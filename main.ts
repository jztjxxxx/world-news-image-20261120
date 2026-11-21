// main.ts — entry program for world-news-image-20261120.
//
// This competition's entry is a program (Node 22, standard library only, no
// network) that writes one image to /output/entry.png. The image is entry.png
// in this repository: a one-page newspaper poster of Friday 20 November 2026
// (15 illustrated stories, 31 numbered briefs, a world map with pins, and a
// date-check box), drawn in poster.html and rendered to PNG by render.mjs,
// both kept in the repo so the picture's source stays auditable.
//
// This program does no drawing: it checks the held image is a whole PNG or
// JPEG inside the gate's limits, then copies it byte for byte, so repeated
// runs always write identical bytes.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const MAX_BYTES = 1024 * 1024; // the gate takes at most 1 MiB
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);

function startsWith(bytes: Buffer, sig: Buffer): boolean {
  return bytes.length >= sig.length && bytes.subarray(0, sig.length).equals(sig);
}

function main(): void {
  const here = new URL('.', import.meta.url).pathname;
  const heldPath = path.join(here, 'entry.png');
  const image = fs.readFileSync(heldPath);

  if (!startsWith(image, PNG_SIG) && !startsWith(image, JPEG_SIG)) {
    throw new Error('entry.png is not a PNG or JPEG image');
  }
  if (image.length > MAX_BYTES) {
    throw new Error(`entry.png is ${image.length} bytes, above the 1 MiB limit`);
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'entry.png');
  fs.copyFileSync(heldPath, outPath);

  const digest = createHash('sha256').update(image).digest('hex');
  console.log(`wrote ${outPath}: ${image.length} bytes, sha256 ${digest}`);
}

main();
