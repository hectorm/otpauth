/**
 * Converts a hexadecimal string to an Uint8Array.
 * @param {string} str Hexadecimal string.
 * @returns {Uint8Array} Uint8Array.
 */
const hexDecode = (str) => {
  // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
  str = str.replace(/ /g, "");

  const buf = new ArrayBuffer(str.length / 2);
  const arr = new Uint8Array(buf);

  for (let i = 0; i < str.length; i += 2) {
    arr[i / 2] = parseInt(str.substring(i, i + 2), 16);
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
