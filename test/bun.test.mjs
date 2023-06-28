/* global Bun */

import test from "bun:test";

globalThis.describe = test.describe;
globalThis.it = test.test;
globalThis.assert = (a) => test.expect(a).toBeTruthy();
globalThis.assertEquals = (a, b) => test.expect(a).toStrictEqual(b);
globalThis.assertMatch = (a, b) => test.expect(b.test(a)).toBe(true);

(async () => {
  globalThis.OTPAuth = await import(Bun.env.TEST_LIBPATH);
  await import("./test.mjs");
})();
