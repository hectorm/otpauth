export default class HOTP {
    static get defaults(): any;
    static generate({ secret, algorithm, digits, counter, }: {
        secret: Secret;
        algorithm?: string;
        digits?: number;
        counter?: number;
    }): string;
    static validate({ token, secret, algorithm, digits, counter, window, }: {
        token: string;
        secret: Secret;
        algorithm?: string;
        digits: number;
        counter?: number;
        window?: number;
    }): number | null;
    constructor({ issuer, label, secret, algorithm, digits, counter, }?: {
        issuer?: string;
        label?: string;
        secret?: Secret | string;
        algorithm?: string;
        digits?: number;
        counter?: number;
    });
    issuer: string;
    label: string;
    secret: Secret;
    algorithm: string;
    digits: number;
    counter: number;
    generate({ counter, }?: {
        counter?: number;
    }): string;
    validate({ token, counter, window, }: {
        token: string;
        counter?: number;
        window?: number;
    }): number | null;
    toString(): string;
}
import Secret from "./secret";
