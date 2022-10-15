import * as crypto from "node:crypto";

import { globalScope } from "../global-scope.js";

/**
 * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
 * @param {string} a String a.
 * @param {string} b String b.
 * @returns {boolean} Equality result.
 */
const timingSafeEqual = (a, b) => {
  if (crypto?.timingSafeEqual) {
    return crypto.timingSafeEqual(
      globalScope.Buffer.from(a),
      globalScope.Buffer.from(b)
    );
  } else {
    if (a.length !== b.length) {
      throw new TypeError("Input strings must have the same length");
    }
    let i = -1;
    let out = 0;
    while (++i < a.length) {
      out |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return out === 0;
  }
};

export { timingSafeEqual };
