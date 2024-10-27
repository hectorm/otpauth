/**
 * RFC 4648 base32 alphabet without pad.
 * @type {string}
 */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Converts a base32 string to an Uint8Array (RFC 4648).
 * @see [LinusU/base32-decode](https://github.com/LinusU/base32-decode)
 * @param {string} str Base32 string.
 * @returns {Uint8Array} Uint8Array.
 */
const base32Decode = (str) => {
  // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
  str = str.replace(/ /g, "");

  // Canonicalize to all upper case and remove padding if it exists.
  let end = str.length;
  while (str[end - 1] === "=") --end;
  str = (end < str.length ? str.substring(0, end) : str).toUpperCase();

  const buf = new ArrayBuffer(((str.length * 5) / 8) | 0);
  const arr = new Uint8Array(buf);
  let bits = 0;
  let value = 0;
  let index = 0;

  for (let i = 0; i < str.length; i++) {
    const idx = ALPHABET.indexOf(str[i]);
    if (idx === -1) throw new TypeError(`Invalid character found: ${str[i]}`);

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      arr[index++] = value >>> bits;
    }
  }

  return arr;
};

/**
 * Converts an Uint8Array to a base32 string (RFC 4648).
 * @see [LinusU/base32-encode](https://github.com/LinusU/base32-encode)
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} Base32 string.
 */
const base32Encode = (arr) => {
  let bits = 0;
  let value = 0;
  let str = "";

  for (let i = 0; i < arr.length; i++) {
    value = (value << 8) | arr[i];
    bits += 8;

    while (bits >= 5) {
      str += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    str += ALPHABET[(value << (5 - bits)) & 31];
  }

  return str;
};

export { base32Decode, base32Encode };
