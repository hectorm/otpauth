// @ts-expect-error
import { describe, it, expect } from "bun:test";

globalThis.describe = describe;
globalThis.it = it;
/** @type {(a: unknown) => void} */
globalThis.assert = (a) => expect(a).toBeTruthy();
/** @type {(a: unknown, b: unknown) => void} */
globalThis.assertEquals = (a, b) => expect(a).toStrictEqual(b);
/** @type {(a: string, b: RegExp) => void} */
globalThis.assertMatch = (a, b) => expect(b.test(a)).toBe(true);

if (!("OTPAuth" in globalThis)) {
  globalThis.OTPAuth = await import("../dist/otpauth.esm.js");
}

await import("./test.mjs");
