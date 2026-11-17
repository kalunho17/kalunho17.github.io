#!/usr/bin/env node
// Copies an episode's rendered YouTube thumbnail into the site as a compressed image, so the
// videos page can show it without loading anything from YouTube.
//
//   node .claude/skills/add-video/thumb.mjs --episode ep-003 --number 3 [--png <path>] [--youtube-repo <path>]
//
// Source: <MEDIA_ROOT>/<episode id>/render/thumbnail.png (MEDIA_ROOT from the channel repo's
// .env; only that one key is read), or --png. Output: assets/img/videos/video-<n>.webp,
// 960 × 540. Needs ffmpeg on the PATH. Prints JSON; nothing is committed.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..", "..", "..");
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const fail = (message) => {
  console.log(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
};

const episode = flag("--episode");
const number = Number(flag("--number"));
const ytRepo = resolve(flag("--youtube-repo") ?? resolve(siteRoot, "..", "youtube"));
if (!Number.isInteger(number) || number < 1) fail("usage: thumb.mjs --episode ep-NNN --number <video number> [--png <path>]");

let png = flag("--png");
if (!png) {
  if (!/^ep-\d{3}$/.test(episode ?? "")) fail("pass --episode ep-NNN (the short id, as the media folder is named) or --png <path>");
  const envFile = resolve(ytRepo, ".env");
  if (!existsSync(envFile)) fail(`${envFile} not found: pass --png <path to thumbnail.png>`);
  const line = readFileSync(envFile, "utf8").split(/\r?\n/).find((l) => l.startsWith("MEDIA_ROOT="));
  const mediaRoot = line?.slice("MEDIA_ROOT=".length).trim().replace(/^["']|["']$/g, "");
  if (!mediaRoot) fail("MEDIA_ROOT is not set in the channel repo's .env: pass --png <path to thumbnail.png>");
  png = resolve(mediaRoot, episode, "render", "thumbnail.png");
}
if (!existsSync(png)) fail(`${png} not found: render it in the channel repo (pnpm yt render thumb <episode-dir>) or pass --png`);

const outDir = resolve(siteRoot, "assets", "img", "videos");
mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, `video-${number}.webp`);
try {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-vf", "scale=960:540:flags=lanczos", "-c:v", "libwebp", "-quality", "82", "-compression_level", "6", out], { stdio: ["ignore", "ignore", "pipe"] });
} catch (e) {
  fail(`ffmpeg failed: ${String(e.stderr ?? e.message).trim().slice(0, 400)}`);
}
console.log(JSON.stringify({ ok: true, source: png, written: out, src: `/assets/img/videos/video-${number}.webp`, bytes: statSync(out).size }, null, 2));
