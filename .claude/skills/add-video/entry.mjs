#!/usr/bin/env node
// Builds the /videos/ entry for one published video, from the YouTube URL and the episode
// in the channel repo. Prints JSON: the episode it matched, what is missing, and the entry HTML.
//
//   node .claude/skills/add-video/entry.mjs <youtube-url> [--episode ep-003] [--pdf <drive-url>] [--pptx <drive-url>] [--youtube-repo <path>]
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
const existing = (live.match(/<article class="entry"/g) ?? []).length;
const alreadyListed = live.includes(`watch?v=${id}`);
const number = existing + 1;

const headline = ytTitle ?? ep.content.meta.title;
const takeaway = ep.episode.takeaway;
const date = fmtDate(ep.episode.publish_date) ?? fmtDate(ep.content.meta.date) ?? fmtDate(new Date().toISOString().slice(0, 10));
const pdfUrl = pdfArg ?? ep.episode.pdf_url ?? null;
const pptxUrl = pptxArg ?? ep.episode.pptx_url ?? null;

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
if (!pdfUrl) missing.push("pdf_url: the Google Drive share link of handout.pdf (episode.yaml → pdf_url, or pass --pdf)");
if (!pptxUrl) missing.push("pptx_url: the Google Drive share link of deck.pptx (episode.yaml → pptx_url, or pass --pptx)");
if (!ytTitle) missing.push(`YouTube title (${titleNote}); the headline falls back to content.yaml meta.title`);
if (!takeaway || /^TODO/i.test(takeaway)) missing.push("takeaway in episode.yaml");
if (!refs.length) missing.push("references in content.yaml");
if (pdfUrl && !/^https:\/\/(drive|docs)\.google\.com\//.test(pdfUrl)) missing.push(`pdf_url is not a Google Drive link: ${pdfUrl}`);
if (pptxUrl && !/^https:\/\/(drive|docs)\.google\.com\//.test(pptxUrl)) missing.push(`pptx_url is not a Google Drive link: ${pptxUrl}`);

const pdfLine = pdfUrl ?? "PDF_URL_MISSING";
const pptxLine = pptxUrl ?? "PPTX_URL_MISSING";
const entry = `      <article class="entry" id="video-${number}">
        <p class="meta">Video ${number} · ${esc(date)} · ${esc(typeLabel)}</p>
        <h2>${esc(headline)}</h2>
        <p>${esc(takeaway)}</p>
        <div class="actions">
          <a class="btn btn--small" href="${watchUrl}">
            <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#youtube"></use></svg>
            Watch on YouTube
          </a>
          <a class="link-arrow" href="${esc(pdfLine)}">
            <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#document"></use></svg>
            Handout (PDF, Google Drive)
          </a>
          <a class="link-arrow" href="${esc(pptxLine)}">
            <svg class="icon icon--sm" aria-hidden="true"><use href="/assets/img/icons.svg#document"></use></svg>
            Deck (PowerPoint, Google Drive)
          </a>
        </div>
        <details class="entry__sources">
          <summary>Sources</summary>
          <ol class="sources">
${sourceItems.join("\n")}
          </ol>
        </details>
      </article>`;

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
  entry_html: entry,
}, null, 2));
