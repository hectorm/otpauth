/**
 * Dynamically import Node.js modules ("eval" is used to prevent bundlers from including the module).
 * @see [webpack/webpack#8826](https://github.com/webpack/webpack/issues/8826)
 * @param {string} name Module name.
 * @returns {*} Module.
 */
export const nodeRequire: any;
