// Neon Tide Cover Studio — hand-in program for the gta6-cover-art-01 bounty.
//
// The entry itself is the static web app under app/ (plain files, no build
// step, no network). This program's whole job is to hand that app in the way
// the bounty asks: copy app/ and screenshots/ into the output directory and
// write dossier.json there with buildDossier from the vendored make.fun
// library (vendor/makefun-app.ts, the kit's copy, unchanged — the gate
// rebuilds the dossier with the same library and compares byte for byte).
//
// Node 22, standard library only, nothing installed, no network. It runs
// twice in the grader and must write the same bytes both times, so it does
// nothing time- or random-dependent: a straight copy plus the dossier.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The app goes in whole: every file under app/ is part of the entry.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });

// Screenshots ride along when the repository holds them (3 or 4 images, the
// first by name is the cover the judge sees on top of the contact sheet).
const shotsDir = join(outDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), shotsDir, { recursive: true });
}

// The dossier is capped the way the gate caps it: 160 KiB of source text,
// at most 4 screenshots of 256 KiB each, at most 993 files and 48 MiB under
// app/, and no path under app/ longer than 1000 bytes.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
