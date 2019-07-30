export = otpAuth
declare namespace otpAuth {

    export const version: string;


    // Secret class
    interface SecretConfig {
        config?: Config
        buffer?: ArrayBuffer
        size?: number
    }

    export class Secret {
        constructor(config?: SecretConfig)
        static fromB32(str: string): Secret;
        static fromHex(str: string): Secret;
        static fromRaw(str: string): Secret;
        b32: string
        hex: string
        raw: string
        buffer: ArrayBuffer
    }


    interface Config {
        issuer: string,
        label: string,
        secret?: Secret;
        algorithm?: string;
        digits?: number;
        period?: number;
    }

    // HOTP

    export class HOTP {
        constructor(config: Config);
        generate(config?: { pad?: boolean, counter?: number }): string | number;
        validate(config?: { window?: number }): number | null
        toString(): string
        issuer: string
        label: string
        secret: Secret
        algorithm: string
        digits: number
        period: number
    }

    // TOTP

    export class TOTP {
        constructor(config: Config);
        generate(config?: { pad?: boolean, timestamp?: number }): string | number;
        validate(config?: { window?: number }): number | null
        toString(): string
        issuer: string
        label: string
        secret: Secret
        algorithm: string
        digits: number
        period: number
    }

}
