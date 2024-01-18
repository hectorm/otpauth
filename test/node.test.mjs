import { describe, it } from "node:test";
import assert from "node:assert/strict";

globalThis.describe = describe;
globalThis.it = it;
globalThis.assert = assert;
globalThis.assertEquals = assert.deepStrictEqual;
globalThis.assertMatch = assert.match;

globalThis.OTPAuth ??= await import("../dist/otpauth.node.mjs");

await import("./test.mjs");
