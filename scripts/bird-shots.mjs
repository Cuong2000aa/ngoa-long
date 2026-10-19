// Chụp quạ bay trong thành: camera bám theo 1 con quạ. node scripts/bird-shots.mjs [url] [prefix]
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173/tests/showcase.html?lv=60";
const prefix = process.argv[3] ?? "bird";
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (m) => ["error", "warning"].includes(m.type()) && !m.text().includes("FBXLoader") && console.log(`[${m.type()}] ${m.text()}`));
await page.goto(url, { waitUntil: "load" });
await page.waitForSelector("#iso-town-map[data-walls][data-buildings]", { timeout: 90000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${prefix}-wide.png` });

// Camera đặt chéo phía sau-trên con quạ số 0, nhìn về phía nó (thấy cả thành phía dưới).
const offsets = { chase: [-5, 3.2, -7], side: [7, 1.5, 0], below: [3, -6, 4] };
for (const [name, off] of Object.entries(offsets)) {
  await page.evaluate((off) => {
    const city = window.__city;
    city.controls.update = () => false;
    cancelAnimationFrame(window.__follow ?? 0);
    const step = () => {
      const bird = city.crowd.flyers[0].obj;
      const cam = city.camera;
      const fwd = bird.getWorldDirection(cam.position.clone());
      const side = fwd.clone().cross(cam.up).normalize();
      cam.position.copy(bird.position).addScaledVector(fwd, off[2]).addScaledVector(side, off[0]);
      cam.position.y += off[1];
      cam.lookAt(bird.position);
      window.__follow = requestAnimationFrame(step);
    };
    step();
  }, off);
  for (let i = 0; i < 2; i++) {
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${prefix}-${name}-${i}.png` });
  }
}
await browser.close();
console.log("done");
