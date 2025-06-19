---
layout: post
title:  Using basicgopot with Hybrid-Analysis
date: 2023-06-20 12:00:00
description: How to configure an open source honeypot I wrote to scan uploaded files with Hybrid-Analysis using WebHooks.
tags: basicgopot reverse-engineering 
categories: 
---

### The Rundown on basicgopot
I have been working on a new project for a little over a week now called [***basicgopot***](https://github.com/morgenm/basicgopot). It is an open source honeypot written in Go. It allows us to create a customized HTTP honeypot server by serving the HTML and CSS files we give (or we can use the prebuilt templates). The code will save and log any files that are uploaded to it via POST requests to `/upload`. Its functionality is configurable with a JSON config file, using which we can easily make the server send all the uploaded files to VirusTotal for scanning. This tool allows us to set up a honeypot webserver which saves, logs, and scans all file uploads, quickly and with no hassle. 

More information about this project can be found on my [GitHub](https://github.com/morgenm/basicgopot). What I want to discuss today is how we can utilize a new basicgopot feature I just released yesterday: WebHooks. 

### What are WebHooks
Generally, a webhook is a mechanism that lets an application send another application information in when an event occurs in real-time. This is exactly what WebHooks do in the context of basicgopot. WebHooks are easily configurable and let us send information to an external web app when an event occurs in the honeypot. At the time of writing only POST requests are supported and the only event that WebHooks can be tied to are upload events. This, however, is powerful in its own right. This could allow us to do things like sending a Slack notification whenever a file is uploaded, sending the file data to another server for data storage, or even performing content analysis on uploaded text and code. The possibilities are endless. One such possibility is what this post will cover: sending files to another malware analysis engine. 

Basicgopot already has the capability of sending files to VirusTotal for analysis baked into it. However, some organizations and researchers use other tools which can provide more or different data about scanned files. And perhaps some even spin up their own sandboxes for malware analysis and file scanning. In any case, I want to demonstrate how we can utilize WebHooks to extend basicgopot's capabilities. The specific tool I will be using to illustrate this is [Hybrid-Analysis](https://www.hybrid-analysis.com), since their API is available for free.

### Creating our Hybrid-Analysis API Key
We need to configure our Hybrid-Analysis API key so basicgopot can use it to upload files for analysis. Documentation on this can be found in their [docs](https://www.hybrid-analysis.com/docs/api/v2). We need to generate the key and save it for adding it to the config file in the next section.

### Installing and Configuring basicgopot
For the purposes of this post, I downloaded basicgopot v1.1.2 for Linux AMD64 from the releases page on my GitHub. I copied `config/config.json.example` to `config/config.json`. I modified the config file to look like this:
```json
{
    "ServerPort" : 8080,
    "UploadLimitMB" : 512,
    "UseVirusTotal" : false,
    "UploadVirusTotal" : false,
    "VirusTotalApiKey" : "lol",
    "ScanOutputDir" : "scans/",
    "UploadsDir" : "uploads/",
    "UploadLog" : "uploads.json",
    "WebHookDir" : "webhooks/",
    "UploadWebHooks" : { 
        "Hybrid-Analysis" : {
            "URL" : "https://www.hybrid-analysis.com/api/v2/quick-scan/file",
            "Method" : "POST",
            "Headers" : {
                "api-key": "APIKEY",
                "user-agent": "Falcon",
                "accept": "*/*"
            },
            "Forms" : {
                "scan_type" : "all",
                "file" : "$FILE"
            }
        }  
    }
}
```
Where APIKEY is replaced with the API key generated in the previous section. And that's it. Now we can go and see it in action.

### Deploying
To run the honeypot, we just execute this command in the project directory:
```bash
./basicgopot
```
Now, navigating to `http://localhost:8080`, we see:

{% include figure.liquid path="assets/img/basicgopot-hybrid-analysis/index.png" class="img-fluid rounded z-depth-1" zoomable=true %}

We will select a sample from my computer to the server. Let's imagine we are a bad actor who has some malware that we want to upload to this vulnerable page:

{% include figure.liquid path="assets/img/basicgopot-hybrid-analysis/upload_zeus.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Now we get taken to the upload success page:

{% include figure.liquid path="assets/img/basicgopot-hybrid-analysis/upload_success.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Since the file was uploaded, the WebHook should have triggered as it is tied to upload events. First, we will check the `webhooks` directory to see if it triggered. There is a new file there titled `"Hybrid-Analysis DATE"` where `DATE` is the current date and time. The file looks like this:

```json
{
    "id": "----",
    "sha256": "7a981d743a601ca2ae40f78547430bcd404f93520b0ba78e2ca53edf8a0f31f0",
    "scanners": [
        {
            "name": "CrowdStrike Falcon Static Analysis (ML)",
            "status": "no-result",
            "error_message": null,
            "progress": 100,
            "total": null,
            "positives": null,
            "percent": null,
            "anti_virus_results": []
        },
        {
            "name": "Metadefender",
            "status": "malicious",
            "error_message": null,
            "progress": 100,
            "total": 26,
            "positives": 2,
            "percent": 7,
            "anti_virus_results": []
        },
        {
            "name": "VirusTotal",
            "status": "malicious",
            "error_message": null,
            "progress": 100,
            "total": 75,
            "positives": 12,
            "percent": 16,
            "anti_virus_results": []
        }
    ],
    "scanners_v2": {
        "crowdstrike_ml": {
            "name": "CrowdStrike Falcon Static Analysis (ML)",
            "status": "no-result",
            "error_message": null,
            "progress": 100,
            "percent": null,
            "anti_virus_results": []
        },
        "metadefender": {
            "name": "Metadefender",
            "status": "malicious",
            "error_message": null,
            "progress": 100,
            "total": 26,
            "positives": 2,
            "percent": 7,
            "anti_virus_results": []
        },
        "virustotal": {
            "name": "VirusTotal",
            "status": "malicious",
            "error_message": null,
            "progress": 100,
            "total": 75,
            "positives": 12,
            "percent": 16
        },
        "urlscan_io": null,
        "scam_adviser": null,
        "clean_dns": null
    },
    "whitelist": [
        {
            "id": "internal",
            "value": false
        }
    ],
    "reports": [
        "----",
        "----"
    ],
    "finished": true
}
```

Now let's go check our Hybrid-Analysis account. Navigating to our submissions for our account, we see:

{% include figure.liquid path="assets/img/basicgopot-hybrid-analysis/submission.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Clicking on this gives us some more details. It appears that this sample was indeed malicious:

{% include figure.liquid path="assets/img/basicgopot-hybrid-analysis/submission_details.png" class="img-fluid rounded z-depth-1" zoomable=true %}

And that about sums it up. Now we have deployed an HTTP honeypot that uploads files to Hybrid-Analysis in only a few minutes! If you are interested in basicgopot, go check it out on my GitHub, linked above. Contributions and feature requests are always welcome!