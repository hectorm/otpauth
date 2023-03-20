/* global Deno */

import * as bdd from "https://deno.land/std/testing/bdd.ts";
import * as asserts from "https://deno.land/std/testing/asserts.ts";

globalThis.describe = bdd.describe;
globalThis.it = bdd.it;
globalThis.assert = asserts.assert;
globalThis.assertEquals = asserts.assertEquals;
globalThis.assertMatch = asserts.assertMatch;

(async () => {
  globalThis.OTPAuth = await import(Deno.args[0]);
  await import("./test.mjs");
})();
