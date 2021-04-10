/* global globalThis, window, self */
/* global mocha, describe, it */
/* global chai, assert, assertEquals, assertMatch */
/* global Deno */
/* global OTPAuth */

(async () => {
	/* ================================================
	 * Initialize environment
	 * ================================================
	 */

	const context = (() => {
		/* eslint-disable no-restricted-globals */
		if (typeof globalThis !== 'undefined') return globalThis;
		if (typeof global !== 'undefined') return global;
		if (typeof window !== 'undefined') return window;
		if (typeof self !== 'undefined') return self;
		/* eslint-enable */
		return this;
	})();

	const isNode = Object.prototype.toString.call(context.process) === '[object process]';
	const isDeno = 'Deno' in context && Deno.version && Deno.version.deno;

	if (isDeno) {
		await import('https://cdn.jsdelivr.net/npm/mocha@8/mocha.js');
	}

	if (!('describe' in context) || !('it' in context)) {
		mocha.setup({ ui: 'bdd', reporter: 'spec' });
		context.mochaSelfSetup = true;
	}

	if ('chai' in context) {
		context.assert = chai.assert;
		context.assertEquals = chai.assert.deepEqual;
		context.assertMatch = chai.assert.match;
	} else if (isNode) {
		// eslint-disable-next-line global-require
		const nodeAssert = require('assert').strict;
		context.assert = nodeAssert;
		context.assertEquals = nodeAssert.deepStrictEqual;
		context.assertMatch = nodeAssert.match;
	} else if (isDeno) {
		const denoAssert = await import('https://deno.land/std/testing/asserts.ts');
		context.assert = denoAssert.assert;
		context.assertEquals = denoAssert.assertEquals;
		context.assertMatch = denoAssert.assertMatch;
	}

	if ('OTPAuth' in context) {
		// OTPAuth is already defined.
	} else if (isNode) {
		// eslint-disable-next-line global-require, import/no-dynamic-require
		context.OTPAuth = require(process.env.IS_MINIFIED === 'true'
			? '../dist/otpauth.cjs.min.js'
			: '../dist/otpauth.cjs.js');
	} else if (isDeno) {
		context.OTPAuth = await import(Deno.env.get('IS_MINIFIED') === 'true'
			? '../dist/otpauth.esm.min.js'
			: '../dist/otpauth.esm.js');
	}

	/* ================================================
	 * Test cases
	 * ================================================
	 */

	const cases = [{
		// 00
		buffer: new Uint16Array([43166, 43963, 43559, 29521, 19166, 19613, 5178, 6152, 37930, 252, 24507, 64210, 28982, 57540, 65533, 54088, 54415, 2014, 50282, 22992]).buffer,
		raw: '\u009E\u00A8\u00BB\u00AB\u0027\u00AA\u0051\u0073\u00DE\u004A\u009D\u004C\u003A\u0014\u0008\u0018\u002A\u0094\u00FC\u0000\u00BB\u005F\u00D2\u00FA\u0036\u0071\u00C4\u00E0\u00FD\u00FF\u0048\u00D3\u008F\u00D4\u00DE\u0007\u006A\u00C4\u00D0\u0059',
		b32: 'T2ULXKZHVJIXHXSKTVGDUFAIDAVJJ7AAXNP5F6RWOHCOB7P7JDJY7VG6A5VMJUCZ',
		hex: '9EA8BBAB27AA5173DE4A9D4C3A1408182A94FC00BB5FD2FA3671C4E0FDFF48D38FD4DE076AC4D059',
		hotp: {
			constructor: {
				input: { algorithm: 'SHA1' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '136591'
			},
			validate: {
				input: { token: '136591', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=T2ULXKZHVJIXHXSKTVGDUFAIDAVJJ7AAXNP5F6RWOHCOB7P7JDJY7VG6A5VMJUCZ&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'SHA1', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '823248'
			},
			validate: {
				input: { token: '823248', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=T2ULXKZHVJIXHXSKTVGDUFAIDAVJJ7AAXNP5F6RWOHCOB7P7JDJY7VG6A5VMJUCZ&algorithm=SHA1&digits=6&period=5'
			}
		}
	}, {
		// 01
		buffer: new Uint16Array([18090, 48480, 27991, 30797, 47976, 51345, 8708, 48040, 20922, 20926, 9312, 49305, 30776, 7291, 42211, 63590, 1158, 12256, 50671, 40876]).buffer,
		raw: '\u00AA\u0046\u0060\u00BD\u0057\u006D\u004D\u0078\u0068\u00BB\u0091\u00C8\u0004\u0022\u00A8\u00BB\u00BA\u0051\u00BE\u0051\u0060\u0024\u0099\u00C0\u0038\u0078\u007B\u001C\u00E3\u00A4\u0066\u00F8\u0086\u0004\u00E0\u002F\u00EF\u00C5\u00AC\u009F',
		b32: 'VJDGBPKXNVGXQ2F3SHEAIIVIXO5FDPSRMASJTQBYPB5RZY5EM34IMBHAF7X4LLE7',
		hex: 'AA4660BD576D4D7868BB91C80422A8BBBA51BE51602499C038787B1CE3A466F88604E02FEFC5AC9F',
		hotp: {
			constructor: {
				input: { algorithm: 'SHA256' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '728219'
			},
			validate: {
				input: { token: '728219', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=VJDGBPKXNVGXQ2F3SHEAIIVIXO5FDPSRMASJTQBYPB5RZY5EM34IMBHAF7X4LLE7&algorithm=SHA256&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'SHA256', period: 10 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '530988'
			},
			validate: {
				input: { token: '530988', timestamp: 1451606410000 },
				output: -1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=VJDGBPKXNVGXQ2F3SHEAIIVIXO5FDPSRMASJTQBYPB5RZY5EM34IMBHAF7X4LLE7&algorithm=SHA256&digits=6&period=10'
			}
		}
	}, {
		// 02
		buffer: new Uint16Array([32525, 58802, 54704, 50846, 842, 31285, 32289, 64282, 36479, 51558, 50702, 18096, 65533, 12308, 65533, 39346, 5951, 54232, 34271, 18845]).buffer,
		raw: '\u000D\u007F\u00B2\u00E5\u00B0\u00D5\u009E\u00C6\u004A\u0003\u0035\u007A\u0021\u007E\u001A\u00FB\u007F\u008E\u0066\u00C9\u000E\u00C6\u00B0\u0046\u00FD\u00FF\u0014\u0030\u00FD\u00FF\u00B2\u0099\u003F\u0017\u00D8\u00D3\u00DF\u0085\u009D\u0049',
		b32: 'BV73FZNQ2WPMMSQDGV5CC7Q27N7Y4ZWJB3DLARX574KDB7P7WKMT6F6Y2PPYLHKJ',
		hex: '0D7FB2E5B0D59EC64A03357A217E1AFB7F8E66C90EC6B046FDFF1430FDFFB2993F17D8D3DF859D49',
		hotp: {
			constructor: {
				input: { algorithm: 'SHA512' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '812759'
			},
			validate: {
				input: { token: '812759', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=BV73FZNQ2WPMMSQDGV5CC7Q27N7Y4ZWJB3DLARX574KDB7P7WKMT6F6Y2PPYLHKJ&algorithm=SHA512&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'SHA512', period: 15 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '069364'
			},
			validate: {
				input: { token: '069364', timestamp: 1451606385000, window: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=BV73FZNQ2WPMMSQDGV5CC7Q27N7Y4ZWJB3DLARX574KDB7P7WKMT6F6Y2PPYLHKJ&algorithm=SHA512&digits=6&period=15'
			}
		}
	}, {
		// 03
		buffer: new Uint16Array([51037, 23628, 33758, 7831, 60635, 33945, 53212, 34347, 30503, 20017, 25741, 52882, 1730, 34105, 43705, 34358, 11389, 21091, 43338, 32591]).buffer,
		raw: '\u005D\u00C7\u004C\u005C\u00DE\u0083\u0097\u001E\u00DB\u00EC\u0099\u0084\u00DC\u00CF\u002B\u0086\u0027\u0077\u0031\u004E\u008D\u0064\u0092\u00CE\u00C2\u0006\u0039\u0085\u00B9\u00AA\u0036\u0086\u007D\u002C\u0063\u0052\u004A\u00A9\u004F\u007F',
		b32: 'LXDUYXG6QOLR5W7MTGCNZTZLQYTXOMKORVSJFTWCAY4YLONKG2DH2LDDKJFKST37',
		hex: '5DC74C5CDE83971EDBEC9984DCCF2B862777314E8D6492CEC2063985B9AA36867D2C63524AA94F7F',
		hotp: {
			constructor: {
				input: { digits: 6, issuer: 'ACME' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '692310'
			},
			validate: {
				input: { token: '692310', counter: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://hotp/ACME:OTPAuth?issuer=ACME&secret=LXDUYXG6QOLR5W7MTGCNZTZLQYTXOMKORVSJFTWCAY4YLONKG2DH2LDDKJFKST37&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { digits: 6, issuer: 'ACME' }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '096972'
			},
			validate: {
				input: { token: '096972', timestamp: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://totp/ACME:OTPAuth?issuer=ACME&secret=LXDUYXG6QOLR5W7MTGCNZTZLQYTXOMKORVSJFTWCAY4YLONKG2DH2LDDKJFKST37&algorithm=SHA1&digits=6&period=30'
			}
		}
	}, {
		// 04
		buffer: new Uint16Array([21530, 65533, 31457, 21867, 48007, 30404, 49757, 60647, 22494, 54350, 45498, 45781, 50410, 3426, 24674, 4442, 45282, 62405, 29459, 49678]).buffer,
		raw: '\u001A\u0054\u00FD\u00FF\u00E1\u007A\u006B\u0055\u0087\u00BB\u00C4\u0076\u005D\u00C2\u00E7\u00EC\u00DE\u0057\u004E\u00D4\u00BA\u00B1\u00D5\u00B2\u00EA\u00C4\u0062\u000D\u0062\u0060\u005A\u0011\u00E2\u00B0\u00C5\u00F3\u0013\u0073\u000E\u00C2',
		b32: 'DJKP377BPJVVLB53YR3F3QXH5TPFOTWUXKY5LMXKYRRA2YTALII6FMGF6MJXGDWC',
		hex: '1A54FDFFE17A6B5587BBC4765DC2E7ECDE574ED4BAB1D5B2EAC4620D62605A11E2B0C5F313730EC2',
		hotp: {
			constructor: {
				input: { digits: 7, label: 'Username' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '9926814'
			},
			validate: {
				input: { token: '9926814', counter: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://hotp/Username?secret=DJKP377BPJVVLB53YR3F3QXH5TPFOTWUXKY5LMXKYRRA2YTALII6FMGF6MJXGDWC&algorithm=SHA1&digits=7&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { digits: 7, label: 'Username' }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '6614389'
			},
			validate: {
				input: { token: '6614389', timestamp: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://totp/Username?secret=DJKP377BPJVVLB53YR3F3QXH5TPFOTWUXKY5LMXKYRRA2YTALII6FMGF6MJXGDWC&algorithm=SHA1&digits=7&period=30'
			}
		}
	}, {
		// 05
		buffer: new Uint16Array([14646, 41460, 53078, 31118, 12968, 28155, 26734, 2876, 14486, 2483, 60944, 3819, 43040, 51157, 61274, 57439, 47819, 46060, 31835, 64784]).buffer,
		raw: '\u0036\u0039\u00F4\u00A1\u0056\u00CF\u008E\u0079\u00A8\u0032\u00FB\u006D\u006E\u0068\u003C\u000B\u0096\u0038\u00B3\u0009\u0010\u00EE\u00EB\u000E\u0020\u00A8\u00D5\u00C7\u005A\u00EF\u005F\u00E0\u00CB\u00BA\u00EC\u00B3\u005B\u007C\u0010\u00FD',
		b32: 'GY47JIKWZ6HHTKBS7NWW42B4BOLDRMYJCDXOWDRAVDK4OWXPL7QMXOXMWNNXYEH5',
		hex: '3639F4A156CF8E79A832FB6D6E683C0B9638B30910EEEB0E20A8D5C75AEF5FE0CBBAECB35B7C10FD',
		hotp: {
			constructor: {
				input: { digits: 8, issuer: 'ACME Co', label: 'Firstname Lastname' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '76351593'
			},
			validate: {
				input: { token: '76351593', counter: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://hotp/ACME%20Co:Firstname%20Lastname?issuer=ACME%20Co&secret=GY47JIKWZ6HHTKBS7NWW42B4BOLDRMYJCDXOWDRAVDK4OWXPL7QMXOXMWNNXYEH5&algorithm=SHA1&digits=8&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { digits: 8, issuer: 'ACME Co', label: 'Firstname Lastname' }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '57578252'
			},
			validate: {
				input: { token: '57578252', timestamp: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://totp/ACME%20Co:Firstname%20Lastname?issuer=ACME%20Co&secret=GY47JIKWZ6HHTKBS7NWW42B4BOLDRMYJCDXOWDRAVDK4OWXPL7QMXOXMWNNXYEH5&algorithm=SHA1&digits=8&period=30'
			}
		}
	}, {
		// 06
		buffer: new Uint16Array([6952, 59382, 49227, 46820, 62400, 43213, 1294, 31142, 1178, 21964, 36167, 26389, 58911, 9677, 51244, 15092, 19914, 38706, 3646, 58573]).buffer,
		raw: '\u0028\u001B\u00F6\u00E7\u004B\u00C0\u00E4\u00B6\u00C0\u00F3\u00CD\u00A8\u000E\u0005\u00A6\u0079\u009A\u0004\u00CC\u0055\u0047\u008D\u0015\u0067\u001F\u00E6\u00CD\u0025\u002C\u00C8\u00F4\u003A\u00CA\u004D\u0032\u0097\u003E\u000E\u00CD\u00E4',
		b32: 'FAN7NZ2LYDSLNQHTZWUA4BNGPGNAJTCVI6GRKZY743GSKLGI6Q5MUTJSS47A5TPE',
		hex: '281BF6E74BC0E4B6C0F3CDA80E05A6799A04CC55478D15671FE6CD252CC8F43ACA4D32973E0ECDE4',
		hotp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { counter: 1e10 },
				output: '462236'
			},
			validate: {
				input: { token: '462236', counter: 1e10 + 1 },
				output: -1
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=FAN7NZ2LYDSLNQHTZWUA4BNGPGNAJTCVI6GRKZY743GSKLGI6Q5MUTJSS47A5TPE&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '211496'
			},
			validate: {
				input: { token: '211496', timestamp: 1451603700000, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=FAN7NZ2LYDSLNQHTZWUA4BNGPGNAJTCVI6GRKZY743GSKLGI6Q5MUTJSS47A5TPE&algorithm=SHA1&digits=6&period=30'
			}
		}
	}, {
		// 07
		buffer: new Uint16Array([36033, 1942, 57802, 13299, 6193, 59972, 65533, 63130, 15420, 38697, 61727, 17566, 24165, 31833, 44414, 46673, 22869, 25260, 59361, 37446]).buffer,
		raw: '\u00C1\u008C\u0096\u0007\u00CA\u00E1\u00F3\u0033\u0031\u0018\u0044\u00EA\u00FD\u00FF\u009A\u00F6\u003C\u003C\u0029\u0097\u001F\u00F1\u009E\u0044\u0065\u005E\u0059\u007C\u007E\u00AD\u0051\u00B6\u0055\u0059\u00AC\u0062\u00E1\u00E7\u0046\u0092',
		b32: 'YGGJMB6K4HZTGMIYITVP37426Y6DYKMXD7YZ4RDFLZMXY7VNKG3FKWNMMLQ6ORUS',
		hex: 'C18C9607CAE1F333311844EAFDFF9AF63C3C29971FF19E44655E597C7EAD51B65559AC62E1E74692',
		hotp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { counter: 1e10 },
				output: '203969'
			},
			validate: {
				input: { token: '203969', counter: 1e10 - 1, window: 0 },
				output: null
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=YGGJMB6K4HZTGMIYITVP37426Y6DYKMXD7YZ4RDFLZMXY7VNKG3FKWNMMLQ6ORUS&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '946384'
			},
			validate: {
				input: { token: '946384', timestamp: 1451603700000, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=YGGJMB6K4HZTGMIYITVP37426Y6DYKMXD7YZ4RDFLZMXY7VNKG3FKWNMMLQ6ORUS&algorithm=SHA1&digits=6&period=30'
			}
		}
	}, {
		// 08
		buffer: new Uint16Array([20412, 49784, 65451, 25185, 19043, 3957, 48751, 34068, 8924, 27365, 1945, 44024, 14202, 54242, 54475, 37844, 27053, 57858, 9905, 37141]).buffer,
		raw: '\u00BC\u004F\u0078\u00C2\u00AB\u00FF\u0061\u0062\u0063\u004A\u0075\u000F\u006F\u00BE\u0014\u0085\u00DC\u0022\u00E5\u006A\u0099\u0007\u00F8\u00AB\u007A\u0037\u00E2\u00D3\u00CB\u00D4\u00D4\u0093\u00AD\u0069\u0002\u00E2\u00B1\u0026\u0015\u0091',
		b32: 'XRHXRQVL75QWEY2KOUHW7PQUQXOCFZLKTED7RK32G7RNHS6U2SJ222IC4KYSMFMR',
		hex: 'BC4F78C2ABFF6162634A750F6FBE1485DC22E56A9907F8AB7A37E2D3CBD4D493AD6902E2B1261591',
		hotp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { counter: 1e10 },
				output: '833717'
			},
			validate: {
				input: { token: '833717', counter: 1e10 },
				output: 0
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=XRHXRQVL75QWEY2KOUHW7PQUQXOCFZLKTED7RK32G7RNHS6U2SJ222IC4KYSMFMR&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '875381'
			},
			validate: {
				input: { token: '875381', timestamp: 1451603700000, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=XRHXRQVL75QWEY2KOUHW7PQUQXOCFZLKTED7RK32G7RNHS6U2SJ222IC4KYSMFMR&algorithm=SHA1&digits=6&period=30'
			}
		}
	}, {
		// 09
		buffer: new Uint16Array([1319, 4080, 36928, 43915, 63050, 33017, 65533, 33717, 27409, 32302, 47857, 291, 44387, 44158, 32840, 33103, 33267, 14581, 37425, 15343]).buffer,
		raw: '\u0027\u0005\u00F0\u000F\u0040\u0090\u008B\u00AB\u004A\u00F6\u00F9\u0080\u00FD\u00FF\u00B5\u0083\u0011\u006B\u002E\u007E\u00F1\u00BA\u0023\u0001\u0063\u00AD\u007E\u00AC\u0048\u0080\u004F\u0081\u00F3\u0081\u00F5\u0038\u0031\u0092\u00EF\u003B',
		b32: 'E4C7AD2ASCF2WSXW7GAP375VQMIWWLT66G5CGALDVV7KYSEAJ6A7HAPVHAYZF3Z3',
		hex: '2705F00F40908BAB4AF6F980FDFFB583116B2E7EF1BA230163AD7EAC48804F81F381F5383192EF3B',
		hotp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { counter: 1e10 },
				output: '865988'
			},
			validate: {
				input: { token: '865988', counter: 1e10 + 2 },
				output: null
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=E4C7AD2ASCF2WSXW7GAP375VQMIWWLT66G5CGALDVV7KYSEAJ6A7HAPVHAYZF3Z3&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: {}
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '893785'
			},
			validate: {
				input: { token: '893785', timestamp: 1451606400000 },
				output: 0
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=E4C7AD2ASCF2WSXW7GAP375VQMIWWLT66G5CGALDVV7KYSEAJ6A7HAPVHAYZF3Z3&algorithm=SHA1&digits=6&period=30'
			}
		}
	}, {
		// 10
		buffer: new Uint16Array([30962, 21697, 33627, 20478, 1528, 33224, 26631, 29032, 49527, 27537, 10606, 33477, 42138, 35439, 20536, 3785, 3658, 16089, 21145, 61065]).buffer,
		raw: '\u00F2\u0078\u00C1\u0054\u005B\u0083\u00FE\u004F\u00F8\u0005\u00C8\u0081\u0007\u0068\u0068\u0071\u0077\u00C1\u0091\u006B\u006E\u0029\u00C5\u0082\u009A\u00A4\u006F\u008A\u0038\u0050\u00C9\u000E\u004A\u000E\u00D9\u003E\u0099\u0052\u0089\u00EE',
		b32: '6J4MCVC3QP7E76AFZCAQO2DIOF34DELLNYU4LAU2URXYUOCQZEHEUDWZH2MVFCPO',
		hex: 'F278C1545B83FE4FF805C8810768687177C1916B6E29C5829AA46F8A3850C90E4A0ED93E995289EE',
		hotp: {
			constructor: {
				input: { algorithm: 'sha1' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '188821'
			},
			validate: {
				input: { token: '188821', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=6J4MCVC3QP7E76AFZCAQO2DIOF34DELLNYU4LAU2URXYUOCQZEHEUDWZH2MVFCPO&algorithm=SHA1&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha1', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '805138'
			},
			validate: {
				input: { token: '805138', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=6J4MCVC3QP7E76AFZCAQO2DIOF34DELLNYU4LAU2URXYUOCQZEHEUDWZH2MVFCPO&algorithm=SHA1&digits=6&period=5'
			}
		}
	}, {
		// 11
		buffer: new Uint16Array([59872, 6069, 56070, 48753, 63025, 39523, 58831, 64361, 2334, 26780, 42356, 50540, 56554, 12152, 16863, 571, 16603, 3269, 44292, 34800]).buffer,
		raw: '\u00E0\u00E9\u00B5\u0017\u0006\u00DB\u0071\u00BE\u0031\u00F6\u0063\u009A\u00CF\u00E5\u0069\u00FB\u001E\u0009\u009C\u0068\u0074\u00A5\u006C\u00C5\u00EA\u00DC\u0078\u002F\u00DF\u0041\u003B\u0002\u00DB\u0040\u00C5\u000C\u0004\u00AD\u00F0\u0087',
		b32: '4DU3KFYG3NY34MPWMONM7ZLJ7MPATHDIOSSWZRPK3R4C7X2BHMBNWQGFBQCK34EH',
		hex: 'E0E9B51706DB71BE31F6639ACFE569FB1E099C6874A56CC5EADC782FDF413B02DB40C50C04ADF087',
		hotp: {
			constructor: {
				input: { algorithm: 'sha224' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '315879'
			},
			validate: {
				input: { token: '315879', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=4DU3KFYG3NY34MPWMONM7ZLJ7MPATHDIOSSWZRPK3R4C7X2BHMBNWQGFBQCK34EH&algorithm=SHA224&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha224', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '896072'
			},
			validate: {
				input: { token: '896072', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=4DU3KFYG3NY34MPWMONM7ZLJ7MPATHDIOSSWZRPK3R4C7X2BHMBNWQGFBQCK34EH&algorithm=SHA224&digits=6&period=5'
			}
		}
	}, {
		// 12
		buffer: new Uint16Array([46317, 43292, 62725, 60546, 46677, 44765, 38165, 18530, 31341, 35422, 19506, 7540, 23097, 61697, 35124, 36125, 58291, 22052, 23823, 46255]).buffer,
		raw: '\u00ED\u00B4\u001C\u00A9\u0005\u00F5\u0082\u00EC\u0055\u00B6\u00DD\u00AE\u0015\u0095\u0062\u0048\u006D\u007A\u005E\u008A\u0032\u004C\u0074\u001D\u0039\u005A\u0001\u00F1\u0034\u0089\u001D\u008D\u00B3\u00E3\u0024\u0056\u000F\u005D\u00AF\u00B4',
		b32: '5W2BZKIF6WBOYVNW3WXBLFLCJBWXUXUKGJGHIHJZLIA7CNEJDWG3HYZEKYHV3L5U',
		hex: 'EDB41CA905F582EC55B6DDAE159562486D7A5E8A324C741D395A01F134891D8DB3E324560F5DAFB4',
		hotp: {
			constructor: {
				input: { algorithm: 'sha256' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '639940'
			},
			validate: {
				input: { token: '639940', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=5W2BZKIF6WBOYVNW3WXBLFLCJBWXUXUKGJGHIHJZLIA7CNEJDWG3HYZEKYHV3L5U&algorithm=SHA256&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha256', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '908354'
			},
			validate: {
				input: { token: '908354', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=5W2BZKIF6WBOYVNW3WXBLFLCJBWXUXUKGJGHIHJZLIA7CNEJDWG3HYZEKYHV3L5U&algorithm=SHA256&digits=6&period=5'
			}
		}
	}, {
		// 13
		buffer: new Uint16Array([35200, 62990, 7581, 58630, 38929, 44639, 187, 2966, 52417, 5318, 1773, 12420, 8629, 39433, 33260, 4890, 16322, 773, 6243, 31930]).buffer,
		raw: '\u0080\u0089\u000E\u00F6\u009D\u001D\u0006\u00E5\u0011\u0098\u005F\u00AE\u00BB\u0000\u0096\u000B\u00C1\u00CC\u00C6\u0014\u00ED\u0006\u0084\u0030\u00B5\u0021\u0009\u009A\u00EC\u0081\u001A\u0013\u00C2\u003F\u0005\u0003\u0063\u0018\u00BA\u007C',
		b32: 'QCEQ55U5DUDOKEMYL6XLWAEWBPA4ZRQU5UDIIMFVEEEZV3EBDIJ4EPYFANRRROT4',
		hex: '80890EF69D1D06E511985FAEBB00960BC1CCC614ED068430B521099AEC811A13C23F05036318BA7C',
		hotp: {
			constructor: {
				input: { algorithm: 'sha384' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '380107'
			},
			validate: {
				input: { token: '380107', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=QCEQ55U5DUDOKEMYL6XLWAEWBPA4ZRQU5UDIIMFVEEEZV3EBDIJ4EPYFANRRROT4&algorithm=SHA384&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha384', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '803042'
			},
			validate: {
				input: { token: '803042', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=QCEQ55U5DUDOKEMYL6XLWAEWBPA4ZRQU5UDIIMFVEEEZV3EBDIJ4EPYFANRRROT4&algorithm=SHA384&digits=6&period=5'
			}
		}
	}, {
		// 14
		buffer: new Uint16Array([62708, 476, 35751, 42199, 26053, 9636, 7798, 16008, 54524, 40401, 30304, 5801, 16891, 52836, 24993, 51823, 4929, 55721, 64238, 53445]).buffer,
		raw: '\u00F4\u00F4\u00DC\u0001\u00A7\u008B\u00D7\u00A4\u00C5\u0065\u00A4\u0025\u0076\u001E\u0088\u003E\u00FC\u00D4\u00D1\u009D\u0060\u0076\u00A9\u0016\u00FB\u0041\u0064\u00CE\u00A1\u0061\u006F\u00CA\u0041\u0013\u00A9\u00D9\u00EE\u00FA\u00C5\u00D0',
		b32: '6T2NYANHRPL2JRLFUQSXMHUIH36NJUM5MB3KSFX3IFSM5ILBN7FECE5J3HXPVROQ',
		hex: 'F4F4DC01A78BD7A4C565A425761E883EFCD4D19D6076A916FB4164CEA1616FCA4113A9D9EEFAC5D0',
		hotp: {
			constructor: {
				input: { algorithm: 'sha512' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '498152'
			},
			validate: {
				input: { token: '498152', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=6T2NYANHRPL2JRLFUQSXMHUIH36NJUM5MB3KSFX3IFSM5ILBN7FECE5J3HXPVROQ&algorithm=SHA512&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha512', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '142394'
			},
			validate: {
				input: { token: '142394', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=6T2NYANHRPL2JRLFUQSXMHUIH36NJUM5MB3KSFX3IFSM5ILBN7FECE5J3HXPVROQ&algorithm=SHA512&digits=6&period=5'
			}
		}
	}, {
		// 15
		buffer: new Uint16Array([18898, 19236, 32930, 1508, 8382, 36005, 39479, 24160, 57062, 10043, 52507, 26259, 28002, 52332, 31553, 65310, 11440, 28960, 47512, 36733]).buffer,
		raw: '\u00D2\u0049\u0024\u004B\u00A2\u0080\u00E4\u0005\u00BE\u0020\u00A5\u008C\u0037\u009A\u0060\u005E\u00E6\u00DE\u003B\u0027\u001B\u00CD\u0093\u0066\u0062\u006D\u006C\u00CC\u0041\u007B\u001E\u00FF\u00B0\u002C\u0020\u0071\u0098\u00B9\u007D\u008F',
		b32: '2JESIS5CQDSALPRAUWGDPGTAL3TN4OZHDPGZGZTCNVWMYQL3D373ALBAOGMLS7MP',
		hex: 'D249244BA280E405BE20A58C379A605EE6DE3B271BCD9366626D6CCC417B1EFFB02C207198B97D8F',
		hotp: {
			constructor: {
				input: { algorithm: 'sha3-224' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '315320'
			},
			validate: {
				input: { token: '315320', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=2JESIS5CQDSALPRAUWGDPGTAL3TN4OZHDPGZGZTCNVWMYQL3D373ALBAOGMLS7MP&algorithm=SHA3-224&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha3-224', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '428883'
			},
			validate: {
				input: { token: '428883', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=2JESIS5CQDSALPRAUWGDPGTAL3TN4OZHDPGZGZTCNVWMYQL3D373ALBAOGMLS7MP&algorithm=SHA3-224&digits=6&period=5'
			}
		}
	}, {
		// 16
		buffer: new Uint16Array([206, 55307, 42195, 2063, 11460, 63004, 25397, 42731, 3738, 49669, 48340, 32191, 15925, 697, 46246, 37598, 52735, 61462, 13904, 53412]).buffer,
		raw: '\u00CE\u0000\u000B\u00D8\u00D3\u00A4\u000F\u0008\u00C4\u002C\u001C\u00F6\u0035\u0063\u00EB\u00A6\u009A\u000E\u0005\u00C2\u00D4\u00BC\u00BF\u007D\u0035\u003E\u00B9\u0002\u00A6\u00B4\u00DE\u0092\u00FF\u00CD\u0016\u00F0\u0050\u0036\u00A4\u00D0',
		b32: 'ZYAAXWGTUQHQRRBMDT3DKY7LU2NA4BOC2S6L67JVH24QFJVU32JP7TIW6BIDNJGQ',
		hex: 'CE000BD8D3A40F08C42C1CF63563EBA69A0E05C2D4BCBF7D353EB902A6B4DE92FFCD16F05036A4D0',
		hotp: {
			constructor: {
				input: { algorithm: 'sha3-256' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '197377'
			},
			validate: {
				input: { token: '197377', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=ZYAAXWGTUQHQRRBMDT3DKY7LU2NA4BOC2S6L67JVH24QFJVU32JP7TIW6BIDNJGQ&algorithm=SHA3-256&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha3-256', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '250041'
			},
			validate: {
				input: { token: '250041', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=ZYAAXWGTUQHQRRBMDT3DKY7LU2NA4BOC2S6L67JVH24QFJVU32JP7TIW6BIDNJGQ&algorithm=SHA3-256&digits=6&period=5'
			}
		}
	}, {
		// 17
		buffer: new Uint16Array([30959, 10450, 52070, 122, 26633, 20195, 44317, 35309, 8602, 17395, 30065, 7037, 18931, 39512, 47870, 57239, 42917, 54683, 10016, 9958]).buffer,
		raw: '\u00EF\u0078\u00D2\u0028\u0066\u00CB\u007A\u0000\u0009\u0068\u00E3\u004E\u001D\u00AD\u00ED\u0089\u009A\u0021\u00F3\u0043\u0071\u0075\u007D\u001B\u00F3\u0049\u0058\u009A\u00FE\u00BA\u0097\u00DF\u00A5\u00A7\u009B\u00D5\u0020\u0027\u00E6\u0026',
		b32: '554NEKDGZN5AACLI4NHB3LPNRGNCD42DOF2X2G7TJFMJV7V2S7P2LJ432UQCPZRG',
		hex: 'EF78D22866CB7A000968E34E1DADED899A21F34371757D1BF349589AFEBA97DFA5A79BD52027E626',
		hotp: {
			constructor: {
				input: { algorithm: 'sha3-384' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '282670'
			},
			validate: {
				input: { token: '282670', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=554NEKDGZN5AACLI4NHB3LPNRGNCD42DOF2X2G7TJFMJV7V2S7P2LJ432UQCPZRG&algorithm=SHA3-384&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha3-384', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '167415'
			},
			validate: {
				input: { token: '167415', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=554NEKDGZN5AACLI4NHB3LPNRGNCD42DOF2X2G7TJFMJV7V2S7P2LJ432UQCPZRG&algorithm=SHA3-384&digits=6&period=5'
			}
		}
	}, {
		// 18
		buffer: new Uint16Array([35583, 39822, 46901, 30918, 55399, 37103, 32535, 55417, 32950, 9801, 47763, 31688, 6827, 42877, 50822, 40618, 34914, 40194, 63073, 40081]).buffer,
		raw: '\u00FF\u008A\u008E\u009B\u0035\u00B7\u00C6\u0078\u0067\u00D8\u00EF\u0090\u0017\u007F\u0079\u00D8\u00B6\u0080\u0049\u0026\u0093\u00BA\u00C8\u007B\u00AB\u001A\u007D\u00A7\u0086\u00C6\u00AA\u009E\u0062\u0088\u0002\u009D\u0061\u00F6\u0091\u009C',
		b32: '76FI5GZVW7DHQZ6Y56IBO73Z3C3IASJGSO5MQ65LDJ62PBWGVKPGFCACTVQ7NEM4',
		hex: 'FF8A8E9B35B7C67867D8EF90177F79D8B680492693BAC87BAB1A7DA786C6AA9E6288029D61F6919C',
		hotp: {
			constructor: {
				input: { algorithm: 'sha3-512' }
			},
			generate: {
				input: { counter: 1e10 },
				output: '690216'
			},
			validate: {
				input: { token: '690216', counter: 1e10 - 90, window: 100 },
				output: 90
			},
			toString: {
				output: 'otpauth://hotp/OTPAuth?secret=76FI5GZVW7DHQZ6Y56IBO73Z3C3IASJGSO5MQ65LDJ62PBWGVKPGFCACTVQ7NEM4&algorithm=SHA3-512&digits=6&counter=0'
			}
		},
		totp: {
			constructor: {
				input: { algorithm: 'sha3-512', period: 5 }
			},
			generate: {
				input: { timestamp: 1451606400000 },
				output: '993525'
			},
			validate: {
				input: { token: '993525', timestamp: 1451606395000 },
				output: 1
			},
			toString: {
				output: 'otpauth://totp/OTPAuth?secret=76FI5GZVW7DHQZ6Y56IBO73Z3C3IASJGSO5MQ65LDJ62PBWGVKPGFCACTVQ7NEM4&algorithm=SHA3-512&digits=6&period=5'
			}
		}
	}];

	/* ================================================
	 * Utils
	 * ================================================
	 */

	describe('Utils', () => {
		it('uint.fromBuf[0]', () => {
			const output = OTPAuth.Utils.uint.fromBuf(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer);
			assertEquals(output, 0);
		});

		it('uint.fromBuf[1]', () => {
			const output = OTPAuth.Utils.uint.fromBuf(new Uint8Array([0, 0, 0, 0, 255, 255, 255, 255]).buffer);
			assertEquals(output, 4294967295);
		});

		it('uint.fromBuf[2]', () => { // MAX_SAFE_INTEGER
			const output = OTPAuth.Utils.uint.fromBuf(new Uint8Array([0, 31, 255, 255, 255, 255, 255, 255]).buffer);
			assertEquals(output, 9007199254740991);
		});

		it('uint.toBuf[0]', () => {
			const output = OTPAuth.Utils.uint.toBuf(0);
			assertEquals(new Uint8Array(output), new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
		});

		it('uint.toBuf[1]', () => {
			const output = OTPAuth.Utils.uint.toBuf(4294967295);
			assertEquals(new Uint8Array(output), new Uint8Array([0, 0, 0, 0, 255, 255, 255, 255]));
		});

		it('uint.toBuf[2]', () => { // MAX_SAFE_INTEGER
			const output = OTPAuth.Utils.uint.toBuf(9007199254740991);
			assertEquals(new Uint8Array(output), new Uint8Array([0, 31, 255, 255, 255, 255, 255, 255]));
		});

		cases.forEach((input, index) => {
			it(`raw.fromBuf[${index}]`, () => {
				const output = OTPAuth.Utils.raw.fromBuf(input.buffer);
				assertEquals(output, input.raw);
			});
		});

		cases.forEach((input, index) => {
			it(`raw.toBuf[${index}]`, () => {
				const output = OTPAuth.Utils.raw.toBuf(input.raw);
				assertEquals(new Uint16Array(output), new Uint16Array(input.buffer));
			});
		});

		cases.forEach((input, index) => {
			it(`b32.fromBuf[${index}]`, () => {
				const output = OTPAuth.Utils.b32.fromBuf(input.buffer);
				assertEquals(output, input.b32);
			});
		});

		cases.forEach((input, index) => {
			it(`b32.toBuf[${index}]`, () => {
				const output = OTPAuth.Utils.b32.toBuf(input.b32);
				assertEquals(new Uint16Array(output), new Uint16Array(input.buffer));
			});
		});

		it('b32.fromBuf(b32.toBuf)', () => {
			const input = cases[0];
			const output = OTPAuth.Utils.b32.fromBuf(
				OTPAuth.Utils.b32.toBuf(`${input.b32.toLowerCase()}=`)
			);
			assertEquals(output, input.b32);
		});

		cases.forEach((input, index) => {
			it(`hex.fromBuf[${index}]`, () => {
				const output = OTPAuth.Utils.hex.fromBuf(input.buffer);
				assertEquals(output, input.hex);
			});
		});

		cases.forEach((input, index) => {
			it(`hex.toBuf[${index}]`, () => {
				const output = OTPAuth.Utils.hex.toBuf(input.hex);
				assertEquals(new Uint16Array(output), new Uint16Array(input.buffer));
			});
		});

		it('Utils.pad[0]', () => {
			const output = OTPAuth.Utils.pad(123, 6);
			assertEquals(output, '000123');
		});

		it('Utils.pad[1]', () => {
			const output = OTPAuth.Utils.pad(123456, -4);
			assertEquals(output, '123456');
		});

		it('Utils.pad[2]', () => {
			const output = OTPAuth.Utils.pad(123456, 0);
			assertEquals(output, '123456');
		});

		it('Utils.pad[3]', () => {
			const output = OTPAuth.Utils.pad('0123', 6);
			assertEquals(output, '000123');
		});
	});

	/* ================================================
	 * Secret
	 * ================================================
	 */

	describe('Secret', () => {
		cases.forEach((input, index) => {
			it(`constructor[${index}]`, () => {
				const output = new OTPAuth.Secret({ buffer: input.buffer });

				assertEquals(new Uint16Array(output.buffer), new Uint16Array(input.buffer));
				assertEquals(output.raw, input.raw);
				assertEquals(output.b32, input.b32);
				assertEquals(output.hex, input.hex);
			});
		});

		it(`constructor[${cases.length}]`, () => {
			const output = new OTPAuth.Secret({ size: 256 });

			assert(output.buffer instanceof ArrayBuffer);
			assertEquals(output.buffer.byteLength, 256);
			assert(typeof output.raw === 'string');
			assert(typeof output.b32 === 'string');
			assertMatch(output.b32, /^[2-7A-Z]{410}$/);
			assert(typeof output.hex === 'string');
			assertMatch(output.hex, /^[0-9A-F]{512}$/);
		});

		it(`constructor[${cases.length + 1}]`, () => {
			const output = new OTPAuth.Secret();

			assert(output.buffer instanceof ArrayBuffer);
			assertEquals(output.buffer.byteLength, 20);
			assert(typeof output.b32 === 'string');
			assertMatch(output.b32, /^[2-7A-Z]{32}$/);
			assert(typeof output.hex === 'string');
			assertMatch(output.hex, /^[0-9A-F]{40}$/);
		});

		cases.forEach((input, index) => {
			it(`fromRaw[${index}]`, () => {
				const output = OTPAuth.Secret.fromRaw(input.raw);

				assert(output instanceof OTPAuth.Secret);
				assertEquals(new Uint16Array(output.buffer), new Uint16Array(input.buffer));
				assertEquals(output.raw, input.raw);
				assertEquals(output.b32, input.b32);
				assertEquals(output.hex, input.hex);
			});
		});

		cases.forEach((input, index) => {
			it(`fromB32[${index}]`, () => {
				const output = OTPAuth.Secret.fromB32(input.b32);

				assert(output instanceof OTPAuth.Secret);
				assertEquals(new Uint16Array(output.buffer), new Uint16Array(input.buffer));
				assertEquals(output.raw, input.raw);
				assertEquals(output.b32, input.b32);
				assertEquals(output.hex, input.hex);
			});
		});

		cases.forEach((input, index) => {
			it(`fromHex[${index}]`, () => {
				const output = OTPAuth.Secret.fromHex(input.hex);

				assert(output instanceof OTPAuth.Secret);
				assertEquals(new Uint16Array(output.buffer), new Uint16Array(input.buffer));
				assertEquals(output.raw, input.raw);
				assertEquals(output.b32, input.b32);
				assertEquals(output.hex, input.hex);
			});
		});
	});

	/* ================================================
	 * HOTP
	 * ================================================
	 */

	describe('HOTP', () => {
		it('defaults', () => {
			const hotp = new OTPAuth.HOTP();

			assertEquals(hotp.issuer, '');
			assertEquals(hotp.label, 'OTPAuth');
			assert(hotp.secret instanceof OTPAuth.Secret);
			assertEquals(hotp.algorithm, 'SHA1');
			assertEquals(hotp.digits, 6);
			assertEquals(hotp.counter, 0);

			assert(typeof hotp.generate() === 'string');
			assert(hotp.generate().length === 6);

			assertEquals(hotp.validate({ token: hotp.generate() }), -1);

			// Counter is incremented on each 'generate' call.
			assertEquals(hotp.counter, 3);
		});

		cases.forEach((input, index) => {
			it(`generate[${index}]`, () => {
				const hotp = new OTPAuth.HOTP({
					...input.hotp.constructor.input,
					secret: input.b32
				});

				const output = hotp.generate(input.hotp.generate.input);
				assertEquals(output, input.hotp.generate.output);
			});
		});

		cases.forEach((input, index) => {
			it(`validate[${index}]`, () => {
				const hotp = new OTPAuth.HOTP({
					...input.hotp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = hotp.validate(input.hotp.validate.input);
				assertEquals(output, input.hotp.validate.output);
			});
		});

		cases.forEach((input, index) => {
			it(`toString[${index}]`, () => {
				const hotp = new OTPAuth.HOTP({
					...input.hotp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = hotp.toString();
				assertEquals(output, input.hotp.toString.output);
			});
		});
	});

	/* ================================================
	 * TOTP
	 * ================================================
	 */

	describe('TOTP', () => {
		it('defaults', () => {
			const totp = new OTPAuth.TOTP();

			assertEquals(totp.issuer, '');
			assertEquals(totp.label, 'OTPAuth');
			assert(totp.secret instanceof OTPAuth.Secret);
			assertEquals(totp.algorithm, 'SHA1');
			assertEquals(totp.digits, 6);
			assertEquals(totp.period, 30);

			assert(typeof totp.generate() === 'string');
			assert(totp.generate().length === 6);

			assertEquals(totp.validate({ token: totp.generate() }), 0);
		});

		cases.forEach((input, index) => {
			it(`generate[${index}]`, () => {
				const totp = new OTPAuth.TOTP({
					...input.totp.constructor.input,
					secret: input.b32
				});

				const output = totp.generate(input.totp.generate.input);
				assertEquals(output, input.totp.generate.output);
			});
		});

		cases.forEach((input, index) => {
			it(`validate[${index}]`, () => {
				const totp = new OTPAuth.TOTP({
					...input.totp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = totp.validate(input.totp.validate.input);
				assertEquals(output, input.totp.validate.output);
			});
		});

		cases.forEach((input, index) => {
			it(`toString[${index}]`, () => {
				const totp = new OTPAuth.TOTP({
					...input.totp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = totp.toString();
				assertEquals(output, input.totp.toString.output);
			});
		});
	});

	/* ================================================
	 * URI
	 * ================================================
	 */

	describe('URI', () => {
		cases.forEach((input, index) => {
			it(`parse[${index}] - HOTP`, () => {
				const hotp = new OTPAuth.HOTP({
					...input.hotp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = OTPAuth.URI.parse(input.hotp.toString.output);
				assertEquals(output, hotp);
			});
		});

		cases.forEach((input, index) => {
			it(`parse[${index}] - TOTP`, () => {
				const totp = new OTPAuth.TOTP({
					...input.totp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = OTPAuth.URI.parse(input.totp.toString.output);
				assertEquals(output, totp);
			});
		});

		cases.forEach((input, index) => {
			it(`stringify[${index}] - HOTP`, () => {
				const hotp = new OTPAuth.HOTP({
					...input.hotp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = OTPAuth.URI.stringify(hotp);
				assertEquals(output, input.hotp.toString.output);
			});
		});

		cases.forEach((input, index) => {
			it(`stringify[${index}] - TOTP`, () => {
				const totp = new OTPAuth.TOTP({
					...input.totp.constructor.input,
					secret: new OTPAuth.Secret({ buffer: input.buffer })
				});

				const output = OTPAuth.URI.stringify(totp);
				assertEquals(output, input.totp.toString.output);
			});
		});
	});

	/* ================================================
	 * Version
	 * ================================================
	 */

	describe('version', () => {
		it('version', () => {
			assert(typeof OTPAuth.version === 'string');
			// Semantic Versioning 2.0.0 regex (taken from: https://github.com/npm/node-semver/).
			assertMatch(OTPAuth.version, /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][a-zA-Z0-9-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][a-zA-Z0-9-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
		});
	});

	// Start tests if we were the ones who initialized Mocha.
	if (context.mochaSelfSetup) {
		mocha.run(code => {
			if (isNode) process.exit(code);
			else if (isDeno) Deno.exit(code);
		});
	}
})();
