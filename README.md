# kalunho.com

Source of [kalunho.com](https://kalunho.com), the website of Dr. Kalun Ho: why technology moves the way it does. Plain HTML, one stylesheet and one small script, served by GitHub Pages.

## Structure

```
index.html                     home page
home/                          finished home page, moves to index.html at launch
videos/                        every video with its handout, deck and sources
experiments/                   own measurements, one page each
  tokens-per-task/             experiment 1
about/                         about Dr. Kalun Ho
links/                         link page for social media bios
legal/                         legal notice
privacy/                       privacy policy
404.html                       page for unknown addresses
assets/
  css/site.css                 all styles; colour tokens at the top
  js/site.js                   click-to-load video, colour theme toggle, fade-in
  fonts/                       Open Sans, self-hosted (OFL licence)
  img/                         motif, icon sprite, portraits, share image
favicon.svg, favicon-32.png, favicon.ico, apple-touch-icon.png
sitemap.xml, robots.txt        for search engines
CNAME                          the custom domain, kalunho.com
.nojekyll                      serve the files as they are
.claude/skills/add-video/      adds a published video to the videos page
```
