import { isNode } from "../is-node.js";

/**
 * Node.js crypto module.
 * @type {Object.<string, *>|undefined}
 */
const nodeCrypto = isNode
  ? // A dynamically generated name is used to prevent some bundlers from including the module.
    require(Array.from("otpyrc").reverse().join(""))
  : undefined;

export { nodeCrypto };
