import { globalScope } from "../global-scope.js";
import { isNode } from "../is-node.js";
import { nodeRequire } from "../node-require.js";

const NodeCrypto = isNode ? nodeRequire("crypto") : undefined;

/**
 * Returns random bytes.
 * @param {number} size Size.
 * @returns {ArrayBuffer} Random bytes.
 */
const randomBytes = (size) => {
  if (isNode) {
    return NodeCrypto.randomBytes(size).buffer;
  } else {
    if (!globalScope.crypto || !globalScope.crypto.getRandomValues) {
      throw new Error("Cryptography API not available");
    }
    return globalScope.crypto.getRandomValues(new Uint8Array(size)).buffer;
  }
};

export { randomBytes };
