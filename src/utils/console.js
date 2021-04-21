import globalThis from './global-this';

/**
 * "console" ponyfill.
 * @type {Object.<string, *>}
 */
const console = (() => {
	/** @type {Object.<string, *>} */
	const container = {};

	const methods = [
		'assert', 'clear', 'context', 'count', 'countReset', 'debug', 'dir', 'dirxml',
		'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile',
		'profileEnd', 'table', 'time', 'timeEnd', 'timeLog', 'timeStamp', 'trace', 'warn',
	];

	if (typeof globalThis.console === 'object') {
		for (const method of methods) {
			container[method] = typeof globalThis.console[method] === 'function'
				? globalThis.console[method]
				: () => {};
		}
	} else {
		for (const method of methods) {
			container[method] = () => {};
		}
	}

	return container;
})();

export default console;
