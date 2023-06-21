---
layout: page
permalink: /repositories/
title: repositories
description: A curated list of my GitHub repos. Some cybersecurity and hacking related projects. 
nav: true
nav_order: 3
---

## My GitHub [![GitHub](https://img.shields.io/badge/GitHub-blue?style=for-the-badge&logo=github&logoColor=white)](https://github.com/morgenm)



[![Metrics](https://metrics.lecoq.io/morgenm?template=classic&achievements=1&languages=1&lines=1&notable=1&rss=1&base=header%2C%20activity%2C%20community%2C%20repositories%2C%20metadata&base.indepth=false&base.hireable=false&base.skip=false&languages=false&languages.ignored=html%2C%20css%2Cscss&languages.limit=8&languages.threshold=0%25&languages.other=false&languages.colors=github&languages.sections=most-used&languages.indepth=false&languages.analysis.timeout=15&languages.analysis.timeout.repositories=7.5&languages.categories=markup%2C%20programming&languages.recent.categories=markup%2C%20programming&languages.recent.load=300&languages.recent.days=14&lines=false&lines.sections=base&lines.repositories.limit=4&lines.history.limit=1&achievements=false&achievements.threshold=B&achievements.secrets=true&achievements.display=detailed&achievements.limit=0&achievements.ignored=verified&notable=false&notable.from=organization&notable.repositories=false&notable.indepth=false&notable.types=commit&notable.self=false&rss=false&rss.source=https%3A%2F%2Fmorgenm.github.io%2Ffeed.xml&rss.limit=4&config.timezone=America%2FChicago)](https://github.com/morgenm)

---

## GitHub Repositories

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