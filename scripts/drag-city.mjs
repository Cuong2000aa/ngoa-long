// Kéo + zoom bản đồ, kiểm tra kéo không mở nhầm bảng: node scripts/drag-city.mjs [url] [out.png]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/?smoke=1";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls]", { timeout: 60000 });

const pin = await page.locator('.city-pin[data-bid="hall"]').boundingBox();
const before = pin ? Math.round(pin.x) : -1;
await page.mouse.move(760, 420);
await page.mouse.down();
await page.mouse.move(600, 380, { steps: 12 });
await page.mouse.up();
await page.mouse.move(760, 360);
await page.mouse.wheel(0, -600);
await page.waitForTimeout(900);
const after = await page.locator('.city-pin[data-bid="hall"]').boundingBox();
const open = await page.evaluate(() => !document.getElementById("panel-layer")?.hidden);
console.log(`nhãn Ty Vũ x: ${before} -> ${after ? Math.round(after.x) : -1} · panel mở nhầm=${open}`);
await page.screenshot({ path: process.argv[3] ?? "city-drag.png" });
await browser.close();
