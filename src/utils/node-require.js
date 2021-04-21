import isNode from './is-node';

/**
 * Dynamically import Node.js modules ("eval" is used to prevent bundlers from including the module).
 * {@link https://github.com/webpack/webpack/issues/8826|webpack/webpack#8826}
 * @param {string} name Module name.
 * @returns {*} Module.
 */
const nodeRequire = isNode
	// eslint-disable-next-line no-eval
	? eval('require')
	: () => {};

export default nodeRequire;
