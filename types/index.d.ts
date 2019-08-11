export = OTPAuth

declare namespace OTPAuth {
	export class HOTP {
		constructor(config?: {
			issuer?: string,
			label?: string,
			secret?: Secret | string,
			algorithm?: string,
			digits?: number,
			counter?: number
		});

		issuer: string;
		label: string;
		secret: Secret;
		algorithm: string;
		digits: number;
		counter: number;

		static generate(config: {
			secret: Secret,
			algorithm?: string,
			digits?: number,
			counter?: number
		}): string;

		generate(config?: {
			counter?: number
		}): string;

		static validate(config: {
			token: string,
			secret: Secret,
			algorithm?: string,
			counter?: number,
			window?: number
		}): number | null;

		validate(config: {
			token: string,
			counter?: number,
			window?: number
		}): number | null;

		toString(): string;
	}

	export class TOTP {
		constructor(config?: {
			issuer?: string,
			label?: string,
			secret?: Secret | string,
			algorithm?: string,
			digits?: number,
			period?: number
		});

		issuer: string;
		label: string;
		secret: Secret;
		algorithm: string;
		digits: number;
		period: number;

		static generate(config: {
			secret: Secret,
			algorithm?: string,
			digits?: number,
			period?: number,
			timestamp?: number
		}): string;

		generate(config?: {
			timestamp?: number
		}): string;

		static validate(config: {
			token: string,
			secret: Secret,
			algorithm?: string,
			period?: number,
			timestamp?: number,
			window?: number
		}): number | null;

		validate(config: {
			token: string,
			timestamp?: number,
			window?: number
		}): number | null;

		toString(): string;
	}

	export class Secret {
		constructor(config?: {
			buffer?: ArrayBuffer,
			size?: number
		});

		buffer: ArrayBuffer;
		raw: string;
		b32: string;
		hex: string;

		static fromRaw(str: string): Secret;

		static fromB32(str: string): Secret;

		static fromHex(str: string): Secret;
	}

	export class URI {
		static parse(uri: string): HOTP | TOTP;

		static stringify(otp: HOTP | TOTP, config?: {
			legacyIssuer?: boolean
		}): string;
	}

	export const Utils: {
		uint: {
			decode(buf: ArrayBuffer): number,
			encode(num: number): ArrayBuffer
		},
		raw: {
			decode(buf: ArrayBuffer): string,
			encode(str: string): ArrayBuffer
		},
		b32: {
			alphabet: string,
			decode(buf: ArrayBuffer): string,
			encode(str: string): ArrayBuffer
		},
		hex: {
			decode(buf: ArrayBuffer): string,
			encode(str: string): ArrayBuffer
		},
		pad(num: number | string, digits: number): string
	};

	export const version: string;
}
