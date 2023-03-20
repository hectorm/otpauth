import test from "test";
import assert from "node:assert";

globalThis.describe = test.describe;
globalThis.it = test.it;
globalThis.assert = assert;
globalThis.assertEquals = assert.deepStrictEqual;
globalThis.assertMatch = assert.match;

(async () => {
  globalThis.OTPAuth = await import(process.argv[2]);
  await import("./test.mjs");
})();
