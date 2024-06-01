import * as crypto from "node:crypto";
import { hmac } from "@noble/hashes/hmac";
import { sha1 } from "@noble/hashes/sha1";
import { sha224, sha256, sha384, sha512 } from "@noble/hashes/sha2";
import { sha3_224, sha3_256, sha3_384, sha3_512 } from "@noble/hashes/sha3";
import { globalScope } from "../global-scope.js";

/**
 * OpenSSL-Noble hashes map.
 * @type {Object.<string, sha1|sha224|sha256|sha384|sha512|sha3_224|sha3_256|sha3_384|sha3_512>}
 */
const OPENSSL_NOBLE_HASHES = {
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
 * Calculates an HMAC digest.
 * In Node.js, the command "openssl list -digest-algorithms" displays the available digest algorithms.
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
  } else {
    const hash = OPENSSL_NOBLE_HASHES[algorithm.toUpperCase()];
    if (typeof hash === "undefined") {
      throw new TypeError("Unknown hash function");
    }
    return hmac(hash, key, message);
  }
};

export { hmacDigest };
