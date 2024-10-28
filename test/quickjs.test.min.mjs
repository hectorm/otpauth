// @ts-nocheck
import * as std from "std";

if (!("OTPAuth" in globalThis)) {
  try {
    globalThis.OTPAuth = await import("../dist/otpauth.esm.min.js");
  } catch (error) {
    std.err.printf("%s\n", error.message);
    std.exit(1);
  }
}

await import("./quickjs.test.mjs");
