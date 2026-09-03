/**
 * Hexadecimal alphabet.
 * @type {string}
 */
const ALPHABET = "0123456789ABCDEF";

/**
 * Converts a hexadecimal string to an Uint8Array.
 * @param {string} str Hexadecimal string.
 * @returns {Uint8Array} Uint8Array.
 */
const hexDecode = (str) => {
  // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
  str = str.replace(/ /g, "").toUpperCase();

  const buf = new ArrayBuffer(str.length / 2);
  const arr = new Uint8Array(buf);

  for (let i = 0; i < str.length; i += 2) {
    const hi = ALPHABET.indexOf(str[i]);
    const lo = ALPHABET.indexOf(str[i + 1]);
    if (hi === -1 || lo === -1) throw new TypeError(`Invalid character found: ${str.substring(i, i + 2)}`);
    arr[i / 2] = (hi << 4) | lo;
  }

  return arr;
};

/**
 * Converts an Uint8Array to a hexadecimal string.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} Hexadecimal string.
 */
const hexEncode = (arr) => {
  let str = "";

  for (let i = 0; i < arr.length; i++) {
    const hex = arr[i].toString(16);
    if (hex.length === 1) str += "0";
    str += hex;
  }

  return str.toUpperCase();
};

export { hexDecode, hexEncode };
