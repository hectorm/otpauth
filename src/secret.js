import { base32Decode, base32Encode } from "./utils/encoding/base32.js";
import { hexDecode, hexEncode } from "./utils/encoding/hex.js";
import { latin1Decode, latin1Encode } from "./utils/encoding/latin1.js";
import { utf8Decode, utf8Encode } from "./utils/encoding/utf8.js";
import { randomBytes } from "./utils/crypto/random-bytes.js";

/**
 * OTP secret key.
 */
class Secret {
  /**
   * Creates a secret key object.
   * @param {Object} [config] Configuration options.
   * @param {ArrayBufferLike} [config.buffer] Secret key buffer.
   * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
   */
  constructor({ buffer, size = 20 } = {}) {
    /**
     * Secret key.
     * @type {Uint8Array}
     * @readonly
     */
    this.bytes = typeof buffer === "undefined" ? randomBytes(size) : new Uint8Array(buffer);

    // Prevent the "bytes" property from being modified.
    Object.defineProperty(this, "bytes", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: this.bytes,
    });
  }

  /**
   * Converts a Latin-1 string to a Secret object.
   * @param {string} str Latin-1 string.
   * @returns {Secret} Secret object.
   */
  static fromLatin1(str) {
    return new Secret({ buffer: latin1Decode(str).buffer });
  }

  /**
   * Converts an UTF-8 string to a Secret object.
   * @param {string} str UTF-8 string.
   * @returns {Secret} Secret object.
   */
  static fromUTF8(str) {
    return new Secret({ buffer: utf8Decode(str).buffer });
  }

  /**
   * Converts a base32 string to a Secret object.
   * @param {string} str Base32 string.
   * @returns {Secret} Secret object.
   */
  static fromBase32(str) {
    return new Secret({ buffer: base32Decode(str).buffer });
  }

  /**
   * Converts a hexadecimal string to a Secret object.
   * @param {string} str Hexadecimal string.
   * @returns {Secret} Secret object.
   */
  static fromHex(str) {
    return new Secret({ buffer: hexDecode(str).buffer });
  }

  /**
   * Secret key buffer.
   * @deprecated For backward compatibility, the "bytes" property should be used instead.
   * @type {ArrayBufferLike}
   */
  get buffer() {
    return this.bytes.buffer;
  }

  /**
   * Latin-1 string representation of secret key.
   * @type {string}
   */
  get latin1() {
    Object.defineProperty(this, "latin1", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: latin1Encode(this.bytes),
    });

    return this.latin1;
  }

  /**
   * UTF-8 string representation of secret key.
   * @type {string}
   */
  get utf8() {
    Object.defineProperty(this, "utf8", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: utf8Encode(this.bytes),
    });

    return this.utf8;
  }

  /**
   * Base32 string representation of secret key.
   * @type {string}
   */
  get base32() {
    Object.defineProperty(this, "base32", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: base32Encode(this.bytes),
    });

    return this.base32;
  }

  /**
   * Hexadecimal string representation of secret key.
   * @type {string}
   */
  get hex() {
    Object.defineProperty(this, "hex", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: hexEncode(this.bytes),
    });

    return this.hex;
  }
}

export { Secret };
