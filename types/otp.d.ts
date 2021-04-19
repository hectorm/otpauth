export class HOTP {
    /**
     * Generates an HOTP token.
     * @param {Object} config Configuration options.
     * @param {Secret} config.secret Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.counter=0] Counter value.
     * @returns {string} Token.
     */
    static generate({ secret, algorithm, digits, counter }: {
        secret: Secret;
        algorithm?: string;
        digits?: number;
        counter?: number;
    }): string;
    /**
     * Validates an HOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {Secret} config.secret Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} config.digits Token length.
     * @param {number} [config.counter=0] Counter value.
     * @param {number} [config.window=1] Window of counter values to test.
     * @returns {number|null} Token delta, or null if the token is not found.
     */
    static validate({ token, secret, algorithm, digits, counter, window }: {
        token: string;
        secret: Secret;
        algorithm?: string;
        digits: number;
        counter?: number;
        window?: number;
    }): number | null;
    /**
     * HOTP: An HMAC-based One-time Password Algorithm (RFC 4226)
     * (https://tools.ietf.org/html/rfc4226).
     * @constructor
     * @param {Object} [config] Configuration options.
     * @param {string} [config.issuer=''] Account provider.
     * @param {string} [config.label='OTPAuth'] Account label.
     * @param {Secret|string} [config.secret=Secret] Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.counter=0] Initial counter value.
     */
    constructor({ issuer, label, secret, algorithm, digits, counter }?: {
        issuer?: string;
        label?: string;
        secret?: Secret | string;
        algorithm?: string;
        digits?: number;
        counter?: number;
    });
    /**
     * Account provider.
     * @type {string}
     */
    issuer: string;
    /**
     * Account label.
     * @type {string}
     */
    label: string;
    /**
     * Secret key.
     * @type {Secret}
     */
    secret: Secret;
    /**
     * HMAC hashing algorithm.
     * @type {string}
     */
    algorithm: string;
    /**
     * Token length.
     * @type {number}
     */
    digits: number;
    /**
     * Initial counter value.
     * @type {number}
     */
    counter: number;
    /**
     * Generates an HOTP token.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.counter=this.counter++] Counter value.
     * @returns {string} Token.
     */
    generate({ counter }?: {
        counter?: number;
    }): string;
    /**
     * Validates an HOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {number} [config.counter=this.counter] Counter value.
     * @param {number} [config.window=1] Window of counter values to test.
     * @returns {number|null} Token delta, or null if the token is not found.
     */
    validate({ token, counter, window }: {
        token: string;
        counter?: number;
        window?: number;
    }): number | null;
    /**
     * Returns a Google Authenticator key URI.
     * @returns {string} URI.
     */
    toString(): string;
}
export class TOTP {
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
    static generate({ secret, algorithm, digits, period, timestamp }: {
        secret: Secret;
        algorithm?: string;
        digits?: number;
        period?: number;
        timestamp?: number;
    }): string;
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
     * @returns {number|null} Token delta, or null if the token is not found.
     */
    static validate({ token, secret, algorithm, digits, period, timestamp, window }: {
        token: string;
        secret: Secret;
        algorithm?: string;
        digits: number;
        period?: number;
        timestamp?: number;
        window?: number;
    }): number | null;
    /**
     * TOTP: Time-Based One-Time Password Algorithm (RFC 6238)
     * (https://tools.ietf.org/html/rfc6238).
     * @constructor
     * @param {Object} [config] Configuration options.
     * @param {string} [config.issuer=''] Account provider.
     * @param {string} [config.label='OTPAuth'] Account label.
     * @param {Secret|string} [config.secret=Secret] Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.period=30] Token time-step duration.
     */
    constructor({ issuer, label, secret, algorithm, digits, period }?: {
        issuer?: string;
        label?: string;
        secret?: Secret | string;
        algorithm?: string;
        digits?: number;
        period?: number;
    });
    /**
     * Account provider.
     * @type {string}
     */
    issuer: string;
    /**
     * Account label.
     * @type {string}
     */
    label: string;
    /**
     * Secret key.
     * @type {Secret}
     */
    secret: Secret;
    /**
     * HMAC hashing algorithm.
     * @type {string}
     */
    algorithm: string;
    /**
     * Token length.
     * @type {number}
     */
    digits: number;
    /**
     * Token time-step duration.
     * @type {number}
     */
    period: number;
    /**
     * Generates a TOTP token.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @returns {string} Token.
     */
    generate({ timestamp }?: {
        timestamp?: number;
    }): string;
    /**
     * Validates a TOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @param {number} [config.window=1] Window of counter values to test.
     * @returns {number|null} Token delta, or null if the token is not found.
     */
    validate({ token, timestamp, window }: {
        token: string;
        timestamp?: number;
        window?: number;
    }): number | null;
    /**
     * Returns a Google Authenticator key URI.
     * @returns {string} URI.
     */
    toString(): string;
}
import { Secret } from "./secret";
