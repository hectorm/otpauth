/* global mocha, exit */

import path from "node:path";
import url from "node:url";
import playwright from "playwright";

const __dirname = url.fileURLToPath(path.dirname(import.meta.url));

(async () => {
  const browserName = process.env.BROWSER || "chromium";
  const browser = await playwright[browserName].launch();

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addScriptTag({
      path: path.join(__dirname, "../node_modules/mocha/mocha.js"),
    });
    await page.addScriptTag({
      path: path.join(__dirname, "../node_modules/chai/chai.js"),
    });
    await page.addScriptTag({
      path: path.join(__dirname, process.env.JSFILE),
    });

    await page.evaluate(() => mocha.setup({ ui: "bdd", reporter: "tap" }));
    await page.addScriptTag({ path: path.join(__dirname, "./test.mjs") });

    page.on("console", (msg) => process.stdout.write(msg.text()));

    page.exposeFunction("exit", async (code) => {
      await browser.close();
      process.exit(code);
    });
    await page.evaluate(() =>
      mocha.run((code) => setTimeout(() => exit(code), 10))
    );

    await page.waitForTimeout(120000);
    throw new Error("Timeout");
  } catch (error) {
    console.error(error);
    await browser.close();
    process.exit(1);
  }
})();
