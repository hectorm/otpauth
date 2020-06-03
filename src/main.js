/**
 * One Time Password (HOTP/TOTP) library for Node.js and browser.
 * @module OTPAuth
 * @author Héctor Molinero Fernández <hector@molinero.dev>
 */
import { HOTP, TOTP } from './otp';
import { URI } from './uri';
import { Secret } from './secret';
import { Utils } from './utils';
import { version } from './version';

export { HOTP, TOTP, URI, Secret, Utils, version };
