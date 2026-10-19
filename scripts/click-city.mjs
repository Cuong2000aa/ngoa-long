// Bấm công trình trên canvas 3D, kiểm tra bảng chi tiết mở: node scripts/click-city.mjs [url]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/?smoke=1";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls]", { timeout: 60000 });
await page.waitForTimeout(500);

const pin = await page.locator('.city-pin[data-bid="hall"]').boundingBox();
if (!pin) throw new Error("không thấy nhãn Ty Vũ");
// thân nhà nằm dưới nhãn
await page.mouse.click(pin.x + pin.width / 2, pin.y + pin.height + 40);
await page.waitForTimeout(400);
const open = await page.evaluate(() => !document.getElementById("panel-layer")?.hidden);
const title = await page.evaluate(() => document.getElementById("panel-body")?.innerText.split("\n")[0] ?? "");
console.log(`panel mở=${open} · ${title}`);
await page.screenshot({ path: process.argv[3] ?? "city-click.png" });
await browser.close();
