import { uintDecode } from "./internal/encoding/uint.js";
import { canonicalizeAlgorithm, hmacDigest } from "./internal/crypto/hmac-digest.js";
import { Secret } from "./secret.js";
import { timingSafeEqual } from "./internal/crypto/timing-safe-equal.js";

/**
 * HOTP: An HMAC-based One-time Password Algorithm.
 * @see [RFC 4226](https://datatracker.ietf.org/doc/html/rfc4226)
 */
class HOTP {
  /**
   * Default configuration.
   * @type {{
   *   issuer: string,
   *   label: string,
   *   issuerInLabel: boolean,
   *   algorithm: string,
   *   digits: number,
   *   counter: number
   *   window: number
   * }}
   */
  static get defaults() {
    return {
      issuer: "",
      label: "OTPAuth",
      issuerInLabel: true,
      algorithm: "SHA1",
      digits: 6,
      counter: 0,
      window: 1,
    };
  }

  /**
   * Creates an HOTP object.
   * @param {Object} [config] Configuration options.
   * @param {string} [config.issuer=''] Account provider.
   * @param {string} [config.label='OTPAuth'] Account label.
   * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
   * @param {Secret|string} [config.secret=Secret] Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Initial counter value.
   * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
   */
  constructor({
    issuer = HOTP.defaults.issuer,
    label = HOTP.defaults.label,
    issuerInLabel = HOTP.defaults.issuerInLabel,
    secret = new Secret(),
    algorithm = HOTP.defaults.algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter,
    hmac,
  } = {}) {
    /**
     * Account provider.
     * @type {string}
     */
    this.issuer = issuer;
    /**
     * Account label.
     * @type {string}
     */
    this.label = label;
    /**
     * Include issuer prefix in label.
     * @type {boolean}
     */
    this.issuerInLabel = issuerInLabel;
    /**
     * Secret key.
     * @type {Secret}
     */
    this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
    /**
     * HMAC hashing algorithm.
     * @type {string}
     */
    this.algorithm = hmac ? algorithm : canonicalizeAlgorithm(algorithm);
    /**
     * Token length.
     * @type {number}
     */
    this.digits = digits;
    /**
     * Initial counter value.
     * @type {number}
     */
    this.counter = counter;
    /**
     * Custom HMAC function.
     * @type {((algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array)|undefined}
     */
    this.hmac = hmac;
  }

  /**
   * Generates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Counter value.
   * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
   * @returns {string} Token.
   */
  static generate({
    secret,
    algorithm = HOTP.defaults.algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter,
    hmac = hmacDigest,
  }) {
    const message = uintDecode(counter);
    const digest = hmac(algorithm, secret.bytes, message);
    if (!digest?.byteLength || digest.byteLength < 19) {
      throw new TypeError("Return value must be at least 19 bytes");
    }
    const offset = digest[digest.byteLength - 1] & 15;
    const otp =
      (((digest[offset] & 127) << 24) |
        ((digest[offset + 1] & 255) << 16) |
        ((digest[offset + 2] & 255) << 8) |
        (digest[offset + 3] & 255)) %
      10 ** digits;

    return otp.toString().padStart(digits, "0");
  }

  /**
   * Generates an HOTP token.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.counter=this.counter++] Counter value.
   * @returns {string} Token.
   */
  generate({ counter = this.counter++ } = {}) {
    return HOTP.generate({
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      counter,
      hmac: this.hmac,
    });
  }

  /**
   * Validates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Counter value.
   * @param {number} [config.window=1] Window of counter values to test.
   * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */
  static validate({
    token,
    secret,
    algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter,
    window = HOTP.defaults.window,
    hmac = hmacDigest,
  }) {
    // Return early if the token length does not match the digit number.
    if (token.length !== digits) return null;

    let delta = null;

    const check = (/** @type {number} */ i) => {
      const generatedToken = HOTP.generate({
        secret,
        algorithm,
        digits,
        counter: i,
        hmac,
      });
      if (timingSafeEqual(token, generatedToken)) {
        delta = i - counter;
      }
    };

    check(counter);
    for (let i = 1; i <= window && delta === null; ++i) {
      check(counter - i);
      if (delta !== null) break;
      check(counter + i);
      if (delta !== null) break;
    }

    return delta;
  }

  /**
   * Validates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {number} [config.counter=this.counter] Counter value.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */
  validate({ token, counter = this.counter, window }) {
    return HOTP.validate({
      token,
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      counter,
      window,
      hmac: this.hmac,
    });
  }

  /**
   * Returns a Google Authenticator key URI.
   * @returns {string} URI.
   */
  toString() {
    const e = encodeURIComponent;
    return (
      "otpauth://hotp/" +
      `${
        this.issuer.length > 0
          ? this.issuerInLabel
            ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&`
            : `${e(this.label)}?issuer=${e(this.issuer)}&`
          : `${e(this.label)}?`
      }` +
      `secret=${e(this.secret.base32)}&` +
      `algorithm=${e(this.algorithm)}&` +
      `digits=${e(this.digits)}&` +
      `counter=${e(this.counter)}`
    );
  }
}

export { HOTP };
