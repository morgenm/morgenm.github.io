---
layout: post
title: Dirty Pipe Exploit in Rust
date: 2025-07-05 12:00:00
description: Writeup covering my Dirty Pipe (CVE-2022-0847) exploit in Rust
tags: exploit research
categories:
---

[PoC Code and Compiled Executable on my GitHub](https://github.com/morgenm/dirtypipe)


# Introduction

Dirty Pipe (CVE-2022-0847) is a vulnerability in the Linux kernel which allows an attacker to overwrite files that they have read-only access to. At the time of writing, this vulnerability is 3 years old, but overwriting nearly any file without appropriate permissions using only a few system calls stood out to me. Additionally, since the exploit abuses normal kernel behavior, detecting the exploit is not an easy task.

CVE-2022-0847 affects the following Linux kernel versions, according to [NIST's NVD](https://nvd.nist.gov/vuln/detail/cve-2022-0847):
- From `5.8` up to (but not including) `5.10.102`
- From `5.15` up to (but not including) `5.15.25`
- From `5.16` up to (but not including) `5.16.11`

The vulnerability can be weaponized to escalate privileges on older Linux systems due to the arbitrary file overwrite. It abuses a flaw in functions in the Linux kernel that allowed pipes to contain stale flag values. Because of this, a pipe could be used to write to pages in the kernel page cache, which in turn could write arbitrarily to files the user does not have write permission for. 

My goals for this writeup were to develop a Rust-based PoC that:
- Allows the attacker to overwrite any read-only file using any provided input data
- Can escalate privileges by overwriting an SUID file
- Performs a backup of the target file in order to be non-destructive

This exploit was a fun learning opportunity. I have abused this before in CTFs and HackTheBox for privilege escalation, but writing an exploit for it allowed me to do a deep-dive and learn more about the Linux kernel and exploit development. My work was based on the amazing writeup by Max Kellermann [here](https://dirtypipe.cm4all.com/). 

# Background

Let's cover some brief background before beginning. The Linux kernel manages memory represented by pages. Reading a file entails the kernel copying pages from the disk into memory in what's called the page cache. These pages are cached, allowing read and write operations in memory without polling physical storage. 

Pipes are used for interprocess communication and are unidirectional. When a pipe is created, you are provided with two file descriptors, a read end and a write end. Pipes are implemented as a circular buffer where each element points to an actual page, which *should* be the page that can be read from or written to. Both Max Kellerman's writeup and [this article from Oracle](https://blogs.oracle.com/linux/post/pipe-and-splice) provide good explanations for how pipes are implemented. 

Each element within the pipe (the circular buffer) is called a `pipe_buffer`. These can have flags. The only pertinent one for this exploit is `PIPE_BUF_FLAG_CAN_MERGE`, refered to as the merge flag going forward. The merge flag lets the kernel know that it can safely write into the page referenced by the `pipe_buffer`. 

Now, on to the vulnerability. There is a linux system call named `splice` which moves data between two file descriptors (can be a file and a pipe) without copying it into userspace. This is done by copying page references. The Dirty Pipe vulnerability hinges on the fact that the kernel does not remove the merge flag before splicing a file into a pipe. So, if a `pipe_buffer` is mergeable, and we call `splice` to copy a page reference from a read-only file into the pipe, we can just arbitrarily write into the file. No permissions needed!

Based on this knowledge, we should be able to exploit this with the following steps:
1. Create a pipe
2. Fill then clear the pipe (to ensure the merge flag is set)
3. Splice our target file into the pipe
4. Write data to the pipe

However, there are some constraints:
1. We must have read access to the file.
2. Overwrite can't start at a page boundary (we need to splice at least one byte)
3. Overwrite cannot cross a page boundary (the kernel would create a new buffer for the remainder of the file)

# Environment Setup
I created a `Debian 11.3.0` VM using the ISO provided [here](https://get.debian.org/images/archive/11.3.0/amd64/iso-cd/). However, it appeared to be patched, so I downgraded the kernel by downloading `linux-image-5.10.0-11` instead of the provided `5.10.0-35`:

```bash
wget http://snapshot.debian.org/archive/debian/20220222T150634Z/pool/main/l/linux-signed-amd64/linux-image-5.10.0-11-amd64_5.10.92-1_amd64.deb
sudo dpkg -i *.deb
sudo update-grub
```

After that, I restarted and selected `5.10.0-11` from the advanced boot menu in Grub.

# Developing the exploit
## Initial Implementation
Based on the exploitation steps outlined above, implementing the PoC was straightforward. I used Rust's standard library for opening, reading, and writing to the pipe. For the `open()` and `splice()` system calls, I used `libc`, which required an `unsafe` block.  

First, I created, filled, then drained (read until empty) a pipe. 

{% include figure.liquid path="assets/img/dirtypipe/pipe.png" class="img-fluid rounded z-depth-1" zoomable=true %}

This ensured that the pipe had the `merge` flag set. 

Next, I opened the target file as read-only and spliced some bytes into the pipe. The target was `/tmp/test` for the initial PoC, which was RO, owned by `root`, and was a copy of `/etc/passwd`. I arbitrarily spliced 4 bytes here; It only needs to be one. 

{% include figure.liquid path="assets/img/dirtypipe/splice.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Now, we are posed for writing any data we want to into the target file by writing into the pipe. I wrote the string `TEST` into the pipe.

{% include figure.liquid path="assets/img/dirtypipe/write.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Running that worked. The string `TEST` was written into `/tmp/test`, even though it was owned by `root` and my user only had read permissions.

{% include figure.liquid path="assets/img/dirtypipe/test.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Simple enough, right?

## Privilege Escalation
Now how can we use this for privilege escalation? The typical method for exploits of this nature is to set `root`'s password by modifying `/etc/passwd`. A more appealing method to me was to overwrite a binary that has Set User ID (SUID) permissions. If we replace such an executable with a payload that sets the user ID to `root` and spawns a shell, we will have successfully escalated our privileges. Then, once we are done performing any post-exploitation activities, we can revert the target SUID binary to its original state. 

Performing privilege escalation this way does not require a lot of change to the exploit. We just need a suitable payload and to overwrite a SUID binary with its contents. 

To create a payload, I utilized [pwntools](https://docs.pwntools.com/en/stable/). I wrote a short Python script which generated an ELF binary that sets the user and group IDs to `0` (`root`), then spawns `/bin/sh`. 

On my first attempt I simply exported this directly as an ELF then used the exploit to overwrite `/usr/bin/sudo`. However, that introduced some problems. Running the overwritten binary failed. It wasn't an ELF. Running `hexdump` showed the issue:

{% include figure.liquid path="assets/img/dirtypipe/hexdump.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Since we splice 1 byte and we can't overwrite on page boundaries, the write began at the second byte. So the first two bytes of the ELF became `7f7f` rather than `457f`. I updated the code to account for this by skipping the first byte and warning the user if the offset is set to 0. 

Now, after this fix, the first two bytes of the target are `457f`, but I received a segfault when attempting to run the target. It did not take long to discover the issue; The payload's size was `8k`, much larger than a single page. Since we can't write on or cross page boundaries, this breaks the exploit. I tinkered with this for a while, but discovered that I likely cannot generate an executable smaller than `4k` using only `pwntools`. 

When researching how to generate a valid ELF file less than `4k` in size, I discovered a couple of useful articles ([muppetlabs](https://www.muppetlabs.com/~breadbox/software/tiny/teensy.html) and [stalkr.net](https://blog.stalkr.net/2014/10/tiny-elf-3264-with-nasm.html)). 

I edited the Python script to assemble the shellcode and export it as bytes:
```python
# Code for generation SUID binary for privesc.
from pwn import *

context.arch = 'amd64'
context.os = 'linux'

shellcode = shellcraft.setuid(0) + shellcraft.setgid(0) + shellcraft.execve('/bin/sh')

with open("shellcode.bin" ,'wb') as f:
    f.write(asm(shellcode))
```

Then I used the Tiny 64-bit ELF NASM template from the `stalkr.net` article linked above, and modified it to include the exported shellcode:
```asm
; From https://blog.stalkr.net/2014/10/tiny-elf-3264-with-nasm.html
BITS 64
    org 0x400000
 
ehdr:           ; Elf64_Ehdr
    db 0x7f, "ELF", 2, 1, 1, 0 ; e_ident
    times 8 db 0
    dw  2         ; e_type
    dw  0x3e      ; e_machine
    dd  1         ; e_version
    dq  _start    ; e_entry
    dq  phdr - $$ ; e_phoff
    dq  0         ; e_shoff
    dd  0         ; e_flags
    dw  ehdrsize  ; e_ehsize
    dw  phdrsize  ; e_phentsize
    dw  1         ; e_phnum
    dw  0         ; e_shentsize
    dw  0         ; e_shnum
    dw  0         ; e_shstrndx
    ehdrsize  equ  $ - ehdr

phdr:           ; Elf64_Phdr
    dd  1         ; p_type
    dd  5         ; p_flags
    dq  0         ; p_offset
    dq  $$        ; p_vaddr
    dq  $$        ; p_paddr
    dq  filesize  ; p_filesz
    dq  filesize  ; p_memsz
    dq  0x1000    ; p_align
    phdrsize  equ  $ - phdr

_start:
    call shellcode

shellcode:
    incbin "shellcode.bin"

filesize equ $ - $$
```

Finally, I ran the following to generate the final ELF payload:
```bash
nasm -f bin -o suid loader.asm
```

This significantly reduced the size of the payload ELF binary, while still being executable. It went from `8k` to `176` bytes. Then, when I ran the exploit, this time overwriting `/usr/bin/passwd` with the new SUID payload, it worked!

{% include figure.liquid path="assets/img/dirtypipe/working.png" class="img-fluid rounded z-depth-1" zoomable=true %}

The PoC was functional! It overwrites any file and can overwrite SUID files with this payload to escalate privileges.

## Enhancements

In order to make the PoC more useful, I implemented some additional functionality. I added command line argument parsing so the user may select which file to overwrite and with which input (including what SUID binary to overwrite). The user can also specify the offset when in `overwrite` mode (not overwriting an SUID binary). Next, I added code to check the host's kernel version and to warn the user if it is not vulnerable. Finally, I implemented functionality for backing up the target file to `/tmp` so the target can be easily reverted to its original state.

# Conclusion

Overall, this was a rewarding project that gave me a deeper understanding of both exploit development and the Linux kernel’s internals. Despite being three years old, Dirty Pipe remains one of the more elegant and dangerous privilege escalation bugs in recent memory. With only a few system calls and minimal code, an attacker with read-only access can overwrite arbitrary files, bypassing fundamental Unix file permission boundaries.

Writing the exploit from scratch in Rust helped solidify my understanding of how the page cache, pipes, and flags like `PIPE_BUF_FLAG_CAN_MERGE` interact under the hood. It also forced me to think through edge cases—like page boundaries and ELF header corruption—and solve them in practical ways, such as payload minimization with custom NASM assembly.

Detecting Dirty Pipe exploit attempts can be challenging, as the vulnerability abuses legitimate system behavior and common system calls, such as splice. File integrity monitoring may catch some forms of exploitation—for instance, unexpected modifications to system-critical files. In environments where system files aren't modified outside of package updates or planned changes, this kind of monitoring can serve as a strong indicator of compromise.

However, this approach has limitations. For example, [Wazuh's detection strategy](https://wazuh.com/blog/detecting-dirty-pipe-vulnerability-with-wazuh-cve-2022-0847/) focuses on monitoring calls to `splice` with changes to `/etc/passwd`. My implementation of the exploit (as well as others publicly available), however, can overwrite SUID binaries such as `/usr/bin/passwd` to escalate privileges without modifying `/etc/passwd`. Detection strategies such as this may miss exploit attempts due to relying on very specific files being modified.

My code is publicly available on [GitHub](https://github.com/morgenm/dirtypipe). This repo contains the full PoC; The compiled exploit, SUID payload, and Python script are also availble under `Releases`. I hope that it's a useful resource for others looking to understand this vulnerability and to experiment with it in a safe, controlled environment.

# References
1. Max Kellermann. [The Dirty Pipe Vulnerability](https://dirtypipe.cm4all.com/)
2. National Vulnerability Database [CVE-2022-0847](https://nvd.nist.gov/vuln/detail/cve-2022-0847)
3. Oracle Linux [An In-Depth Look at Pipe and Splice implementation in Linux kernel](https://blogs.oracle.com/linux/post/pipe-and-splice)
4. stalkr [Tiny ELF 32/64 with nasm](https://blog.stalkr.net/2014/10/tiny-elf-3264-with-nasm.html)
5. MuppetLabs [A Whirlwind Tutorial on Creating Really Teensy ELF Executables for Linux](https://www.muppetlabs.com/~breadbox/software/tiny/teensy.html)
6. Wazuh [Detecting Dirty Pipe vulnerability with Wazuh (CVE-2022-0847)](https://wazuh.com/blog/detecting-dirty-pipe-vulnerability-with-wazuh-cve-2022-0847/)
7. Linux Manual Pages `man splice`, `man 2 pipe`