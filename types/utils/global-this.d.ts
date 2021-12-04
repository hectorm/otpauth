/**
 * "globalThis" ponyfill.
 * {@link https://mathiasbynens.be/notes/globalthis|A horrifying globalThis polyfill in universal JavaScript}
 * @type {Object.<string, *>}
 */
export const globalThis: {
    [x: string]: any;
};
