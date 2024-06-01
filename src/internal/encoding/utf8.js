import { globalScope } from "../global-scope.js";

/**
 * TextEncoder instance.
 * @type {TextEncoder|null}
 */
const ENCODER = globalScope.TextEncoder ? new globalScope.TextEncoder("utf-8") : null;

/**
 * TextDecoder instance.
 * @type {TextDecoder|null}
 */
const DECODER = globalScope.TextDecoder ? new globalScope.TextDecoder("utf-8") : null;

/**
 * Converts an UTF-8 string to an Uint8Array.
 * @param {string} str String.
 * @returns {Uint8Array} Uint8Array.
 */
const utf8Decode = (str) => {
  if (!ENCODER) {
    throw new Error("Encoding API not available");
  }

  return ENCODER.encode(str);
};

/**
 * Converts an Uint8Array to an UTF-8 string.
 * @param {Uint8Array} arr Uint8Array.
 * @returns {string} String.
 */
const utf8Encode = (arr) => {
  if (!DECODER) {
    throw new Error("Encoding API not available");
  }

  return DECODER.decode(arr);
};

export { utf8Decode, utf8Encode };
