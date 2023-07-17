---
layout: page
permalink: /portfolio/
title: portfolio
description:
nav: true
nav_order: 3
---

## Personal Projects
---

### basicgopot
<div>{% include repository/repo.html repository="morgenm/basicgopot" %}</div>

**Goal**: The goal of this project is to create an HTTP honeypot server specifically focused on file uploads and which provides the user the ability to customize nearly all aspects of the server. 

**Implemented Features**:
- Allows the user to serve custom HTML and CSS so they can design the webserver however they wish. 
- Can customize what the server does when a file is uploaded to the server: 
  - It can scan the file upload with VirusTotal.
  - The user can define custom webhooks which call any API they wish. 
- Traffic and upload logging.
- The server can be run with Docker and Docker Compose.

**Technical Approach**: I wrote the project in Go and used only the standard library. To serve the HTML and CSS files and to handle the file upload forms, I used the standard library's `net/http` package. Development was performed iteratively; I started by creating a minimal webserver then expanded to implement all the planned features. The `testing` package was used to design unit and integration tests and to fuzz several function inputs. `Delve` was used for debugging the Go code. 

GitHub issues were used to track planned features and other enhancements. Most features were implemented in their own branch and were merged back to `main` with pull-requests to better organize and track my progress. I used GitHub actions to implement a CI/CD pipeline. Actions that I designed for this project include: linting, compiling, testing, exporting coverage to [codecov.io](https://codecov.io/gh/morgenm/basicgopot), and checking for security vulnerabilities with [gosec](https://github.com/securego/gosec). [Snyk](https://snyk.io) was also used to check the source code and docker images for vulnerabilities.

Finally, [goreleaser](https://goreleaser.com/) was used to release binaries for various architectures and operating systems directly to GitHub. Additionally, docker images were published on [DockerHub](https://hub.docker.com/r/morgenm/basicgopot/).

While the primary planned features are implemented, I plan on continuing to improve this project with additional features.

---

## Other Personal Projects [![GitHub](https://img.shields.io/badge/GitHub-blue?style=for-the-badge&logo=github&logoColor=white)](https://github.com/morgenm)

{% if site.data.repositories.github_repos %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.html repository=repo %}
  {% endfor %}
</div>
{% endif %}

---

## Other Projects I have Contributed to
{% if site.data.repositories.github_repos_contributed %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos_contributed %}
    {% include repository/repo.html repository=repo %}
  {% endfor %}
</div>
{% endif %}

