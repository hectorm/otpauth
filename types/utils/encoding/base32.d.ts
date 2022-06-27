/**
 * Converts a base32 string to an ArrayBuffer (RFC 4648).
 * @see [LinusU/base32-decode](https://github.com/LinusU/base32-decode)
 * @param {string} str Base32 string.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
export function base32ToBuf(str: string): ArrayBuffer;
/**
 * Converts an ArrayBuffer to a base32 string (RFC 4648).
 * @see [LinusU/base32-encode](https://github.com/LinusU/base32-encode)
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} Base32 string.
 */
export function base32FromBuf(buf: ArrayBuffer): string;
