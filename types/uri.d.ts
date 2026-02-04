/**
 * HOTP/TOTP object/string conversion.
 * @see [Key URI Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
 */
export class URI {
    /**
     * Parses a Google Authenticator key URI and returns an HOTP/TOTP object.
     * @param {string} uri Google Authenticator Key URI.
     * @param {Object} [config] Configuration options.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     * @returns {HOTP|TOTP} HOTP/TOTP object.
     */
    static parse(uri: string, { hmac }?: {
        hmac?: ((algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array) | undefined;
    }): HOTP | TOTP;
    /**
     * Converts an HOTP/TOTP object to a Google Authenticator key URI.
     * @param {HOTP|TOTP} otp HOTP/TOTP object.
     * @returns {string} Google Authenticator Key URI.
     */
    static stringify(otp: HOTP | TOTP): string;
}
import { HOTP } from "./hotp.js";
import { TOTP } from "./totp.js";
