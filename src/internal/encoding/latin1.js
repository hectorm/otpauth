/**
 * Converts a Latin-1 string to an Uint8Array.
 * @param {string} str Latin-1 string.
 * @returns {Uint8Array} Uint8Array.
 */
const latin1Decode = (str) => {
  const buf = new ArrayBuffer(str.length);
  const arr = new Uint8Array(buf);

  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }

  return arr;
};

/**
 * Converts an Uint8Array to a Latin-1 string.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} Latin-1 string.
 */
const latin1Encode = (arr) => {
  let str = "";

  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }

  return str;
};

export { latin1Decode, latin1Encode };
