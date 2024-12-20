/**
 * OTP secret key.
 */
export class Secret {
    /**
     * Converts a Latin-1 string to a Secret object.
     * @param {string} str Latin-1 string.
     * @returns {Secret} Secret object.
     */
    static fromLatin1(str: string): Secret;
    /**
     * Converts an UTF-8 string to a Secret object.
     * @param {string} str UTF-8 string.
     * @returns {Secret} Secret object.
     */
    static fromUTF8(str: string): Secret;
    /**
     * Converts a base32 string to a Secret object.
     * @param {string} str Base32 string.
     * @returns {Secret} Secret object.
     */
    static fromBase32(str: string): Secret;
    /**
     * Converts a hexadecimal string to a Secret object.
     * @param {string} str Hexadecimal string.
     * @returns {Secret} Secret object.
     */
    static fromHex(str: string): Secret;
    /**
     * Creates a secret key object.
     * @param {Object} [config] Configuration options.
     * @param {ArrayBufferLike} [config.buffer] Secret key buffer.
     * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
     */
    constructor({ buffer, size }?: {
        buffer?: ArrayBufferLike | undefined;
        size?: number | undefined;
    });
    /**
     * Secret key.
     * @type {Uint8Array}
     * @readonly
     */
    readonly bytes: Uint8Array;
    /**
     * Secret key buffer.
     * @deprecated For backward compatibility, the "bytes" property should be used instead.
     * @type {ArrayBufferLike}
     */
    get buffer(): ArrayBufferLike;
    /**
     * Latin-1 string representation of secret key.
     * @type {string}
     */
    get latin1(): string;
    /**
     * UTF-8 string representation of secret key.
     * @type {string}
     */
    get utf8(): string;
    /**
     * Base32 string representation of secret key.
     * @type {string}
     */
    get base32(): string;
    /**
     * Hexadecimal string representation of secret key.
     * @type {string}
     */
    get hex(): string;
}
