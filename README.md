[![Documentation](https://doc.esdoc.org/github.com/zant95/otpauth/badge.svg)][3]
[![License](https://img.shields.io/github/license/zant95/otpauth.svg)][1]

[![NPM](https://nodei.co/npm/otpauth.png)][2]

***

# OTPAuth
One Time Password (HOTP/TOTP) library for Node.js and browser.

## Installation
Install the module via `npm`.

```
$ npm install otpauth
```

## Usage

### Node.js
```javascript
const OTPAuth = require('otpauth');

// Generate a random secret
let randomTOTP = new OTPAuth.TOTP();

// Specify a custom secret
let customTOTP = new OTPAuth.TOTP({
	'issuer': 'ACME',
	'label': 'AzureDiamond',
	'algorithm': 'SHA512',
	'digits': 8,
	'period': 20,
	'secret': OTPAuth.Secret.fromB32('NB2W45DFOIZA')
});

// Convert to Google Authenticator key URI
console.log(customTOTP.toString());

// Generate token
console.log(customTOTP.generate());

```

### Browser
```html
<script src="otpauth.js"></script>
<script>
	var randomTOTP = new OTPAuth.TOTP();

	// Same as above...
</script>
```

## Supported hashing algorithms
In Node.js, the same algorithms as [```Crypto.createHmac```][4] function are supported, since it is used internally.
In browsers, the ```SHA1```, ```SHA256``` and ```SHA512``` algorithms are supported by using the [Stanford Javascript Crypto Library][5].

## Documentation
See the [documentation][3] page.

[1]: LICENSE.md
[2]: https://www.npmjs.com/package/otpauth
[3]: https://doc.esdoc.org/github.com/zant95/otpauth/
[4]: https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key
[5]: https://github.com/bitwiseshiftleft/sjcl

