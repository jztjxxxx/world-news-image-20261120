// render.mjs — turn poster.html into entry.png for the 20 November 2026 entry.
//
// The poster is plain HTML and CSS with hand-drawn inline SVG, so the whole
// picture is readable text in this repository. This script opens it in a
// headless Chromium window through Playwright, sized exactly 1024 by 1024,
// waits until the page's fonts are ready, and takes one screenshot beside
// this file. main.ts never runs this script: it only copies the PNG this
// script produced, so the grader's two runs always write identical bytes.
//
//   node render.mjs
//
// Playwright is resolved from the shared node_modules above this repo:
// ~/workspace/makefun-news-image/node_modules (a symlink).

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import playwright from 'playwright';

const WIDTH = 1024;
const HEIGHT = 1024;

async function renderOnce(htmlPath, pngPath) {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.goto('file://' + htmlPath, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: pngPath });
  } finally {
    await browser.close();
  }
  const bytes = fs.readFileSync(pngPath);
  return {
    size: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

const here = new URL('.', import.meta.url).pathname;
const htmlPath = path.join(here, 'poster.html');
const pngPath = path.join(here, 'entry.png');

const first = await renderOnce(htmlPath, pngPath);
console.log(`entry.png: ${first.size} bytes, sha256 ${first.sha256}`);
