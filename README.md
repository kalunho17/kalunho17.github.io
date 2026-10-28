# kalunho.com

The website of Dr. Kalun Ho's YouTube channel on AI strategy for executives: plain static HTML, one CSS file and a little JavaScript, hosted on GitHub Pages at **https://kalunho.com**.

> **Before going live:** the Impressum and the privacy policy are templates. Fill in every `[TODO]` and have both pages reviewed by a qualified person. See the launch checklist in section 6.

The site needs no routine maintenance. The home page player shows the channel's uploads playlist, so it always plays the newest video. Handouts and decks live on Google Drive and are linked from YouTube and the newsletter, not from this site.

## 1. Pages

| Path | In the nav | Purpose |
|---|---|---|
| `/` | yes (Home) | Hero, latest video (click to load), what you get, how episodes are made, newsletter band |
| `/links/` | no | Bio link page for Instagram and TikTok |
| `/newsletter/` | yes | Why subscribe, illustrative slide, Beehiiv button |
| `/about/` | yes | What the channel stands for and how it works |
| `/work-with-me/` | **no** | Hidden: built, not linked, `noindex`, not in the sitemap. See `LAUNCH-WORK-WITH-ME.md` |
| `/impressum/` | footer | Legal notice (template) |
| `/privacy/` | footer | Privacy policy (template) |
| `/404.html` | – | Shown by GitHub Pages for unknown addresses |

### Files

```
index.html, links/, newsletter/, about/, work-with-me/, impressum/, privacy/, 404.html
assets/css/site.css      all styles; colour tokens at the top
assets/js/site.js        click-to-load video + fade-in (the only script)
assets/fonts/            Open Sans 300/400/600/700 (woff2) + OFL.txt licence
assets/img/              motif, icons sprite, portrait placeholders, OG image
favicon.svg, favicon-32.png, favicon.ico, apple-touch-icon.png
sitemap.xml, robots.txt, CNAME (kalunho.com), .nojekyll
config.md                every placeholder and where it is used
LAUNCH-WORK-WITH-ME.md   steps to switch on the hidden page
```

**Header and footer** are copied on every page, between `<!-- HEADER START -->` / `<!-- HEADER END -->` and `<!-- FOOTER START -->` / `<!-- FOOTER END -->`. To change them, use Replace in Files in VS Code (`Cmd+Shift+H`) so every page changes at once. The footer year is plain text (`© 2026`); update it whenever you like.

## 2. Preview locally

```sh
cd path/to/kalunho17.github.io
python3 -m http.server
```

Then open http://localhost:8000. All paths start with `/`, so open the site through the server, not by double-clicking the files.

## 3. Placeholders and photos

**Placeholders:** `config.md` lists every token (`{{YOUTUBE_CHANNEL_URL}}` and the rest), what to enter and where it is used. Replace them with Replace in Files.

**Photos:** the portraits are neutral SVG placeholders. Each place that uses one has a `<!-- TODO PHOTO -->` comment.

| Slot | Placeholder file | Aspect | Recommended size | Where it appears |
|---|---|---|---|---|
| Portrait, large | `assets/img/portrait-placeholder-4x5.svg` | 4:5 | JPG or WebP, at least 1200 × 1500 px, under 250 KB | Home ("How every episode is made"), About (page head) |
| Portrait, round | `assets/img/portrait-placeholder-1x1.svg` | 1:1 | JPG or WebP, at least 600 × 600 px, under 100 KB | `/links/` (shown as a 112 px circle) |

To swap a photo:

1. Save it in `assets/img/`, for example as `portrait-4x5.webp` and `portrait-1x1.webp`.
2. Replace in Files: `portrait-placeholder-4x5.svg` → `portrait-4x5.webp` (2 places), and `portrait-placeholder-1x1.svg` → `portrait-1x1.webp` (1 place).
3. Delete the placeholder files and the `<!-- TODO PHOTO -->` comments.

Keep the aspect ratio. The layout crops to 4:5 and 1:1, so a different ratio gets cut off.

**Open Graph image** (the preview when someone shares the link): `assets/img/og-image.png` is already exported from `assets/img/og-image.svg`. Re-export only if you change the headline in the SVG:

1. Install Open Sans on your Mac: Google Fonts → Open Sans → Get font → Download, then open the `.ttf` files and click Install.
2. Run:

   ```sh
   /Applications/Inkscape.app/Contents/MacOS/inkscape assets/img/og-image.svg --export-type=png --export-filename=assets/img/og-image.png --export-width=1200
   ```

The **video poster** on the home page is HTML and CSS (in `index.html`), not an image. Edit its text there.

## 4. GitHub Pages setup

The repository already exists (`kalunho17/kalunho17.github.io`, remote `origin`) and currently deploys the "under construction" page with a GitHub Actions workflow. The new site is on the branch `site-v1` and deploys **from the branch** instead: no workflow and nothing to update.

1. **Switch the deployment source first.** On github.com, open the repository → **Settings** → **Pages** → **Build and deployment** → **Source**: select **Deploy from a branch**, then **Branch: `main`**, folder **`/ (root)`** → **Save**.
   Do this before pushing. The new `main` no longer contains the Actions workflow, so with the old setting nothing would deploy.
2. **Merge and push:**

   ```sh
   git checkout main
   git merge --ff-only site-v1
   git push origin main
   git branch -d site-v1
   ```

3. **Custom domain:** Settings → Pages → **Custom domain**: `kalunho.com` → **Save** (it may already be set). The `CNAME` file in the repository root already contains `kalunho.com`.
4. **HTTPS:** once the DNS check passes, tick **Enforce HTTPS**. The certificate can take up to 24 hours.
5. **Verify the domain** (prevents someone else from taking it over): click your profile picture → **Settings** → **Pages** (in the sidebar under "Code, planning, and automation") → **Add a domain** → `kalunho.com`. GitHub shows a TXT record. Add it at your registrar (see section 5), wait a few minutes, then click **Verify**.

The first deployment takes about a minute. Check its progress under the repository's **Actions** tab ("pages build and deployment").

## 5. DNS records at your registrar

`kalunho.com` (the apex) is the main address. `www.kalunho.com` redirects to it automatically once its CNAME record exists.

| Type | Host / name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `kalunho17.github.io` |
| TXT | `_github-pages-challenge-kalunho17` | the value GitHub shows in step 5 above |

Delete any other A, AAAA or ALIAS records for `@`, and any other record for `www` (for example a parking page). These values were checked against GitHub's documentation ("Managing a custom domain for your GitHub Pages site") on 28 October 2026.

To check the records once they're live:

```sh
dig kalunho.com +noall +answer -t A
dig kalunho.com +noall +answer -t AAAA
dig www.kalunho.com +noall +answer -t CNAME
```

## 6. Launch checklist

- [ ] **Placeholders replaced:** `grep -rn "{{" --include='*.html' .` prints nothing.
- [ ] **Photos replaced:** both slots from section 3, and the `TODO PHOTO` comments removed.
- [ ] **OG image:** `assets/img/og-image.png` exists. It does already; re-export only if you changed the SVG.
- [ ] **Legal pages reviewed:** every `[TODO]` in `impressum/` and `privacy/` filled, both pages checked by a qualified person, and the "Template" notices deleted. `grep -rn "TODO" --include='*.html' .` prints nothing.
- [ ] **Identity check clean:** the command below prints nothing.
- [ ] **Banned-words check clean:** the command below prints nothing.
- [ ] **Lighthouse:** on the live site, Chrome → DevTools → Lighthouse, mobile and desktop. All four categories at 95 or above.
- [ ] **Links tested on a phone:** every button on `/links/`, the video plays after the click, "Subscribe on YouTube" opens the subscribe dialog, the newsletter button opens Beehiiv.
- [ ] **Bio links set:** `https://kalunho.com/links/` as the link in the Instagram and TikTok bios.
- [ ] **Share preview:** paste `https://kalunho.com` into the LinkedIn Post Inspector and check the image and text.

**Identity check.** The only identity string allowed anywhere on the site is "Dr. Kalun Ho". The brackets stop the command from matching itself in this file:

```sh
grep -rniIE --exclude-dir=.git '[p]hd|[p]h\.d|[c]omputer science|[a]i lab|[h]ead of|[l]eader of|[s]trategist|[a]i strategy & execution|[e]xpert|[t]hought leader|[f]ormer' .
```

**Banned-words check:**

```sh
grep -rniIE --exclude-dir=.git '[g]ame-changer|[r]evolutionary|[u]nlock|[s]upercharge|[j]ourney|[e]cosystem|[d]isrupt|[c]utting-edge|[n]ext-level|[e]mpower|[h]arness|[s]eamless|[t]ransformative|[w]orld-class|[p]assionate' .
```

## 7. Later

- **Work with me:** follow `LAUNCH-WORK-WITH-ME.md`.
- **Newsletter embed:** every newsletter button sits under a `<!-- NEWSLETTER CTA -->` comment (home band, newsletter page twice). To use a Beehiiv embed, replace the `<a class="btn …">` there with Beehiiv's embed code. An embed loads Beehiiv as soon as the page opens, so update the privacy policy first and check whether you then need consent. The plain link avoids both.
- **Analytics:** every page has an `<!-- ANALYTICS SLOT -->` comment in the `<head>` with GoatCounter and Plausible examples (both cookieless). Paste one snippet on every page, and replace the "Cookies and analytics" section of the privacy policy with the commented template below it.

## Rules for future edits

- **Identity:** "Dr. Kalun Ho" is the only identity string. No credentials, titles, roles, employers or descriptors anywhere: not in text, meta tags, alt text, JSON-LD, images or file names.
- **Voice:** headlines state a conclusion, in sentence case, ending with a full stop. Short sentences, "you" singular, plain words, no exclamation marks, no invented facts or numbers.
- **Design:** colours only through the tokens at the top of `site.css`. No shadows, no gradients, no stock photos. `--secondary` text only on white: on tinted backgrounds it fails WCAG AA.
- **Third parties:** nothing may load from another domain before a click. Fonts stay self-hosted.
