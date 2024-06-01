const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

globalThis.describe = describe;
globalThis.it = it;
globalThis.assert = assert;
globalThis.assertEquals = assert.deepStrictEqual;
globalThis.assertMatch = assert.match;

if (!("OTPAuth" in globalThis)) {
  globalThis.OTPAuth = require("../dist/otpauth.node.cjs");
}

import("./test.mjs");
