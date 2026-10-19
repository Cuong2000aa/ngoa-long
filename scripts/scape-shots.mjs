// Chụp các góc cảnh ngoài: node scripts/scape-shots.mjs [url] [prefix]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/tests/showcase.html?lv=1";
const prefix = process.argv[3] ?? "scape";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (m) => m.type() === "error" && console.log(`[error] ${m.text()}`));
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls][data-buildings]", { timeout: 90000 });
await page.waitForTimeout(3500);

const views = {
  wide: { target: [-6, 0, 6], pos: [38, 55, 58] },
  road: { target: [-12, 0, 50], pos: [14, 32, 78] },
  hunt: { target: [-48, 0, 2], pos: [-16, 34, 36] },
  mountain: { target: [22, 4, -55], pos: [18, 38, -5] },
};

for (const [name, v] of Object.entries(views)) {
  await page.evaluate(({ target, pos }) => {
    const city = window.__city;
    city.controls.target.set(...target);
    city.camera.position.set(...pos);
    city.controls.update();
  }, v);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${prefix}-${name}.png` });
}
await browser.close();
console.log("done");
