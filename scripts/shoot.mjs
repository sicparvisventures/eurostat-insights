import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE || "http://localhost:3210";

const targets = (process.env.TARGETS || "/:landing,/home:home,/topics:topics,/topics/economy:topic-economy,/explore:explore,/dataset/demo_pjan:dataset")
  .split(",")
  .map((t) => t.split(":"));

const FULL = process.env.FULL === "1";
const DARK = process.env.LIGHT !== "1";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});

for (const [path, name] of targets) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: DARK ? "dark" : "light" },
  ]);
  await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2800));

  const o = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
  }));
  console.log(`${name.padEnd(18)} scrollWidth=${o.docW} (vp ${o.winW})`);
  await page.screenshot({ path: `/tmp/shots/${name}.png`, fullPage: FULL });
  await page.close();
}

await browser.close();
console.log("done");
