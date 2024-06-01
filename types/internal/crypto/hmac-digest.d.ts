/**
 * Calculates an HMAC digest.
 * In Node.js, the command "openssl list -digest-algorithms" displays the available digest algorithms.
 * @param {string} algorithm Algorithm.
 * @param {Uint8Array} key Key.
 * @param {Uint8Array} message Message.
 * @returns {Uint8Array} Digest.
 */
export function hmacDigest(algorithm: string, key: Uint8Array, message: Uint8Array): Uint8Array;
