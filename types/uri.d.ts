export default class URI {
    static parse(uri: string): HOTP | TOTP;
    static stringify(otp: HOTP | TOTP): string;
}
import HOTP from "./hotp";
import TOTP from "./totp";
