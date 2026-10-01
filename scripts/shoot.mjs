#!/usr/bin/env node
// Full-page screenshots of every route at every breakpoint.
// Usage: node scripts/shoot.mjs [baseUrl] [outDir]

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { launch } from "./lib/cdp.mjs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = process.argv[3] ?? "shots";

const ROUTES = [
  ["home", "/"],
  ["demos", "/demos"],
  ["skills", "/skills"],
  ["presentations", "/presentations"],
  ["submit", "/submit"],
  ["demo-detail", "/demos/hero-shield"],
  ["skill-detail", "/skills/auth0-agent-skills"],
  ["presentation-detail", "/presentations/example-placeholder"],
  ["not-found", "/nope"],
];

const WIDTHS = [
  ["mobile", 390],
  ["tablet", 834],
  ["desktop", 1440],
];

const browser = await launch(9222);
try {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  for (const [label, width] of WIDTHS) {
    for (const [name, path] of ROUTES) {
      await browser.viewport(width, 900);
      await browser.goto(BASE + path);
      const png = await browser.shot({ fullPage: true, width });
      const file = join(OUT, `${label}-${name}.png`);
      await writeFile(file, png);
      console.log(`${file}  ${width}w`);
    }
  }
} finally {
  browser.close();
}
