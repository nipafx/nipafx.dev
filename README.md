# nipafx.dev

My Gatsby site.

## Content

The site shows various kinds of content, like blog posts, YouTube videos, newsletters, and more.
To keep things organized, I defined some terms:

* _Article_: What is usually called a blog post - a proper article on any topic
* _Event_: Announcements of Accento, 26 Hours Of Java, etc.
* _Talks_: An abstract and list of presentations for a talk
* _Video_: A post linking to a YouTube video
* _Post_: Each of the above is a _post_

## Building & Deploying

```sh
# to develop the site locally:
npx gatsby develop

# to develop Netlify integrations locally:
npx netlify dev

# to build the site:
npx gatsby clean
npx gatsby build
# or shorter:
npm run build

# to deploy the site (requires env vars
# `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`)
npx netlify deploy --prod --dir=public
```
