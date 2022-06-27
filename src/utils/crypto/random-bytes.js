import { globalScope } from "../global-scope.js";
import { isNode } from "../is-node.js";
import { nodeRequire } from "../node-require.js";

const NodeCrypto = isNode ? nodeRequire("crypto") : undefined;
const BrowserCrypto = !isNode
  ? globalScope.crypto || globalScope.msCrypto
  : undefined;

/**
 * Returns random bytes.
 * @param {number} size Size.
 * @returns {ArrayBuffer} Random bytes.
 */
const randomBytes = (size) => {
  if (isNode) {
    return NodeCrypto.randomBytes(size).buffer;
  } else {
    if (!BrowserCrypto || !BrowserCrypto.getRandomValues) {
      throw new Error("Cryptography API not available");
    }
    return BrowserCrypto.getRandomValues(new Uint8Array(size)).buffer;
  }
};

export { randomBytes };
