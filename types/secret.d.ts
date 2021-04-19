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
     * Secret key object.
     * @constructor
     * @param {Object} [config] Configuration options.
     * @param {ArrayBuffer} [config.buffer=Crypto.randomBytes] Secret key.
     * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
     */
    constructor({ buffer, size }?: {
        buffer?: ArrayBuffer;
        size?: number;
    });
    /**
     * Secret key.
     * @type {ArrayBuffer}
     */
    buffer: ArrayBuffer;
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
     * Base32 representation of secret key.
     * @type {string}
     */
    get base32(): string;
    /**
     * Hexadecimal representation of secret key.
     * @type {string}
     */
    get hex(): string;
}
