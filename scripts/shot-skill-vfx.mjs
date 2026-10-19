// Chụp hiệu ứng chiêu 2D preview: node scripts/shot-skill-vfx.mjs [label] [out.png]
// Ví dụ: node scripts/shot-skill-vfx.mjs "Thiết Bích" docs/_shots/thiet-bich.png
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const label = process.argv[2] ?? "Thiết Bích";
const out = resolve(process.argv[3] ?? "docs/_shots/thiet-bich.png");
const base = process.argv[4] ?? "http://127.0.0.1:5173";
const url = `${base}/preview-combat.html`;

const chromeCandidates = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => existsSync(p));
if (!chrome) {
  console.error("Không tìm thấy Chrome. Set CHROME=...");
  process.exit(1);
}

await mkdir(dirname(out), { recursive: true });

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#demo-bar button", { timeout: 20000 });

const clicked = await page.evaluate((want) => {
  const btns = Array.from(document.querySelectorAll("#demo-bar button"));
  const btn = btns.find((b) => (b.textContent || "").trim() === want);
  if (!btn) return { ok: false, labels: btns.map((b) => b.textContent) };
  btn.click();
  return { ok: true };
}, label);

if (!clicked.ok) {
  console.error("Không thấy nút", label, "có:", clicked.labels);
  await browser.close();
  process.exit(2);
}

// Bắt giữa timeline (emission/impact)
await page.waitForTimeout(380);
await page.screenshot({ path: out, fullPage: false });
console.log(`saved ${out}`);
await browser.close();
