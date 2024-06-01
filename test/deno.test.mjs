// @ts-expect-error
import { describe, it } from "https://deno.land/std/testing/bdd.ts";
// @ts-expect-error
import { assert, assertEquals, assertMatch } from "https://deno.land/std/assert/mod.ts";

globalThis.describe = describe;
globalThis.it = it;
globalThis.assert = assert;
globalThis.assertEquals = assertEquals;
globalThis.assertMatch = assertMatch;

if (!("OTPAuth" in globalThis)) {
  globalThis.OTPAuth = await import("../dist/otpauth.esm.js");
}

await import("./test.mjs");
