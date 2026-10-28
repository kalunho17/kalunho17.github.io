# Launching /work-with-me/

The page is built but hidden: no link points to it, it carries `noindex`, and it is not in the sitemap. Anyone with the URL can still open it (`https://kalunho.com/work-with-me/`), so you can send it to a client before launch.

## Steps to switch it on

1. **Review the copy** in `work-with-me/index.html`. If you want a credibility section, add it where the comment `<!-- LATER: a credibility section … -->` sits. This page is the only exception to the identity rule, and only after launch.

2. **Remove the hidden markers** at the top of `work-with-me/index.html`:
   - delete the line `<!-- HIDDEN: not linked, noindex. To launch: add to nav + sitemap, remove noindex. -->`
   - delete the line `<meta name="robots" content="noindex">`

3. **Add it to the navigation on every page that has a header.** In VS Code, open Replace in Files (`Cmd+Shift+H`):
   - Find: `<li><a href="/about/">About</a></li>`
   - Replace: `<li><a href="/about/">About</a></li>` + new line + `        <li><a href="/work-with-me/">Work with me</a></li>`
   - The About page itself has `aria-current="page"` on its About link, so do it there by hand: add the same `<li>` after its About item.
   - In `work-with-me/index.html`, add `aria-current="page"` to the new link: `<a href="/work-with-me/" aria-current="page">`.

   This covers `index.html`, `newsletter/`, `about/`, `work-with-me/`, `impressum/`, `privacy/` and `404.html`. `/links/` has no navigation; add a button there only if you want one.

4. **Add it to the sitemap.** In `sitemap.xml`, add this line before `</urlset>`:

   ```xml
   <url><loc>https://kalunho.com/work-with-me/</loc></url>
   ```

5. **Optional:** link it from the About page's contact row ("For workshops and talks, see Work with me.").

6. **Check before you push:**
   - Open the site locally (`python3 -m http.server`) and check the header at 360 px wide: four nav items must fit on one line.
   - Run the identity and banned-words checks from `README.md` (section 6).

7. **Commit and push.**
