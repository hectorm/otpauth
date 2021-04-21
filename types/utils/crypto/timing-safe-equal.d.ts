export default timingSafeEqual;
/**
 * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
 * @param {string} a String a.
 * @param {string} b String b.
 * @returns {boolean} Equality result.
 */
declare function timingSafeEqual(a: string, b: string): boolean;
