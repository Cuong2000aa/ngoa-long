// Chụp Thành Chính bằng Chrome thật: node scripts/shot-city.mjs [url] [out.png]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/?smoke=1";
const out = process.argv[3] ?? "city-shot.png";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") console.log(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 400) console.log(`[http ${r.status()}] ${r.url()}`);
});

const t0 = Date.now();
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls][data-buildings]", { timeout: 90000 });
const walls = await page.getAttribute("#iso-town-map", "data-walls");
const buildings = await page.getAttribute("#iso-town-map", "data-buildings");
console.log(`walls=${walls} buildings=${buildings} sau ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await page.waitForTimeout(800);
await page.screenshot({ path: out });
console.log(`saved ${out}`);
await browser.close();
