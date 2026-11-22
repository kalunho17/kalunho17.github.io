#!/usr/bin/env node
// Builds the /videos/ entry for one published video, from the YouTube URL and the episode
// in the channel repo. Prints JSON: the episode it matched, what is missing, and the entry HTML.
//
//   node .claude/skills/add-video/entry.mjs <youtube-url> [--episode ep-003] [--pdf <drive-url>] [--pptx <drive-url>] [--files <drive-folder-url>] [--youtube-repo <path>]
//
// The sources are numbered with the channel repo's own code (@yt/layout numberReferences),
// so the numbers match the video, the handout and the deck. Nothing is written to disk.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..", "..", "..");

// --- Arguments --------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const episodeArg = flag("--episode");
const pdfArg = flag("--pdf");
const pptxArg = flag("--pptx");
const filesArg = flag("--files");
const ytRepo = resolve(flag("--youtube-repo") ?? resolve(siteRoot, "..", "youtube"));
const url = args[0];

const fail = (message) => {
  console.log(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
};
if (!url) fail("usage: entry.mjs <youtube-url> [--episode ep-NNN] [--pdf <drive-url>] [--pptx <drive-url>]");

// --- Video id ---------------------------------------------------------------
function videoId(u) {
  let parsed;
  try { parsed = new URL(u); } catch { return null; }
  const host = parsed.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    const m = parsed.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/);
    if (m) return m[1];
  }
  return null;
}
const id = videoId(url);
if (!id || !/^[\w-]{11}$/.test(id)) fail(`not a YouTube video URL: ${url}`);
const watchUrl = `https://www.youtube.com/watch?v=${id}`;

// --- Published title (oEmbed: public, no key) --------------------------------
let ytTitle = null;
let titleNote = null;
try {
  const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`);
  if (r.ok) ytTitle = (await r.json()).title ?? null;
  else titleNote = `oEmbed returned ${r.status} (private, unlisted-and-restricted or not yet processed?)`;
} catch (e) {
  titleNote = `oEmbed request failed: ${e.message}`;
}

// --- Channel repo packages ----------------------------------------------------
const ioPath = resolve(ytRepo, "packages", "io", "dist", "index.js");
const layoutPath = resolve(ytRepo, "packages", "layout", "dist", "index.js");
if (!existsSync(ioPath) || !existsSync(layoutPath)) {
  fail(`channel repo packages not built at ${ytRepo}. Run "pnpm install && pnpm build" there.`);
}
const { loadEpisode } = await import(pathToFileURL(ioPath).href);
const { numberReferences, fullRef } = await import(pathToFileURL(layoutPath).href);

// --- Find the episode -----------------------------------------------------------
const episodesDir = resolve(ytRepo, "episodes");
const words = (s) => new Set(String(s ?? "").toLowerCase().match(/[a-z0-9]+/g) ?? []);
const overlap = (a, b) => {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / Math.max(A.size, B.size);
};

const loaded = [];
for (const name of existsSync(episodesDir) ? readdirSync(episodesDir) : []) {
  if (!/^ep-\d{3}/.test(name)) continue;
  const dir = resolve(episodesDir, name);
  if (!existsSync(resolve(dir, "episode.yaml"))) continue;
  try { loaded.push(loadEpisode(dir)); } catch (e) { /* invalid episode: skip, yt validate reports it */ }
}

let ep;
let match;
if (episodeArg) {
  ep = loaded.find((e) => e.episode.id === episodeArg || e.id === episodeArg || e.id.startsWith(episodeArg + "-"));
  if (!ep) fail(`episode ${episodeArg} not found in ${episodesDir}`);
  match = { by: "--episode" };
} else {
  const candidates = loaded
    .filter((e) => e.id !== "ep-000-sample" && ["rendered", "published"].includes(e.episode.status))
    .map((e) => ({ e, score: ytTitle ? Math.max(overlap(ytTitle, e.content?.meta?.title), overlap(ytTitle, e.episode.working_title)) : 0 }))
    .sort((a, b) => b.score - a.score || b.e.id.localeCompare(a.e.id));
  if (!candidates.length) fail(`no episode with status rendered or published in ${episodesDir}. Pass --episode ep-NNN.`);
  ep = candidates[0].e;
  match = {
    by: ytTitle ? "title overlap" : "newest rendered/published episode",
    score: Number(candidates[0].score.toFixed(2)),
    candidates: candidates.slice(0, 5).map((c) => ({ id: c.e.id, status: c.e.episode.status, title: c.e.content?.meta?.title ?? c.e.episode.working_title, score: Number(c.score.toFixed(2)) })),
  };
}
if (!ep.content) fail(`${ep.id} has no content.yaml`);
// How well the published title fits the chosen episode, 0 to 1. Low means: confirm with the user.
const titleFit = ytTitle ? Number(Math.max(overlap(ytTitle, ep.content.meta.title), overlap(ytTitle, ep.episode.working_title)).toFixed(2)) : null;

// --- Entry fields -----------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtDate = (s) => {
  const m = String(s ?? "").match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return null;
  return `${months[Number(m[2]) - 1]} ${m[1]}`;
};
const fmtAccessed = (s) => {
  const m = String(s ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}` : null;
};
const typeLabel = { explainer: "Explainer", "case-study": "Case study", news: "News" }[ep.episode.type] ?? ep.episode.type;

const videosHtml = readFileSync(resolve(siteRoot, "videos", "index.html"), "utf8");
const live = videosHtml.replace(/<!--[\s\S]*?-->/g, "");
const existing = (live.match(/<article class="entry[\s"]/g) ?? []).length;  // "entry" or "entry entry--thumb"
const alreadyListed = live.includes(`watch?v=${id}`);
// A listed video keeps its number, so home_html can be rebuilt for it; a new one is the next number.
const listedNumber = alreadyListed
  ? Number(live.match(new RegExp(`id="video-(\\d+)"[\\s\\S]*?watch\\?v=${id}`))?.[1] ?? NaN)
  : NaN;
const number = Number.isFinite(listedNumber) ? listedNumber : existing + 1;

const headline = ytTitle ?? ep.content.meta.title;
const takeaway = ep.episode.takeaway;
const date = fmtDate(ep.episode.publish_date) ?? fmtDate(ep.content.meta.date) ?? fmtDate(new Date().toISOString().slice(0, 10));
const pdfUrl = pdfArg ?? ep.episode.pdf_url ?? null;
const pptxUrl = pptxArg ?? ep.episode.pptx_url ?? null;
// The channel repo's default is one shared Drive folder with both files (episode.yaml → files_url).
// Single file links win when both are set; otherwise the entry links the folder once.
const filesUrl = pdfUrl && pptxUrl ? null : (filesArg ?? ep.episode.files_url ?? null);

const numbering = numberReferences(ep.content);
const byId = new Map(ep.content.references.map((r) => [r.id, r]));
const refs = [...numbering.entries()].sort((a, b) => a[1] - b[1]).map(([rid]) => byId.get(rid)).filter(Boolean);
const sourceItems = refs.map((r) => {
  const f = fullRef(r);
  const link = f.url ? ` <a href="${esc(f.url)}">${esc(f.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>.` : "";
  const acc = fmtAccessed(f.accessed);
  return `            <li>${esc(f.text)}${link}${acc ? ` Accessed ${acc}.` : ""}</li>`;
});

const missing = [];
if (!filesUrl && !pdfUrl) missing.push("pdf_url: the Google Drive share link of handout.pdf (episode.yaml → pdf_url, or pass --pdf), or the folder link (files_url, --files)");
if (!filesUrl && !pptxUrl) missing.push("pptx_url: the Google Drive share link of deck.pptx (episode.yaml → pptx_url, or pass --pptx), or the folder link (files_url, --files)");
if (filesUrl && !/^https:\/\/drive\.google\.com\//.test(filesUrl)) missing.push(`files_url is not a Google Drive link: ${filesUrl}`);
if (!ytTitle) missing.push(`YouTube title (${titleNote}); the headline falls back to content.yaml meta.title`);
if (!takeaway || /^TODO/i.test(takeaway)) missing.push("takeaway in episode.yaml");
if (!refs.length) missing.push("references in content.yaml");
if (pdfUrl && !/^https:\/\/(drive|docs)\.google\.com\//.test(pdfUrl)) missing.push(`pdf_url is not a Google Drive link: ${pdfUrl}`);
if (pptxUrl && !/^https:\/\/(drive|docs)\.google\.com\//.test(pptxUrl)) missing.push(`pptx_url is not a Google Drive link: ${pptxUrl}`);

// The thumbnail is a local copy of the video's own artwork (thumb.mjs), never YouTube's image server.
const thumbSrc = `/assets/img/videos/video-${number}.webp`;
const thumbExists = existsSync(resolve(siteRoot, "assets", "img", "videos", `video-${number}.webp`));
if (!thumbExists) missing.push(`thumbnail: run node .claude/skills/add-video/thumb.mjs --episode ${ep.id.match(/^ep-\d{3}/)?.[0] ?? "ep-NNN"} --number ${number}`);

const pdfLine = pdfUrl ?? "PDF_URL_MISSING";
const pptxLine = pptxUrl ?? "PPTX_URL_MISSING";
const entry = `      <article class="entry entry--thumb" id="video-${number}">
        <div class="entry__media">
          <div class="video">
            <a class="video__poster video__poster--image" href="${watchUrl}" data-video="${id}" data-title="${esc(headline)}">
              <img src="${thumbSrc}" alt="" width="960" height="540" loading="lazy">
              <span class="video__button"><svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg#play"></use></svg></span>
              <span class="sr-only">Play the video: ${esc(headline)} (loads the YouTube player)</span>
            </a>
          </div>
        </div>
        <div class="entry__body">
          <p class="meta">Video ${number} · ${esc(date)} · ${esc(typeLabel)}</p>
          <h2>${esc(headline)}</h2>
          <p>${esc(takeaway)}</p>
          <div class="actions">
            <a class="btn btn--small" href="${watchUrl}">
              <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#youtube"></use></svg>
              Watch on YouTube
            </a>
${filesUrl ? `            <a class="link-arrow" href="${esc(filesUrl)}">
              <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#document"></use></svg>
              Handout and deck (PDF and PowerPoint, Google Drive)
            </a>
` : `            <a class="link-arrow" href="${esc(pdfLine)}">
              <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#document"></use></svg>
              Handout (PDF, Google Drive)
            </a>
            <a class="link-arrow" href="${esc(pptxLine)}">
              <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#document"></use></svg>
              Deck (PowerPoint, Google Drive)
            </a>
`}          </div>
          <details class="entry__sources">
            <summary>Sources</summary>
            <ol class="sources">
${sourceItems.join("\n")}
            </ol>
          </details>
        </div>
      </article>`;

// The home page's "Latest video" block: replaces everything between the LATEST VIDEO markers in index.html.
const arrow = `<svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#arrow-right"></use></svg>`;
const home = `<!-- LATEST VIDEO START: written by the add-video skill (entry.mjs → home_html), one block per new video. -->
      <div class="section-head">
        <p class="kicker">Latest video</p>
        <h2 id="latest-title">${esc(headline)}</h2>
        <p class="lead">${esc(takeaway)}</p>
        <div class="actions">
          <a class="link-arrow" href="/videos/#video-${number}">
            Handout, deck and sources
            ${arrow}
          </a>
          <a class="link-arrow" href="/videos/">
            All videos
            ${arrow}
          </a>
        </div>
      </div>
      <div>
        <!-- Click-to-load: nothing loads from YouTube until the click (see /assets/js/site.js). -->
        <div class="video">
          <a class="video__poster video__poster--image" href="${watchUrl}" data-video="${id}" data-title="${esc(headline)}">
            <img src="${thumbSrc}" alt="" width="960" height="540" loading="lazy">
            <span class="video__button"><svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg#play"></use></svg></span>
            <span class="sr-only">Play the video: ${esc(headline)} (loads the YouTube player)</span>
          </a>
        </div>
        <p class="caption video-note">The video loads from YouTube (youtube-nocookie.com) only when you click play. <a href="/privacy/#youtube">How YouTube handles your data</a></p>
      </div>
<!-- LATEST VIDEO END -->`;

console.log(JSON.stringify({
  ok: missing.length === 0 && !alreadyListed,
  video: { id, url: watchUrl, title: ytTitle },
  episode: { id: ep.id, status: ep.episode.status, title: ep.content.meta.title, dir: ep.dir },
  match,
  title_fit: titleFit,
  number,
  first_video: existing === 0,
  already_listed: alreadyListed,
  missing,
  thumbnail: { src: thumbSrc, exists: thumbExists },
  entry_html: entry,
  home_html: home,
}, null, 2));
