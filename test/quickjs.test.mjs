// @ts-nocheck
import * as os from "os";
import * as std from "std";

let testTotalCount = 0;
let testPassedCount = 0;
let testFailedCount = 0;
let currentDescribe = "";

globalThis.describe = (name, fn) => {
  currentDescribe = name;
  std.out.printf("# %s\n", currentDescribe);
  fn();
};

globalThis.it = (name, fn) => {
  testTotalCount++;
  try {
    fn();
    testPassedCount++;
    std.out.printf("ok %d - %s %s\n", testTotalCount, currentDescribe, name);
  } catch (error) {
    testFailedCount++;
    std.out.printf("not ok %d - %s %s\n", testTotalCount, currentDescribe, name);
    std.out.printf("  ---\n");
    std.out.printf("  message: %s\n", error.message);
    std.out.printf("  severity: %s\n", "fail");
    std.out.printf("  stack: \n%s\n", error.stack);
    std.out.printf("  ...\n");
  }
};

globalThis.assert = (condition) => {
  if (!condition) throw new Error("Assertion failed");
};

globalThis.assertEquals = (actual, expected) => {
  const deepEqual = (a, b) => {
    if (a === b) return true;
    if (a instanceof Uint8Array && b instanceof Uint8Array) {
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  };
  if (!deepEqual(actual, expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

globalThis.assertMatch = (string, regex) => {
  if (!regex.test(string)) throw new Error(`Expected "${string}" to match ${regex}`);
};

// QuickJS does not support the Web Crypto API.
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = {};
}

if (typeof globalThis.crypto.getRandomValues === "undefined") {
  globalThis.crypto.getRandomValues = (() => {
    // Use /dev/urandom as a source of entropy on Unix-like systems.
    if (os.platform === "linux" || os.platform === "darwin") {
      return (array) => {
        let fd;
        try {
          fd = os.open("/dev/urandom", os.O_RDONLY);
          os.read(fd, array.buffer, 0, array.byteLength);
        } finally {
          if (fd) os.close(fd);
        }
        return array;
      };
    } else {
      // Fallback to an insecure random number generator,
      // but we are in a test environment so it's ok.
      return (array) => {
        for (let i = 0, r = 0; i < array.length; i++) {
          if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
          array[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
        }
        return array;
      };
    }
  })();
}

if (!("OTPAuth" in globalThis)) {
  try {
    globalThis.OTPAuth = await import("../dist/otpauth.esm.js");
  } catch (error) {
    std.err.printf("%s\n", error.message);
    std.exit(1);
  }
}

std.out.printf("%s\n", "TAP version 14");

try {
  await import("./test.mjs");
  std.out.printf("# tests %d\n", testTotalCount);
  std.out.printf("# pass %d\n", testPassedCount);
  std.out.printf("# fail %d\n", testFailedCount);
  std.out.printf("1..%d\n", testTotalCount);
  if (testFailedCount > 0) std.exit(1);
} catch (error) {
  std.out.printf("not ok - %s\n", error.message);
  std.out.printf("# tests %d\n", 1);
  std.out.printf("# pass %d\n", 0);
  std.out.printf("# fail %d\n", 1);
  std.out.printf("1..%d\n", 1);
  std.exit(1);
}
