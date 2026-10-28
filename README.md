# kalunho.com

The website of Dr. Kalun Ho's YouTube channel on AI strategy for executives: plain static HTML, one CSS file and a little JavaScript, hosted on GitHub Pages at **https://kalunho.com**.

> **Status: under construction.** Visitors to kalunho.com see a temporary "under construction" page. The finished home page waits in `home/index.html`, and search engines are kept out by `robots.txt`. Work through the to-do list (section 1), then go live (section 2).

Once live, the site needs no routine maintenance. The home page player shows the channel's uploads playlist, so it always plays the newest video. Handouts and decks live on Google Drive and are linked from YouTube and the newsletter, not from this site. Every push to `main` is online in about a minute.

## 1. To-do list before going live

### Already done

- [x] Site built and online on GitHub Pages: "Deploy from a branch", `main`, `/ (root)`
- [x] Custom domain `kalunho.com`, HTTPS enforced, `www.kalunho.com` redirects to `kalunho.com`
- [x] DNS: the four A records and the `www` CNAME (checked 28 October 2026)
- [x] Open Graph image exported (`assets/img/og-image.png`)

### A. Fill in the placeholders

Details and the exact places for each are in `config.md`. Replace them with Replace in Files in VS Code (`Cmd+Shift+H`).

- [ ] `{{YOUTUBE_CHANNEL_URL}}`: your channel URL without a trailing slash, for example `https://www.youtube.com/@yourhandle`
- [ ] `{{YOUTUBE_UPLOADS_PLAYLIST}}`: your channel ID (YouTube Studio → Settings → Channel → Advanced settings) with the leading `UC` replaced by `UU`
- [ ] `{{BEEHIIV_SUBSCRIBE_URL}}`: the public subscribe page of your Beehiiv newsletter (set up the publication first)
- [ ] `{{INSTAGRAM_URL}}`: your Instagram profile URL
- [ ] `{{TIKTOK_URL}}`: your TikTok profile URL
- [ ] `{{CONTACT_EMAIL}}`: a public contact address, not your private one
- [ ] Optional: a channel name. Until you decide, the site uses "Dr. Kalun Ho"; `config.md` lists the two places to change.
- [ ] Check: `grep -rn "{{" --include='*.html' .` prints nothing.

### B. Replace the photos

- [ ] **Large portrait, 4:5:** JPG or WebP, at least 1200 × 1500 px, under 250 KB. Shown on the home page and the About page.
- [ ] **Round portrait, 1:1:** JPG or WebP, at least 600 × 600 px, under 100 KB. Shown on `/links/`.
- [ ] Delete the placeholder files and the `<!-- TODO PHOTO -->` comments.

How to swap them is in section 4.

### C. Finish the legal pages

- [ ] **Impressum** (`impressum/index.html`): street and house number, postcode and city, a phone number or other fast contact route, VAT ID (or delete that section), and check that the name matches your legal name.
- [ ] **Privacy policy** (`privacy/index.html`): date of the review, your address, confirm GitHub's EU-U.S. Data Privacy Framework certification, the newsletter section (once your Beehiiv account is set up), and your federal state's data protection authority.
- [ ] Have both pages reviewed by a qualified person.
- [ ] Delete the "Template" notice at the top of both pages.
- [ ] Check: `grep -rn "TODO" --include='*.html' .` prints nothing (this also finds the `TODO PHOTO` comments).

### D. Domain

- [ ] **Verify the domain on GitHub** (prevents someone else from taking it over). Not done yet: there is no verification record as of 28 October 2026. Click your profile picture → **Settings** → **Pages** (sidebar, under "Code, planning, and automation") → **Add a domain** → `kalunho.com`. Add the TXT record GitHub shows (host `_github-pages-challenge-kalunho17`) at your registrar, wait a few minutes, then click **Verify**.
- [ ] Optional but recommended: **add the four AAAA records** for visitors on IPv6 (missing as of 28 October 2026). See section 5.

### E. Final check before going live

- [ ] Preview locally (section 3) and click every link on the home page, `/links/`, `/newsletter/` and `/about/`. Each one should open the right YouTube, Instagram, TikTok or Beehiiv page.
- [ ] Click play on the home page: the newest video should start.
- [ ] Run the identity and banned-words checks (section 6). Both must print nothing.

## 2. Go live

Run these in the project folder:

1. **Put the finished home page in place.** This replaces the construction page:

   ```sh
   git mv -f home/index.html index.html
   rmdir home
   ```

   Without the command line: delete `index.html`, move `home/index.html` to the top folder, then delete the empty `home` folder.

2. **Let search engines in.** Replace the content of `robots.txt`:

   ```sh
   printf 'User-agent: *\nAllow: /\n\nSitemap: https://kalunho.com/sitemap.xml\n' > robots.txt
   ```

3. **Optional:** delete the block `/* --- Under construction … */` (two rules) from `assets/css/site.css`. Nothing uses it after the swap.

4. **Publish:**

   ```sh
   git add -A
   git commit -m "Go live"
   git push origin main
   ```

5. After about a minute, open https://kalunho.com and check that the full home page appears.

## 3. After going live

- [ ] **Lighthouse:** on the live site, Chrome → DevTools → Lighthouse, mobile and desktop. All four categories should be at 95 or above.
- [ ] **Phone test:** every button on https://kalunho.com/links/, the video, the subscribe and newsletter buttons.
- [ ] **Bio links:** set `https://kalunho.com/links/` as the link in your Instagram and TikTok bios.
- [ ] **Share preview:** paste `https://kalunho.com` into the LinkedIn Post Inspector and check the image and text.
- [ ] Optional: **Google Search Console:** add `kalunho.com` as a property and submit `https://kalunho.com/sitemap.xml`.

## 4. Reference

### Pages

| Path | In the nav | Purpose |
|---|---|---|
| `/` | – | **Temporary:** "under construction" page. Replaced by the home page at launch |
| `/home/` | – | **Temporary:** the finished home page, waiting for launch (moves to `/`) |
| `/links/` | no | Bio link page for Instagram and TikTok |
| `/newsletter/` | yes | Why subscribe, illustrative slide, Beehiiv button |
| `/about/` | yes | What the channel stands for and how it works |
| `/work-with-me/` | **no** | Hidden: built, not linked, `noindex`, not in the sitemap. See `LAUNCH-WORK-WITH-ME.md` |
| `/impressum/` | footer | Legal notice (template) |
| `/privacy/` | footer | Privacy policy (template) |
| `/404.html` | – | Shown by GitHub Pages for unknown addresses |

Until launch, all pages except `/` are reachable only by typing their address, and search engines stay out. The "Home" links in the navigation lead to the construction page until you go live.

### Files

```
index.html               temporary "under construction" page
home/index.html          finished home page (moves to index.html at launch)
links/, newsletter/, about/, work-with-me/, impressum/, privacy/, 404.html
assets/css/site.css      all styles; colour tokens at the top
assets/js/site.js        click-to-load video + fade-in (the only script)
assets/fonts/            Open Sans 300/400/600/700 (woff2) + OFL.txt licence
assets/img/              motif, icons sprite, portrait placeholders, OG image
favicon.svg, favicon-32.png, favicon.ico, apple-touch-icon.png
sitemap.xml, robots.txt, CNAME (kalunho.com), .nojekyll
config.md                every placeholder and where it is used
LAUNCH-WORK-WITH-ME.md   steps to switch on the hidden page
```

**Header and footer** are copied on every page, between `<!-- HEADER START -->` / `<!-- HEADER END -->` and `<!-- FOOTER START -->` / `<!-- FOOTER END -->`. To change them, use Replace in Files (`Cmd+Shift+H`) so every page changes at once. The footer year is plain text (`© 2026`); update it whenever you like.

### Preview locally

```sh
cd path/to/kalunho17.github.io
python3 -m http.server
```

Then open http://localhost:8000/home/ for the finished home page (http://localhost:8000 shows the construction page until launch). Open the site through the server, not by double-clicking the files, because all paths start with `/`. Online, the finished home page is at https://kalunho.com/home/ until launch.

### Swapping the photos

| Slot | Placeholder file | Aspect | Recommended size | Where it appears |
|---|---|---|---|---|
| Portrait, large | `assets/img/portrait-placeholder-4x5.svg` | 4:5 | JPG or WebP, at least 1200 × 1500 px, under 250 KB | Home ("How every episode is made"), About (page head) |
| Portrait, round | `assets/img/portrait-placeholder-1x1.svg` | 1:1 | JPG or WebP, at least 600 × 600 px, under 100 KB | `/links/` (shown as a 112 px circle) |

1. Save each photo in `assets/img/`, for example as `portrait-4x5.webp` and `portrait-1x1.webp`.
2. Replace in Files: `portrait-placeholder-4x5.svg` → `portrait-4x5.webp` (2 places), and `portrait-placeholder-1x1.svg` → `portrait-1x1.webp` (1 place).
3. Delete the placeholder files and the `<!-- TODO PHOTO -->` comments.

Keep the aspect ratio. The layout crops to 4:5 and 1:1, so a different ratio gets cut off.

### Open Graph image

The preview when someone shares the link is `assets/img/og-image.png`, exported from `assets/img/og-image.svg`. Re-export only if you change the headline in the SVG:

1. Install Open Sans on your Mac: Google Fonts → Open Sans → Get font → Download, then open the `.ttf` files and click Install.
2. Run:

   ```sh
   /Applications/Inkscape.app/Contents/MacOS/inkscape assets/img/og-image.svg --export-type=png --export-filename=assets/img/og-image.png --export-width=1200
   ```

The video poster on the home page is HTML and CSS (in `home/index.html`, later `index.html`), not an image. Edit its text there.

## 5. Hosting and DNS

**GitHub Pages** (set up, checked 28 October 2026): repository `kalunho17/kalunho17.github.io` → Settings → Pages → Source **Deploy from a branch**, branch `main`, folder `/ (root)`; custom domain `kalunho.com`; **Enforce HTTPS** on. The `CNAME` file in the repository root contains `kalunho.com`. Each push to `main` deploys automatically; progress shows under the repository's **Actions** tab ("pages build and deployment").

**DNS records at your registrar.** `kalunho.com` is the main address; `www.kalunho.com` redirects to it.

| Type | Host / name | Value | Status (28 Oct 2026) |
|---|---|---|---|
| A | `@` | `185.199.108.153` | set |
| A | `@` | `185.199.109.153` | set |
| A | `@` | `185.199.110.153` | set |
| A | `@` | `185.199.111.153` | set |
| AAAA | `@` | `2606:50c0:8000::153` | missing (optional) |
| AAAA | `@` | `2606:50c0:8001::153` | missing (optional) |
| AAAA | `@` | `2606:50c0:8002::153` | missing (optional) |
| AAAA | `@` | `2606:50c0:8003::153` | missing (optional) |
| CNAME | `www` | `kalunho17.github.io` | set |
| TXT | `_github-pages-challenge-kalunho17` | the value GitHub shows when you verify the domain | missing |

These values match GitHub's documentation ("Managing a custom domain for your GitHub Pages site"). To check the records:

```sh
dig kalunho.com +noall +answer -t A
dig kalunho.com +noall +answer -t AAAA
dig www.kalunho.com +noall +answer -t CNAME
```

## 6. Checks

**Placeholders and to-dos left:**

```sh
grep -rn "{{" --include='*.html' .
grep -rn "TODO" --include='*.html' .
```

**Identity check.** The only identity string allowed anywhere on the site is "Dr. Kalun Ho". The brackets stop the command from matching itself in this file:

```sh
grep -rniIE --exclude-dir=.git '[p]hd|[p]h\.d|[c]omputer science|[a]i lab|[h]ead of|[l]eader of|[s]trategist|[a]i strategy & execution|[e]xpert|[t]hought leader|[f]ormer' .
```

**Banned-words check:**

```sh
grep -rniIE --exclude-dir=.git '[g]ame-changer|[r]evolutionary|[u]nlock|[s]upercharge|[j]ourney|[e]cosystem|[d]isrupt|[c]utting-edge|[n]ext-level|[e]mpower|[h]arness|[s]eamless|[t]ransformative|[w]orld-class|[p]assionate' .
```

All four commands must print nothing before you go live.

## 7. Later

- **Work with me:** follow `LAUNCH-WORK-WITH-ME.md`.
- **Newsletter embed:** every newsletter button sits under a `<!-- NEWSLETTER CTA -->` comment (home page band, newsletter page twice). To use a Beehiiv embed, replace the `<a class="btn …">` there with Beehiiv's embed code. An embed loads Beehiiv as soon as the page opens, so update the privacy policy first and check whether you then need consent. The plain link avoids both.
- **Analytics:** every page has an `<!-- ANALYTICS SLOT -->` comment in the `<head>` with GoatCounter and Plausible examples (both cookieless). Paste one snippet on every page, and replace the "Cookies and analytics" section of the privacy policy with the commented template below it.

## Rules for future edits

- **Identity:** "Dr. Kalun Ho" is the only identity string. No credentials, titles, roles, employers or descriptors anywhere: not in text, meta tags, alt text, JSON-LD, images or file names.
- **Voice:** headlines state a conclusion, in sentence case, ending with a full stop. Short sentences, "you" singular, plain words, no exclamation marks, no invented facts or numbers.
- **Design:** colours only through the tokens at the top of `site.css`. No shadows, no gradients, no stock photos. `--secondary` text only on white: on tinted backgrounds it fails WCAG AA.
- **Third parties:** nothing may load from another domain before a click. Fonts stay self-hosted.
