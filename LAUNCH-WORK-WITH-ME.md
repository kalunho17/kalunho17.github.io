# Launching /work-with-me/

The page is built but hidden: no link points to it, it carries `noindex`, and it is not in the sitemap. Anyone with the URL can still open it (`https://kalunho.com/work-with-me/`), so you can send it to a client before launch.

## Steps to switch it on

1. **Rewrite the copy** in `work-with-me/index.html`. The page still uses the wording from before the 3 November 2026 tone change (quiet, no promises, no "decision" or "what AI means for business" framing, no self-praise; see `README.md`, "Rules for future edits"). Lines to change:
   - `<title>`, `meta description`, `og:description`, `twitter:description` (lines 24, 25, 40, 47): "built on the same sourced method as the channel" is a claim about rigour. Say what the page offers instead, for example "Workshops, talks and hands-on support on AI, for teams and leadership audiences."
   - The h1 "Bring the channel's method into your organisation." and the lead "… sourced figures, clear options and a decision at the end." (lines 111 and 112). Use a plain heading such as "Workshops, talks and hands-on support." and a lead that names the three formats without promising outcomes.
   - Workshops card (lines 126 and 128): drop "a short list of decisions"; say what a session is.
   - Speaking card (line 132): replace "what AI means for business" (the old positioning) and "Every figure on stage is cited, as in the videos" (self-expectation, not a selling point).
   - Hands-on card (line 138): "moving from a decision to a working use case" still uses the decision framing.
   - The `card__label` "What you get" blocks (lines 127, 133, 139): keep only if they stay factual; otherwise remove them.
   - The band "Start with a short email." (lines 150 and 151) is fine.
   - Decide whether to fill the `<!-- LATER: a credibility section … -->` slot (line 143). If you do, keep it to the same facts as the About bio: AI Lab of a large German company, doctorate in computer vision, talks at company events, universities and career fairs. Do not name the employer. Clients or references only with their written permission.
   - Keep the page in the same person as the rest of the site: the About page uses "I", the home page mostly describes the videos. Pick one for this page and stay with it.

2. **Remove the hidden markers** at the top of `work-with-me/index.html`:
   - delete the line `<!-- HIDDEN: not linked, noindex. To launch: add to nav + sitemap, remove noindex. -->`
   - delete the line `<meta name="robots" content="noindex">`

3. **Add it to the navigation on every page that has a header.** In VS Code, open Replace in Files (`Cmd+Shift+H`):
   - Find: `<li><a href="/about/">About</a></li>`
   - Replace: `<li><a href="/about/">About</a></li>` + new line + `        <li><a href="/work-with-me/">Work with me</a></li>`
   - The About page itself has `aria-current="page"` on its About link, so do it there by hand: add the same `<li>` after its About item.
   - In `work-with-me/index.html`, add `aria-current="page"` to the new link: `<a href="/work-with-me/" aria-current="page">`.

   This covers `index.html` (or `home/index.html` while the site is still under construction), `newsletter/`, `about/`, `work-with-me/`, `impressum/`, `privacy/` and `404.html`. `/links/` and the construction page have no navigation.

4. **Add it to the sitemap.** In `sitemap.xml`, add this line before `</urlset>`:

   ```xml
   <url><loc>https://kalunho.com/work-with-me/</loc></url>
   ```

5. **Optional:** link it from the About page's contact row ("For workshops and talks, see Work with me."), and update the sentence in the About "Who I am" row that mentions talks, so it points here.

6. **Fill the remaining placeholder.** The page has one `{{CONTACT_EMAIL}}` token (line 154). It is the same address as on `/about/`, `/impressum/` and `/privacy/`, so replace it everywhere at once (`config.md`).

7. **Check before you push:**
   - Open the site locally (`python3 -m http.server`) and check the header at 360 px wide: four nav items must fit on one line.
   - Run the identity and banned-words checks from `README.md` (section 6). Both must print nothing.
   - Read the page once more against the About page: same tone, same facts, nothing the About page does not also say.

8. **Commit and push.**
