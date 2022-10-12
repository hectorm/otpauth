import { isNode } from "../is-node.js";

/**
 * Node.js crypto module.
 * @type {Object.<string, *>|undefined}
 */
const nodeCrypto = isNode ? require("crypto") : undefined;

export { nodeCrypto };
