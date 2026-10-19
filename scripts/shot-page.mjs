// Chụp 1 trang bất kỳ khi body[data-ready]: node scripts/shot-page.mjs <url> <out.png> [delayMs]
import { chromium } from "playwright-core";

const [url, out, delay = "300"] = process.argv.slice(2);
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (m) => m.type() === "error" && console.log(`[error] ${m.text()}`));
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("body[data-ready]", { timeout: 60000 });
await page.waitForTimeout(Number(delay));
console.log(await page.title());
await page.screenshot({ path: out });
await browser.close();
