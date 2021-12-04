/**
 * Converts a Latin-1 string to an ArrayBuffer.
 * @param {string} str Latin-1 string.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
const latin1ToBuf = (str) => {
  const buf = new ArrayBuffer(str.length);
  const arr = new Uint8Array(buf);

  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }

  return buf;
};

/**
 * Converts an ArrayBuffer to a Latin-1 string.
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} Latin-1 string.
 */
const latin1FromBuf = (buf) => {
  const arr = new Uint8Array(buf);
  let str = "";

  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }

  return str;
};

export { latin1ToBuf, latin1FromBuf };
