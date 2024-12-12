/**
 * Converts an integer to an Uint8Array.
 * @param {number} num Integer.
 * @returns {Uint8Array} Uint8Array.
 */
const uintDecode = (num) => {
  const buf = new ArrayBuffer(8);
  const arr = new Uint8Array(buf);
  let acc = num;

  for (let i = 7; i >= 0; i--) {
    if (acc === 0) break;
    arr[i] = acc & 255;
    acc -= arr[i];
    acc /= 256;
  }

  return arr;
};

/**
 * Converts an Uint8Array to an integer.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {number} Integer.
 */
const uintEncode = (arr) => {
  let num = 0;

  for (let i = 0; i < arr.length; i++) {
    num *= 256;
    num += arr[i];
  }

  return num;
};

export { uintDecode, uintEncode };
