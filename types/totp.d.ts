export default class TOTP {
    static get defaults(): any;
    static generate({ secret, algorithm, digits, period, timestamp, }: {
        secret: Secret;
        algorithm?: string;
        digits?: number;
        period?: number;
        timestamp?: number;
    }): string;
    static validate({ token, secret, algorithm, digits, period, timestamp, window, }: {
        token: string;
        secret: Secret;
        algorithm?: string;
        digits: number;
        period?: number;
        timestamp?: number;
        window?: number;
    }): number | null;
    constructor({ issuer, label, secret, algorithm, digits, period, }?: {
        issuer?: string;
        label?: string;
        secret?: Secret | string;
        algorithm?: string;
        digits?: number;
        period?: number;
    });
    issuer: string;
    label: string;
    secret: Secret;
    algorithm: string;
    digits: number;
    period: number;
    generate({ timestamp, }?: {
        timestamp?: number;
    }): string;
    validate({ token, timestamp, window, }: {
        token: string;
        timestamp?: number;
        window?: number;
    }): number | null;
    toString(): string;
}
import Secret from "./secret";
