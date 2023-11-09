/* global Bun */

import { describe, it, expect } from "bun:test";

globalThis.describe = describe;
globalThis.it = it;
globalThis.assert = (a) => expect(a).toBeTruthy();
globalThis.assertEquals = (a, b) => expect(a).toStrictEqual(b);
globalThis.assertMatch = (a, b) => expect(b.test(a)).toBe(true);

globalThis.OTPAuth = await import(Bun.env.TEST_LIBPATH);

await import("./test.mjs");
