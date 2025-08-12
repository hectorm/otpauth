import * as crypto from "node:crypto";
import { hmac } from "@noble/hashes/hmac.js";
import { sha1 } from "@noble/hashes/legacy.js";
import { sha224, sha256, sha384, sha512 } from "@noble/hashes/sha2.js";
import { sha3_224, sha3_256, sha3_384, sha3_512 } from "@noble/hashes/sha3.js";
import { globalScope } from "../global-scope.js";

/**
 * @noble/hashes hash functions.
 * @type {Object.<string, sha1|sha224|sha256|sha384|sha512|sha3_224|sha3_256|sha3_384|sha3_512>}
 */
const nobleHashes = {
  SHA1: sha1,
  SHA224: sha224,
  SHA256: sha256,
  SHA384: sha384,
  SHA512: sha512,
  "SHA3-224": sha3_224,
  "SHA3-256": sha3_256,
  "SHA3-384": sha3_384,
  "SHA3-512": sha3_512,
};

/**
 * Canonicalizes a hash algorithm name.
 * @param {string} algorithm Hash algorithm name.
 * @returns {"SHA1"|"SHA224"|"SHA256"|"SHA384"|"SHA512"|"SHA3-224"|"SHA3-256"|"SHA3-384"|"SHA3-512"} Canonicalized hash algorithm name.
 */
const canonicalizeAlgorithm = (algorithm) => {
  switch (true) {
    case /^(?:SHA-?1|SSL3-SHA1)$/i.test(algorithm):
      return "SHA1";
    case /^SHA(?:2?-)?224$/i.test(algorithm):
      return "SHA224";
    case /^SHA(?:2?-)?256$/i.test(algorithm):
      return "SHA256";
    case /^SHA(?:2?-)?384$/i.test(algorithm):
      return "SHA384";
    case /^SHA(?:2?-)?512$/i.test(algorithm):
      return "SHA512";
    case /^SHA3-224$/i.test(algorithm):
      return "SHA3-224";
    case /^SHA3-256$/i.test(algorithm):
      return "SHA3-256";
    case /^SHA3-384$/i.test(algorithm):
      return "SHA3-384";
    case /^SHA3-512$/i.test(algorithm):
      return "SHA3-512";
    default:
      throw new TypeError(`Unknown hash algorithm: ${algorithm}`);
  }
};

/**
 * Calculates an HMAC digest.
 * @param {string} algorithm Algorithm.
 * @param {Uint8Array} key Key.
 * @param {Uint8Array} message Message.
 * @returns {Uint8Array} Digest.
 */
const hmacDigest = (algorithm, key, message) => {
  if (crypto?.createHmac) {
    const hmac = crypto.createHmac(algorithm, globalScope.Buffer.from(key));
    hmac.update(globalScope.Buffer.from(message));
    return hmac.digest();
  } else if (hmac) {
    const hash = nobleHashes[algorithm] ?? nobleHashes[canonicalizeAlgorithm(algorithm)];
    return hmac(hash, key, message);
  } else {
    throw new Error("Missing HMAC function");
  }
};

export { canonicalizeAlgorithm, hmacDigest };
