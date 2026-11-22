---
name: add-video
description: Add a newly published YouTube video to kalunho.com/videos/ and the home page. Use when the user pastes a YouTube video URL and asks to add it to the website, update the videos page, or says they published a video. Builds the entry from the episode in the channel repo (takeaway, Google Drive handout and deck links, numbered sources), inserts it, runs the site checks, commits and pushes. On the first video it also walks through going live.
---

# Add a published video to the website

The user publishes a video on YouTube, pastes its URL and asks for it to be added. One entry
goes at the top of `videos/index.html`, and the home page (`index.html`) gets the new video in
its "Latest video" block and its question at the top of "The questions".

The content comes from the channel repo (`../youtube`, the episode folder), not from YouTube.
YouTube only supplies the published title. The helper script uses the channel repo's own
code to number the sources, so they match the video, the handout and the deck.

## Steps

### 1. Copy the thumbnail, then build the entry

The entry shows the video's own YouTube thumbnail, as a local copy: nothing may load from YouTube
before the visitor clicks. Copy it from the channel repo's render folder first (needs ffmpeg):

```sh
node .claude/skills/add-video/thumb.mjs --episode ep-003 --number 3
```

`--number` is the video's number on the page (the newest existing entry plus one), `--episode` the
short episode id as the media folder is named. `--png <path>` takes any other file, for example
the thumbnail the user actually uploaded if it differs from the render. It writes
`assets/img/videos/video-<n>.webp` (960 × 540). Then:

```sh
node .claude/skills/add-video/entry.mjs "<youtube-url>"
```

Options: `--episode ep-003` when the user names the episode or the match is wrong,
`--pdf "<drive-url>"` / `--pptx "<drive-url>"` when the user pastes the handout or deck link in the chat,
`--youtube-repo <path>` if the channel repo is not next to this one.

The script prints JSON and writes nothing. Read it before going on:

- **`error`**: stop and tell the user. A common one: the channel repo packages are not
  built. Run `pnpm install && pnpm build` in the channel repo, then retry.
- **`already_listed: true`**: the video is on the page already. Tell the user and stop.
- **`match` and `title_fit`**: which episode the entry is built from. If `title_fit` is below
  0.3, or `match.candidates` has more than one plausible episode, ask the user which episode
  it is and rerun with `--episode`. Never guess.
- **`missing`**: resolve each item before writing.
  - `thumbnail`: run `thumb.mjs` as above, then rerun. If the episode has no rendered thumbnail,
    ask the user for the image they uploaded to YouTube and pass it with `--png`.
  - `pdf_url` / `pptx_url`: only listed when the episode has no `files_url` (the shared Drive folder
    with both files, the channel repo's default; the entry then links the folder once). Ask the user for the Google Drive share link of `handout.pdf`
    or `deck.pptx`. When they give it, also write it into the episode's `episode.yaml` as
    `pdf_url:` or `pptx_url:` (the channel repo reads them for the YouTube description), then
    rerun.
  - The YouTube title could not be read: the video may still be processing or private.
    Ask the user to check that it is public, or to paste the title.
  - Takeaway or references missing: the episode is not finished in the channel repo. Tell
    the user and stop.

Never publish an entry that still contains `PDF_URL_MISSING` or `PPTX_URL_MISSING`.

### 2. Insert it

In `videos/index.html`, put `entry_html` as the first child of `<div class="entries">`,
replacing the `<!-- Newest video goes here -->` comment line on the first video, above the
previous newest entry afterwards. Newest is always first. Leave the `<!-- ENTRY TEMPLATE -->`
comment in place.

On the home page (`index.html`):

- Replace everything from `<!-- LATEST VIDEO START` to `<!-- LATEST VIDEO END -->`, both
  markers included, with `home_html`. It shows the new video's thumbnail, title and takeaway.
- Add the video's question as the first item of the list under `<!-- QUESTIONS -->`, linked
  to its entry: `<li><a href="/videos/#video-<n>">…?</a></li>`. Phrase it as the question the
  video answers, in sentence case, from the published title (for example "Should You Buy a
  GPU? Count Your Tasks First." became "Should you buy a GPU, or keep paying for the API?").
  Keep every earlier question; one per published video, newest first.

If the episode has an experiment page (`experiments/<slug>/` whose "The video" link still points
at the channel, `<!-- VIDEO LINK -->`), add the third link "The experiment" to the entry (the
template shows it), and link the video from the experiment page. Experiment pages are built,
never edited by hand: in the channel repository, set `youtube_url` in the episode's
`episode.yaml` first if it is not there yet, then run `python episodes/<episode>/website/build.py`,
the word check `python .claude/skills/experiment-writeup/page/wordcheck.py
../kalunho17.github.io/experiments/*/index.html`, and `node .claude/skills/experiment-writeup/og.mjs <slug>`.
That also regenerates the experiment's card thumbnail on `experiments/index.html` and its share image.
The experiment card keeps its chart thumbnail; only the video entry shows the YouTube thumbnail.

Do not change the headline: it is the title as published on YouTube, so a visitor recognises
it. Do not rewrite the takeaway or the sources: they come from the channel repo, where they
were approved.

### 3. First video only (`first_video: true`)

The site goes live on the day of the first video (TODO.md, "Go live"). Before pushing:

1. Delete the block from `<!-- FIRST VIDEO NOTICE: delete with the first entry. -->` to the
   end of its `<div class="section-head">` in `videos/index.html`.
2. Replace the four example questions on the home page (`home/index.html`, or `index.html`
   if the site is already live; the list under `<!-- EXAMPLE QUESTIONS -->`). Propose the
   first video's question, phrased like the others ("Why …?"), and ask the user which
   planned questions to keep. Remove the `EXAMPLE QUESTIONS` comment when they are real.
3. Check the placeholders: `grep -rn "{{" --include='*.html' .`.
   `{{YOUTUBE_UPLOADS_PLAYLIST}}` needs the channel ID (YouTube Studio → Settings → Channel →
   Advanced settings, `UC…` becomes `UU…`). Ask the user for any value that is left.
4. Ask the user whether to go live now. If yes, follow TODO.md section 2, "Go live":
   move `home/index.html` to `index.html`, replace `robots.txt`, optionally drop the
   under-construction CSS block. Also check the to-do list in TODO.md (photos, legal pages)
   and tell the user what is still open. Going live with unfinished legal pages is the
   user's call, not yours.

### 4. Check

This must print nothing:

```sh
grep -rnE "PDF_URL_MISSING|PPTX_URL_MISSING" --include='*.html' .
grep -rnE "i\.ytimg\.com|img\.youtube\.com" --include='*.html' .        # thumbnails only as local copies
grep -o 'src="/assets/img/videos/[^"]*"' videos/index.html | cut -d'"' -f2 | while read f; do [ -f ".$f" ] || echo "missing $f"; done
```

Then run the identity, private-terms and banned-words checks from `TODO.md` (local, git-ignored), section 6
("Checks"). All three must print nothing. If `.local/private-terms.txt` is missing, tell
the user the private-terms check could not run. Never copy private terms into this file or
any other tracked file: everything in this repository is public on GitHub and on kalunho.com.

If a check hits text that came from the episode (a source title, a YouTube title), tell the
user instead of editing it.

### 5. Commit and push

Pasting the URL and asking for the update is the request to publish, so commit and push to
`main` unless the user said to hold. GitHub Pages is live about a minute later.

```sh
git add videos/index.html index.html assets/img/videos/video-<n>.webp   # plus experiments/<slug>/index.html,
                                     # experiments/index.html and assets/img/og-<slug>.* when the experiment
                                     # page was regenerated, plus home/index.html, index.html, robots.txt … on the first video
git commit -m "Add video <n>: <title>"
git push origin main
```

End the commit message with the attribution line from the current system reminder. Only
stage what this skill changed. If the episode's `episode.yaml` got a `pdf_url` or `pptx_url`, that file is
in the channel repo; the episodes folder is git-ignored there, so there is nothing to commit
on that side.

### 6. Report

Tell the user in a few lines: which episode the entry came from, the link to
`https://kalunho.com/videos/#video-<n>`, and anything left open. On the first video, say
whether the site went live.

## Rules

- Public word is "video", never "episode".
- Both files are free: the handout (`pdf_url`) and the deck (`pptx_url`) are linked side by side.
- Link Google Drive, never embed it.
- The thumbnail is always the local copy (`assets/img/videos/`), never an image from YouTube's servers:
  the privacy policy says nothing loads from YouTube before a click. Clicking it plays the video in
  place through youtube-nocookie.com (`data-video`, `assets/js/site.js`).
- One entry per video. Do not touch older entries unless the user asks.
