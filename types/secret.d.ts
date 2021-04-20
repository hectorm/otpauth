export default class Secret {
    static fromLatin1(str: string): Secret;
    static fromUTF8(str: string): Secret;
    static fromBase32(str: string): Secret;
    static fromHex(str: string): Secret;
    constructor({ buffer, size }?: {
        buffer?: ArrayBuffer;
        size?: number;
    });
    buffer: ArrayBuffer;
    get latin1(): string;
    get utf8(): string;
    get base32(): string;
    get hex(): string;
}
