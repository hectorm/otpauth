import { HOTP } from "./hotp.js";
import { TOTP } from "./totp.js";

/**
 * Key URI regex (otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS).
 * @type {RegExp}
 */
const OTPURI_REGEX = /^otpauth:\/\/([ht]otp)\/(.+)\?([A-Z0-9.~_-]+=[^?&]*(?:&[A-Z0-9.~_-]+=[^?&]*)*)$/i;

/**
 * RFC 4648 base32 alphabet with pad.
 * @type {RegExp}
 */
const SECRET_REGEX = /^[2-7A-Z]+=*$/i;

/**
 * Regex for supported algorithms in built-in HMAC function.
 * @type {RegExp}
 */
const ALGORITHM_REGEX = /^SHA(?:1|224|256|384|512|3-224|3-256|3-384|3-512)$/i;

/**
 * Regex for custom algorithms in user-defined HMAC function.
 * @type {RegExp}
 */
const ALGORITHM_CUSTOM_REGEX = /^[A-Z0-9]+(?:[_-][A-Z0-9]+)*$/i;

/**
 * Integer regex.
 * @type {RegExp}
 */
const INTEGER_REGEX = /^[+-]?\d+$/;

/**
 * Positive integer regex.
 * @type {RegExp}
 */
const POSITIVE_INTEGER_REGEX = /^\+?[1-9]\d*$/;

/**
 * HOTP/TOTP object/string conversion.
 * @see [Key URI Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
 */
class URI {
  /**
   * Parses a Google Authenticator key URI and returns an HOTP/TOTP object.
   * @param {string} uri Google Authenticator Key URI.
   * @param {Object} [config] Configuration options.
   * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
   * @returns {HOTP|TOTP} HOTP/TOTP object.
   */
  static parse(uri, { hmac } = {}) {
    let uriGroups;

    try {
      uriGroups = uri.match(OTPURI_REGEX);
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      /* Handled below */
    }

    if (!Array.isArray(uriGroups)) {
      throw new URIError("Invalid URI format");
    }

    // Extract URI groups.
    const uriType = uriGroups[1].toLowerCase();
    const uriLabel = uriGroups[2].split(/(?::|%3A) *(.+)/i, 2).map(decodeURIComponent);
    /** @type {Object.<string, string>} */
    const uriParams = uriGroups[3].split("&").reduce((acc, cur) => {
      const pairArr = cur.split(/=(.*)/, 2).map(decodeURIComponent);
      const pairKey = pairArr[0].toLowerCase();
      const pairVal = pairArr[1];
      /** @type {Object.<string, string>} */
      const pairAcc = acc;

      pairAcc[pairKey] = pairVal;
      return pairAcc;
    }, {});

    // 'OTP' will be instantiated with 'config' argument.
    let OTP;
    const config = {};

    if (uriType === "hotp") {
      OTP = HOTP;

      // Counter: required
      if (typeof uriParams.counter !== "undefined" && INTEGER_REGEX.test(uriParams.counter)) {
        config.counter = parseInt(uriParams.counter, 10);
      } else {
        throw new TypeError("Missing or invalid 'counter' parameter");
      }
    } else if (uriType === "totp") {
      OTP = TOTP;

      // Period: optional
      if (typeof uriParams.period !== "undefined") {
        if (POSITIVE_INTEGER_REGEX.test(uriParams.period)) {
          config.period = parseInt(uriParams.period, 10);
        } else {
          throw new TypeError("Invalid 'period' parameter");
        }
      }
    } else {
      throw new TypeError("Unknown OTP type");
    }

    // Label: required
    // Issuer: optional
    if (typeof uriParams.issuer !== "undefined") {
      config.issuer = uriParams.issuer;
    }
    if (uriLabel.length === 2) {
      config.label = uriLabel[1];
      if (typeof config.issuer === "undefined" || config.issuer === "") {
        config.issuer = uriLabel[0];
      } else if (uriLabel[0] === "") {
        config.issuerInLabel = false;
      }
    } else {
      config.label = uriLabel[0];
      if (typeof config.issuer !== "undefined" && config.issuer !== "") {
        config.issuerInLabel = false;
      }
    }

    // Secret: required
    if (typeof uriParams.secret !== "undefined" && SECRET_REGEX.test(uriParams.secret)) {
      config.secret = uriParams.secret;
    } else {
      throw new TypeError("Missing or invalid 'secret' parameter");
    }

    // Algorithm: optional
    if (typeof uriParams.algorithm !== "undefined") {
      if ((hmac ? ALGORITHM_CUSTOM_REGEX : ALGORITHM_REGEX).test(uriParams.algorithm)) {
        config.algorithm = uriParams.algorithm;
      } else {
        throw new TypeError("Invalid 'algorithm' parameter");
      }
    }

    // Digits: optional
    if (typeof uriParams.digits !== "undefined") {
      if (POSITIVE_INTEGER_REGEX.test(uriParams.digits)) {
        config.digits = parseInt(uriParams.digits, 10);
      } else {
        throw new TypeError("Invalid 'digits' parameter");
      }
    }

    // HMAC: optional
    if (typeof hmac !== "undefined") {
      config.hmac = hmac;
    }

    return new OTP(config);
  }

  /**
   * Converts an HOTP/TOTP object to a Google Authenticator key URI.
   * @param {HOTP|TOTP} otp HOTP/TOTP object.
   * @returns {string} Google Authenticator Key URI.
   */
  static stringify(otp) {
    if (otp instanceof HOTP || otp instanceof TOTP) {
      return otp.toString();
    }

    throw new TypeError("Invalid 'HOTP/TOTP' object");
  }
}

export { URI };
