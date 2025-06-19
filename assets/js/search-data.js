// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-portfolio",
          title: "portfolio",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/portfolio/";
          },
        },{id: "post-crackmes-one-catpuzzler-39-s-switching-crackme",
        
          title: "Crackmes.one - catpuzzler&#39;s Switching crackme",
        
        description: "Writeup for catpuzzler&#39;s &quot;Switching crackme&quot; (crackmes.one)",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/crackmes.one-switching-crackme/";
          
        },
      },{id: "post-using-basicgopot-with-hybrid-analysis",
        
          title: "Using basicgopot with Hybrid-Analysis",
        
        description: "How to configure an open source honeypot I wrote to scan uploaded files with Hybrid-Analysis using WebHooks.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/basicgopot-hybrid-analysis/";
          
        },
      },{id: "post-detecting-phishing-emails-with-nlp-and-ai",
        
          title: "Detecting Phishing Emails with NLP and AI",
        
        description: "Describing my attempt to detecting phishing emails using Natural Language Processing (NLP) and AI.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/phishing-detection-ai/";
          
        },
      },{id: "post-malwarebytes-2017-crackme-stage-2",
        
          title: "Malwarebytes 2017 CrackMe Stage 2",
        
        description: "Writeup for the second half of Malwarebytes&#39;s 2017 CrackMe challenge.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/malwarebytes-2017-crackme-stage-2/";
          
        },
      },{id: "post-malwarebytes-2017-crackme-stage-1",
        
          title: "Malwarebytes 2017 CrackMe Stage 1",
        
        description: "Writeup for Malwarebytes&#39;s 2017 CrackMe challenge.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/malwarebytes-2017-crackme-stage-1/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6D%6F%72%67%65%6E.%77%31%78%6E%70@%73%6C%6D%61%69%6C.%6D%65", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/morgenm# your GitHub user name", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/morgen-malinoski", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
