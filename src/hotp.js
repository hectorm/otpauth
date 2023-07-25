import { uintToBuf } from "./utils/encoding/uint.js";
import { hmacDigest } from "./utils/crypto/hmac-digest.js";
import { Secret } from "./secret.js";
import { timingSafeEqual } from "./utils/crypto/timing-safe-equal.js";

/**
 * HOTP: An HMAC-based One-time Password Algorithm.
 * @see [RFC 4226](https://tools.ietf.org/html/rfc4226)
 */
class HOTP {
  /**
   * Default configuration.
   * @type {{
   *   issuer: string,
   *   label: string,
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
   * @param {Secret|string} [config.secret=Secret] Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Initial counter value.
   */
  constructor({
    issuer = HOTP.defaults.issuer,
    label = HOTP.defaults.label,
    secret = new Secret(),
    algorithm = HOTP.defaults.algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter,
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
     * Secret key.
     * @type {Secret}
     */
    this.secret =
      typeof secret === "string" ? Secret.fromBase32(secret) : secret;
    /**
     * HMAC hashing algorithm.
     * @type {string}
     */
    this.algorithm = algorithm.toUpperCase();
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
  }

  /**
   * Generates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.counter=0] Counter value.
   * @returns {string} Token.
   */
  static generate({
    secret,
    algorithm = HOTP.defaults.algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter,
  }) {
    const digest = new Uint8Array(
      hmacDigest(algorithm, secret.buffer, uintToBuf(counter)),
    );
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
    });
  }

  /**
   * Validates an HOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} config.digits Token length.
   * @param {number} [config.counter=0] Counter value.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */
  static validate({
    token,
    secret,
    algorithm,
    digits,
    counter = HOTP.defaults.counter,
    window = HOTP.defaults.window,
  }) {
    // Return early if the token length does not match the digit number.
    if (token.length !== digits) return null;

    let delta = null;

    for (let i = counter - window; i <= counter + window; ++i) {
      const generatedToken = HOTP.generate({
        secret,
        algorithm,
        digits,
        counter: i,
      });

      if (timingSafeEqual(token, generatedToken)) {
        delta = i - counter;
      }
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
          ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&`
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
