const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

globalThis.describe = describe;
globalThis.it = it;
globalThis.assert = assert;
globalThis.assertEquals = assert.deepStrictEqual;
globalThis.assertMatch = assert.match;

globalThis.OTPAuth ??= require("../dist/otpauth.node.cjs");

import("./test.mjs");
