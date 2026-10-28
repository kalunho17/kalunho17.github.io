# Placeholders

Every value you still have to fill in. The HTML uses these exact tokens, so you can search and replace them across the whole site.

**How to replace:** in VS Code, press `Cmd+Shift+H` (Replace in Files), enter the token, for example `{{TIKTOK_URL}}`, enter your value, and click **Replace All**. When you're done, this command must print nothing:

```sh
grep -rn "{{" --include='*.html' .
```

## Tokens

| Token | What to enter | Example | Used in (count) |
|---|---|---|---|
| `{{YOUTUBE_CHANNEL_URL}}` | Your channel URL, **without a trailing slash**. The site adds `/videos` and `?sub_confirmation=1` itself. | `https://www.youtube.com/@yourhandle` | `index.html` (6), `about/` (4), `links/` (4), `newsletter/` (3), `impressum/` (3), `privacy/` (3), `work-with-me/` (3), `404.html` (3) |
| `{{YOUTUBE_UPLOADS_PLAYLIST}}` | Your channel ID with `UC` at the start replaced by `UU`. Find the channel ID in YouTube Studio → Settings → Channel → Advanced settings. | channel `UCabc123…` → `UUabc123…` | `index.html` (1, the click-to-load player) |
| `{{BEEHIIV_SUBSCRIBE_URL}}` | The public subscribe page of your Beehiiv newsletter. | `https://yourname.beehiiv.com/subscribe` | `newsletter/` (2), `index.html` (1), `links/` (1) |
| `{{INSTAGRAM_URL}}` | Your Instagram profile URL. | `https://www.instagram.com/yourhandle/` | footer of every page (1 each), `links/` (+1 button), JSON-LD `sameAs` on every public page (1 each) |
| `{{TIKTOK_URL}}` | Your TikTok profile URL. | `https://www.tiktok.com/@yourhandle` | footer of every page (1 each), `links/` (+1 button), JSON-LD `sameAs` on every public page (1 each) |
| `{{CONTACT_EMAIL}}` | A public contact address, **not your private one**. Shown as text and used in `mailto:` links. Also serves as the email in the Impressum and the privacy policy. | `hello@kalunho.com` | `privacy/` (4), `about/` (2), `impressum/` (2), `work-with-me/` (1) |
| `{{CHANNEL_NAME}}` | Not decided yet, so it is **not used as a token**. Where a name is needed, the site uses "Dr. Kalun Ho". See below. | | – |

`{{YOUTUBE_CHANNEL_URL}}` also appears in the header button and footer of every page, which is why every file contains it.

### When you decide on a channel name

The person stays "Dr. Kalun Ho". Only the site name changes. Replace "Dr. Kalun Ho" with the channel name in these two places on every page:

1. `<meta property="og:site_name" content="Dr. Kalun Ho">`
2. The JSON-LD block, inside `"@type": "WebSite"`: `"name": "Dr. Kalun Ho"`. Do **not** change the `"@type": "Person"` name.

Optionally, also change the wordmark in the header (`<span>Dr. Kalun Ho</span>` inside `class="brand"`) and the suffix in each `<title>` (`… · Dr. Kalun Ho`).

## Legal details: `[TODO: …]` markers

The Impressum and the privacy policy use visible `[TODO: …]` markers instead of tokens. Fill them in, have both pages reviewed, then delete the yellow-bordered "Template" notice at the top of each page.

| File | Markers |
|---|---|
| `impressum/index.html` | street and house number, postcode and city, phone number (or delete the line), VAT ID (or delete the section). Also check that the name matches your legal name. |
| `privacy/index.html` | date of the review, street and house number, postcode and city, GitHub's Data Privacy Framework certification (confirm), the newsletter section (Beehiiv processing), the supervisory authority of your federal state |

Check what's left with:

```sh
grep -rn "TODO" --include='*.html' .
```

## Photos

See the photo slot table in `README.md` (section 3).
