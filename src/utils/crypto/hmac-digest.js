import jsSHA from "jssha";

import { nodeCrypto } from "./node-crypto.js";
import { globalScope } from "../global-scope.js";

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
  if (nodeCrypto) {
    const hmac = nodeCrypto.createHmac(algorithm, globalScope.Buffer.from(key));
    hmac.update(globalScope.Buffer.from(message));
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
