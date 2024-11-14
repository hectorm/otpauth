/**
 * Canonicalizes a hash algorithm name.
 * @param {string} algorithm Hash algorithm name.
 * @returns {"SHA1"|"SHA224"|"SHA256"|"SHA384"|"SHA512"|"SHA3-224"|"SHA3-256"|"SHA3-384"|"SHA3-512"} Canonicalized hash algorithm name.
 */
export function canonicalizeAlgorithm(algorithm: string): "SHA1" | "SHA224" | "SHA256" | "SHA384" | "SHA512" | "SHA3-224" | "SHA3-256" | "SHA3-384" | "SHA3-512";
/**
 * Calculates an HMAC digest.
 * @param {string} algorithm Algorithm.
 * @param {Uint8Array} key Key.
 * @param {Uint8Array} message Message.
 * @returns {Uint8Array} Digest.
 */
export function hmacDigest(algorithm: string, key: Uint8Array, message: Uint8Array): Uint8Array;
