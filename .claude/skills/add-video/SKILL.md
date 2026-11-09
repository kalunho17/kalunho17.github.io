---
name: add-video
description: Add a newly published YouTube video to kalunho.com/videos/. Use when the user pastes a YouTube video URL and asks to add it to the website, update the videos page, or says they published a video. Builds the entry from the episode in the channel repo (takeaway, Google Drive handout and deck links, numbered sources), inserts it, runs the site checks, commits and pushes. On the first video it also walks through going live.
---

# Add a published video to the website

The user publishes a video on YouTube, pastes its URL and asks for it to be added. One entry
goes at the top of `videos/index.html`. Everything else on the site updates itself.

The content comes from the channel repo (`../youtube`, the episode folder), not from YouTube.
YouTube only supplies the published title. The helper script uses the channel repo's own
code to number the sources, so they match the video, the handout and the deck.

## Steps

### 1. Build the entry

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
  - `pdf_url` / `pptx_url`: ask the user for the Google Drive share link of `handout.pdf`
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

If the episode has an experiment page (`experiments/<slug>/` whose "The video" link still points
at the channel, `<!-- VIDEO LINK -->`), add the third link "The experiment" to the entry (the
template shows it), and point the experiment page's video link at the new video URL.

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
git add videos/index.html            # plus home/index.html, index.html, robots.txt … on the first video
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
- One entry per video. Do not touch older entries unless the user asks.
