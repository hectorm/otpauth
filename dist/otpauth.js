(function(){/*
 otpauth v3.2.5 | (c) Héctor Molinero Fernández <hector@molinero.dev> | https://github.com/hectorm/otpauth | MIT */
'use strict';
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function(array) {
  var index = 0;
  return function() {
    return index < array.length ? {done:!1, value:array[index++]} : {done:!0};
  };
};
$jscomp.arrayIterator = function(array) {
  return {next:$jscomp.arrayIteratorImpl(array)};
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(target, property, descriptor) {
  target != Array.prototype && target != Object.prototype && (target[property] = descriptor.value);
};
$jscomp.getGlobal = function(maybeGlobal) {
  return "undefined" != typeof window && window === maybeGlobal ? maybeGlobal : "undefined" != typeof global && null != global ? global : maybeGlobal;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
  $jscomp.initSymbol = function() {
  };
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.SymbolClass = function(id, opt_description) {
  this.$jscomp$symbol$id_ = id;
  $jscomp.defineProperty(this, "description", {configurable:!0, writable:!0, value:opt_description});
};
$jscomp.SymbolClass.prototype.toString = function() {
  return this.$jscomp$symbol$id_;
};
$jscomp.Symbol = function() {
  function Symbol(opt_description) {
    if (this instanceof Symbol) {
      throw new TypeError("Symbol is not a constructor");
    }
    return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX + (opt_description || "") + "_" + counter++, opt_description);
  }
  var counter = 0;
  return Symbol;
}();
$jscomp.initSymbolIterator = function() {
  $jscomp.initSymbol();
  var symbolIterator = $jscomp.global.Symbol.iterator;
  symbolIterator || (symbolIterator = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("Symbol.iterator"));
  "function" != typeof Array.prototype[symbolIterator] && $jscomp.defineProperty(Array.prototype, symbolIterator, {configurable:!0, writable:!0, value:function() {
    return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
  }});
  $jscomp.initSymbolIterator = function() {
  };
};
$jscomp.initSymbolAsyncIterator = function() {
  $jscomp.initSymbol();
  var symbolAsyncIterator = $jscomp.global.Symbol.asyncIterator;
  symbolAsyncIterator || (symbolAsyncIterator = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("Symbol.asyncIterator"));
  $jscomp.initSymbolAsyncIterator = function() {
  };
};
$jscomp.iteratorPrototype = function(next) {
  $jscomp.initSymbolIterator();
  next = {next:next};
  next[$jscomp.global.Symbol.iterator] = function() {
    return this;
  };
  return next;
};
$jscomp.polyfill = function(target, polyfill, fromLang, toLang) {
  if (polyfill) {
    fromLang = $jscomp.global;
    target = target.split(".");
    for (toLang = 0; toLang < target.length - 1; toLang++) {
      var key = target[toLang];
      key in fromLang || (fromLang[key] = {});
      fromLang = fromLang[key];
    }
    target = target[target.length - 1];
    toLang = fromLang[target];
    polyfill = polyfill(toLang);
    polyfill != toLang && null != polyfill && $jscomp.defineProperty(fromLang, target, {configurable:!0, writable:!0, value:polyfill});
  }
};
$jscomp.polyfill("Number.parseInt", function(orig) {
  return orig || parseInt;
}, "es6", "es3");
(function(root, factory) {
  "object" === typeof exports && "object" === typeof module ? module.exports = factory() : "function" === typeof define && define.amd ? define([], factory) : "object" === typeof exports ? exports.OTPAuth = factory() : root.OTPAuth = factory();
})(this, function() {
  return function(modules) {
    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      var module = installedModules[moduleId] = {i:moduleId, l:!1, exports:{}};
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.l = !0;
      return module.exports;
    }
    var installedModules = {};
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function(exports, name, getter) {
      __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {enumerable:!0, get:getter});
    };
    __webpack_require__.r = function(exports) {
      $jscomp.initSymbol();
      $jscomp.initSymbol();
      "undefined" !== typeof Symbol && Symbol.toStringTag && ($jscomp.initSymbol(), Object.defineProperty(exports, Symbol.toStringTag, {value:"Module"}));
      Object.defineProperty(exports, "__esModule", {value:!0});
    };
    __webpack_require__.t = function(value, mode) {
      mode & 1 && (value = __webpack_require__(value));
      if (mode & 8 || mode & 4 && "object" === typeof value && value && value.__esModule) {
        return value;
      }
      var ns = Object.create(null);
      __webpack_require__.r(ns);
      Object.defineProperty(ns, "default", {enumerable:!0, value:value});
      if (mode & 2 && "string" != typeof value) {
        for (var key$jscomp$0 in value) {
          __webpack_require__.d(ns, key$jscomp$0, function(key) {
            return value[key];
          }.bind(null, key$jscomp$0));
        }
      }
      return ns;
    };
    __webpack_require__.n = function(module) {
      var getter = module && module.__esModule ? function() {
        return module["default"];
      } : function() {
        return module;
      };
      __webpack_require__.d(getter, "a", getter);
      return getter;
    };
    __webpack_require__.o = function(object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 4);
  }([function(module, __webpack_exports__, __webpack_require__) {
    (function(global) {
      __webpack_require__.d(__webpack_exports__, "b", function() {
        return Utils;
      });
      __webpack_require__.d(__webpack_exports__, "a", function() {
        return InternalUtils;
      });
      var Utils = {uint:{}};
      Utils.uint.decode = function(buf) {
        buf = new Uint8Array(buf);
        for (var num = 0, i = 0; i < buf.length; i++) {
          0 !== buf[i] && (num *= 256, num += buf[i]);
        }
        return num;
      };
      Utils.uint.encode = function(num) {
        for (var buf = new ArrayBuffer(8), arr = new Uint8Array(buf), i = 7; 0 <= i && 0 !== num; i--) {
          arr[i] = num & 255, num -= arr[i], num /= 256;
        }
        return buf;
      };
      Utils.raw = {};
      Utils.raw.decode = function(buf) {
        buf = new Uint8Array(buf);
        for (var str = "", i = 0; i < buf.length; i++) {
          str += String.fromCharCode(buf[i]);
        }
        return str;
      };
      Utils.raw.encode = function(str) {
        for (var buf = new ArrayBuffer(str.length), arr = new Uint8Array(buf), i = 0; i < str.length; i++) {
          arr[i] = str.charCodeAt(i);
        }
        return buf;
      };
      Utils.b32 = {};
      Utils.b32.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      Utils.b32.decode = function(buf) {
        buf = new Uint8Array(buf);
        for (var bits = 0, value = 0, str = "", i = 0; i < buf.length; i++) {
          for (value = value << 8 | buf[i], bits += 8; 5 <= bits;) {
            str += Utils.b32.alphabet[value >>> bits - 5 & 31], bits -= 5;
          }
        }
        0 < bits && (str += Utils.b32.alphabet[value << 5 - bits & 31]);
        return str;
      };
      Utils.b32.encode = function(str) {
        var strUpp = str.toUpperCase();
        str = new ArrayBuffer(5 * str.length / 8 | 0);
        for (var arr = new Uint8Array(str), bits = 0, value = 0, index = 0, i = 0; i < strUpp.length; i++) {
          var idx = Utils.b32.alphabet.indexOf(strUpp[i]);
          if (-1 === idx) {
            throw new TypeError("Invalid character found: " + strUpp[i]);
          }
          value = value << 5 | idx;
          bits += 5;
          8 <= bits && (arr[index++] = value >>> bits - 8 & 255, bits -= 8);
        }
        return str;
      };
      Utils.hex = {};
      Utils.hex.decode = function(buf) {
        buf = new Uint8Array(buf);
        for (var str = "", i = 0; i < buf.length; i++) {
          var hexByte = buf[i].toString(16);
          str += 1 === hexByte.length ? "0" + hexByte : hexByte;
        }
        return str.toUpperCase();
      };
      Utils.hex.encode = function(str) {
        for (var buf = new ArrayBuffer(str.length / 2), arr = new Uint8Array(buf), i = 0; i < arr.length; i++) {
          arr[i] = Number.parseInt(str.substr(2 * i, 2), 16);
        }
        return buf;
      };
      var InternalUtils = {};
      InternalUtils.isNode = "[object process]" === Object.prototype.toString.call(global.process);
      InternalUtils.require = function(name) {
        return InternalUtils.isNode ? eval("require")(name) : null;
      };
    }).call(this, __webpack_require__(3));
  }, function(module, __webpack_exports__, __webpack_require__) {
    var sjcl = {cipher:{}, hash:{}, keyexchange:{}, mode:{}, misc:{}, codec:{}, exception:{corrupt:function(message) {
      this.toString = function() {
        return "CORRUPT: " + this.message;
      };
      this.message = message;
    }, invalid:function(message) {
      this.toString = function() {
        return "INVALID: " + this.message;
      };
      this.message = message;
    }, bug:function(message) {
      this.toString = function() {
        return "BUG: " + this.message;
      };
      this.message = message;
    }, notReady:function(message) {
      this.toString = function() {
        return "NOT READY: " + this.message;
      };
      this.message = message;
    }}, bitArray:{bitSlice:function(a, bstart, bend) {
      a = sjcl.bitArray._shiftRight(a.slice(bstart / 32), 32 - (bstart & 31)).slice(1);
      return void 0 === bend ? a : sjcl.bitArray.clamp(a, bend - bstart);
    }, extract:function(a, bstart, blength) {
      var sh = Math.floor(-bstart - blength & 31);
      return ((bstart + blength - 1 ^ bstart) & -32 ? a[bstart / 32 | 0] << 32 - sh ^ a[bstart / 32 + 1 | 0] >>> sh : a[bstart / 32 | 0] >>> sh) & (1 << blength) - 1;
    }, concat:function(a1, a2) {
      if (0 === a1.length || 0 === a2.length) {
        return a1.concat(a2);
      }
      var last = a1[a1.length - 1], shift = sjcl.bitArray.getPartial(last);
      return 32 === shift ? a1.concat(a2) : sjcl.bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
    }, bitLength:function(a) {
      var l = a.length;
      return 0 === l ? 0 : 32 * (l - 1) + sjcl.bitArray.getPartial(a[l - 1]);
    }, clamp:function(a, len) {
      if (32 * a.length < len) {
        return a;
      }
      a = a.slice(0, Math.ceil(len / 32));
      var l = a.length;
      len &= 31;
      0 < l && len && (a[l - 1] = sjcl.bitArray.partial(len, a[l - 1] & 2147483648 >> len - 1, 1));
      return a;
    }, partial:function(len, x, _end) {
      return 32 === len ? x : (_end ? x | 0 : x << 32 - len) + 1099511627776 * len;
    }, getPartial:function(x) {
      return Math.round(x / 1099511627776) || 32;
    }, equal:function(a, b) {
      if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
        return !1;
      }
      var x = 0, i;
      for (i = 0; i < a.length; i++) {
        x |= a[i] ^ b[i];
      }
      return 0 === x;
    }, _shiftRight:function(a, shift, carry, out) {
      var i;
      for (void 0 === out && (out = []); 32 <= shift; shift -= 32) {
        out.push(carry), carry = 0;
      }
      if (0 === shift) {
        return out.concat(a);
      }
      for (i = 0; i < a.length; i++) {
        out.push(carry | a[i] >>> shift), carry = a[i] << 32 - shift;
      }
      a = sjcl.bitArray.getPartial(a.length ? a[a.length - 1] : 0);
      out.push(sjcl.bitArray.partial(shift + a & 31, 32 < shift + a ? carry : out.pop(), 1));
      return out;
    }, _xor4:function(x, y) {
      return [x[0] ^ y[0], x[1] ^ y[1], x[2] ^ y[2], x[3] ^ y[3]];
    }, byteswapM:function(a) {
      var i;
      for (i = 0; i < a.length; ++i) {
        var v = a[i];
        a[i] = v >>> 24 | v >>> 8 & 65280 | (v & 65280) << 8 | v << 24;
      }
      return a;
    }}};
    "undefined" === typeof ArrayBuffer && function(globals) {
      globals.ArrayBuffer = function() {
      };
      globals.DataView = function() {
      };
    }(void 0);
    sjcl.codec.arrayBuffer = {fromBits:function(arr, padding, padding_count) {
      padding = void 0 == padding ? !0 : padding;
      padding_count = padding_count || 8;
      if (0 === arr.length) {
        return new ArrayBuffer(0);
      }
      var ol = sjcl.bitArray.bitLength(arr) / 8;
      if (0 !== sjcl.bitArray.bitLength(arr) % 8) {
        throw new sjcl.exception.invalid("Invalid bit size, must be divisble by 8 to fit in an arraybuffer correctly");
      }
      padding && 0 !== ol % padding_count && (ol += padding_count - ol % padding_count);
      padding_count = new DataView(new ArrayBuffer(4 * arr.length));
      for (padding = 0; padding < arr.length; padding++) {
        padding_count.setUint32(4 * padding, arr[padding] << 32);
      }
      arr = new DataView(new ArrayBuffer(ol));
      if (arr.byteLength === padding_count.byteLength) {
        return padding_count.buffer;
      }
      ol = padding_count.byteLength < arr.byteLength ? padding_count.byteLength : arr.byteLength;
      for (padding = 0; padding < ol; padding++) {
        arr.setUint8(padding, padding_count.getUint8(padding));
      }
      return arr.buffer;
    }, toBits:function(buffer) {
      var out = [];
      if (0 === buffer.byteLength) {
        return [];
      }
      var inView = new DataView(buffer);
      var len = inView.byteLength - inView.byteLength % 4;
      for (buffer = 0; buffer < len; buffer += 4) {
        out.push(inView.getUint32(buffer));
      }
      if (0 != inView.byteLength % 4) {
        var tmp = new DataView(new ArrayBuffer(4));
        buffer = 0;
        for (var l = inView.byteLength % 4; buffer < l; buffer++) {
          tmp.setUint8(buffer + 4 - l, inView.getUint8(len + buffer));
        }
        out.push(sjcl.bitArray.partial(inView.byteLength % 4 * 8, tmp.getUint32(0)));
      }
      return out;
    }, hexDumpBuffer:function(buffer) {
      buffer = new DataView(buffer);
      for (var string = "", i = 0; i < buffer.byteLength; i += 2) {
        0 == i % 16 && (string += "\n" + i.toString(16) + "\t");
        var JSCompiler_inline_result = buffer.getUint16(i).toString(16);
        JSCompiler_inline_result += "";
        JSCompiler_inline_result = 4 <= JSCompiler_inline_result.length ? JSCompiler_inline_result : Array(4 - JSCompiler_inline_result.length + 1).join("0") + JSCompiler_inline_result;
        string += JSCompiler_inline_result + " ";
      }
      console.log(string.toUpperCase());
    }};
    sjcl.hash.sha1 = function(hash) {
      hash ? (this._h = hash._h.slice(0), this._buffer = hash._buffer.slice(0), this._length = hash._length) : this.reset();
    };
    sjcl.hash.sha1.hash = function(data) {
      return (new sjcl.hash.sha1).update(data).finalize();
    };
    sjcl.hash.sha1.prototype = {blockSize:512, reset:function() {
      this._h = this._init.slice(0);
      this._buffer = [];
      this._length = 0;
      return this;
    }, update:function(data) {
      "string" === typeof data && (data = sjcl.codec.utf8String.toBits(data));
      var b = this._buffer = sjcl.bitArray.concat(this._buffer, data);
      var i = this._length;
      data = this._length = i + sjcl.bitArray.bitLength(data);
      if (9007199254740991 < data) {
        throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
      }
      if ("undefined" !== typeof Uint32Array) {
        var c = new Uint32Array(b), j = 0;
        for (i = this.blockSize + i - (this.blockSize + i & this.blockSize - 1); i <= data; i += this.blockSize) {
          this._block(c.subarray(16 * j, 16 * (j + 1))), j += 1;
        }
        b.splice(0, 16 * j);
      } else {
        for (i = this.blockSize + i - (this.blockSize + i & this.blockSize - 1); i <= data; i += this.blockSize) {
          this._block(b.splice(0, 16));
        }
      }
      return this;
    }, finalize:function() {
      var i, b = this._buffer, h = this._h;
      b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
      for (i = b.length + 2; i & 15; i++) {
        b.push(0);
      }
      b.push(Math.floor(this._length / 4294967296));
      for (b.push(this._length | 0); b.length;) {
        this._block(b.splice(0, 16));
      }
      this.reset();
      return h;
    }, _init:[1732584193, 4023233417, 2562383102, 271733878, 3285377520], _key:[1518500249, 1859775393, 2400959708, 3395469782], _f:function(t, b, c, d) {
      if (19 >= t) {
        return b & c | ~b & d;
      }
      if (39 >= t) {
        return b ^ c ^ d;
      }
      if (59 >= t) {
        return b & c | b & d | c & d;
      }
      if (79 >= t) {
        return b ^ c ^ d;
      }
    }, _S:function(n, x) {
      return x << n | x >>> 32 - n;
    }, _block:function(words) {
      var tmp, h = this._h;
      if ("undefined" !== typeof Uint32Array) {
        var w = Array(80);
        for (tmp = 0; 16 > tmp; tmp++) {
          w[tmp] = words[tmp];
        }
      } else {
        w = words;
      }
      var a = h[0];
      var b = h[1];
      var c = h[2];
      var d = h[3];
      var e = h[4];
      for (words = 0; 79 >= words; words++) {
        16 <= words && (w[words] = this._S(1, w[words - 3] ^ w[words - 8] ^ w[words - 14] ^ w[words - 16])), tmp = this._S(5, a) + this._f(words, b, c, d) + e + w[words] + this._key[Math.floor(words / 20)] | 0, e = d, d = c, c = this._S(30, b), b = a, a = tmp;
      }
      h[0] = h[0] + a | 0;
      h[1] = h[1] + b | 0;
      h[2] = h[2] + c | 0;
      h[3] = h[3] + d | 0;
      h[4] = h[4] + e | 0;
    }};
    sjcl.hash.sha256 = function(hash) {
      this._key[0] || this._precompute();
      hash ? (this._h = hash._h.slice(0), this._buffer = hash._buffer.slice(0), this._length = hash._length) : this.reset();
    };
    sjcl.hash.sha256.hash = function(data) {
      return (new sjcl.hash.sha256).update(data).finalize();
    };
    sjcl.hash.sha256.prototype = {blockSize:512, reset:function() {
      this._h = this._init.slice(0);
      this._buffer = [];
      this._length = 0;
      return this;
    }, update:function(data) {
      "string" === typeof data && (data = sjcl.codec.utf8String.toBits(data));
      var b = this._buffer = sjcl.bitArray.concat(this._buffer, data);
      var i = this._length;
      data = this._length = i + sjcl.bitArray.bitLength(data);
      if (9007199254740991 < data) {
        throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
      }
      if ("undefined" !== typeof Uint32Array) {
        var c = new Uint32Array(b), j = 0;
        for (i = 512 + i - (512 + i & 511); i <= data; i += 512) {
          this._block(c.subarray(16 * j, 16 * (j + 1))), j += 1;
        }
        b.splice(0, 16 * j);
      } else {
        for (i = 512 + i - (512 + i & 511); i <= data; i += 512) {
          this._block(b.splice(0, 16));
        }
      }
      return this;
    }, finalize:function() {
      var i, b = this._buffer, h = this._h;
      b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
      for (i = b.length + 2; i & 15; i++) {
        b.push(0);
      }
      b.push(Math.floor(this._length / 4294967296));
      for (b.push(this._length | 0); b.length;) {
        this._block(b.splice(0, 16));
      }
      this.reset();
      return h;
    }, _init:[], _key:[], _precompute:function() {
      function frac(x) {
        return 4294967296 * (x - Math.floor(x)) | 0;
      }
      for (var i = 0, prime = 2, factor, isPrime; 64 > i; prime++) {
        isPrime = !0;
        for (factor = 2; factor * factor <= prime; factor++) {
          if (0 === prime % factor) {
            isPrime = !1;
            break;
          }
        }
        isPrime && (8 > i && (this._init[i] = frac(Math.pow(prime, .5))), this._key[i] = frac(Math.pow(prime, 1 / 3)), i++);
      }
    }, _block:function(w) {
      var i, h = this._h, k = this._key, h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
      for (i = 0; 64 > i; i++) {
        if (16 > i) {
          var tmp = w[i];
        } else {
          tmp = w[i + 1 & 15];
          var b = w[i + 14 & 15];
          tmp = w[i & 15] = (tmp >>> 7 ^ tmp >>> 18 ^ tmp >>> 3 ^ tmp << 25 ^ tmp << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i & 15] + w[i + 9 & 15] | 0;
        }
        tmp = tmp + h7 + (h4 >>> 6 ^ h4 >>> 11 ^ h4 >>> 25 ^ h4 << 26 ^ h4 << 21 ^ h4 << 7) + (h6 ^ h4 & (h5 ^ h6)) + k[i];
        h7 = h6;
        h6 = h5;
        h5 = h4;
        h4 = h3 + tmp | 0;
        h3 = h2;
        h2 = h1;
        h1 = h0;
        h0 = tmp + (h1 & h2 ^ h3 & (h1 ^ h2)) + (h1 >>> 2 ^ h1 >>> 13 ^ h1 >>> 22 ^ h1 << 30 ^ h1 << 19 ^ h1 << 10) | 0;
      }
      h[0] = h[0] + h0 | 0;
      h[1] = h[1] + h1 | 0;
      h[2] = h[2] + h2 | 0;
      h[3] = h[3] + h3 | 0;
      h[4] = h[4] + h4 | 0;
      h[5] = h[5] + h5 | 0;
      h[6] = h[6] + h6 | 0;
      h[7] = h[7] + h7 | 0;
    }};
    sjcl.hash.sha512 = function(hash) {
      this._key[0] || this._precompute();
      hash ? (this._h = hash._h.slice(0), this._buffer = hash._buffer.slice(0), this._length = hash._length) : this.reset();
    };
    sjcl.hash.sha512.hash = function(data) {
      return (new sjcl.hash.sha512).update(data).finalize();
    };
    sjcl.hash.sha512.prototype = {blockSize:1024, reset:function() {
      this._h = this._init.slice(0);
      this._buffer = [];
      this._length = 0;
      return this;
    }, update:function(data) {
      "string" === typeof data && (data = sjcl.codec.utf8String.toBits(data));
      var b = this._buffer = sjcl.bitArray.concat(this._buffer, data);
      var i = this._length;
      data = this._length = i + sjcl.bitArray.bitLength(data);
      if (9007199254740991 < data) {
        throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
      }
      if ("undefined" !== typeof Uint32Array) {
        var c = new Uint32Array(b), j = 0;
        for (i = 1024 + i - (1024 + i & 1023); i <= data; i += 1024) {
          this._block(c.subarray(32 * j, 32 * (j + 1))), j += 1;
        }
        b.splice(0, 32 * j);
      } else {
        for (i = 1024 + i - (1024 + i & 1023); i <= data; i += 1024) {
          this._block(b.splice(0, 32));
        }
      }
      return this;
    }, finalize:function() {
      var i, b = this._buffer, h = this._h;
      b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
      for (i = b.length + 4; i & 31; i++) {
        b.push(0);
      }
      b.push(0);
      b.push(0);
      b.push(Math.floor(this._length / 4294967296));
      for (b.push(this._length | 0); b.length;) {
        this._block(b.splice(0, 32));
      }
      this.reset();
      return h;
    }, _init:[], _initr:[12372232, 13281083, 9762859, 1914609, 15106769, 4090911, 4308331, 8266105], _key:[], _keyr:[2666018, 15689165, 5061423, 9034684, 4764984, 380953, 1658779, 7176472, 197186, 7368638, 14987916, 16757986, 8096111, 1480369, 13046325, 6891156, 15813330, 5187043, 9229749, 11312229, 2818677, 10937475, 4324308, 1135541, 6741931, 11809296, 16458047, 15666916, 11046850, 698149, 229999, 945776, 13774844, 2541862, 12856045, 9810911, 11494366, 7844520, 15576806, 8533307, 15795044, 4337665, 
    16291729, 5553712, 15684120, 6662416, 7413802, 12308920, 13816008, 4303699, 9366425, 10176680, 13195875, 4295371, 6546291, 11712675, 15708924, 1519456, 15772530, 6568428, 6495784, 8568297, 13007125, 7492395, 2515356, 12632583, 14740254, 7262584, 1535930, 13146278, 16321966, 1853211, 294276, 13051027, 13221564, 1051980, 4080310, 6651434, 14088940, 4675607], _precompute:function() {
      function frac(x) {
        return 4294967296 * (x - Math.floor(x)) | 0;
      }
      function frac2(x) {
        return 1099511627776 * (x - Math.floor(x)) & 255;
      }
      for (var i = 0, prime = 2, factor, isPrime; 80 > i; prime++) {
        isPrime = !0;
        for (factor = 2; factor * factor <= prime; factor++) {
          if (0 === prime % factor) {
            isPrime = !1;
            break;
          }
        }
        isPrime && (8 > i && (this._init[2 * i] = frac(Math.pow(prime, .5)), this._init[2 * i + 1] = frac2(Math.pow(prime, .5)) << 24 | this._initr[i]), this._key[2 * i] = frac(Math.pow(prime, 1 / 3)), this._key[2 * i + 1] = frac2(Math.pow(prime, 1 / 3)) << 24 | this._keyr[i], i++);
      }
    }, _block:function(words) {
      var h = this._h, k = this._key, h0h = h[0], h0l = h[1], h1h = h[2], h1l = h[3], h2h = h[4], h2l = h[5], h3h = h[6], h3l = h[7], h4h = h[8], h4l = h[9], h5h = h[10], h5l = h[11], h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
      if ("undefined" !== typeof Uint32Array) {
        var w = Array(160);
        for (var j = 0; 32 > j; j++) {
          w[j] = words[j];
        }
      } else {
        w = words;
      }
      j = h0h;
      var al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
      for (words = 0; 80 > words; words++) {
        if (16 > words) {
          var wrh = w[2 * words];
          var wrl = w[2 * words + 1];
        } else {
          wrl = w[2 * (words - 15)];
          var gamma0xl = w[2 * (words - 15) + 1];
          wrh = (gamma0xl << 31 | wrl >>> 1) ^ (gamma0xl << 24 | wrl >>> 8) ^ wrl >>> 7;
          var gamma0l = (wrl << 31 | gamma0xl >>> 1) ^ (wrl << 24 | gamma0xl >>> 8) ^ (wrl << 25 | gamma0xl >>> 7);
          wrl = w[2 * (words - 2)];
          var gamma1xl = w[2 * (words - 2) + 1];
          gamma0xl = (gamma1xl << 13 | wrl >>> 19) ^ (wrl << 3 | gamma1xl >>> 29) ^ wrl >>> 6;
          gamma1xl = (wrl << 13 | gamma1xl >>> 19) ^ (gamma1xl << 3 | wrl >>> 29) ^ (wrl << 26 | gamma1xl >>> 6);
          var wr7h = w[2 * (words - 7)], wr16h = w[2 * (words - 16)], wr16l = w[2 * (words - 16) + 1];
          wrl = gamma0l + w[2 * (words - 7) + 1];
          wrh = wrh + wr7h + (wrl >>> 0 < gamma0l >>> 0 ? 1 : 0);
          wrl += gamma1xl;
          wrh += gamma0xl + (wrl >>> 0 < gamma1xl >>> 0 ? 1 : 0);
          wrl += wr16l;
          wrh += wr16h + (wrl >>> 0 < wr16l >>> 0 ? 1 : 0);
        }
        w[2 * words] = wrh |= 0;
        w[2 * words + 1] = wrl |= 0;
        wr7h = eh & fh ^ ~eh & gh;
        var chl = el & fl ^ ~el & gl;
        gamma1xl = j & bh ^ j & ch ^ bh & ch;
        var majl = al & bl ^ al & cl ^ bl & cl;
        wr16h = (al << 4 | j >>> 28) ^ (j << 30 | al >>> 2) ^ (j << 25 | al >>> 7);
        wr16l = (j << 4 | al >>> 28) ^ (al << 30 | j >>> 2) ^ (al << 25 | j >>> 7);
        var krh = k[2 * words], krl = k[2 * words + 1];
        gamma0xl = hl + ((eh << 18 | el >>> 14) ^ (eh << 14 | el >>> 18) ^ (el << 23 | eh >>> 9));
        gamma0l = hh + ((el << 18 | eh >>> 14) ^ (el << 14 | eh >>> 18) ^ (eh << 23 | el >>> 9)) + (gamma0xl >>> 0 < hl >>> 0 ? 1 : 0);
        gamma0xl += chl;
        gamma0l += wr7h + (gamma0xl >>> 0 < chl >>> 0 ? 1 : 0);
        gamma0xl += krl;
        gamma0l += krh + (gamma0xl >>> 0 < krl >>> 0 ? 1 : 0);
        gamma0xl = gamma0xl + wrl | 0;
        gamma0l += wrh + (gamma0xl >>> 0 < wrl >>> 0 ? 1 : 0);
        wrl = wr16l + majl;
        wrh = wr16h + gamma1xl + (wrl >>> 0 < wr16l >>> 0 ? 1 : 0);
        hh = gh;
        hl = gl;
        gh = fh;
        gl = fl;
        fh = eh;
        fl = el;
        el = dl + gamma0xl | 0;
        eh = dh + gamma0l + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
        dh = ch;
        dl = cl;
        ch = bh;
        cl = bl;
        bh = j;
        bl = al;
        al = gamma0xl + wrl | 0;
        j = gamma0l + wrh + (al >>> 0 < gamma0xl >>> 0 ? 1 : 0) | 0;
      }
      h0l = h[1] = h0l + al | 0;
      h[0] = h0h + j + (h0l >>> 0 < al >>> 0 ? 1 : 0) | 0;
      h1l = h[3] = h1l + bl | 0;
      h[2] = h1h + bh + (h1l >>> 0 < bl >>> 0 ? 1 : 0) | 0;
      h2l = h[5] = h2l + cl | 0;
      h[4] = h2h + ch + (h2l >>> 0 < cl >>> 0 ? 1 : 0) | 0;
      h3l = h[7] = h3l + dl | 0;
      h[6] = h3h + dh + (h3l >>> 0 < dl >>> 0 ? 1 : 0) | 0;
      h4l = h[9] = h4l + el | 0;
      h[8] = h4h + eh + (h4l >>> 0 < el >>> 0 ? 1 : 0) | 0;
      h5l = h[11] = h5l + fl | 0;
      h[10] = h5h + fh + (h5l >>> 0 < fl >>> 0 ? 1 : 0) | 0;
      h6l = h[13] = h6l + gl | 0;
      h[12] = h6h + gh + (h6l >>> 0 < gl >>> 0 ? 1 : 0) | 0;
      h7l = h[15] = h7l + hl | 0;
      h[14] = h7h + hh + (h7l >>> 0 < hl >>> 0 ? 1 : 0) | 0;
    }};
    sjcl.misc.hmac = function(key, Hash) {
      this._hash = Hash = Hash || sjcl.hash.sha256;
      var exKey = [[], []], i, bs = Hash.prototype.blockSize / 32;
      this._baseHash = [new Hash, new Hash];
      key.length > bs && (key = Hash.hash(key));
      for (i = 0; i < bs; i++) {
        exKey[0][i] = key[i] ^ 909522486, exKey[1][i] = key[i] ^ 1549556828;
      }
      this._baseHash[0].update(exKey[0]);
      this._baseHash[1].update(exKey[1]);
      this._resultHash = new Hash(this._baseHash[0]);
    };
    sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(data) {
      if (this._updated) {
        throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
      }
      this.update(data);
      return this.digest(data);
    };
    sjcl.misc.hmac.prototype.reset = function() {
      this._resultHash = new this._hash(this._baseHash[0]);
      this._updated = !1;
    };
    sjcl.misc.hmac.prototype.update = function(data) {
      this._updated = !0;
      this._resultHash.update(data);
    };
    sjcl.misc.hmac.prototype.digest = function() {
      var w = this._resultHash.finalize();
      w = (new this._hash(this._baseHash[1])).update(w).finalize();
      this.reset();
      return w;
    };
    __webpack_exports__.a = sjcl;
  }, function(module, __webpack_exports__, __webpack_require__) {
    (function(global) {
      __webpack_require__.d(__webpack_exports__, "a", function() {
        return Crypto;
      });
      var sjcl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1), NodeCrypto = __webpack_require__(0).a.require("crypto"), Crypto = {};
      if (NodeCrypto) {
        var bufferFrom = "function" === typeof Buffer.from ? Buffer.from : function(arrbuf) {
          var nodeBuf = new Buffer(arrbuf.byteLength);
          arrbuf = new Uint8Array(arrbuf);
          for (var i = 0; i < arrbuf.length; i++) {
            nodeBuf[i] = arrbuf[i];
          }
          return nodeBuf;
        };
        var bufferTo = Buffer.prototype instanceof Uint8Array ? function(nodeBuf) {
          return nodeBuf;
        } : function(nodeBuf) {
          for (var arr = new Uint8Array(nodeBuf.length), i = 0; i < arr.length; i++) {
            arr[i] = nodeBuf[i];
          }
          return arr;
        };
        Crypto.randomBytes = function(size) {
          size = NodeCrypto.randomBytes(size);
          return bufferTo(size);
        };
        Crypto.hmacDigest = function(algorithm, key, message) {
          algorithm = NodeCrypto.createHmac(algorithm, bufferFrom(key));
          return bufferTo(algorithm).update(bufferFrom(message)).digest();
        };
      } else {
        if ("undefined" !== typeof global.crypto && "function" === typeof global.crypto.getRandomValues) {
          var getRandomValues = function(arr) {
            global.crypto.getRandomValues(arr);
          };
        } else {
          "undefined" !== typeof global.msCrypto && "function" === typeof global.msCrypto.getRandomValues ? getRandomValues = function(arr) {
            global.msCrypto.getRandomValues(arr);
          } : (console.warn("Cryptography API not available, falling back to 'Math.random'..."), getRandomValues = function(arr) {
            for (var i = 0; i < arr.length; i++) {
              arr[i] = Math.floor(256 * Math.random());
            }
          });
        }
        Crypto.randomBytes = function(size) {
          size = new Uint8Array(size);
          getRandomValues(size);
          return size;
        };
        Crypto.hmacDigest = function(algorithm, key, message) {
          algorithm = sjcl__WEBPACK_IMPORTED_MODULE_0__.a.hash[algorithm.toLowerCase()];
          if ("undefined" === typeof algorithm) {
            throw new TypeError("Unknown hash function");
          }
          key = new sjcl__WEBPACK_IMPORTED_MODULE_0__.a.misc.hmac(sjcl__WEBPACK_IMPORTED_MODULE_0__.a.codec.arrayBuffer.toBits(key), algorithm);
          key.update(sjcl__WEBPACK_IMPORTED_MODULE_0__.a.codec.arrayBuffer.toBits(message));
          return sjcl__WEBPACK_IMPORTED_MODULE_0__.a.codec.arrayBuffer.fromBits(key.digest(), !1);
        };
      }
    }).call(this, __webpack_require__(3));
  }, function(module, exports) {
    exports = function() {
      return this;
    }();
    try {
      exports = exports || (new Function("return this"))();
    } catch (e) {
      "object" === typeof window && (exports = window);
    }
    module.exports = exports;
  }, function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    var utils = __webpack_require__(0), src_crypto = __webpack_require__(2), secret_Secret = function($jscomp$destructuring$var0) {
      var $jscomp$destructuring$var1 = void 0 === $jscomp$destructuring$var0 ? {} : $jscomp$destructuring$var0;
      $jscomp$destructuring$var0 = $jscomp$destructuring$var1.buffer;
      $jscomp$destructuring$var1 = void 0 === $jscomp$destructuring$var1.size ? 20 : $jscomp$destructuring$var1.size;
      this.buffer = "undefined" === typeof $jscomp$destructuring$var0 ? src_crypto.a.randomBytes($jscomp$destructuring$var1).buffer : $jscomp$destructuring$var0;
    };
    secret_Secret.fromRaw = function(str) {
      return new this({buffer:utils.b.raw.encode(str)});
    };
    secret_Secret.fromB32 = function(str) {
      return new this({buffer:utils.b.b32.encode(str)});
    };
    secret_Secret.fromHex = function(str) {
      return new this({buffer:utils.b.hex.encode(str)});
    };
    $jscomp.global.Object.defineProperties(secret_Secret.prototype, {raw:{configurable:!0, enumerable:!0, get:function() {
      Object.defineProperty(this, "raw", {enumerable:!0, configurable:!0, writable:!0, value:utils.b.raw.decode(this.buffer)});
      return this.raw;
    }}, b32:{configurable:!0, enumerable:!0, get:function() {
      Object.defineProperty(this, "b32", {enumerable:!0, configurable:!0, writable:!0, value:utils.b.b32.decode(this.buffer)});
      return this.b32;
    }}, hex:{configurable:!0, enumerable:!0, get:function() {
      Object.defineProperty(this, "hex", {enumerable:!0, configurable:!0, writable:!0, value:utils.b.hex.decode(this.buffer)});
      return this.hex;
    }}});
    var OTPURI_REGEX = /^otpauth:\/\/([ht]otp)\/(.+)\?((?:&?(?:issuer|label|secret|algorithm|digits|counter|period)=[^&]+)+)$/i, SECRET_REGEX = /^[2-7A-Z]+$/i, ALGORITHM_REGEX = /^SHA(?:1|256|512)$/i, INTEGER_REGEX = /^[+-]?\d+$/, POSITIVE_INTEGER_REGEX = /^\+?[1-9]\d*$/, uri_URI = function() {
    };
    uri_URI.parse = function(uri) {
      try {
        var uriGroups = decodeURIComponent(uri).match(OTPURI_REGEX);
      } catch (error) {
      }
      if (!Array.isArray(uriGroups)) {
        throw new URIError("Invalid URI format");
      }
      var uriType = uriGroups[1].toLowerCase();
      uri = uriGroups[2].split(/:(.+)/, 2);
      uriGroups = uriGroups[3].split("&").reduce(function(acc, cur) {
        cur = cur.split(/=(.+)/, 2);
        var pairKey = cur[0].toLowerCase();
        acc[pairKey] = cur[1];
        return acc;
      }, {});
      var config = {};
      if ("hotp" === uriType) {
        if (uriType = otp_HOTP, "undefined" !== typeof uriGroups.counter && INTEGER_REGEX.test(uriGroups.counter)) {
          config.counter = Number.parseInt(uriGroups.counter, 10);
        } else {
          throw new TypeError("Missing or invalid 'counter' parameter");
        }
      } else {
        if ("totp" === uriType) {
          if (uriType = otp_TOTP, "undefined" !== typeof uriGroups.period) {
            if (POSITIVE_INTEGER_REGEX.test(uriGroups.period)) {
              config.period = Number.parseInt(uriGroups.period, 10);
            } else {
              throw new TypeError("Invalid 'period' parameter");
            }
          }
        } else {
          throw new TypeError("Unknown OTP type");
        }
      }
      if (2 === uri.length) {
        if (config.label = uri[1], "undefined" === typeof uriGroups.issuer) {
          config.issuer = uri[0];
        } else {
          if (uriGroups.issuer === uri[0]) {
            config.issuer = uriGroups.issuer;
          } else {
            throw new TypeError("Invalid 'issuer' parameter");
          }
        }
      } else {
        config.label = uri[0], "undefined" !== typeof uriGroups.issuer && (config.issuer = uriGroups.issuer);
      }
      if ("undefined" !== typeof uriGroups.secret && SECRET_REGEX.test(uriGroups.secret)) {
        config.secret = new secret_Secret({buffer:utils.b.b32.encode(uriGroups.secret)});
      } else {
        throw new TypeError("Missing or invalid 'secret' parameter");
      }
      if ("undefined" !== typeof uriGroups.algorithm) {
        if (ALGORITHM_REGEX.test(uriGroups.algorithm)) {
          config.algorithm = uriGroups.algorithm;
        } else {
          throw new TypeError("Invalid 'algorithm' parameter");
        }
      }
      if ("undefined" !== typeof uriGroups.digits) {
        if (POSITIVE_INTEGER_REGEX.test(uriGroups.digits)) {
          config.digits = Number.parseInt(uriGroups.digits, 10);
        } else {
          throw new TypeError("Invalid 'digits' parameter");
        }
      }
      return new uriType(config);
    };
    uri_URI.stringify = function(otp, $jscomp$destructuring$var2) {
      $jscomp$destructuring$var2 = void 0 === $jscomp$destructuring$var2 ? {} : $jscomp$destructuring$var2;
      $jscomp$destructuring$var2 = void 0 === $jscomp$destructuring$var2.legacyIssuer ? !0 : $jscomp$destructuring$var2.legacyIssuer;
      var isTOTP = otp instanceof otp_TOTP;
      if (!(otp instanceof otp_HOTP || isTOTP)) {
        throw new TypeError("Invalid 'HOTP/TOTP' object");
      }
      var uri = "otpauth://" + ((isTOTP ? "totp" : "hotp") + "/");
      0 < otp.issuer.length ? ($jscomp$destructuring$var2 && (uri += encodeURIComponent(otp.issuer) + ":"), uri += encodeURIComponent(otp.label) + "?", uri += "issuer=" + encodeURIComponent(otp.issuer) + "&") : uri += encodeURIComponent(otp.label) + "?";
      uri += "secret=" + encodeURIComponent(otp.secret.b32) + ("&algorithm=" + encodeURIComponent(otp.algorithm)) + ("&digits=" + encodeURIComponent(otp.digits));
      return uri = isTOTP ? uri + ("&period=" + encodeURIComponent(otp.period)) : uri + ("&counter=" + encodeURIComponent(otp.counter));
    };
    var otp_HOTP = function($jscomp$destructuring$var4) {
      var $jscomp$destructuring$var5 = void 0 === $jscomp$destructuring$var4 ? {} : $jscomp$destructuring$var4;
      $jscomp$destructuring$var4 = void 0 === $jscomp$destructuring$var5.issuer ? "" : $jscomp$destructuring$var5.issuer;
      var label = void 0 === $jscomp$destructuring$var5.label ? "OTPAuth" : $jscomp$destructuring$var5.label, secret = void 0 === $jscomp$destructuring$var5.secret ? new secret_Secret : $jscomp$destructuring$var5.secret, algorithm = void 0 === $jscomp$destructuring$var5.algorithm ? "SHA1" : $jscomp$destructuring$var5.algorithm, digits = void 0 === $jscomp$destructuring$var5.digits ? 6 : $jscomp$destructuring$var5.digits;
      $jscomp$destructuring$var5 = void 0 === $jscomp$destructuring$var5.counter ? 0 : $jscomp$destructuring$var5.counter;
      this.issuer = $jscomp$destructuring$var4;
      this.label = label;
      this.secret = secret;
      this.algorithm = algorithm;
      this.digits = digits;
      this.counter = $jscomp$destructuring$var5;
    };
    otp_HOTP.generate = function($jscomp$destructuring$var6) {
      var digits = void 0 === $jscomp$destructuring$var6.digits ? 6 : $jscomp$destructuring$var6.digits, pad = void 0 === $jscomp$destructuring$var6.pad ? !0 : $jscomp$destructuring$var6.pad;
      $jscomp$destructuring$var6 = new Uint8Array(src_crypto.a.hmacDigest(void 0 === $jscomp$destructuring$var6.algorithm ? "SHA1" : $jscomp$destructuring$var6.algorithm, $jscomp$destructuring$var6.secret.buffer, utils.b.uint.encode(void 0 === $jscomp$destructuring$var6.counter ? 0 : $jscomp$destructuring$var6.counter)));
      var offset = $jscomp$destructuring$var6[$jscomp$destructuring$var6.byteLength - 1] & 15;
      $jscomp$destructuring$var6 = (($jscomp$destructuring$var6[offset] & 127) << 24 | ($jscomp$destructuring$var6[offset + 1] & 255) << 16 | ($jscomp$destructuring$var6[offset + 2] & 255) << 8 | $jscomp$destructuring$var6[offset + 3] & 255) % Math.pow(10, digits);
      return pad ? Array(1 + digits - String($jscomp$destructuring$var6).length).join("0") + $jscomp$destructuring$var6 : $jscomp$destructuring$var6;
    };
    otp_HOTP.prototype.generate = function($jscomp$destructuring$var8) {
      $jscomp$destructuring$var8 = void 0 === $jscomp$destructuring$var8 ? {} : $jscomp$destructuring$var8;
      var counter = void 0 === $jscomp$destructuring$var8.counter ? this.counter++ : $jscomp$destructuring$var8.counter;
      return otp_HOTP.generate({secret:this.secret, algorithm:this.algorithm, digits:this.digits, counter:counter, pad:$jscomp$destructuring$var8.pad});
    };
    otp_HOTP.validate = function($jscomp$destructuring$var10) {
      var token = $jscomp$destructuring$var10.token, secret = $jscomp$destructuring$var10.secret, algorithm = $jscomp$destructuring$var10.algorithm, counter = void 0 === $jscomp$destructuring$var10.counter ? 0 : $jscomp$destructuring$var10.counter;
      $jscomp$destructuring$var10 = void 0 === $jscomp$destructuring$var10.window ? 50 : $jscomp$destructuring$var10.window;
      for (var searchToken = Number.parseInt(token, 10), i = counter - $jscomp$destructuring$var10; i <= counter + $jscomp$destructuring$var10; ++i) {
        var generatedToken = otp_HOTP.generate({secret:secret, algorithm:algorithm, counter:i, digits:token.length, pad:!1});
        if (searchToken === generatedToken) {
          return i - counter;
        }
      }
      return null;
    };
    otp_HOTP.prototype.validate = function($jscomp$destructuring$var12) {
      return otp_HOTP.validate({token:$jscomp$destructuring$var12.token, secret:this.secret, algorithm:this.algorithm, counter:void 0 === $jscomp$destructuring$var12.counter ? this.counter : $jscomp$destructuring$var12.counter, window:$jscomp$destructuring$var12.window});
    };
    otp_HOTP.prototype.toString = function() {
      return uri_URI.stringify(this);
    };
    var otp_TOTP = function($jscomp$destructuring$var14) {
      var $jscomp$destructuring$var15 = void 0 === $jscomp$destructuring$var14 ? {} : $jscomp$destructuring$var14;
      $jscomp$destructuring$var14 = void 0 === $jscomp$destructuring$var15.issuer ? "" : $jscomp$destructuring$var15.issuer;
      var label = void 0 === $jscomp$destructuring$var15.label ? "OTPAuth" : $jscomp$destructuring$var15.label, secret = void 0 === $jscomp$destructuring$var15.secret ? new secret_Secret : $jscomp$destructuring$var15.secret, algorithm = void 0 === $jscomp$destructuring$var15.algorithm ? "SHA1" : $jscomp$destructuring$var15.algorithm, digits = void 0 === $jscomp$destructuring$var15.digits ? 6 : $jscomp$destructuring$var15.digits;
      $jscomp$destructuring$var15 = void 0 === $jscomp$destructuring$var15.period ? 30 : $jscomp$destructuring$var15.period;
      this.issuer = $jscomp$destructuring$var14;
      this.label = label;
      this.secret = secret;
      this.algorithm = algorithm;
      this.digits = digits;
      this.period = $jscomp$destructuring$var15;
    };
    otp_TOTP.generate = function($jscomp$destructuring$var16) {
      var secret = $jscomp$destructuring$var16.secret, algorithm = $jscomp$destructuring$var16.algorithm, digits = $jscomp$destructuring$var16.digits, period = void 0 === $jscomp$destructuring$var16.period ? 30 : $jscomp$destructuring$var16.period, timestamp = void 0 === $jscomp$destructuring$var16.timestamp ? Date.now() : $jscomp$destructuring$var16.timestamp;
      return otp_HOTP.generate({secret:secret, algorithm:algorithm, digits:digits, counter:Math.floor(timestamp / 1000 / period), pad:$jscomp$destructuring$var16.pad});
    };
    otp_TOTP.prototype.generate = function($jscomp$destructuring$var18) {
      $jscomp$destructuring$var18 = void 0 === $jscomp$destructuring$var18 ? {} : $jscomp$destructuring$var18;
      var timestamp = void 0 === $jscomp$destructuring$var18.timestamp ? Date.now() : $jscomp$destructuring$var18.timestamp;
      return otp_TOTP.generate({secret:this.secret, algorithm:this.algorithm, digits:this.digits, period:this.period, timestamp:timestamp, pad:$jscomp$destructuring$var18.pad});
    };
    otp_TOTP.validate = function($jscomp$destructuring$var20) {
      var token = $jscomp$destructuring$var20.token, secret = $jscomp$destructuring$var20.secret, algorithm = $jscomp$destructuring$var20.algorithm, period = void 0 === $jscomp$destructuring$var20.period ? 30 : $jscomp$destructuring$var20.period, timestamp = void 0 === $jscomp$destructuring$var20.timestamp ? Date.now() : $jscomp$destructuring$var20.timestamp;
      return otp_HOTP.validate({token:token, secret:secret, algorithm:algorithm, counter:Math.floor(timestamp / 1000 / period), window:$jscomp$destructuring$var20.window});
    };
    otp_TOTP.prototype.validate = function($jscomp$destructuring$var22) {
      return otp_TOTP.validate({token:$jscomp$destructuring$var22.token, secret:this.secret, algorithm:this.algorithm, period:this.period, timestamp:$jscomp$destructuring$var22.timestamp, window:$jscomp$destructuring$var22.window});
    };
    otp_TOTP.prototype.toString = function() {
      return uri_URI.stringify(this);
    };
    __webpack_require__.d(__webpack_exports__, "version", function() {
      return "3.2.5";
    });
    __webpack_require__.d(__webpack_exports__, "HOTP", function() {
      return otp_HOTP;
    });
    __webpack_require__.d(__webpack_exports__, "TOTP", function() {
      return otp_TOTP;
    });
    __webpack_require__.d(__webpack_exports__, "URI", function() {
      return uri_URI;
    });
    __webpack_require__.d(__webpack_exports__, "Secret", function() {
      return secret_Secret;
    });
    __webpack_require__.d(__webpack_exports__, "Utils", function() {
      return utils.b;
    });
  }]);
});
}).call(this || window)

//# sourceMappingURL=otpauth.js.map