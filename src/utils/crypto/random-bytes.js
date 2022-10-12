import { nodeCrypto } from "./node-crypto.js";
import { globalScope } from "../global-scope.js";

/**
 * Returns random bytes.
 * @param {number} size Size.
 * @returns {ArrayBuffer} Random bytes.
 */
const randomBytes = (size) => {
  if (nodeCrypto) {
    return nodeCrypto.randomBytes(size).buffer;
  } else {
    if (!globalScope.crypto || !globalScope.crypto.getRandomValues) {
      throw new Error("Cryptography API not available");
    }
    return globalScope.crypto.getRandomValues(new Uint8Array(size)).buffer;
  }
};

export { randomBytes };
