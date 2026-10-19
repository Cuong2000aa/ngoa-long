// Đo FPS thành chính: node scripts/fps.mjs [url]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/tests/showcase.html?lv=100";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true, args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls][data-buildings]", { timeout: 90000 });
await page.waitForTimeout(3000);
const r = await page.evaluate(() => new Promise((done) => {
  let n = 0;
  const t0 = performance.now();
  const step = () => {
    n++;
    if (performance.now() - t0 < 3000) requestAnimationFrame(step);
    else done({ fps: (n / (performance.now() - t0)) * 1000, info: window.__city?.renderer?.info?.render });
  };
  requestAnimationFrame(step);
}));
console.log(`fps=${r.fps.toFixed(1)}`, JSON.stringify(r.info ?? {}));
await browser.close();
