export default magicalGlobalThis;
/**
 * "globalThis" ponyfill.
 * {@link https://mathiasbynens.be/notes/globalthis|A horrifying globalThis polyfill in universal JavaScript}
 * @type {Object.<string, *>}
*/
declare const magicalGlobalThis: {
    [x: string]: any;
};
