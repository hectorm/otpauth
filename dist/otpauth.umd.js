//! otpauth 9.5.2 | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth
//! noble-hashes 2.4.0 | (c) Paul Miller | MIT | https://github.com/paulmillr/noble-hashes
/// <reference types="./otpauth.d.ts" />
// @ts-nocheck
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.OTPAuth = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Converts an integer to an Uint8Array.
   * @param {number} num Integer.
   * @returns {Uint8Array} Uint8Array.
   */ const uintDecode = (num)=>{
      const buf = new ArrayBuffer(8);
      const arr = new Uint8Array(buf);
      let acc = num;
      for(let i = 7; i >= 0; i--){
          if (acc === 0) break;
          arr[i] = acc & 255;
          acc -= arr[i];
          acc /= 256;
      }
      return arr;
  };

  /**
   * Checks if something is Uint8Array. Be careful: nodejs Buffer will return true.
   * @param a - value to test
   * @returns `true` when the value is a Uint8Array-compatible view.
   * @example
   * Check whether a value is a Uint8Array-compatible view.
   * ```ts
   * isBytes(new Uint8Array([1, 2, 3]));
   * ```
   */ function isBytes(a) {
      // Plain `instanceof Uint8Array` is too strict for some Buffer / proxy / cross-realm cases.
      // The fallback still requires a real ArrayBuffer view, so plain
      // JSON-deserialized `{ constructor: ... }` spoofing is rejected, and
      // `BYTES_PER_ELEMENT === 1` keeps the fallback on byte-oriented views.
      return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array' && 'BYTES_PER_ELEMENT' in a && a.BYTES_PER_ELEMENT === 1;
  }
  // Shared error-message prefix builder. Only called on throw paths, so assert
  // success paths never pay for the string concatenation.
  const atitle = (title)=>title ? `"${title}" ` : '';
  /**
   * Asserts something is a non-negative integer.
   * @param n - number to validate
   * @param title - label included in thrown errors
   * @returns The validated number.
   * @throws On wrong argument types. {@link TypeError}
   * @throws On wrong argument ranges or values. {@link RangeError}
   * @example
   * Validate a non-negative integer option.
   * ```ts
   * anumber(32, 'length');
   * ```
   */ function anumber(n, title = '') {
      if (typeof n !== 'number') throw new TypeError(atitle(title) + 'expected number, got ' + typeof n);
      if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(atitle(title) + 'expected integer >= 0, got ' + n);
      return n;
  }
  /**
   * Asserts something is a boolean.
   * @param value - value to validate
   * @param title - label included in thrown errors
   * @returns The validated boolean.
   * @throws On wrong argument types. {@link TypeError}
   * @example
   * Validate a boolean option.
   * ```ts
   * abool(true, 'enableXOF');
   * ```
   */ function abool(value, title = '') {
      if (typeof value !== 'boolean') throw new TypeError(atitle(title) + 'expected boolean, got type=' + typeof value);
      return value;
  }
  /**
   * Asserts something is Uint8Array.
   * @param value - value to validate
   * @param length - optional exact length constraint
   * @param title - label included in thrown errors
   * @returns The validated byte array.
   * @throws On wrong argument types. {@link TypeError}
   * @throws On wrong argument ranges or values. {@link RangeError}
   * @example
   * Validate that a value is a byte array.
   * ```ts
   * abytes(new Uint8Array([1, 2, 3]));
   * ```
   */ function abytes(value, length, title = '') {
      // Success path first: this runs at the start of every update() / digestInto(), and the
      // common `abytes(data)` form must not pay for length handling it does not use.
      if (isBytes(value) && (length === undefined)) return value;
      const bytes = isBytes(value);
      const ofLen = '';
      const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
      const message = atitle(title) + 'expected Uint8Array' + ofLen + ', got ' + got;
      if (!bytes) throw new TypeError(message);
      throw new RangeError(message);
  }
  /**
   * Asserts something is a wrapped hash constructor.
   * @param h - hash constructor to validate
   * @throws On wrong argument types or invalid hash wrapper shape. {@link TypeError}
   * @throws On invalid hash metadata ranges or values. {@link RangeError}
   * @throws If the hash metadata allows empty outputs or block sizes. {@link Error}
   * @example
   * Validate a callable hash wrapper.
   * ```ts
   * import { ahash } from '@noble/hashes/utils.js';
   * import { sha256 } from '@noble/hashes/sha2.js';
   * ahash(sha256);
   * ```
   */ function ahash(h) {
      if (typeof h !== 'function' || typeof h.create !== 'function') throw new TypeError('expected hash wrapped by utils.createHasher');
      anumber(h.outputLen);
      anumber(h.blockLen);
      // HMAC and KDF callers treat these as real byte lengths; allowing zero lets fake wrappers pass
      // validation and can produce empty outputs instead of failing fast.
      if (h.outputLen < 1 || h.blockLen < 1) throw new Error('hash blockLen / outputLen must be >= 1');
  }
  const aobject = (value, label)=>{
      if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError((label === 'object' ? '' : `"${label}" `) + 'expected object, got type=' + typeof value);
  };
  const aopts = (value, label)=>{
      aobject(value, label);
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) throw new TypeError(`"${label}" expected plain object`);
      // Object.assign() treats an own "__proto__" source key as a write to the target's legacy
      // prototype setter. Reject it before merging so inherited option values cannot be injected.
      if (Object.hasOwn(value, '__proto__')) throw new TypeError(`"${label}.__proto__" is not allowed`);
  };
  /**
   * Asserts a hash instance has not been destroyed or finished.
   * @param instance - hash instance to validate
   * @param checkFinished - whether to reject finalized instances
   * @throws If the hash instance has already been destroyed or finalized. {@link Error}
   * @example
   * Validate that a hash instance is still usable.
   * ```ts
   * import { aexists } from '@noble/hashes/utils.js';
   * import { sha256 } from '@noble/hashes/sha2.js';
   * const hash = sha256.create();
   * aexists(hash);
   * ```
   */ function aexists(instance, checkFinished = true) {
      // Runs on every update()/digestInto(); the flags are library-owned booleans, so only their
      // truthiness is checked - re-validating their type per call was pure hot-path overhead.
      if (instance.destroyed) throw new Error('hash was destroyed');
      if (checkFinished && instance.finished) throw new Error('digest() was already called');
  }
  /**
   * Asserts output is a sufficiently-sized byte array.
   * @param out - destination buffer
   * @param instance - hash instance providing output length
   * Oversized buffers are allowed; downstream code only promises to fill the first `outputLen` bytes.
   * @throws On wrong argument types. {@link TypeError}
   * @throws On wrong argument ranges or values. {@link RangeError}
   * @example
   * Validate a caller-provided digest buffer.
   * ```ts
   * import { aoutput } from '@noble/hashes/utils.js';
   * import { sha256 } from '@noble/hashes/sha2.js';
   * const hash = sha256.create();
   * aoutput(new Uint8Array(hash.outputLen), hash);
   * ```
   */ function aoutput(out, instance) {
      abytes(out, undefined, 'output');
      // `outputLen` is a library-owned readonly number; the negated comparison keeps failing fast
      // when it is missing/NaN (comparisons with undefined/NaN are false) without an anumber() call.
      const min = instance.outputLen;
      if (!(out.length >= min)) {
          throw new RangeError('"output" expected length >= ' + min);
      }
  }
  /**
   * Casts a typed array view to Uint32Array.
   * `arr.byteOffset` must already be 4-byte aligned or the platform
   * Uint32Array constructor will throw.
   * @param arr - source typed array
   * @returns Uint32Array view over the same buffer.
   * @example
   * Reinterpret a byte array as 32-bit words.
   * ```ts
   * u32(new Uint8Array(8));
   * ```
   */ function u32(arr) {
      return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  /**
   * Zeroizes typed arrays in place. Warning: JS provides no guarantees.
   * @param arrays - arrays to overwrite with zeros
   * @example
   * Zeroize sensitive buffers in place.
   * ```ts
   * clean(new Uint8Array([1, 2, 3]));
   * ```
   */ function clean(...arrays) {
      for(let i = 0; i < arrays.length; i++){
          arrays[i].fill(0);
      }
  }
  /**
   * Creates a DataView for byte-level manipulation.
   * @param arr - source typed array
   * @returns DataView over the same buffer region.
   * @example
   * Create a DataView over an existing buffer.
   * ```ts
   * createView(new Uint8Array(4));
   * ```
   */ function createView(arr) {
      return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  /**
   * Rotate-right operation for uint32 values.
   * @param word - source word
   * @param shift - shift amount in bits
   * @returns Rotated word.
   * @example
   * Rotate a 32-bit word to the right.
   * ```ts
   * rotr(0x12345678, 8);
   * ```
   */ function rotr(word, shift) {
      return word << 32 - shift | word >>> shift;
  }
  /**
   * Rotate-left operation for uint32 values.
   * @param word - source word
   * @param shift - shift amount in bits
   * @returns Rotated word.
   * @example
   * Rotate a 32-bit word to the left.
   * ```ts
   * rotl(0x12345678, 8);
   * ```
   */ function rotl(word, shift) {
      return word << shift | word >>> 32 - shift >>> 0;
  }
  /** Whether the current platform is little-endian. */ const isLE = /* @__PURE__ */ (()=>new Uint8Array(new Uint32Array([
          0x11223344
      ]).buffer)[0] === 0x44)();
  /**
   * Byte-swap operation for uint32 values.
   * @param word - source word
   * @returns Word with reversed byte order.
   * @example
   * Reverse the byte order of a 32-bit word.
   * ```ts
   * byteSwap(0x11223344);
   * ```
   */ function byteSwap(word) {
      return word << 24 & 0xff000000 | word << 8 & 0xff0000 | word >>> 8 & 0xff00 | word >>> 24 & 0xff;
  }
  /**
   * Byte-swaps every word of a Uint32Array in place.
   * @param arr - array to mutate
   * @returns The same array after mutation; callers pass live state arrays here.
   * @example
   * Reverse the byte order of every word in place.
   * ```ts
   * byteSwap32(new Uint32Array([0x11223344]));
   * ```
   */ function byteSwap32(arr) {
      for(let i = 0; i < arr.length; i++){
          arr[i] = byteSwap(arr[i]);
      }
      return arr;
  }
  /**
   * Conditionally byte-swaps a Uint32Array on big-endian platforms.
   * @param u - array to normalize for host endianness
   * @returns Original or byte-swapped array depending on platform endianness.
   *   On big-endian runtimes this mutates `u` in place via `byteSwap32(...)`.
   * @example
   * Normalize a word array for host endianness.
   * ```ts
   * swap32IfBE(new Uint32Array([0x11223344]));
   * ```
   */ const swap32IfBE = isLE ? (u)=>u : byteSwap32;
  /**
   * Merges default options and passed options.
   * @param defaults - base option object
   * @param opts - user overrides
   * @param title - label included in thrown override errors
   * @returns Fresh merged option object with a null prototype.
   * @throws On wrong argument types. {@link TypeError}
   * @example
   * Merge user overrides onto default options.
   * ```ts
   * checkOpts({ dkLen: 32 }, { asyncTick: 10 });
   * ```
   */ function checkOpts(defaults, opts, title = 'opts') {
      aopts(defaults, 'defaults');
      if (opts !== undefined) aopts(opts, title);
      // Callers read optional fields directly, so omitted values must not fall through to ambient
      // Object.prototype pollution (for example a forged `dkLen` changing SHAKE's default output).
      const merged = Object.assign(Object.create(null), defaults, opts);
      return merged;
  }
  /**
   * Creates a callable hash function from a stateful class constructor.
   * @param hashCons - hash constructor or factory
   * @param info - optional metadata such as DER OID
   * @returns Frozen callable hash wrapper with `.create()`.
   *   Wrapper construction eagerly calls `hashCons(undefined)` once to read
   *   `outputLen` / `blockLen`, so constructor side effects happen at module
   *   init time.
   * @throws On wrong argument types. {@link TypeError}
   * @example
   * Wrap a stateful hash constructor into a callable helper.
   * ```ts
   * import { createHasher } from '@noble/hashes/utils.js';
   * import { sha256 } from '@noble/hashes/sha2.js';
   * const wrapped = createHasher(sha256.create, { oid: sha256.oid });
   * wrapped(new Uint8Array([1]));
   * ```
   */ function createHasher(hashCons, info = {}) {
      if (typeof hashCons !== 'function') throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
      info = checkOpts({}, info, 'info');
      const hashC = (msg, opts)=>hashCons(opts).update(msg).digest();
      const tmp = hashCons(undefined);
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.canXOF = tmp.canXOF;
      hashC.create = (opts)=>hashCons(opts);
      Object.assign(hashC, info);
      return Object.freeze(hashC);
  }
  /**
   * Creates OID metadata for NIST hashes with prefix `06 09 60 86 48 01 65 03 04 02`.
   * @param suffix - final OID byte for the selected hash.
   *   The helper accepts any byte even though only the documented NIST hash
   *   suffixes are meaningful downstream.
   * @returns Object containing the DER-encoded OID.
   * @example
   * Build OID metadata for a NIST hash.
   * ```ts
   * oidNist(0x01);
   * ```
   */ const oidNist = (suffix)=>({
          // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
          // Larger suffix values would need base-128 OID encoding and a different length byte.
          oid: Uint8Array.from([
              0x06,
              0x09,
              0x60,
              0x86,
              0x48,
              0x01,
              0x65,
              0x03,
              0x04,
              0x02,
              suffix
          ])
      });

  /**
   * Internal class for HMAC.
   * Accepts any byte key, although RFC 2104 §3 recommends keys at least
   * `HashLen` bytes long.
   */ class _HMAC {
      update(buf) {
          aexists(this);
          this.iHash.update(buf);
          return this;
      }
      digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          const buf = out.subarray(0, this.outputLen);
          // Reuse the first outputLen bytes for the inner digest; the outer hash consumes them before
          // overwriting that same prefix with the final tag, leaving any oversized tail untouched.
          this.iHash.digestInto(buf);
          this.oHash.update(buf);
          this.oHash.digestInto(buf);
          this.destroy();
      }
      digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
      }
      _cloneInto(to) {
          // Create new instance without calling constructor since the key
          // is already in state and we don't know it.
          to || (to = Object.create(Object.getPrototypeOf(this), {}));
          const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.canXOF = canXOF;
          to.oHash = oHash._cloneInto(to.oHash);
          to.iHash = iHash._cloneInto(to.iHash);
          return to;
      }
      clone() {
          return this._cloneInto();
      }
      destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
      }
      constructor(hash, key){
          this.canXOF = false;
          this.finished = false;
          this.destroyed = false;
          ahash(hash);
          abytes(key, undefined, 'key');
          this.iHash = hash.create();
          if (typeof this.iHash.update !== 'function') throw new Error('expected Hash instance');
          this.blockLen = this.iHash.blockLen;
          this.outputLen = this.iHash.outputLen;
          const blockLen = this.blockLen;
          const pad = new Uint8Array(blockLen);
          // blockLen can be bigger than outputLen
          pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
          for(let i = 0; i < pad.length; i++)pad[i] ^= 0x36;
          this.iHash.update(pad);
          // By doing update (processing of the first block) of the outer hash here,
          // we can re-use it between multiple calls via clone.
          this.oHash = hash.create();
          // Undo internal XOR && apply outer XOR
          for(let i = 0; i < pad.length; i++)pad[i] ^= 0x36 ^ 0x5c;
          this.oHash.update(pad);
          clean(pad);
      }
  }
  const hmac = /* @__PURE__ */ (()=>{
      const hmac_ = (hash, key, message)=>new _HMAC(hash, key).update(message).digest();
      hmac_.create = (hash, key)=>new _HMAC(hash, key);
      return hmac_;
  })();

  const U32_MASK64 = /* @__PURE__ */ (()=>BigInt(2 ** 32 - 1))();
  const _32n = /* @__PURE__ */ BigInt(32);
  // Split bigint into two 32-bit halves. With `le=true`, returned fields become `{ h: low, l: high
  // }` to match little-endian word order rather than the property names.
  function fromBig(n, le = false) {
      if (le) return {
          h: Number(n & U32_MASK64),
          l: Number(n >> _32n & U32_MASK64)
      };
      return {
          h: Number(n >> _32n & U32_MASK64) | 0,
          l: Number(n & U32_MASK64) | 0
      };
  }
  // Split bigint list into `[highWords, lowWords]` when `le=false`; with `le=true`, the first array
  // holds the low halves because `fromBig(...)` swaps the semantic meaning of `h` and `l`.
  function split(lst, le = false) {
      const len = lst.length;
      let Ah = new Uint32Array(len);
      let Al = new Uint32Array(len);
      for(let i = 0; i < len; i++){
          const { h, l } = fromBig(lst[i], le);
          [Ah[i], Al[i]] = [
              h,
              l
          ];
      }
      return [
          Ah,
          Al
      ];
  }
  // Split a JS number into u32 halves without a BigInt allocation. Exact only for integers
  // `0 <= n < 2**53`; callers use it on byte / bit counters, which JS length math caps far below
  // that (an ArrayBuffer cannot exceed 2**53 - 1 bytes).
  const fromNumH = (n)=>n / 2 ** 32 | 0;
  const fromNumL = (n)=>n >>> 0;
  // Drop-in replacement for `view.setBigUint64(byteOffset, BigInt(n), isLE)` without the per-call
  // BigInt allocation. Same `n < 2**53` precondition as `fromNumH`/`fromNumL`.
  function setU64FromNum(view, byteOffset, n, isLE) {
      const h = fromNumH(n);
      const l = fromNumL(n);
      view.setUint32(byteOffset, isLE ? l : h, isLE);
      view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
  }
  // High 32-bit half of a 64-bit logical right shift for `s` in `0..31`.
  const shrSH = (h, _l, s)=>h >>> s;
  // Low 32-bit half of a 64-bit logical right shift, valid for `s` in `1..31`.
  const shrSL = (h, l, s)=>h << 32 - s | l >>> s;
  // High 32-bit half of a 64-bit right rotate, valid for `s` in `1..31`.
  const rotrSH = (h, l, s)=>h >>> s | l << 32 - s;
  // Low 32-bit half of a 64-bit right rotate, valid for `s` in `1..31`.
  const rotrSL = (h, l, s)=>h << 32 - s | l >>> s;
  // High 32-bit half of a 64-bit right rotate, valid for `s` in `33..63`; `32` uses `rotr32*`.
  const rotrBH = (h, l, s)=>h << 64 - s | l >>> s - 32;
  // Low 32-bit half of a 64-bit right rotate, valid for `s` in `33..63`; `32` uses `rotr32*`.
  const rotrBL = (h, l, s)=>h >>> s - 32 | l << 64 - s;
  // 64-bit left rotates (rotl*) are not defined here: sha3.ts, their only consumer, keeps
  // local copies so V8 inlines them into keccakP.
  // Add two split 64-bit words and return the split `{ h, l }` sum.
  // JS uses 32-bit signed integers for bitwise operations, so we cannot simply shift the carry out
  // of the low sum and instead use division.
  function add(Ah, Al, Bh, Bl) {
      const l = (Al >>> 0) + (Bl >>> 0);
      return {
          h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
          l: l | 0
      };
  }
  // Addition with more than 2 elements
  // Unmasked low-word accumulator for 3-way addition; pass the raw result into `add3H(...)`.
  const add3L = (Al, Bl, Cl)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  // High-word finalize step for 3-way addition; `low` must be the untruncated output of `add3L(...)`.
  const add3H = (low, Ah, Bh, Ch)=>Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
  // Unmasked low-word accumulator for 4-way addition; pass the raw result into `add4H(...)`.
  const add4L = (Al, Bl, Cl, Dl)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  // High-word finalize step for 4-way addition; `low` must be the untruncated output of `add4L(...)`.
  const add4H = (low, Ah, Bh, Ch, Dh)=>Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
  // Unmasked low-word accumulator for 5-way addition; pass the raw result into `add5H(...)`.
  const add5L = (Al, Bl, Cl, Dl, El)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  // High-word finalize step for 5-way addition; `low` must be the untruncated output of `add5L(...)`.
  const add5H = (low, Ah, Bh, Ch, Dh, Eh)=>Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

  /**
   * Shared 32-bit conditional boolean primitive reused by SHA-256, SHA-1, and MD5 `F`.
   * Returns bits from `b` when `a` is set, otherwise from `c`.
   * The XOR form is equivalent to MD5's `F(X,Y,Z) = XY v not(X)Z` because the masked terms never
   * set the same bit.
   * @param a - selector word
   * @param b - word chosen when selector bit is set
   * @param c - word chosen when selector bit is clear
   * @returns Mixed 32-bit word.
   * @example
   * Combine three words with the shared 32-bit choice primitive.
   * ```ts
   * Chi(0xffffffff, 0x12345678, 0x87654321);
   * ```
   */ function Chi(a, b, c) {
      return a & b ^ ~a & c;
  }
  /**
   * Shared 32-bit majority primitive reused by SHA-256 and SHA-1.
   * Returns bits shared by at least two inputs.
   * @param a - first input word
   * @param b - second input word
   * @param c - third input word
   * @returns Mixed 32-bit word.
   * @example
   * Combine three words with the shared 32-bit majority primitive.
   * ```ts
   * Maj(0xffffffff, 0x12345678, 0x87654321);
   * ```
   */ function Maj(a, b, c) {
      return a & b ^ a & c ^ b & c;
  }
  /**
   * Merkle-Damgard hash construction base class.
   * Could be used to create MD5, RIPEMD, SHA1, SHA2.
   * Accepts only byte-aligned `Uint8Array` input, even when the underlying spec describes bit
   * strings with partial-byte tails.
   * @param blockLen - internal block size in bytes
   * @param outputLen - digest size in bytes
   * @param padOffset - trailing length field size in bytes
   * @param isLE - whether length and state words are encoded in little-endian
   * @example
   * Use a concrete subclass to get the shared Merkle-Damgard update/digest flow.
   * ```ts
   * import { _SHA1 } from '@noble/hashes/legacy.js';
   * const hash = new _SHA1();
   * hash.update(new Uint8Array([97, 98, 99]));
   * hash.digest();
   * ```
   */ class HashMD {
      update(data) {
          aexists(this);
          abytes(data);
          const { view, buffer, blockLen } = this;
          const len = data.length;
          let processed = false;
          for(let pos = 0; pos < len;){
              const take = Math.min(blockLen - this.pos, len - pos);
              // Fast path only when there is no buffered partial block: `take === blockLen` implies
              // `this.pos === 0`, so we can process full blocks directly from the input view.
              if (take === blockLen) {
                  const dataView = createView(data);
                  for(; blockLen <= len - pos; pos += blockLen)this.process(dataView, pos);
                  processed = true;
                  continue;
              }
              // When the whole input is buffered in one go (common for short messages), passing `data`
              // directly avoids allocating a subarray view.
              buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
              this.pos += take;
              pos += take;
              if (this.pos === blockLen) {
                  this.process(view, 0);
                  this.pos = 0;
                  processed = true;
              }
          }
          this.length += data.length;
          // Shared schedule buffers only pick up input-derived words inside process(); if everything
          // was buffered without processing, there is nothing to zero.
          if (processed) this.roundClean();
          return this;
      }
      digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          // Padding
          // We can avoid allocation of buffer for padding completely if it
          // was previously not allocated here. But it won't change performance.
          const { buffer, view, blockLen, isLE } = this;
          let { pos } = this;
          // append the bit '1' to the message, then zero-pad the rest of the block
          buffer[pos++] = 0b10000000;
          buffer.fill(0, pos);
          // we have less than padOffset left in buffer, so we cannot put length in
          // current block, need process it and pad again
          if (this.padOffset > blockLen - pos) {
              this.process(view, 0);
              buffer.fill(0);
          }
          // `padOffset` reserves the whole length field. For SHA-384/512 the high 64 bits stay zero from
          // the padding fill above, and JS will overflow before user input can make that half non-zero.
          // So we only need to write the low 64 bits here (`length * 8` only scales the exponent of an
          // integer below 2**53, so the split inside the helper stays exact).
          setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
          this.process(view, 0);
          // The final block above is processed outside update(), so the shared message-schedule
          // buffers (e.g. SHA256_W) would otherwise retain input-derived words after digest().
          this.roundClean();
          // digest() passes our own `buffer` as `out`; reuse its cached view instead of allocating one.
          const oview = out === buffer ? view : createView(out);
          const len = this.outputLen;
          // NOTE: we do division by 4 later, which must be fused in single op with modulo by JIT
          const outLen = len / 4;
          const state = this.get();
          // Subclass-misconfiguration invariant: outputLen must be 32-bit aligned and fit the state.
          if (len % 4 || outLen > state.length) throw new Error('invalid outputLen');
          for(let i = 0; i < outLen; i++)oview.setUint32(4 * i, state[i], isLE);
      }
      digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          // Copy before destroy(): subclasses wipe `buffer` during cleanup, but `digest()` must return
          // fresh bytes to the caller.
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
      }
      _cloneIntoMeta(to) {
          const { buffer, length, finished, destroyed, pos } = this;
          to.destroyed = destroyed;
          to.finished = finished;
          to.length = length;
          to.pos = pos;
          // Only partial-block bytes need copying: when `length % blockLen === 0`, `pos === 0` and
          // later `update()` / `digestInto()` overwrite `to.buffer` from the start before reading it.
          if (pos) to.buffer.set(buffer); // Avoid a hot modulo guard.
          return to;
      }
      clone() {
          return this._cloneInto();
      }
      constructor(blockLen, outputLen, padOffset, isLE){
          this.canXOF = false;
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE;
          this.buffer = new Uint8Array(blockLen);
          this.view = createView(this.buffer);
      }
  }
  /**
   * Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
   * Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
   */ /** Initial SHA256 state from RFC 6234 §6.1: the first 32 bits of the fractional parts of the
   * square roots of the first eight prime numbers. Exported as a shared table; callers must treat
   * it as read-only because constructors copy words from it by index. */ const SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      0x6a09e667,
      0xbb67ae85,
      0x3c6ef372,
      0xa54ff53a,
      0x510e527f,
      0x9b05688c,
      0x1f83d9ab,
      0x5be0cd19
  ]);
  /** Initial SHA224 state `H(0)` from RFC 6234 §6.1. Exported as a shared table; callers must
   * treat it as read-only because constructors copy words from it by index. */ const SHA224_IV = /* @__PURE__ */ Uint32Array.from([
      0xc1059ed8,
      0x367cd507,
      0x3070dd17,
      0xf70e5939,
      0xffc00b31,
      0x68581511,
      0x64f98fa7,
      0xbefa4fa4
  ]);
  /** Initial SHA384 state from RFC 6234 §6.3: eight RFC 64-bit `H(0)` words stored as sixteen
   * big-endian 32-bit halves. Derived from the fractional parts of the square roots of the ninth
   * through sixteenth prime numbers. Exported as a shared table; callers must treat it as read-only
   * because constructors copy halves from it by index. */ const SHA384_IV = /* @__PURE__ */ Uint32Array.from([
      0xcbbb9d5d,
      0xc1059ed8,
      0x629a292a,
      0x367cd507,
      0x9159015a,
      0x3070dd17,
      0x152fecd8,
      0xf70e5939,
      0x67332667,
      0xffc00b31,
      0x8eb44a87,
      0x68581511,
      0xdb0c2e0d,
      0x64f98fa7,
      0x47b5481d,
      0xbefa4fa4
  ]);
  /** Initial SHA512 state from RFC 6234 §6.3: eight RFC 64-bit `H(0)` words stored as sixteen
   * big-endian 32-bit halves. Derived from the fractional parts of the square roots of the first
   * eight prime numbers. Exported as a shared table; callers must treat it as read-only because
   * constructors copy halves from it by index. */ const SHA512_IV = /* @__PURE__ */ Uint32Array.from([
      0x6a09e667,
      0xf3bcc908,
      0xbb67ae85,
      0x84caa73b,
      0x3c6ef372,
      0xfe94f82b,
      0xa54ff53a,
      0x5f1d36f1,
      0x510e527f,
      0xade682d1,
      0x9b05688c,
      0x2b3e6c1f,
      0x1f83d9ab,
      0xfb41bd6b,
      0x5be0cd19,
      0x137e2179
  ]);

  /** Initial SHA-1 state from RFC 3174 §6.1. */ const SHA1_IV = /* @__PURE__ */ Uint32Array.from([
      0x67452301,
      0xefcdab89,
      0x98badcfe,
      0x10325476,
      0xc3d2e1f0
  ]);
  // Reusable 80-word SHA-1 message schedule buffer.
  const SHA1_W = /* @__PURE__ */ new Uint32Array(80);
  /** Internal SHA1 legacy hash class. */ class _SHA1 extends HashMD {
      get() {
          const { A, B, C, D, E } = this;
          return [
              A,
              B,
              C,
              D,
              E
          ];
      }
      set(A, B, C, D, E) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
      }
      _cloneInto(to) {
          (to || (to = new this.constructor())).set(...this.get());
          return this._cloneIntoMeta(to);
      }
      process(view, offset) {
          for(let i = 0; i < 16; i++, offset += 4)SHA1_W[i] = view.getUint32(offset, false);
          for(let i = 16; i < 80; i++)SHA1_W[i] = rotl(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
          // Compression function main loop, 80 rounds
          let { A, B, C, D, E } = this;
          for(let i = 0; i < 80; i++){
              let F, K;
              if (i < 20) {
                  F = Chi(B, C, D);
                  K = 0x5a827999;
              } else if (i < 40) {
                  F = B ^ C ^ D;
                  K = 0x6ed9eba1;
              } else if (i < 60) {
                  F = Maj(B, C, D);
                  K = 0x8f1bbcdc;
              } else {
                  F = B ^ C ^ D;
                  K = 0xca62c1d6;
              }
              const T = rotl(A, 5) + F + E + K + SHA1_W[i] | 0;
              E = D;
              D = C;
              C = rotl(B, 30);
              B = A;
              A = T;
          }
          // Add the compressed chunk to the current hash value
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          E = E + this.E | 0;
          this.set(A, B, C, D, E);
      }
      roundClean() {
          clean(SHA1_W);
      }
      destroy() {
          // HashMD callers route post-destroy usability through `destroyed`; zeroizing alone still leaves
          // update()/digest() callable on reused instances.
          this.destroyed = true;
          this.set(0, 0, 0, 0, 0);
          clean(this.buffer);
      }
      constructor(){
          super(64, 20, 8, false), this.A = SHA1_IV[0] | 0, this.B = SHA1_IV[1] | 0, this.C = SHA1_IV[2] | 0, this.D = SHA1_IV[3] | 0, this.E = SHA1_IV[4] | 0;
      }
  }
  /**
   * SHA1 (RFC 3174) legacy hash function. It was cryptographically broken.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA1.
   * ```ts
   * sha1(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha1 = /* @__PURE__ */ createHasher(()=>new _SHA1());

  /**
   * SHA-224 / SHA-256 round constants from RFC 6234 §5.1: the first 32 bits
   * of the cube roots of the first 64 primes (2..311).
   */ // prettier-ignore
  const SHA256_K = /* @__PURE__ */ Uint32Array.from([
      0x428a2f98,
      0x71374491,
      0xb5c0fbcf,
      0xe9b5dba5,
      0x3956c25b,
      0x59f111f1,
      0x923f82a4,
      0xab1c5ed5,
      0xd807aa98,
      0x12835b01,
      0x243185be,
      0x550c7dc3,
      0x72be5d74,
      0x80deb1fe,
      0x9bdc06a7,
      0xc19bf174,
      0xe49b69c1,
      0xefbe4786,
      0x0fc19dc6,
      0x240ca1cc,
      0x2de92c6f,
      0x4a7484aa,
      0x5cb0a9dc,
      0x76f988da,
      0x983e5152,
      0xa831c66d,
      0xb00327c8,
      0xbf597fc7,
      0xc6e00bf3,
      0xd5a79147,
      0x06ca6351,
      0x14292967,
      0x27b70a85,
      0x2e1b2138,
      0x4d2c6dfc,
      0x53380d13,
      0x650a7354,
      0x766a0abb,
      0x81c2c92e,
      0x92722c85,
      0xa2bfe8a1,
      0xa81a664b,
      0xc24b8b70,
      0xc76c51a3,
      0xd192e819,
      0xd6990624,
      0xf40e3585,
      0x106aa070,
      0x19a4c116,
      0x1e376c08,
      0x2748774c,
      0x34b0bcb5,
      0x391c0cb3,
      0x4ed8aa4a,
      0x5b9cca4f,
      0x682e6ff3,
      0x748f82ee,
      0x78a5636f,
      0x84c87814,
      0x8cc70208,
      0x90befffa,
      0xa4506ceb,
      0xbef9a3f7,
      0xc67178f2
  ]);
  /** Reusable SHA-224 / SHA-256 message schedule buffer `W_t` from RFC 6234 §6.2 step 1. */ const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  /** Internal SHA-224 / SHA-256 compression engine from RFC 6234 §6.2. */ class SHA2_32B extends HashMD {
      get() {
          const { A, B, C, D, E, F, G, H } = this;
          return [
              A,
              B,
              C,
              D,
              E,
              F,
              G,
              H
          ];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
          this.F = F | 0;
          this.G = G | 0;
          this.H = H | 0;
      }
      _cloneInto(to) {
          (to || (to = new this.constructor())).set(...this.get());
          return this._cloneIntoMeta(to);
      }
      process(view, offset) {
          // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
          for(let i = 0; i < 16; i++, offset += 4)SHA256_W[i] = view.getUint32(offset, false);
          for(let i = 16; i < 64; i++){
              const W15 = SHA256_W[i - 15];
              const W2 = SHA256_W[i - 2];
              const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
              const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
              SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
          }
          // Compression function main loop, 64 rounds
          let { A, B, C, D, E, F, G, H } = this;
          for(let i = 0; i < 64; i++){
              const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
              const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
              const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
              const T2 = sigma0 + Maj(A, B, C) | 0;
              H = G;
              G = F;
              F = E;
              E = D + T1 | 0;
              D = C;
              C = B;
              B = A;
              A = T1 + T2 | 0;
          }
          // Add the compressed chunk to the current hash value
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          E = E + this.E | 0;
          F = F + this.F | 0;
          G = G + this.G | 0;
          H = H + this.H | 0;
          this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
          clean(SHA256_W);
      }
      destroy() {
          // HashMD callers route post-destroy usability through `destroyed`; zeroizing alone still leaves
          // update()/digest() callable on reused instances.
          this.destroyed = true;
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          clean(this.buffer);
      }
      constructor(outputLen, IV){
          super(64, outputLen, 8, false), // We cannot use array here since array allows indexing by variable
          // which means optimizer/compiler cannot use registers.
          // Numeric initializers matter: starting the fields as `undefined` changes
          // V8's field representation and makes sha256 3x slower (measured).
          this.A = 0, this.B = 0, this.C = 0, this.D = 0, this.E = 0, this.F = 0, this.G = 0, this.H = 0;
          this.A = IV[0] | 0;
          this.B = IV[1] | 0;
          this.C = IV[2] | 0;
          this.D = IV[3] | 0;
          this.E = IV[4] | 0;
          this.F = IV[5] | 0;
          this.G = IV[6] | 0;
          this.H = IV[7] | 0;
      }
  }
  /** Internal SHA-256 hash class grounded in RFC 6234 §6.2. */ class _SHA256 extends SHA2_32B {
      constructor(){
          super(32, SHA256_IV);
      }
  }
  /** Internal SHA-224 hash class grounded in RFC 6234 §6.2 and §8.5. */ class _SHA224 extends SHA2_32B {
      constructor(){
          super(28, SHA224_IV);
      }
  }
  // SHA2-512 is slower than sha256 in js because u64 operations are slow.
  // SHA-384 / SHA-512 round constants from RFC 6234 §5.2:
  // 80 full 64-bit words split into high/low halves.
  // prettier-ignore
  const K512 = /* @__PURE__ */ (()=>split([
          '0x428a2f98d728ae22',
          '0x7137449123ef65cd',
          '0xb5c0fbcfec4d3b2f',
          '0xe9b5dba58189dbbc',
          '0x3956c25bf348b538',
          '0x59f111f1b605d019',
          '0x923f82a4af194f9b',
          '0xab1c5ed5da6d8118',
          '0xd807aa98a3030242',
          '0x12835b0145706fbe',
          '0x243185be4ee4b28c',
          '0x550c7dc3d5ffb4e2',
          '0x72be5d74f27b896f',
          '0x80deb1fe3b1696b1',
          '0x9bdc06a725c71235',
          '0xc19bf174cf692694',
          '0xe49b69c19ef14ad2',
          '0xefbe4786384f25e3',
          '0x0fc19dc68b8cd5b5',
          '0x240ca1cc77ac9c65',
          '0x2de92c6f592b0275',
          '0x4a7484aa6ea6e483',
          '0x5cb0a9dcbd41fbd4',
          '0x76f988da831153b5',
          '0x983e5152ee66dfab',
          '0xa831c66d2db43210',
          '0xb00327c898fb213f',
          '0xbf597fc7beef0ee4',
          '0xc6e00bf33da88fc2',
          '0xd5a79147930aa725',
          '0x06ca6351e003826f',
          '0x142929670a0e6e70',
          '0x27b70a8546d22ffc',
          '0x2e1b21385c26c926',
          '0x4d2c6dfc5ac42aed',
          '0x53380d139d95b3df',
          '0x650a73548baf63de',
          '0x766a0abb3c77b2a8',
          '0x81c2c92e47edaee6',
          '0x92722c851482353b',
          '0xa2bfe8a14cf10364',
          '0xa81a664bbc423001',
          '0xc24b8b70d0f89791',
          '0xc76c51a30654be30',
          '0xd192e819d6ef5218',
          '0xd69906245565a910',
          '0xf40e35855771202a',
          '0x106aa07032bbd1b8',
          '0x19a4c116b8d2d0c8',
          '0x1e376c085141ab53',
          '0x2748774cdf8eeb99',
          '0x34b0bcb5e19b48a8',
          '0x391c0cb3c5c95a63',
          '0x4ed8aa4ae3418acb',
          '0x5b9cca4f7763e373',
          '0x682e6ff3d6b2b8a3',
          '0x748f82ee5defb2fc',
          '0x78a5636f43172f60',
          '0x84c87814a1f0ab72',
          '0x8cc702081a6439ec',
          '0x90befffa23631e28',
          '0xa4506cebde82bde9',
          '0xbef9a3f7b2c67915',
          '0xc67178f2e372532b',
          '0xca273eceea26619c',
          '0xd186b8c721c0c207',
          '0xeada7dd6cde0eb1e',
          '0xf57d4f7fee6ed178',
          '0x06f067aa72176fba',
          '0x0a637dc5a2c898a6',
          '0x113f9804bef90dae',
          '0x1b710b35131c471b',
          '0x28db77f523047d84',
          '0x32caab7b40c72493',
          '0x3c9ebe0a15c9bebc',
          '0x431d67c49c100d4c',
          '0x4cc5d4becb3e42b6',
          '0x597f299cfc657e2a',
          '0x5fcb6fab3ad6faec',
          '0x6c44198c4a475817'
      ].map((n)=>BigInt(n))))();
  const SHA512_Kh = /* @__PURE__ */ (()=>K512[0])();
  const SHA512_Kl = /* @__PURE__ */ (()=>K512[1])();
  // Reusable high-half schedule buffer for the RFC 6234 §6.4 64-bit `W_t` words.
  const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
  // Reusable low-half schedule buffer for the RFC 6234 §6.4 64-bit `W_t` words.
  const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
  /** Internal SHA-384 / SHA-512 compression engine from RFC 6234 §6.4. */ class SHA2_64B extends HashMD {
      // prettier-ignore
      get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [
              Ah,
              Al,
              Bh,
              Bl,
              Ch,
              Cl,
              Dh,
              Dl,
              Eh,
              El,
              Fh,
              Fl,
              Gh,
              Gl,
              Hh,
              Hl
          ];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
      }
      _cloneInto(to) {
          (to || (to = new this.constructor())).set(...this.get());
          return this._cloneIntoMeta(to);
      }
      process(view, offset) {
          // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
          for(let i = 0; i < 16; i++, offset += 4){
              SHA512_W_H[i] = view.getUint32(offset);
              SHA512_W_L[i] = view.getUint32(offset += 4);
          }
          for(let i = 16; i < 80; i++){
              // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
              const W15h = SHA512_W_H[i - 15] | 0;
              const W15l = SHA512_W_L[i - 15] | 0;
              const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
              const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
              // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
              const W2h = SHA512_W_H[i - 2] | 0;
              const W2l = SHA512_W_L[i - 2] | 0;
              const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
              const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
              // SHA512_W[i] = s0 + s1 + SHA512_W[i - 7] + SHA512_W[i - 16];
              const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
              const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
              SHA512_W_H[i] = SUMh | 0;
              SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          // Compression function main loop, 80 rounds
          for(let i = 0; i < 80; i++){
              // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
              const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
              const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
              //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
              const CHIh = Eh & Fh ^ ~Eh & Gh;
              const CHIl = El & Fl ^ ~El & Gl;
              // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
              // prettier-ignore
              const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
              const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
              const T1l = T1ll | 0;
              // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
              const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
              const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
              const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
              const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
              Hh = Gh | 0;
              Hl = Gl | 0;
              Gh = Fh | 0;
              Gl = Fl | 0;
              Fh = Eh | 0;
              Fl = El | 0;
              ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
              Dh = Ch | 0;
              Dl = Cl | 0;
              Ch = Bh | 0;
              Cl = Bl | 0;
              Bh = Ah | 0;
              Bl = Al | 0;
              const All = add3L(T1l, sigma0l, MAJl);
              Ah = add3H(All, T1h, sigma0h, MAJh);
              Al = All | 0;
          }
          // Add the compressed chunk to the current hash value
          ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
          clean(SHA512_W_H, SHA512_W_L);
      }
      destroy() {
          // HashMD callers route post-destroy usability through `destroyed`; zeroizing alone still leaves
          // update()/digest() callable on reused instances.
          this.destroyed = true;
          clean(this.buffer);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
      constructor(outputLen, IV){
          super(128, outputLen, 16, false), // We cannot use array here since array allows indexing by variable
          // which means optimizer/compiler cannot use registers.
          // h -- high 32 bits, l -- low 32 bits
          // Numeric initializers matter: starting the fields as `undefined` changes
          // V8's field representation and slows hashing down (measured on sha256).
          this.Ah = 0, this.Al = 0, this.Bh = 0, this.Bl = 0, this.Ch = 0, this.Cl = 0, this.Dh = 0, this.Dl = 0, this.Eh = 0, this.El = 0, this.Fh = 0, this.Fl = 0, this.Gh = 0, this.Gl = 0, this.Hh = 0, this.Hl = 0;
          this.Ah = IV[0] | 0;
          this.Al = IV[1] | 0;
          this.Bh = IV[2] | 0;
          this.Bl = IV[3] | 0;
          this.Ch = IV[4] | 0;
          this.Cl = IV[5] | 0;
          this.Dh = IV[6] | 0;
          this.Dl = IV[7] | 0;
          this.Eh = IV[8] | 0;
          this.El = IV[9] | 0;
          this.Fh = IV[10] | 0;
          this.Fl = IV[11] | 0;
          this.Gh = IV[12] | 0;
          this.Gl = IV[13] | 0;
          this.Hh = IV[14] | 0;
          this.Hl = IV[15] | 0;
      }
  }
  /** Internal SHA-512 hash class grounded in RFC 6234 §6.3 and §6.4. */ class _SHA512 extends SHA2_64B {
      constructor(){
          super(64, SHA512_IV);
      }
  }
  /** Internal SHA-384 hash class grounded in RFC 6234 §6.3 and §6.4. */ class _SHA384 extends SHA2_64B {
      constructor(){
          super(48, SHA384_IV);
      }
  }
  /**
   * SHA2-256 hash function from RFC 4634. In JS it's the fastest: even faster than Blake3. Some info:
   *
   * - Trying 2^128 hashes would get 50% chance of collision, using birthday attack.
   * - BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
   * - Each sha256 hash is executing 2^18 bit operations.
   * - Good 2024 ASICs can do 200Th/sec with 3500 watts of power, corresponding to 2^36 hashes/joule.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA2-256.
   * ```ts
   * sha256(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha256 = /* @__PURE__ */ createHasher(()=>new _SHA256(), /* @__PURE__ */ oidNist(0x01));
  /**
   * SHA2-224 hash function from RFC 4634.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA2-224.
   * ```ts
   * sha224(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha224 = /* @__PURE__ */ createHasher(()=>new _SHA224(), /* @__PURE__ */ oidNist(0x04));
  /**
   * SHA2-512 hash function from RFC 4634.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA2-512.
   * ```ts
   * sha512(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha512 = /* @__PURE__ */ createHasher(()=>new _SHA512(), /* @__PURE__ */ oidNist(0x03));
  /**
   * SHA2-384 hash function from RFC 4634.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA2-384.
   * ```ts
   * sha384(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha384 = /* @__PURE__ */ createHasher(()=>new _SHA384(), /* @__PURE__ */ oidNist(0x02));

  // No __PURE__ annotations in sha3 header:
  // EVERYTHING is in fact used on every export.
  // Various per round constants calculations
  const _0n = BigInt(0);
  const _1n = BigInt(1);
  const _2n = BigInt(2);
  const _7n = BigInt(7);
  const _256n = BigInt(256);
  // FIPS 202 Algorithm 5 rc(): when the outgoing bit is 1, the 8-bit LFSR xors
  // taps 0, 4, 5, and 6, which compresses to the feedback mask `0x71`.
  const _0x71n = BigInt(0x71);
  const SHA3_PI = [];
  const SHA3_ROTL = [];
  const _SHA3_IOTA = []; // no pure annotation: var is always used
  for(let round = 0, R = _1n, x = 1, y = 0; round < 24; round++){
      // Pi
      [x, y] = [
          y,
          (2 * x + 3 * y) % 5
      ];
      SHA3_PI.push(2 * (5 * y + x));
      // Rotational
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      // Iota
      let t = _0n;
      for(let j = 0; j < 7; j++){
          R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
          if (R & _2n) t ^= _1n << (_1n << BigInt(j)) - _1n;
      }
      _SHA3_IOTA.push(t);
  }
  const IOTAS = split(_SHA3_IOTA, true);
  // `split(..., true)` keeps the local little-endian lane-word layout used by
  // `state32`, so these `H` / `L` tables follow the file's first-word /
  // second-word lane slots rather than `_u64.ts`'s usual high/low naming.
  const SHA3_IOTA_H = IOTAS[0];
  const SHA3_IOTA_L = IOTAS[1];
  // 64-bit left rotates as u32 pairs. Inlined here (not imported from _u64) so V8 can
  // inline them into keccakP — the import path costs ~24% on sha3_256. SHA3 is the only
  // consumer of left-rotates; other hashes use right-rotates from _u64.
  // Valid for s in 1..31 (SH/SL) and 33..63 (BH/BL); keccak never rotates by 0/32/64.
  const rotlSH = (h, l, s)=>h << s | l >>> 32 - s;
  const rotlSL = (h, l, s)=>l << s | h >>> 32 - s;
  const rotlBH = (h, l, s)=>l << s - 32 | h >>> 64 - s;
  const rotlBL = (h, l, s)=>h << s - 32 | l >>> 64 - s;
  const rotlH = (h, l, s)=>s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
  const rotlL = (h, l, s)=>s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
  // Reused Theta scratch buffer (column parities), same pattern as SHA256_W in sha2.
  // keccakP never calls user code, so the shared buffer cannot be observed mid-permutation.
  const B = new Uint32Array(5 * 2);
  /**
   * `keccakf1600` internal permutation, additionally allows adjusting the round count.
   * @param s - 5x5 Keccak state encoded as 25 lanes split into 50 uint32 words
   *   in this file's local little-endian lane-word order
   * @param rounds - number of rounds to execute
   * @throws On wrong argument types. {@link TypeError}
   * @throws On wrong argument ranges or values. {@link RangeError}
   * @throws If `rounds` is outside the supported `1..24` range. {@link Error}
   * @example
   * Permute a Keccak state with the default 24 rounds.
   * ```ts
   * keccakP(new Uint32Array(50));
   * ```
   */ function keccakP(s, rounds = 24) {
      if (!(s instanceof Uint32Array)) throw new TypeError('"s" expected Uint32Array(50), got type=' + typeof s);
      if (s.length !== 50) throw new RangeError('"s" expected Uint32Array(50), got length=' + s.length);
      anumber(rounds, 'rounds');
      // This implementation precomputes only the standard Keccak-f[1600] 24-round Iota table.
      if (rounds < 1 || rounds > 24) throw new Error('"rounds" expected integer 1..24');
      // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
      for(let round = 24 - rounds; round < 24; round++){
          // Theta θ
          for(let x = 0; x < 10; x++)B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
          for(let x = 0; x < 10; x += 2){
              const idx1 = (x + 8) % 10;
              const idx0 = (x + 2) % 10;
              const B0 = B[idx0];
              const B1 = B[idx0 + 1];
              const Th = rotlH(B0, B1, 1) ^ B[idx1];
              const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
              for(let y = 0; y < 50; y += 10){
                  s[x + y] ^= Th;
                  s[x + y + 1] ^= Tl;
              }
          }
          // Rho (ρ) and Pi (π)
          let curH = s[2];
          let curL = s[3];
          for(let t = 0; t < 24; t++){
              const shift = SHA3_ROTL[t];
              const Th = rotlH(curH, curL, shift);
              const Tl = rotlL(curH, curL, shift);
              const PI = SHA3_PI[t];
              curH = s[PI];
              curL = s[PI + 1];
              s[PI] = Th;
              s[PI + 1] = Tl;
          }
          // Chi (χ)
          // Same as:
          // for (let x = 0; x < 10; x++) B[x] = s[y + x];
          // for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
          for(let y = 0; y < 50; y += 10){
              const b0 = s[y], b1 = s[y + 1], b2 = s[y + 2], b3 = s[y + 3];
              s[y] ^= ~s[y + 2] & s[y + 4];
              s[y + 1] ^= ~s[y + 3] & s[y + 5];
              s[y + 2] ^= ~s[y + 4] & s[y + 6];
              s[y + 3] ^= ~s[y + 5] & s[y + 7];
              s[y + 4] ^= ~s[y + 6] & s[y + 8];
              s[y + 5] ^= ~s[y + 7] & s[y + 9];
              s[y + 6] ^= ~s[y + 8] & b0;
              s[y + 7] ^= ~s[y + 9] & b1;
              s[y + 8] ^= ~b0 & b2;
              s[y + 9] ^= ~b1 & b3;
          }
          // Iota (ι)
          s[0] ^= SHA3_IOTA_H[round];
          s[1] ^= SHA3_IOTA_L[round];
      }
      clean(B);
  }
  /**
   * Keccak sponge function.
   * @param blockLen - absorb/squeeze rate in bytes
   * @param suffix - domain separation suffix byte
   * @param outputLen - default digest length in bytes. This base sponge only
   *   requires a non-negative integer; wrappers that need positive output
   *   lengths must enforce that themselves.
   * @param enableXOF - whether XOF output is allowed
   * @param rounds - number of Keccak-f rounds
   * @example
   * Build a sponge state, absorb bytes, then finalize a digest.
   * ```ts
   * const hash = new Keccak(136, 0x06, 32);
   * hash.update(new Uint8Array([1, 2, 3]));
   * hash.digest();
   * ```
   */ class Keccak {
      clone() {
          return this._cloneInto();
      }
      keccak() {
          swap32IfBE(this.state32);
          keccakP(this.state32, this.rounds);
          swap32IfBE(this.state32);
          this.posOut = 0;
          this.pos = 0;
      }
      update(data) {
          aexists(this);
          abytes(data);
          const { blockLen, state, state32 } = this;
          const len = data.length;
          // Absorb full blocks with u32 XORs when both sides are 4-byte aligned.
          // XOR of same-position words equals XOR of same-position bytes, so this is endianness-safe.
          const canUseU32 = blockLen % 4 === 0 && data.byteOffset % 4 === 0;
          const blockLen32 = blockLen / 4;
          const data32 = canUseU32 && len >= blockLen ? u32(data) : undefined;
          for(let pos = 0; pos < len;){
              if (data32 !== undefined && this.pos === 0 && pos % 4 === 0 && len - pos >= blockLen) {
                  for(let i = 0, o = pos / 4; i < blockLen32; i++)state32[i] ^= data32[o + i];
                  pos += blockLen;
                  // Subclasses (_KeccakPRG) read `this.pos` inside their `keccak()` override,
                  // so it must reflect the fully-absorbed block before the permutation fires.
                  this.pos = blockLen;
                  this.keccak();
                  continue;
              }
              const take = Math.min(blockLen - this.pos, len - pos);
              for(let i = 0; i < take; i++)state[this.pos++] ^= data[pos++];
              if (this.pos === blockLen) this.keccak();
          }
          return this;
      }
      finish() {
          if (this.finished) return;
          this.finished = true;
          const { state, suffix, pos, blockLen } = this;
          // FIPS 202 appends the SHA3/SHAKE domain-separation suffix before pad10*1.
          // These byte values already include the first padding bit, while the
          // final `0x80` below supplies the closing `1` bit in the last rate byte.
          state[pos] ^= suffix;
          // If that combined suffix lands in the last rate byte and already sets
          // bit 7, absorb it first so the final pad10*1 bit can be xored into a
          // fresh block.
          if ((suffix & 0x80) !== 0 && pos === blockLen - 1) this.keccak();
          state[blockLen - 1] ^= 0x80;
          this.keccak();
      }
      writeInto(out) {
          aexists(this, false);
          abytes(out);
          this.finish();
          const bufferOut = this.state;
          const { blockLen } = this;
          for(let pos = 0, len = out.length; pos < len;){
              if (this.posOut >= blockLen) this.keccak();
              const take = Math.min(blockLen - this.posOut, len - pos);
              out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
              this.posOut += take;
              pos += take;
          }
          return out;
      }
      xofInto(out) {
          // Plain SHA3/Keccak usage with XOF is probably a mistake, but this base
          // class is also reused by SHAKE/cSHAKE/KMAC/TupleHash/ParallelHash/
          // TurboSHAKE/KangarooTwelve wrappers that intentionally enable XOF.
          if (!this.enableXOF) throw new Error('XOF is not enabled');
          return this.writeInto(out);
      }
      xof(bytes) {
          anumber(bytes);
          return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
          aoutput(out, this);
          if (this.finished) throw new Error('digest() was already called');
          // `aoutput(...)` allows oversized buffers; digestInto() must fill only the advertised digest.
          this.writeInto(out.length === this.outputLen ? out : out.subarray(0, this.outputLen));
          this.destroy();
      }
      digest() {
          const out = new Uint8Array(this.outputLen);
          this.digestInto(out);
          return out;
      }
      destroy() {
          this.destroyed = true;
          clean(this.state);
      }
      _cloneInto(to) {
          const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
          to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
          // Reused destinations can come from a different rate/capacity variant, so clone must rewrite
          // the sponge geometry as well as the state words.
          to.blockLen = blockLen;
          to.state32.set(this.state32);
          // Sponge padding and XOF output are positional, so both offsets are part of the clone state.
          to.pos = this.pos;
          to.posOut = this.posOut;
          to.finished = this.finished;
          to.rounds = rounds;
          // Suffix can change in cSHAKE
          to.suffix = suffix;
          to.outputLen = outputLen;
          to.enableXOF = enableXOF;
          // Clones must preserve the public capability bit too; `_KMAC` reuses this path and deep clone
          // tests compare instance fields directly, so leaving `canXOF` behind makes the clone lie.
          to.canXOF = this.canXOF;
          to.destroyed = this.destroyed;
          return to;
      }
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24){
          this.pos = 0;
          this.posOut = 0;
          this.finished = false;
          this.destroyed = false;
          this.enableXOF = false;
          anumber(blockLen, 'blockLen');
          anumber(suffix, 'suffix');
          anumber(rounds, 'rounds');
          abool(enableXOF, 'enableXOF');
          this.blockLen = blockLen;
          this.suffix = suffix;
          this.outputLen = outputLen;
          this.enableXOF = enableXOF;
          this.canXOF = enableXOF;
          this.rounds = rounds;
          // Can be passed from user as dkLen
          anumber(outputLen, 'outputLen');
          // Only keccak-f1600 is supported: 1600 bits (5x5 matrix of 64bit) === 200 bytes of state.
          if (!(0 < blockLen && blockLen < 200)) throw new Error('"blockLen" must be 1..199');
          this.state = new Uint8Array(200);
          this.state32 = u32(this.state);
      }
  }
  const genKeccak = (suffix, blockLen, outputLen, info = {})=>createHasher(()=>new Keccak(blockLen, suffix, outputLen), info);
  /**
   * SHA3-224 hash function.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA3-224.
   * ```ts
   * sha3_224(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha3_224 = /* @__PURE__ */ genKeccak(0x06, 144, 28, /* @__PURE__ */ oidNist(0x07));
  /**
   * SHA3-256 hash function. Different from keccak-256.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA3-256.
   * ```ts
   * sha3_256(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha3_256 = /* @__PURE__ */ genKeccak(0x06, 136, 32, /* @__PURE__ */ oidNist(0x08));
  /**
   * SHA3-384 hash function.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA3-384.
   * ```ts
   * sha3_384(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha3_384 = /* @__PURE__ */ genKeccak(0x06, 104, 48, /* @__PURE__ */ oidNist(0x09));
  /**
   * SHA3-512 hash function.
   * @param msg - message bytes to hash
   * @param opts - Reserved hash options.
   * @returns Digest bytes.
   * @example
   * Hash a message with SHA3-512.
   * ```ts
   * sha3_512(new Uint8Array([97, 98, 99]));
   * ```
   */ const sha3_512 = /* @__PURE__ */ genKeccak(0x06, 72, 64, /* @__PURE__ */ oidNist(0x0a));

  /**
   * "globalThis" ponyfill.
   * @see [A horrifying globalThis polyfill in universal JavaScript](https://mathiasbynens.be/notes/globalthis)
   * @type {Object.<string, *>}
   */ const globalScope = (()=>{
      if (typeof globalThis === "object") return globalThis;
      else {
          Object.defineProperty(Object.prototype, "__GLOBALTHIS__", {
              get () {
                  return this;
              },
              configurable: true
          });
          try {
              // @ts-expect-error
              // eslint-disable-next-line no-undef
              if (typeof __GLOBALTHIS__ !== "undefined") return __GLOBALTHIS__;
          } finally{
              // @ts-expect-error
              delete Object.prototype.__GLOBALTHIS__;
          }
      }
      // Still unable to determine "globalThis", fall back to a naive method.
      if (typeof self !== "undefined") return self;
      else if (typeof window !== "undefined") return window;
      else if (typeof global !== "undefined") return global;
      return undefined;
  })();

  /**
   * @noble/hashes hash functions.
   * @type {Object.<string, sha1|sha224|sha256|sha384|sha512|sha3_224|sha3_256|sha3_384|sha3_512>}
   */ const nobleHashes = {
      SHA1: sha1,
      SHA224: sha224,
      SHA256: sha256,
      SHA384: sha384,
      SHA512: sha512,
      "SHA3-224": sha3_224,
      "SHA3-256": sha3_256,
      "SHA3-384": sha3_384,
      "SHA3-512": sha3_512
  };
  /**
   * Canonicalizes a hash algorithm name.
   * @param {string} algorithm Hash algorithm name.
   * @returns {"SHA1"|"SHA224"|"SHA256"|"SHA384"|"SHA512"|"SHA3-224"|"SHA3-256"|"SHA3-384"|"SHA3-512"} Canonicalized hash algorithm name.
   */ const canonicalizeAlgorithm = (algorithm)=>{
      switch(true){
          case /^(?:SHA-?1|SSL3-SHA1)$/i.test(algorithm):
              return "SHA1";
          case /^SHA(?:2?-)?224$/i.test(algorithm):
              return "SHA224";
          case /^SHA(?:2?-)?256$/i.test(algorithm):
              return "SHA256";
          case /^SHA(?:2?-)?384$/i.test(algorithm):
              return "SHA384";
          case /^SHA(?:2?-)?512$/i.test(algorithm):
              return "SHA512";
          case /^SHA3-224$/i.test(algorithm):
              return "SHA3-224";
          case /^SHA3-256$/i.test(algorithm):
              return "SHA3-256";
          case /^SHA3-384$/i.test(algorithm):
              return "SHA3-384";
          case /^SHA3-512$/i.test(algorithm):
              return "SHA3-512";
          default:
              throw new TypeError(`Unknown hash algorithm: ${algorithm}`);
      }
  };
  /**
   * Calculates an HMAC digest.
   * @param {string} algorithm Algorithm.
   * @param {Uint8Array} key Key.
   * @param {Uint8Array} message Message.
   * @returns {Uint8Array} Digest.
   */ const hmacDigest = (algorithm, key, message)=>{
      if (hmac) {
          const hash = nobleHashes[algorithm] ?? nobleHashes[canonicalizeAlgorithm(algorithm)];
          return hmac(hash, key, message);
      } else {
          throw new Error("Missing HMAC function");
      }
  };

  /**
   * RFC 4648 base32 alphabet without pad.
   * @type {string}
   */ const ALPHABET$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  /**
   * Converts a base32 string to an Uint8Array (RFC 4648).
   * @see [LinusU/base32-decode](https://github.com/LinusU/base32-decode)
   * @param {string} str Base32 string.
   * @returns {Uint8Array} Uint8Array.
   */ const base32Decode = (str)=>{
      // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
      str = str.replace(/ /g, "").toUpperCase();
      // Remove padding if it exists.
      let end = str.length;
      while(str[end - 1] === "=")--end;
      if (end < str.length) str = str.substring(0, end);
      const buf = new ArrayBuffer(str.length * 5 / 8 | 0);
      const arr = new Uint8Array(buf);
      let bits = 0;
      let value = 0;
      let index = 0;
      for(let i = 0; i < str.length; i++){
          const idx = ALPHABET$1.indexOf(str[i]);
          if (idx === -1) throw new TypeError(`Invalid character found: ${str[i]}`);
          value = value << 5 | idx;
          bits += 5;
          if (bits >= 8) {
              bits -= 8;
              arr[index++] = value >>> bits;
          }
      }
      return arr;
  };
  /**
   * Converts an Uint8Array to a base32 string (RFC 4648).
   * @see [LinusU/base32-encode](https://github.com/LinusU/base32-encode)
   * @param {Uint8Array} arr Uint8Array.
   * @returns {string} Base32 string.
   */ const base32Encode = (arr)=>{
      let bits = 0;
      let value = 0;
      let str = "";
      for(let i = 0; i < arr.length; i++){
          value = value << 8 | arr[i];
          bits += 8;
          while(bits >= 5){
              str += ALPHABET$1[value >>> bits - 5 & 31];
              bits -= 5;
          }
      }
      if (bits > 0) {
          str += ALPHABET$1[value << 5 - bits & 31];
      }
      return str;
  };

  /**
   * Hexadecimal alphabet.
   * @type {string}
   */ const ALPHABET = "0123456789ABCDEF";
  /**
   * Converts a hexadecimal string to an Uint8Array.
   * @param {string} str Hexadecimal string.
   * @returns {Uint8Array} Uint8Array.
   */ const hexDecode = (str)=>{
      // Remove spaces (although they are not allowed by the spec, some issuers add them for readability).
      str = str.replace(/ /g, "").toUpperCase();
      const buf = new ArrayBuffer(str.length / 2);
      const arr = new Uint8Array(buf);
      for(let i = 0; i < str.length; i += 2){
          const hi = ALPHABET.indexOf(str[i]);
          const lo = ALPHABET.indexOf(str[i + 1]);
          if (hi === -1 || lo === -1) throw new TypeError(`Invalid character found: ${str.substring(i, i + 2)}`);
          arr[i / 2] = hi << 4 | lo;
      }
      return arr;
  };
  /**
   * Converts an Uint8Array to a hexadecimal string.
   * @param {Uint8Array} arr Uint8Array.
   * @returns {string} Hexadecimal string.
   */ const hexEncode = (arr)=>{
      let str = "";
      for(let i = 0; i < arr.length; i++){
          const hex = arr[i].toString(16);
          if (hex.length === 1) str += "0";
          str += hex;
      }
      return str.toUpperCase();
  };

  /**
   * Converts a Latin-1 string to an Uint8Array.
   * @param {string} str Latin-1 string.
   * @returns {Uint8Array} Uint8Array.
   */ const latin1Decode = (str)=>{
      const buf = new ArrayBuffer(str.length);
      const arr = new Uint8Array(buf);
      for(let i = 0; i < str.length; i++){
          arr[i] = str.charCodeAt(i) & 0xff;
      }
      return arr;
  };
  /**
   * Converts an Uint8Array to a Latin-1 string.
   * @param {Uint8Array} arr Uint8Array.
   * @returns {string} Latin-1 string.
   */ const latin1Encode = (arr)=>{
      let str = "";
      for(let i = 0; i < arr.length; i++){
          str += String.fromCharCode(arr[i]);
      }
      return str;
  };

  /**
   * TextEncoder instance.
   * @type {TextEncoder|null}
   */ const ENCODER = globalScope.TextEncoder ? new globalScope.TextEncoder() : null;
  /**
   * TextDecoder instance.
   * @type {TextDecoder|null}
   */ const DECODER = globalScope.TextDecoder ? new globalScope.TextDecoder() : null;
  /**
   * Converts an UTF-8 string to an Uint8Array.
   * @param {string} str String.
   * @returns {Uint8Array} Uint8Array.
   */ const utf8Decode = (str)=>{
      if (!ENCODER) {
          throw new Error("Encoding API not available");
      }
      return ENCODER.encode(str);
  };
  /**
   * Converts an Uint8Array to an UTF-8 string.
   * @param {Uint8Array} arr Uint8Array.
   * @returns {string} String.
   */ const utf8Encode = (arr)=>{
      if (!DECODER) {
          throw new Error("Encoding API not available");
      }
      return DECODER.decode(arr);
  };

  /**
   * Returns random bytes.
   * @param {number} size Size.
   * @returns {Uint8Array} Random bytes.
   */ const randomBytes = (size)=>{
      if (globalScope.crypto?.getRandomValues) {
          return globalScope.crypto.getRandomValues(new Uint8Array(size));
      } else {
          throw new Error("Cryptography API not available");
      }
  };

  /**
   * OTP secret key.
   */ class Secret {
      /**
     * Converts a Latin-1 string to a Secret object.
     * @param {string} str Latin-1 string.
     * @returns {Secret} Secret object.
     */ static fromLatin1(str) {
          return new Secret({
              buffer: latin1Decode(str).buffer
          });
      }
      /**
     * Converts an UTF-8 string to a Secret object.
     * @param {string} str UTF-8 string.
     * @returns {Secret} Secret object.
     */ static fromUTF8(str) {
          return new Secret({
              buffer: utf8Decode(str).buffer
          });
      }
      /**
     * Converts a base32 string to a Secret object.
     * @param {string} str Base32 string.
     * @returns {Secret} Secret object.
     */ static fromBase32(str) {
          return new Secret({
              buffer: base32Decode(str).buffer
          });
      }
      /**
     * Converts a hexadecimal string to a Secret object.
     * @param {string} str Hexadecimal string.
     * @returns {Secret} Secret object.
     */ static fromHex(str) {
          return new Secret({
              buffer: hexDecode(str).buffer
          });
      }
      /**
     * Secret key buffer.
     * @deprecated For backward compatibility, the "bytes" property should be used instead.
     * @type {ArrayBufferLike}
     */ get buffer() {
          return this.bytes.buffer;
      }
      /**
     * Latin-1 string representation of secret key.
     * @type {string}
     */ get latin1() {
          Object.defineProperty(this, "latin1", {
              enumerable: true,
              writable: false,
              configurable: false,
              value: latin1Encode(this.bytes)
          });
          return this.latin1;
      }
      /**
     * UTF-8 string representation of secret key.
     * @type {string}
     */ get utf8() {
          Object.defineProperty(this, "utf8", {
              enumerable: true,
              writable: false,
              configurable: false,
              value: utf8Encode(this.bytes)
          });
          return this.utf8;
      }
      /**
     * Base32 string representation of secret key.
     * @type {string}
     */ get base32() {
          Object.defineProperty(this, "base32", {
              enumerable: true,
              writable: false,
              configurable: false,
              value: base32Encode(this.bytes)
          });
          return this.base32;
      }
      /**
     * Hexadecimal string representation of secret key.
     * @type {string}
     */ get hex() {
          Object.defineProperty(this, "hex", {
              enumerable: true,
              writable: false,
              configurable: false,
              value: hexEncode(this.bytes)
          });
          return this.hex;
      }
      /**
     * Creates a secret key object.
     * @param {Object} [config] Configuration options.
     * @param {ArrayBufferLike} [config.buffer] Secret key buffer.
     * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
     */ constructor({ buffer, size = 20 } = {}){
          /**
       * Secret key.
       * @type {Uint8Array}
       * @readonly
       */ this.bytes = typeof buffer === "undefined" ? randomBytes(size) : new Uint8Array(buffer);
          // Prevent the "bytes" property from being modified.
          Object.defineProperty(this, "bytes", {
              enumerable: true,
              writable: false,
              configurable: false,
              value: this.bytes
          });
      }
  }

  /**
   * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
   * @param {string} a String a.
   * @param {string} b String b.
   * @returns {boolean} Equality result.
   */ const timingSafeEqual = (a, b)=>{
      {
          if (a.length !== b.length) {
              throw new TypeError("Input strings must have the same length");
          }
          let i = -1;
          let out = 0;
          while(++i < a.length){
              out |= a.charCodeAt(i) ^ b.charCodeAt(i);
          }
          return out === 0;
      }
  };

  /**
   * HOTP: An HMAC-based One-time Password Algorithm.
   * @see [RFC 4226](https://datatracker.ietf.org/doc/html/rfc4226)
   */ class HOTP {
      /**
     * Default configuration.
     * @type {{
     *   issuer: string,
     *   label: string,
     *   issuerInLabel: boolean,
     *   algorithm: string,
     *   digits: number,
     *   counter: number
     *   window: number
     * }}
     */ static get defaults() {
          return {
              issuer: "",
              label: "OTPAuth",
              issuerInLabel: true,
              algorithm: "SHA1",
              digits: 6,
              counter: 0,
              window: 1
          };
      }
      /**
     * Generates an HOTP token.
     * @param {Object} config Configuration options.
     * @param {Secret} config.secret Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.counter=0] Counter value.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     * @returns {string} Token.
     */ static generate({ secret, algorithm = HOTP.defaults.algorithm, digits = HOTP.defaults.digits, counter = HOTP.defaults.counter, hmac = hmacDigest }) {
          const message = uintDecode(counter);
          const digest = hmac(algorithm, secret.bytes, message);
          if (!digest?.byteLength || digest.byteLength < 19) {
              throw new TypeError("Return value must be at least 19 bytes");
          }
          const offset = digest[digest.byteLength - 1] & 15;
          const otp = ((digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255) % 10 ** digits;
          return otp.toString().padStart(digits, "0");
      }
      /**
     * Generates an HOTP token.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.counter=this.counter++] Counter value.
     * @returns {string} Token.
     */ generate({ counter = this.counter++ } = {}) {
          return HOTP.generate({
              secret: this.secret,
              algorithm: this.algorithm,
              digits: this.digits,
              counter,
              hmac: this.hmac
          });
      }
      /**
     * Validates an HOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {Secret} config.secret Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.counter=0] Counter value.
     * @param {number} [config.window=1] Window of counter values to test.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
     */ static validate({ token, secret, algorithm, digits = HOTP.defaults.digits, counter = HOTP.defaults.counter, window = HOTP.defaults.window, hmac = hmacDigest }) {
          // Return early if the token length does not match the digit number.
          if (token.length !== digits) return null;
          let delta = null;
          const check = (/** @type {number} */ i)=>{
              const generatedToken = HOTP.generate({
                  secret,
                  algorithm,
                  digits,
                  counter: i,
                  hmac
              });
              if (timingSafeEqual(token, generatedToken)) {
                  delta = i - counter;
              }
          };
          check(counter);
          for(let i = 1; i <= window && delta === null; ++i){
              check(counter - i);
              if (delta !== null) break;
              check(counter + i);
              if (delta !== null) break;
          }
          return delta;
      }
      /**
     * Validates an HOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {number} [config.counter=this.counter] Counter value.
     * @param {number} [config.window=1] Window of counter values to test.
     * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
     */ validate({ token, counter = this.counter, window }) {
          return HOTP.validate({
              token,
              secret: this.secret,
              algorithm: this.algorithm,
              digits: this.digits,
              counter,
              window,
              hmac: this.hmac
          });
      }
      /**
     * Returns a Google Authenticator key URI.
     * @returns {string} URI.
     */ toString() {
          const e = encodeURIComponent;
          return "otpauth://hotp/" + `${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}` + `secret=${e(this.secret.base32)}&` + `algorithm=${e(this.algorithm)}&` + `digits=${e(this.digits)}&` + `counter=${e(this.counter)}`;
      }
      /**
     * Creates an HOTP object.
     * @param {Object} [config] Configuration options.
     * @param {string} [config.issuer=''] Account provider.
     * @param {string} [config.label='OTPAuth'] Account label.
     * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
     * @param {Secret|string} [config.secret=Secret] Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.counter=0] Initial counter value.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     */ constructor({ issuer = HOTP.defaults.issuer, label = HOTP.defaults.label, issuerInLabel = HOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = HOTP.defaults.algorithm, digits = HOTP.defaults.digits, counter = HOTP.defaults.counter, hmac } = {}){
          /**
       * Account provider.
       * @type {string}
       */ this.issuer = issuer;
          /**
       * Account label.
       * @type {string}
       */ this.label = label;
          /**
       * Include issuer prefix in label.
       * @type {boolean}
       */ this.issuerInLabel = issuerInLabel;
          /**
       * Secret key.
       * @type {Secret}
       */ this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
          /**
       * HMAC hashing algorithm.
       * @type {string}
       */ this.algorithm = hmac ? algorithm : canonicalizeAlgorithm(algorithm);
          /**
       * Token length.
       * @type {number}
       */ this.digits = digits;
          /**
       * Initial counter value.
       * @type {number}
       */ this.counter = counter;
          /**
       * Custom HMAC function.
       * @type {((algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array)|undefined}
       */ this.hmac = hmac;
      }
  }

  /**
   * TOTP: Time-Based One-Time Password Algorithm.
   * @see [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
   */ class TOTP {
      /**
     * Default configuration.
     * @type {{
     *   issuer: string,
     *   label: string,
     *   issuerInLabel: boolean,
     *   algorithm: string,
     *   digits: number,
     *   period: number
     *   window: number
     * }}
     */ static get defaults() {
          return {
              issuer: "",
              label: "OTPAuth",
              issuerInLabel: true,
              algorithm: "SHA1",
              digits: 6,
              period: 30,
              window: 1
          };
      }
      /**
     * Calculates the counter. i.e. the number of periods since timestamp 0.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.period=30] Token time-step duration.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @returns {number} Counter.
     */ static counter({ period = TOTP.defaults.period, timestamp = Date.now() } = {}) {
          return Math.floor(timestamp / 1000 / period);
      }
      /**
     * Calculates the counter. i.e. the number of periods since timestamp 0.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @returns {number} Counter.
     */ counter({ timestamp = Date.now() } = {}) {
          return TOTP.counter({
              period: this.period,
              timestamp
          });
      }
      /**
     * Calculates the remaining time in milliseconds until the next token is generated.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.period=30] Token time-step duration.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @returns {number} counter.
     */ static remaining({ period = TOTP.defaults.period, timestamp = Date.now() } = {}) {
          return period * 1000 - timestamp % (period * 1000);
      }
      /**
     * Calculates the remaining time in milliseconds until the next token is generated.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @returns {number} counter.
     */ remaining({ timestamp = Date.now() } = {}) {
          return TOTP.remaining({
              period: this.period,
              timestamp
          });
      }
      /**
     * Generates a TOTP token.
     * @param {Object} config Configuration options.
     * @param {Secret} config.secret Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.period=30] Token time-step duration.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     * @returns {string} Token.
     */ static generate({ secret, algorithm, digits, period = TOTP.defaults.period, timestamp = Date.now(), hmac }) {
          return HOTP.generate({
              secret,
              algorithm,
              digits,
              counter: TOTP.counter({
                  period,
                  timestamp
              }),
              hmac
          });
      }
      /**
     * Generates a TOTP token.
     * @param {Object} [config] Configuration options.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @returns {string} Token.
     */ generate({ timestamp = Date.now() } = {}) {
          return TOTP.generate({
              secret: this.secret,
              algorithm: this.algorithm,
              digits: this.digits,
              period: this.period,
              timestamp,
              hmac: this.hmac
          });
      }
      /**
     * Validates a TOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {Secret} config.secret Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.period=30] Token time-step duration.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @param {number} [config.window=1] Window of counter values to test.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
     */ static validate({ token, secret, algorithm, digits, period = TOTP.defaults.period, timestamp = Date.now(), window, hmac }) {
          return HOTP.validate({
              token,
              secret,
              algorithm,
              digits,
              counter: TOTP.counter({
                  period,
                  timestamp
              }),
              window,
              hmac
          });
      }
      /**
     * Validates a TOTP token.
     * @param {Object} config Configuration options.
     * @param {string} config.token Token value.
     * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
     * @param {number} [config.window=1] Window of counter values to test.
     * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
     */ validate({ token, timestamp, window }) {
          return TOTP.validate({
              token,
              secret: this.secret,
              algorithm: this.algorithm,
              digits: this.digits,
              period: this.period,
              timestamp,
              window,
              hmac: this.hmac
          });
      }
      /**
     * Returns a Google Authenticator key URI.
     * @returns {string} URI.
     */ toString() {
          const e = encodeURIComponent;
          return "otpauth://totp/" + `${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}` + `secret=${e(this.secret.base32)}&` + `algorithm=${e(this.algorithm)}&` + `digits=${e(this.digits)}&` + `period=${e(this.period)}`;
      }
      /**
     * Creates a TOTP object.
     * @param {Object} [config] Configuration options.
     * @param {string} [config.issuer=''] Account provider.
     * @param {string} [config.label='OTPAuth'] Account label.
     * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
     * @param {Secret|string} [config.secret=Secret] Secret key.
     * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
     * @param {number} [config.digits=6] Token length.
     * @param {number} [config.period=30] Token time-step duration.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     */ constructor({ issuer = TOTP.defaults.issuer, label = TOTP.defaults.label, issuerInLabel = TOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = TOTP.defaults.algorithm, digits = TOTP.defaults.digits, period = TOTP.defaults.period, hmac } = {}){
          /**
       * Account provider.
       * @type {string}
       */ this.issuer = issuer;
          /**
       * Account label.
       * @type {string}
       */ this.label = label;
          /**
       * Include issuer prefix in label.
       * @type {boolean}
       */ this.issuerInLabel = issuerInLabel;
          /**
       * Secret key.
       * @type {Secret}
       */ this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
          /**
       * HMAC hashing algorithm.
       * @type {string}
       */ this.algorithm = hmac ? algorithm : canonicalizeAlgorithm(algorithm);
          /**
       * Token length.
       * @type {number}
       */ this.digits = digits;
          /**
       * Token time-step duration.
       * @type {number}
       */ this.period = period;
          /**
       * Custom HMAC function.
       * @type {((algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array)|undefined}
       */ this.hmac = hmac;
      }
  }

  /**
   * Key URI regex (otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS).
   * @type {RegExp}
   */ const OTPURI_REGEX = /^otpauth:\/\/([ht]otp)\/(.+)\?([A-Z0-9.~_-]+=[^?&]*(?:&[A-Z0-9.~_-]+=[^?&]*)*)$/i;
  /**
   * RFC 4648 base32 alphabet with pad.
   * @type {RegExp}
   */ const SECRET_REGEX = /^[2-7A-Z]+=*$/i;
  /**
   * Regex for supported algorithms in built-in HMAC function.
   * @type {RegExp}
   */ const ALGORITHM_REGEX = /^SHA(?:1|224|256|384|512|3-224|3-256|3-384|3-512)$/i;
  /**
   * Regex for custom algorithms in user-defined HMAC function.
   * @type {RegExp}
   */ const ALGORITHM_CUSTOM_REGEX = /^[A-Z0-9]+(?:[_-][A-Z0-9]+)*$/i;
  /**
   * Integer regex.
   * @type {RegExp}
   */ const INTEGER_REGEX = /^[+-]?\d+$/;
  /**
   * Positive integer regex.
   * @type {RegExp}
   */ const POSITIVE_INTEGER_REGEX = /^\+?[1-9]\d*$/;
  /**
   * HOTP/TOTP object/string conversion.
   * @see [Key URI Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
   */ class URI {
      /**
     * Parses a Google Authenticator key URI and returns an HOTP/TOTP object.
     * @param {string} uri Google Authenticator Key URI.
     * @param {Object} [config] Configuration options.
     * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
     * @returns {HOTP|TOTP} HOTP/TOTP object.
     */ static parse(uri, { hmac } = {}) {
          let uriGroups;
          try {
              uriGroups = uri.match(OTPURI_REGEX);
          // eslint-disable-next-line no-unused-vars
          } catch (_) {
          /* Handled below */ }
          if (!Array.isArray(uriGroups)) {
              throw new URIError("Invalid URI format");
          }
          // Extract URI groups.
          const uriType = uriGroups[1].toLowerCase();
          const uriLabel = uriGroups[2].split(/(?::|%3A) *(.+)/i, 2).map(decodeURIComponent);
          /** @type {Object.<string, string>} */ const uriParams = uriGroups[3].split("&").reduce((acc, cur)=>{
              const pairArr = cur.split(/=(.*)/, 2).map(decodeURIComponent);
              const pairKey = pairArr[0].toLowerCase();
              const pairVal = pairArr[1];
              /** @type {Object.<string, string>} */ const pairAcc = acc;
              pairAcc[pairKey] = pairVal;
              return pairAcc;
          }, {});
          // 'OTP' will be instantiated with 'config' argument.
          let OTP;
          const config = {};
          if (uriType === "hotp") {
              OTP = HOTP;
              // Counter: required
              if (typeof uriParams.counter !== "undefined" && INTEGER_REGEX.test(uriParams.counter)) {
                  config.counter = parseInt(uriParams.counter, 10);
              } else {
                  throw new TypeError("Missing or invalid 'counter' parameter");
              }
          } else if (uriType === "totp") {
              OTP = TOTP;
              // Period: optional
              if (typeof uriParams.period !== "undefined") {
                  if (POSITIVE_INTEGER_REGEX.test(uriParams.period)) {
                      config.period = parseInt(uriParams.period, 10);
                  } else {
                      throw new TypeError("Invalid 'period' parameter");
                  }
              }
          } else {
              throw new TypeError("Unknown OTP type");
          }
          // Label: required
          // Issuer: optional
          if (typeof uriParams.issuer !== "undefined") {
              config.issuer = uriParams.issuer;
          }
          if (uriLabel.length === 2) {
              config.label = uriLabel[1];
              if (typeof config.issuer === "undefined" || config.issuer === "") {
                  config.issuer = uriLabel[0];
              } else if (uriLabel[0] === "") {
                  config.issuerInLabel = false;
              }
          } else {
              config.label = uriLabel[0];
              if (typeof config.issuer !== "undefined" && config.issuer !== "") {
                  config.issuerInLabel = false;
              }
          }
          // Secret: required
          if (typeof uriParams.secret !== "undefined" && SECRET_REGEX.test(uriParams.secret)) {
              config.secret = uriParams.secret;
          } else {
              throw new TypeError("Missing or invalid 'secret' parameter");
          }
          // Algorithm: optional
          if (typeof uriParams.algorithm !== "undefined") {
              if ((hmac ? ALGORITHM_CUSTOM_REGEX : ALGORITHM_REGEX).test(uriParams.algorithm)) {
                  config.algorithm = uriParams.algorithm;
              } else {
                  throw new TypeError("Invalid 'algorithm' parameter");
              }
          }
          // Digits: optional
          if (typeof uriParams.digits !== "undefined") {
              if (POSITIVE_INTEGER_REGEX.test(uriParams.digits)) {
                  config.digits = parseInt(uriParams.digits, 10);
              } else {
                  throw new TypeError("Invalid 'digits' parameter");
              }
          }
          // HMAC: optional
          if (typeof hmac !== "undefined") {
              config.hmac = hmac;
          }
          return new OTP(config);
      }
      /**
     * Converts an HOTP/TOTP object to a Google Authenticator key URI.
     * @param {HOTP|TOTP} otp HOTP/TOTP object.
     * @returns {string} Google Authenticator Key URI.
     */ static stringify(otp) {
          if (otp instanceof HOTP || otp instanceof TOTP) {
              return otp.toString();
          }
          throw new TypeError("Invalid 'HOTP/TOTP' object");
      }
  }

  /**
   * Library version.
   * @type {string}
   */ const version = "9.5.2";

  exports.HOTP = HOTP;
  exports.Secret = Secret;
  exports.TOTP = TOTP;
  exports.URI = URI;
  exports.version = version;

}));
