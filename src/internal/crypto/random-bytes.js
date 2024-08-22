import * as crypto from "node:crypto";

import { globalScope } from "../global-scope.js";

/**
 * Returns random bytes.
 * @param {number} size Size.
 * @returns {Uint8Array} Random bytes.
 */
const randomBytes = (size) => {
  if (crypto?.randomBytes) {
    return crypto.randomBytes(size);
  } else if (globalScope.crypto?.getRandomValues) {
    return globalScope.crypto.getRandomValues(new Uint8Array(size));
  } else {
    throw new Error("Cryptography API not available");
  }
};

export { randomBytes };
