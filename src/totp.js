import { HOTP } from "./hotp.js";
import { Secret } from "./secret.js";

/**
 * TOTP: Time-Based One-Time Password Algorithm.
 * @see [RFC 6238](https://tools.ietf.org/html/rfc6238)
 */
class TOTP {
  /**
   * Default configuration.
   * @type {{
   *   issuer: string,
   *   label: string,
   *   algorithm: string,
   *   digits: number,
   *   period: number
   *   window: number
   * }}
   */
  static get defaults() {
    return {
      issuer: "",
      label: "OTPAuth",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      window: 1,
    };
  }

  /**
   * Creates a TOTP object.
   * @param {Object} [config] Configuration options.
   * @param {string} [config.issuer=''] Account provider.
   * @param {string} [config.label='OTPAuth'] Account label.
   * @param {Secret|string} [config.secret=Secret] Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.period=30] Token time-step duration.
   */
  constructor({
    issuer = TOTP.defaults.issuer,
    label = TOTP.defaults.label,
    secret = new Secret(),
    algorithm = TOTP.defaults.algorithm,
    digits = TOTP.defaults.digits,
    period = TOTP.defaults.period,
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
     * Token time-step duration.
     * @type {number}
     */
    this.period = period;
  }

  /**
   * Generates a TOTP token.
   * @param {Object} config Configuration options.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} [config.digits=6] Token length.
   * @param {number} [config.period=30] Token time-step duration.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {string} Token.
   */
  static generate({
    secret,
    algorithm,
    digits,
    period = TOTP.defaults.period,
    timestamp = Date.now(),
  }) {
    return HOTP.generate({
      secret,
      algorithm,
      digits,
      counter: Math.floor(timestamp / 1000 / period),
    });
  }

  /**
   * Generates a TOTP token.
   * @param {Object} [config] Configuration options.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @returns {string} Token.
   */
  generate({ timestamp = Date.now() } = {}) {
    return TOTP.generate({
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      timestamp,
    });
  }

  /**
   * Validates a TOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {Secret} config.secret Secret key.
   * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
   * @param {number} config.digits Token length.
   * @param {number} [config.period=30] Token time-step duration.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */
  static validate({
    token,
    secret,
    algorithm,
    digits,
    period = TOTP.defaults.period,
    timestamp = Date.now(),
    window,
  }) {
    return HOTP.validate({
      token,
      secret,
      algorithm,
      digits,
      counter: Math.floor(timestamp / 1000 / period),
      window,
    });
  }

  /**
   * Validates a TOTP token.
   * @param {Object} config Configuration options.
   * @param {string} config.token Token value.
   * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
   * @param {number} [config.window=1] Window of counter values to test.
   * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
   */
  validate({ token, timestamp, window }) {
    return TOTP.validate({
      token,
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      timestamp,
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
      "otpauth://totp/" +
      `${
        this.issuer.length > 0
          ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&`
          : `${e(this.label)}?`
      }` +
      `secret=${e(this.secret.base32)}&` +
      `algorithm=${e(this.algorithm)}&` +
      `digits=${e(this.digits)}&` +
      `period=${e(this.period)}`
    );
  }
}

export { TOTP };
