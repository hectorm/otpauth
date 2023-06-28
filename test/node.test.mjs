import test from "test";
import assert from "node:assert";

globalThis.describe = test.describe;
globalThis.it = test.it;
globalThis.assert = assert;
globalThis.assertEquals = assert.deepStrictEqual;
globalThis.assertMatch = assert.match;

(async () => {
  globalThis.OTPAuth = await import(process.env.TEST_LIBPATH);
  await import("./test.mjs");
})();
