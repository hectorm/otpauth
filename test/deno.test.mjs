// @ts-expect-error
import { describe, it } from "jsr:@std/testing@1/bdd";
// @ts-expect-error
import { assert, assertEquals, assertMatch } from "jsr:@std/assert@1";

globalThis.describe = describe;
globalThis.it = it;
globalThis.assert = assert;
globalThis.assertEquals = assertEquals;
globalThis.assertMatch = assertMatch;

if (!("OTPAuth" in globalThis)) {
  globalThis.OTPAuth = await import("../dist/otpauth.esm.js");
}

await import("./test.mjs");
