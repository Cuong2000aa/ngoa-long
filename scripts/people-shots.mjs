// Zoom vào thành, chụp chuỗi khung để xem người đi lại: node scripts/people-shots.mjs [url] [prefix]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/tests/showcase.html?lv=60";
const prefix = process.argv[3] ?? "people";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (m) => m.type() === "error" && console.log(`[error] ${m.text()}`));
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls][data-buildings]", { timeout: 90000 });

const zoomAt = async (x, y, ticks) => {
  await page.mouse.move(x, y);
  for (let i = 0; i < ticks; i++) {
    await page.mouse.wheel(0, -240);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
};

const spot = (process.argv[4] ?? "560,330").split(",").map(Number);
await zoomAt(spot[0], spot[1], Number(process.argv[5] ?? 7));
for (let i = 0; i < 3; i++) {
  await page.screenshot({ path: `${prefix}-${i}.png` });
  await page.waitForTimeout(450);
}
await browser.close();
console.log("done");
