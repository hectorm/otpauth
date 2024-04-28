[![Last version](https://img.shields.io/github/v/tag/hectorm/otpauth?label=version)](https://github.com/hectorm/otpauth/tags)
[![npm downloads](https://img.shields.io/npm/dm/otpauth?label=npm%20downloads)](https://www.npmjs.com/package/otpauth)

<p align="center">
  <img src="./resources/logo/OTPAuth-Color-Reduced.svg" height="192">
</p>

# OTPAuth

One Time Password (HOTP/TOTP) library for Node.js, Deno, Bun and browsers.

## Usage

### Node.js

```javascript
/* Usage of TOTP module

   The secret used in the TOTP constructor should be created by (new OTPAuth.Secret()).base32 when registering a new device.
   This secret (typically something like "UPMS7FUXJZKWM443JRID4R5KRYKFKPNA") must be stored for the user in a database.

   When verifying a login, the user provided token must be checked with totp.validate({ token, window: 1 }) for all devices
   stored for the user in the database.
*/
const OTPAuth = require('otpauth');
const QRCode = require('qrcode'); // Can be skipped if QRCodes are not needed

/* Registering a new user */

// Create a new TOTP object with random secret.
var MySecret = (new OTPAuth.Secret()).base32;
let totp = new OTPAuth.TOTP({
  issuer: "ACME", // Change to something representing your organisation. Is typically shown in Authenticator APPs to allow selection from multiple accounts
  label: "AzureDiamond", // Also typically displayed in Authenticator APPs. Many sites use the login name here, which makes some sense... 
  algorithm: "SHA1",
  digits: 6, // Number of digits in the token
  period: 30, // Size of the "verification window", in seconds
  secret: MySecret,
});

// Convert to Google Authenticator key URI:
let uri = totp.toString(); // or 'OTPAuth.URI.stringify(totp)'
console.log("Registration uri: "+uri);
 
// Create a QRCode for Authenticator APPs
var QRCodeSVG;
 QRCode.toString(uri, {type:'svg'}, function (err, result) {
    QRCodeSVG = result; // This contains an SVG drawing the QRCode, which must be scanned by the Authenticator APP
    console.log("SVG to draw a QRCode for Authenticator APPs: " + QRCodeSVG);
  });
  

/* Creating a TOTP token on the APP side */

// Convert from Google Authenticator key URI.
// Normally we would fetch the uri from the local APP database. For this example we just use the uri created during the registration part above
totp = OTPAuth.URI.parse(uri);
let token = totp.generate();
console.log("Sample Token: "+token)


/* Validating the token on the server side */

// Validate a token (returns the token delta or null if it is not found in the search window, in which case it should be considered invalid).
// Normally the user would have to type the token into an online form, and the server would load the parameters to create the totp object from the database. 
// For this example we just use the token and object created in the APP side example above.
// If you want to give your users more time to type in the token, increase the window parameter to 2 or 3. But remember that this makes it easier
// for an attacker to pass with a "lucky guess"...

// Play around with the delay parameter to simulate the delay your users need to type in and send the token. 
// With the window parameter set to 1 and period set to 30, a delay of less than 30000 should always recognize the token as valid, 
// while with a delay of more than 60000 the token should always fail. Everything in between has a "random" result, depending
// on when exactly the script is run.
setTimeout(CheckToken, 10000, token); 
function CheckToken(token) {
    let delta = totp.validate({ token, window: 1 });

    if (delta === null) {
        console.log("Token is not valid.");
    } else {
        // Normally delta should be 0 or -1. A delta of >0 is a hint that clocks are not synchronized.
        // The maximum absolute value of delta corresponds to the window parameter of totp.validate
        console.log("Token is valid with delta "+delta);
    }
}
```

### Deno

```javascript
import * as OTPAuth from "https://deno.land/x/otpauth@VERSION/dist/otpauth.esm.js";

// Same as above.
```

### Bun

```javascript
import * as OTPAuth from "otpauth";

// Same as above.
```

### Browsers

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/otpauth/VERSION/otpauth.umd.min.js"></script>
<script>
  // Same as above.
</script>
```

## Documentation

See the documentation page.

> [https://hectorm.github.io/otpauth/](https://hectorm.github.io/otpauth/)

## Supported hashing algorithms

In Node.js, the same algorithms as
[`Crypto.createHmac`](https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options)
function are supported, since it is used internally. In Deno, Bun and browsers, the `SHA1`, `SHA224`, `SHA256`, `SHA384`,
`SHA512`, `SHA3-224`, `SHA3-256`, `SHA3-384` and `SHA3-512` algorithms are supported by using the
[jsSHA](https://github.com/Caligatio/jsSHA) library.

## License

[MIT License](https://github.com/hectorm/otpauth/blob/master/LICENSE.md)
© [Héctor Molinero Fernández](https://hector.molinero.dev/).
