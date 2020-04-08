---
published: true
title: 'Rebuilding my blog with Next.js'
excerpt: "I use my website for hacking with new technologies more than writing content. This time I&rsquo;m rebuilding it using Next.js and if you&rsquo;re reading this, I already deployed the first version."
date: '2019-05-13'
status: 'In Progress'
author:
  name: 'Juan Olvera'
ogImage:
  url: '/static/rebuilding-my-blog-with-nextjs.jpeg'
changeLog:
  2019-10-29: 'Add reference to script generating the JSON feed in build time and fix grammar issues.'
---

I use my website to try new technologies more than writing content, this means that I&#8217;ve rebuilt my site more times than I&#8217;ve written articles. This time I&#8217;m rebuilding it using Next.js, and if you&#8217;re reading this, I already deployed the first version.

## Why Next.js

With the rise of React and the SSR frameworks, e.g., Gatsby and Next.js, I saw a lot of beautiful, fast blogs built with Gatsby. [You probably have already seen Dan&#8217;s](https://overreacted.io/). Of course, I went and tried to set up my own, but the thing I didn&#8217;t like was that Gatsby blog-starter requires GraphQL, which is good, but I don&#8217;t think I need that for a simple blog.

So with the bad habit I have of wanting to build my version of everything, I started to investigate how to build a blog with Next.js.

## How

I got familiar with Next.js by contributing a couple of examples and other small changes. I&#8217;m also currently building two products with it, so I felt confident that I could build something decent.

### Checklist

I started with an empty project using [create-next-app](https://github.com/segment-open-source-transfer/create-next-app), and from there, I made a list of the features I needed.

1. Generate a list of posts from [MDX](https://mdxjs.com/) files
2. Add syntax highlighting
3. Add an RSS feed
4. Add pagination

For a Next.js project, all these things were new for me, and I had no idea how to implement them. So, I went to investigate how other people are doing it.

Guillermo Rauch ([@rauchg](https://twitter.com/rauchg)) told me that Max Stoiber&rsquo;s site ([@mxstbr](https://twitter.com/mxstbr)) was one of his favorite blogs built with Next.js out there, so I looked at his [GitHub repo](https://github.com/mxstbr/mxstbr.com).

Max has 80% of the features I need in his repository, so most of the credit for the work goes to him; his implementation is pretty smart and helped me a lot. I was fortunate to chat with him about it too. 

### 1. Generate a list of posts from MDX files

The goal is to use Node to read the contents of a folder and get a list of files, then for each file, create a JavaScript Object with `title`, `content`, and other metadata.

To use the file system module at build-time, Max used [babel-plugin-preval/macro](https://github.com/kentcdodds/babel-plugin-preval); this package lets you run Node code dynamically in a client context and export the results.

With [Max&#8217;s implementation](https://github.com/mxstbr/mxstbr.com/blob/master/pages/thoughts/index.js) we can import the list of posts and iterate through the `Object`, e.g.,

```jsx{1,6,7,8,9,10,11,12}
import blogposts from "../../data/blog-posts"; 

function Blog() {
  return (
    <ul>
      {blogposts.map((post, index) => (
        <li key={index}>
          <a href={post.path}>{post.title}</a>
          <time>{post.publishedAt}</time>

          {post.summary}
        </li>
      ))}
    </ul>
  );
}

export default Blog;
```

### 2. Syntax highlighting

Syntax highlighting was harder than I thought. Basic syntax highlighting worked with [rehype-prism](https://github.com/mapbox/rehype-prism), but one key feature was missing, the ability to highlight a line of code, e.g.,

```jsx{6,7,8,9}
import React, { useState, useEffect, useRef } from 'react';

function counter() {
  let [count, setCount] = useState(0);

  setInterval(() => {
    // Look, I'm highlighted!
    setCount(count + 1);
  }, 1000);

  return <h1>{count}</h1>;
}
```

Adding line highlighting was probably the hardest part of the process. To implement it, I went to a rabbit hole of learning about [unified.js](https://unified.js.org/) and how syntax trees work. I had to understand how the Gatsby team and contributors implemented their own and how to plug it into the MDX plugin interface.

I <s>stole code</s> got inspiration from these packages:

- [gatsby-remark-prismjs](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-prismjs)
- [@mapbox/rehype-prism](https://github.com/mapbox/rehype-prism)
- [refractor](https://github.com/wooorm/refractor)

I won&#8217;t go in detail, but I integrated code from those three packages to get syntax highlighting working along with the line highlighting feature. Other features are missing but got it&#8217;s working for now. [Since I&#8217;ve created a fork that adds line highlighting to rehype-prism](https://github.com/j0lv3r4/mdx-prism). 

### 3. RSS feed

This feature was easy. I followed Max&#8217;s lead in using the [JSON feed spec](https://jsonfeed.org) and reformatting the blog post `Object` into a JSON feed.

I still haven&#8217;t figure out how to create the JSON file on build time, so, for now, I&#8217;m running the node script before committing changes to generate the feed and routing it as a static file.

An npm script runs a [Node function](https://github.com/j0lv3r4/jolvera.dev/blob/master/posts/rss-feed.js) that generates the feed as a static file when it&#8217;s deploying in Now.

```js{6,7}
// package.json

  "scripts": {
    "dev": "next",
    "build": "next build",
    "build:rss": "node ./.next/serverless/posts/rss-feed.js",
    "now-build": "next build && yarn build:rss",
    "start": "next start",
    "test": "jest"
  },
```

### 4. Pagination

This feature was easy, too. I used the [pagination library](https://www.npmjs.com/package/pagination) with the [blog posts `Object`&rsquo;s length and other options as input](https://github.com/j0lv3r4/jolvera.dev/blob/master/pages/blog.js#L13-L18).

## Development environment

One of the benefits of using Next.js with Now 2.0 is the [`now dev`](https://zeit.co/blog/now-dev) command. You get to see what you will get in production. It uses the same `now.json` configuration file and pretty much everything else works the same way.

## Deployment

After all the work, I got the project into a good-enough working blog using Next.js. At this point, I was really excited to have it deployed, and that [Saturday night I decided to launch it using Now 2.0](https://twitter.com/_jolvera/status/1127431569042550784?s=20).

## Conclusion

The website feels fast. The [Lighthouse audit](https://twitter.com/_jolvera/status/1127432136565383169?s=20) results are amazing. The easiness of adding content feels as if you were dealing with a CMS, except there&rsquo;s no login.

The SSR and pre-fetching features Next.js provides makes the site feel very smooth, fast and responsive.

So far I&#8217;m pleased with the experience of developing with Next.js and Now. I will submit a pull request to the Next.js repository to add the blog as an example, and I hope somebody will find this work useful as I found Max&rsquo;s.

Also published in <a rel="syndication" class="u-syndication" href="https://dev.to/jolvera/rebuilding-my-blog-with-next-js-1h84">DEV.to</a>.