/**
 * An object containing some utilities not exposed in the public API.
 * @private
 * @type {Object}
 */
export const InternalUtils = {

	/**
	 * "globalThis" ponyfill
	 * (https://mathiasbynens.be/notes/globalthis).
	 * @type {Object}
	 */
	get globalThis() {
		let _globalThis;

		/* eslint-disable no-extend-native, no-restricted-globals, no-undef */
		if (typeof globalThis === 'object') {
			_globalThis = globalThis;
		} else {
			Object.defineProperty(Object.prototype, '__magicalGlobalThis__', {
				get() { return this; },
				configurable: true
			});
			try {
				_globalThis = __magicalGlobalThis__;
			} finally {
				delete Object.prototype.__magicalGlobalThis__;
			}
		}

		if (typeof _globalThis === 'undefined') {
			// Still unable to determine "globalThis", fall back to a naive method.
			if (typeof self !== 'undefined') {
				_globalThis = self;
			} else if (typeof window !== 'undefined') {
				_globalThis = window;
			} else if (typeof global !== 'undefined') {
				_globalThis = global;
			}
		}
		/* eslint-enable */

		Object.defineProperty(this, 'globalThis', {
			enumerable: true,
			value: _globalThis
		});

		return this.globalThis;
	},

	/**
	 * "console" ponyfill.
	 * @type {Object}
	 */
	get console() {
		const _console = {};

		const methods = [
			'assert', 'clear', 'context', 'count', 'countReset', 'debug', 'dir', 'dirxml',
			'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile',
			'profileEnd', 'table', 'time', 'timeEnd', 'timeLog', 'timeStamp', 'trace', 'warn'
		];

		if (typeof InternalUtils.globalThis.console === 'object') {
			for (const method of methods) {
				_console[method] = typeof InternalUtils.globalThis.console[method] === 'function'
					? InternalUtils.globalThis.console[method]
					: () => {};
			}
		} else {
			for (const method of methods) {
				_console[method] = () => {};
			}
		}

		Object.defineProperty(this, 'console', {
			enumerable: true,
			value: _console
		});

		return this.console;
	},

	/**
	 * UTF-8 text decoder.
	 * @type {Function}
	 */
	get utf8TextDecode() {
		let _decode;

		if (typeof InternalUtils.globalThis.TextDecoder === 'function') {
			const decoder = new InternalUtils.globalThis.TextDecoder('utf-8');
			_decode = buf => decoder.decode(buf);
		} else {
			_decode = () => {
				throw new Error('Encoding API not available');
			};
		}

		Object.defineProperty(this, 'utf8TextDecode', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: _decode
		});

		return this.utf8TextDecode;
	},

	/**
	 * UTF-8 text encoder.
	 * @type {Function}
	 */
	get utf8TextEncode() {
		let _encode;

		if (typeof InternalUtils.globalThis.TextEncoder === 'function') {
			const encoder = new InternalUtils.globalThis.TextEncoder('utf-8');
			_encode = str => encoder.encode(str);
		} else {
			_encode = () => {
				throw new Error('Encoding API not available');
			};
		}

		Object.defineProperty(this, 'utf8TextEncode', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: _encode
		});

		return this.utf8TextEncode;
	},

	/**
	 * Detect if running in "Node.js".
	 * @type {boolean}
	 */
	get isNode() {
		const _isNode = Object.prototype.toString.call(InternalUtils.globalThis.process) === '[object process]';

		Object.defineProperty(this, 'isNode', {
			enumerable: true,
			value: _isNode
		});

		return this.isNode;
	},

	/**
	 * Dynamically import "Node.js" modules.
	 * (`eval` is used to prevent bundlers from including the module,
	 * e.g., [webpack/webpack#8826](https://github.com/webpack/webpack/issues/8826))
	 * @type {Function}
	 */
	get nodeRequire() {
		const _nodeRequire = InternalUtils.isNode
			// eslint-disable-next-line no-eval
			? eval('require')
			: () => {};

		Object.defineProperty(this, 'nodeRequire', {
			enumerable: true,
			value: _nodeRequire
		});

		return this.nodeRequire;
	}

};
