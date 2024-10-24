[![Last version](https://img.shields.io/github/v/tag/hectorm/otpauth?label=version)](https://github.com/hectorm/otpauth/tags)
[![npm downloads](https://img.shields.io/npm/dm/otpauth?label=npm%20downloads)](https://www.npmjs.com/package/otpauth)

<p align="center">
  <img src="./resources/logo/OTPAuth-Color-Reduced.svg" height="192">
</p>

# OTPAuth

One Time Password (HOTP/TOTP) library for Node.js, Deno, Bun and browsers.

> [!TIP]
> You can try the library with the demo application available at [otpauth.molinero.dev](https://otpauth.molinero.dev).
>
> If you wish to interact with the library in your browser console, the following snippet can be used:
>
> ```javascript
> const OTPAuth = await import("otpauth");
> ```

## Usage

### [Node.js](https://www.npmjs.com/package/otpauth)

```javascript
import * as OTPAuth from "otpauth";

// Create a new TOTP object.
let totp = new OTPAuth.TOTP({
  // Provider or service the account is associated with.
  issuer: "ACME",
  // Account identifier.
  label: "Alice",
  // Algorithm used for the HMAC function.
  algorithm: "SHA1",
  // Length of the generated tokens.
  digits: 6,
  // Interval of time for which a token is valid, in seconds.
  period: 30,
  // Arbitrary key encoded in base32 or OTPAuth.Secret instance
  // (if omitted, a cryptographically secure random secret is generated).
  secret: "US3WHSG7X5KAPV27VANWKQHF3SH3HULL",
  //   or `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
  //   or `new OTPAuth.Secret()`
});

// A cryptographically secure random secret can also be generated with:
let secret = new OTPAuth.Secret({ size: 20 });

// Generate a token (returns the current token as a string).
let token = totp.generate();

// Validate a token (returns the token delta or null if it is not found in the
// search window, in which case it should be considered invalid).
let delta = totp.validate({ token, window: 1 });

// Get the remaining seconds until the current token changes.
let seconds = totp.period - (Math.floor(Date.now() / 1000) % totp.period);

// Convert to Google Authenticator key URI format (usually the URI is encoded
// in a QR code that can be scanned by the user. This functionality is outside
// the scope of the project, but there are many libraries that can be used for
// this purpose).
//
// otpauth://totp/ACME:Alice?issuer=ACME&secret=US3WHSG7X5KAPV27VANWKQHF3SH3HULL&algorithm=SHA1&digits=6&period=30
let uri = totp.toString(); // or 'OTPAuth.URI.stringify(totp)'

// Convert from Google Authenticator key URI format.
totp = OTPAuth.URI.parse(uri);
```

### [Deno](https://jsr.io/@hectorm/otpauth)

```javascript
import * as OTPAuth from "jsr:@hectorm/otpauth";

// Same as above.
```

### [Bun](https://www.npmjs.com/package/otpauth)

```javascript
import * as OTPAuth from "otpauth";

// Same as above.
```

### [Browsers (ESM)](https://www.jsdelivr.com/package/npm/otpauth)

```html
<script type="importmap">
  {
    "imports": { "otpauth": "https://cdn.jsdelivr.net/npm/otpauth@%VERSION%/dist/otpauth.esm.min.js" },
    "integrity": { "https://cdn.jsdelivr.net/npm/otpauth@%VERSION%/dist/otpauth.esm.min.js": "%HASH%" }
  }
</script>
<script type="module">
  import * as OTPAuth from "otpauth";

  // Same as above.
</script>
```

### [Browsers (UMD)](https://www.jsdelivr.com/package/npm/otpauth)

```html
<script
  src="https://cdn.jsdelivr.net/npm/otpauth@%VERSION%/dist/otpauth.umd.min.js"
  integrity="%HASH%"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
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
[@noble/hashes](https://github.com/paulmillr/noble-hashes) library.

## License

[MIT License](https://github.com/hectorm/otpauth/blob/master/LICENSE.md)
© [Héctor Molinero Fernández](https://hector.molinero.dev/).
