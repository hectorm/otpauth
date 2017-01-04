[![Documentation](https://doc.esdoc.org/github.com/zant95/otpauth/badge.svg)](https://doc.esdoc.org/github.com/zant95/otpauth/)
[![License](https://img.shields.io/github/license/zant95/otpauth.svg)](LICENSE.md)

[![NPM](https://nodei.co/npm/otpauth.png)](https://www.npmjs.com/package/otpauth)

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
	'secret': new OTPAuth.Secret({
		'buffer': OTPAuth.Utils.b32.encode('NB2W45DFOIZA')
	})
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

For more information, see the [documentation](https://doc.esdoc.org/github.com/zant95/otpauth/) page.

