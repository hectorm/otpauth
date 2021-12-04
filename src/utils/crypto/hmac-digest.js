import jsSHA from "jssha";

import { globalThis } from "../global-this.js";
import { isNode } from "../is-node.js";
import { nodeRequire } from "../node-require.js";

const NodeBuffer = isNode ? globalThis.Buffer : undefined;
const NodeCrypto = isNode ? nodeRequire("crypto") : undefined;

/**
 * OpenSSL to jsSHA algorithms.
 * @type {Object.<string, string>}
 */
const OPENSSL_TO_JSSHA_ALGO = {
  SHA1: "SHA-1",
  SHA224: "SHA-224",
  SHA256: "SHA-256",
  SHA384: "SHA-384",
  SHA512: "SHA-512",
  "SHA3-224": "SHA3-224",
  "SHA3-256": "SHA3-256",
  "SHA3-384": "SHA3-384",
  "SHA3-512": "SHA3-512",
};

/**
 * Calculates an HMAC digest.
 * In Node.js, the command "openssl list -digest-algorithms" displays the available digest algorithms.
 * @param {string} algorithm Algorithm.
 * @param {ArrayBuffer} key Key.
 * @param {ArrayBuffer} message Message.
 * @returns {ArrayBuffer} Digest.
 */
const hmacDigest = (algorithm, key, message) => {
  if (isNode) {
    const hmac = NodeCrypto.createHmac(algorithm, NodeBuffer.from(key));
    hmac.update(NodeBuffer.from(message));
    return hmac.digest().buffer;
  } else {
    const variant = OPENSSL_TO_JSSHA_ALGO[algorithm.toUpperCase()];
    if (typeof variant === "undefined") {
      throw new TypeError("Unknown hash function");
    }
    // @ts-ignore
    const hmac = new jsSHA(variant, "ARRAYBUFFER");
    hmac.setHMACKey(key, "ARRAYBUFFER");
    hmac.update(message);
    return hmac.getHMAC("ARRAYBUFFER");
  }
};

export { hmacDigest };
