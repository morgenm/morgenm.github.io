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

<div>{% include repository/repo.liquid repository="morgenm/basicgopot" %} </div>

**Goal**: The goal of this project is to create an HTTP honeypot server for the purpose of collecting malicious file uploads. The server should provide the user the ability to customize nearly all aspects of the server.

**Implemented Features**:

- Any files uploaded by malicious hackers are logged and stored for analysis.
- Allows the user to serve custom HTML and CSS so they can design the webserver however they wish.
- Can customize what the server does when a file is uploaded to the server:
  - It can scan the file upload with VirusTotal.
  - The user can define custom webhooks which call any API they wish.
- Traffic logging.
- The server can be run with Docker and Docker Compose.

**Technical Approach**: I wrote the project in Go using only the standard library. I used the standard library's `net/http` package to serve the HTML and CSS files and to handle the file upload forms. Development was performed iteratively; I started by creating a minimal webserver which served only static HTML/CSS files, then iteratively implemented all the planned features. The `testing` package was used to design unit and integration tests and to fuzz function inputs. [Delve](https://github.com/go-delve/delve) was used for debugging the Go code.

GitHub issues were used to track planned features and other enhancements. In order to organize and track my progress, features were implemented in their own branches which were merged back into `main`. I used GitHub Actions to implement a CI/CD pipeline. Actions that I designed for this project include: linting, compiling, testing, exporting coverage to [codecov.io](https://codecov.io/gh/morgenm/basicgopot), and checking for security vulnerabilities with [gosec](https://github.com/securego/gosec). [Snyk](https://snyk.io) was also used to check the source code and docker images for vulnerabilities.

Dynamic security testing was performed using [OWASP ZAP](https://www.zaproxy.org/). ZAP was used to fuzz the file upload functionality and to test for other security vulnerabilities that static code scanning could not find. This uncovered some issues that I patched related to file uploads that were repeated in quick succession.

Finally, [goreleaser](https://goreleaser.com/) was used to release binaries for various architectures and operating systems directly to GitHub. Additionally, docker images were published on [DockerHub](https://hub.docker.com/r/morgenm/basicgopot/).

While the primary planned features are implemented, I plan on continuing to improve this project with additional features.

---

### Phishing Detection using NLP and AI

<div>{% include repository/repo.liquid repository="morgenm/nlp-ai-phishing" %}</div>

Go [here](/blog/2023/phishing-detection-ai/) to read the full writeup.

**Goal**: The goal of this project is to develop a binary classifier that accurately predicts whether a given email body is a phish.

**Technical Approach**: I developed Python code for parsing the body text of email messages and for applying Natural Language Processing techniques such as topic modeling and sentiment analysis on the data. The data consisted of publicly available benign and phishing email corpora. I used Random Forest Classifiers and Convolutional Neural Networks to perform prediction.

**Results**: I achieved 98.6% accuracy on the validation data taken from the publically available corpora. For fun, I applied it to my own email inbox, which achieved 91.4% accuracy.

_See the above link for more details on this project._

---

## Other Personal Projects [![GitHub](https://img.shields.io/badge/GitHub-blue?style=for-the-badge&logo=github&logoColor=white)](https://github.com/morgenm)

{% if site.data.repositories.github_repos %}

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

---

## Other Projects I have Contributed to

{% if site.data.repositories.github_repos_contributed %}

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos_contributed %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}
