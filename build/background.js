/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _tabGroup = __webpack_require__(1);

	var _tabGroup2 = _interopRequireDefault(_tabGroup);

	var _constants = __webpack_require__(26);

	var _constants2 = _interopRequireDefault(_constants);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Creates a new snoozed group of tabs, saved in an IndexedDB store
	 */
	function saveTabs(tabs) {
	  return new Promise(function (resolve, reject) {
	    var group = new _tabGroup2.default({ tabs: tabs });

	    group.save().then(resolve).catch(reject);
	  });
	}

	/**
	 * Closes a collection of tabs using Chrome's tabs.remove API
	 */
	function closeTabs(tabs) {
	  return new Promise(function (resolve, reject) {
	    chrome.tabs.remove(tabs.map(function (t) {
	      return t.id;
	    }), function () {
	      resolve(tabs);
	    });
	  });
	}

	/**
	 * Closes a specific window using Chrome's windows.remove API
	 */
	function closeWindow(win) {
	  return new Promise(function (resolve, reject) {
	    chrome.windows.remove(win.id, function () {
	      resolve(win);
	    });
	  });
	}

	chrome.browserAction.onClicked.addListener(function (tab) {
	  var windowId = tab.windowId;

	  // Ask Chrome for all highlighted tabs. If only one tab is returned, then
	  // close the whole window.
	  //
	  // Chrome automatically marks the current tab in a window as highlighted, so
	  // this corresponds to someone clicking the browser action without
	  // highlighting any tabs.
	  chrome.tabs.query({ windowId: windowId, highlighted: true }, function (tabs) {

	    if (tabs.length > 1) {
	      // Save and close selected tabs
	      saveTabs(tabs).then(function (group) {
	        return closeTabs(group.getTabs());
	      });
	    } else {
	      // Save and close the window.
	      //
	      // The window is closed rather than its collection of tabs so that we can
	      // support Chrome's re-open behaviour correctly.
	      chrome.windows.get(windowId, { populate: true }, function (win) {
	        saveTabs(win.tabs).then(function () {
	          closeWindow(win);
	        });
	      });
	    }
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.TabGroup = undefined;

	var _nodeUuid = __webpack_require__(2);

	var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

	var _constants = __webpack_require__(26);

	var _constants2 = _interopRequireDefault(_constants);

	var _database = __webpack_require__(27);

	var _database2 = _interopRequireDefault(_database);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Represents a group of suspended tabs, backed by IndexedDB
	 */

	var TabGroup = exports.TabGroup = function () {
	  function TabGroup(_ref) {
	    var _ref$uuid = _ref.uuid;
	    var uuid = _ref$uuid === undefined ? _nodeUuid2.default.v4() : _ref$uuid;
	    var name = _ref.name;
	    var tabs = _ref.tabs;

	    _classCallCheck(this, TabGroup);

	    this.uuid = uuid;
	    this.name = name;
	    this.tabs = tabs;
	  }

	  /**
	   * Return the tabs that this group holds
	   */

	  _createClass(TabGroup, [{
	    key: 'getTabs',
	    value: function getTabs() {
	      return this.tabs;
	    }

	    /**
	     * Saves the tab group to the store, resolving with the tab group.
	     * If successful, broadcasts a change event.
	     */

	  }, {
	    key: 'save',
	    value: function save() {
	      var _this = this;

	      var db = new _database2.default();
	      db.open();

	      return new Promise(function (resolve, reject) {
	        db.groups.add({
	          uuid: _this.uuid,
	          name: _this.name,
	          tabs: _this.tabs
	        }).then(function () {
	          chrome.runtime.sendMessage(_constants2.default.CHANGE);
	          resolve(_this);
	        }).catch(function (err) {
	          return reject(err);
	        });
	      });
	    }

	    /**
	     * Destroys the tab group, resolving with the now-deleted tab group
	     * If successful, broadcasts a change event.
	     */

	  }, {
	    key: 'destroy',
	    value: function destroy() {
	      var _this2 = this;

	      var db = new _database2.default();
	      db.open();

	      return new Promise(function (resolve, reject) {
	        db.groups.delete(_this2.uuid).then(function () {
	          chrome.runtime.sendMessage(_constants2.default.CHANGE);
	          resolve(_this2);
	        }).catch(function (err) {
	          return reject(err);
	        });
	      });
	    }
	  }]);

	  return TabGroup;
	}();

	exports.default = TabGroup;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(Buffer) {//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	/*global window, require, define */
	(function(_window) {
	  'use strict';

	  // Unique ID creation requires a high quality random # generator.  We feature
	  // detect to determine the best RNG source, normalizing to a function that
	  // returns 128-bits of randomness, since that's what's usually required
	  var _rng, _mathRNG, _nodeRNG, _whatwgRNG, _previousRoot;

	  function setupBrowser() {
	    // Allow for MSIE11 msCrypto
	    var _crypto = _window.crypto || _window.msCrypto;

	    if (!_rng && _crypto && _crypto.getRandomValues) {
	      // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	      //
	      // Moderately fast, high quality
	      try {
	        var _rnds8 = new Uint8Array(16);
	        _whatwgRNG = _rng = function whatwgRNG() {
	          _crypto.getRandomValues(_rnds8);
	          return _rnds8;
	        };
	        _rng();
	      } catch(e) {}
	    }

	    if (!_rng) {
	      // Math.random()-based (RNG)
	      //
	      // If all else fails, use Math.random().  It's fast, but is of unspecified
	      // quality.
	      var  _rnds = new Array(16);
	      _mathRNG = _rng = function() {
	        for (var i = 0, r; i < 16; i++) {
	          if ((i & 0x03) === 0) { r = Math.random() * 0x100000000; }
	          _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	        }

	        return _rnds;
	      };
	      if ('undefined' !== typeof console && console.warn) {
	        console.warn("[SECURITY] node-uuid: crypto not usable, falling back to insecure Math.random()");
	      }
	    }
	  }

	  function setupNode() {
	    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
	    //
	    // Moderately fast, high quality
	    if (true) {
	      try {
	        var _rb = __webpack_require__(7).randomBytes;
	        _nodeRNG = _rng = _rb && function() {return _rb(16);};
	        _rng();
	      } catch(e) {}
	    }
	  }

	  if (_window) {
	    setupBrowser();
	  } else {
	    setupNode();
	  }

	  // Buffer class to use
	  var BufferClass = ('function' === typeof Buffer) ? Buffer : Array;

	  // Maps for number <-> hex string conversion
	  var _byteToHex = [];
	  var _hexToByte = {};
	  for (var i = 0; i < 256; i++) {
	    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	    _hexToByte[_byteToHex[i]] = i;
	  }

	  // **`parse()` - Parse a UUID into it's component bytes**
	  function parse(s, buf, offset) {
	    var i = (buf && offset) || 0, ii = 0;

	    buf = buf || [];
	    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	      if (ii < 16) { // Don't overflow!
	        buf[i + ii++] = _hexToByte[oct];
	      }
	    });

	    // Zero out remaining bytes if string was short
	    while (ii < 16) {
	      buf[i + ii++] = 0;
	    }

	    return buf;
	  }

	  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	  function unparse(buf, offset) {
	    var i = offset || 0, bth = _byteToHex;
	    return  bth[buf[i++]] + bth[buf[i++]] +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] +
	            bth[buf[i++]] + bth[buf[i++]] +
	            bth[buf[i++]] + bth[buf[i++]];
	  }

	  // **`v1()` - Generate time-based UUID**
	  //
	  // Inspired by https://github.com/LiosK/UUID.js
	  // and http://docs.python.org/library/uuid.html

	  // random #'s we need to init node and clockseq
	  var _seedBytes = _rng();

	  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	  var _nodeId = [
	    _seedBytes[0] | 0x01,
	    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	  ];

	  // Per 4.2.2, randomize (14 bit) clockseq
	  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	  // Previous uuid creation time
	  var _lastMSecs = 0, _lastNSecs = 0;

	  // See https://github.com/broofa/node-uuid for API details
	  function v1(options, buf, offset) {
	    var i = buf && offset || 0;
	    var b = buf || [];

	    options = options || {};

	    var clockseq = (options.clockseq != null) ? options.clockseq : _clockseq;

	    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	    var msecs = (options.msecs != null) ? options.msecs : new Date().getTime();

	    // Per 4.2.1.2, use count of uuid's generated during the current clock
	    // cycle to simulate higher resolution clock
	    var nsecs = (options.nsecs != null) ? options.nsecs : _lastNSecs + 1;

	    // Time since last uuid creation (in msecs)
	    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	    // Per 4.2.1.2, Bump clockseq on clock regression
	    if (dt < 0 && options.clockseq == null) {
	      clockseq = clockseq + 1 & 0x3fff;
	    }

	    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	    // time interval
	    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
	      nsecs = 0;
	    }

	    // Per 4.2.1.2 Throw error if too many uuids are requested
	    if (nsecs >= 10000) {
	      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	    }

	    _lastMSecs = msecs;
	    _lastNSecs = nsecs;
	    _clockseq = clockseq;

	    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	    msecs += 12219292800000;

	    // `time_low`
	    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	    b[i++] = tl >>> 24 & 0xff;
	    b[i++] = tl >>> 16 & 0xff;
	    b[i++] = tl >>> 8 & 0xff;
	    b[i++] = tl & 0xff;

	    // `time_mid`
	    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	    b[i++] = tmh >>> 8 & 0xff;
	    b[i++] = tmh & 0xff;

	    // `time_high_and_version`
	    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	    b[i++] = tmh >>> 16 & 0xff;

	    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	    b[i++] = clockseq >>> 8 | 0x80;

	    // `clock_seq_low`
	    b[i++] = clockseq & 0xff;

	    // `node`
	    var node = options.node || _nodeId;
	    for (var n = 0; n < 6; n++) {
	      b[i + n] = node[n];
	    }

	    return buf ? buf : unparse(b);
	  }

	  // **`v4()` - Generate random UUID**

	  // See https://github.com/broofa/node-uuid for API details
	  function v4(options, buf, offset) {
	    // Deprecated - 'format' argument, as supported in v1.2
	    var i = buf && offset || 0;

	    if (typeof(options) === 'string') {
	      buf = (options === 'binary') ? new BufferClass(16) : null;
	      options = null;
	    }
	    options = options || {};

	    var rnds = options.random || (options.rng || _rng)();

	    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	    rnds[6] = (rnds[6] & 0x0f) | 0x40;
	    rnds[8] = (rnds[8] & 0x3f) | 0x80;

	    // Copy bytes to buffer, if provided
	    if (buf) {
	      for (var ii = 0; ii < 16; ii++) {
	        buf[i + ii] = rnds[ii];
	      }
	    }

	    return buf || unparse(rnds);
	  }

	  // Export public API
	  var uuid = v4;
	  uuid.v1 = v1;
	  uuid.v4 = v4;
	  uuid.parse = parse;
	  uuid.unparse = unparse;
	  uuid.BufferClass = BufferClass;
	  uuid._rng = _rng;
	  uuid._mathRNG = _mathRNG;
	  uuid._nodeRNG = _nodeRNG;
	  uuid._whatwgRNG = _whatwgRNG;

	  if (('undefined' !== typeof module) && module.exports) {
	    // Publish as node.js module
	    module.exports = uuid;
	  } else if (true) {
	    // Publish as AMD module
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {return uuid;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


	  } else {
	    // Publish as global (in browsers)
	    _previousRoot = _window.uuid;

	    // **`noConflict()` - (browser only) to reset global 'uuid' var**
	    uuid.noConflict = function() {
	      _window.uuid = _previousRoot;
	      return uuid;
	    };

	    _window.uuid = uuid;
	  }
	})('undefined' !== typeof window ? window : null);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(4)
	var ieee754 = __webpack_require__(5)
	var isArray = __webpack_require__(6)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 5 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(8)

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = __webpack_require__(10)

	exports.createHmac = __webpack_require__(23)

	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}

	var p = __webpack_require__(24)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync


	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(9)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(3).Buffer))

/***/ },
/* 9 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(11)

	var md5 = toConstructor(__webpack_require__(20))
	var rmd160 = toConstructor(__webpack_require__(22))

	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}

	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}

	var Buffer = __webpack_require__(3).Buffer
	var Hash   = __webpack_require__(12)(Buffer)

	exports.sha1 = __webpack_require__(13)(Buffer, Hash)
	exports.sha256 = __webpack_require__(18)(Buffer, Hash)
	exports.sha512 = __webpack_require__(19)(Buffer, Hash)


/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function (Buffer) {

	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }

	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }

	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }

	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block

	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)

	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }

	      s += ch
	      f += ch

	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s

	    return this
	  }

	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8

	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80

	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)

	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }

	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)

	    var hash = this._update(this._block) || this._hash()

	    return enc ? hash.toString(enc) : hash
	  }

	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }

	  return Hash
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(14).inherits

	module.exports = function (Buffer, Hash) {

	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0

	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

	  var POOL = []

	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()

	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)

	    this._h = null
	    this.init()
	  }

	  inherits(Sha1, Hash)

	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0

	    Hash.prototype.init.call(this)
	    return this
	  }

	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {

	    var a, b, c, d, e, _a, _b, _c, _d, _e

	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e

	    var w = this._w

	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )

	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }

	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }

	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }

	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }

	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }

	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }

	  return Sha1
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(16);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(17);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(15)))

/***/ },
/* 15 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(14).inherits

	module.exports = function (Buffer, Hash) {

	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]

	  var W = new Array(64)

	  function Sha256() {
	    this.init()

	    this._w = W //new Array(64)

	    Hash.call(this, 16*4, 14*4)
	  }

	  inherits(Sha256, Hash)

	  Sha256.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }

	  function R (X, n) {
	    return (X >>> n);
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }

	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }

	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }

	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }

	  Sha256.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }

	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0

	  };

	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)

	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)

	    return H
	  }

	  return Sha256

	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(14).inherits

	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]

	  var W = new Array(160)

	  function Sha512() {
	    this.init()
	    this._w = W

	    Hash.call(this, 128, 112)
	  }

	  inherits(Sha512, Hash)

	  Sha512.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  Sha512.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0

	    for (var i = 0; i < 80; i++) {
	      var j = i * 2

	      var Wi, Wil

	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]

	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]

	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

	        W[j] = Wi
	        W[j + 1] = Wil
	      }

	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)

	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]

	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)

	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }

	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0

	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }

	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)

	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }

	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)

	    return H
	  }

	  return Sha512

	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(21);

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};

	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};

	var processBlock = function (H, M, offset) {

	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];

	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }

	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;

	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;

	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};

	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}

	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}

	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}

	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}

	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}

	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}

	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');

	  var m = bytesToWords(message);

	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;

	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );

	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }

	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];

	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }

	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(10)

	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)

	module.exports = Hmac

	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg

	  var blocksize = (alg === 'sha512') ? 128 : 64

	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)

	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = createHash(alg).update(ipad)
	}

	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}

	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(25)

	module.exports = function (crypto, exports) {
	  exports = exports || {}

	  var exported = pbkdf2Export(crypto)

	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync

	  return exports
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }

	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')

	    setTimeout(function() {
	      var result

	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }

	      callback(undefined, result)
	    })
	  }

	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')

	    if (iterations < 0)
	      throw new TypeError('Bad iterations')

	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')

	    if (keylen < 0)
	      throw new TypeError('Bad key length')

	    digest = digest || 'sha1'

	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)

	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)

	      var U = crypto.createHmac(digest, password).update(block1).digest()

	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen

	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }

	      U.copy(T, 0, 0, hLen)

	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()

	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }

	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }

	    return DK
	  }

	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  CHANGE: '__change__'
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Database = undefined;

	var _dexie = __webpack_require__(28);

	var _dexie2 = _interopRequireDefault(_dexie);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Database = exports.Database = function (_Dexie) {
	  _inherits(Database, _Dexie);

	  function Database() {
	    _classCallCheck(this, Database);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Database).call(this, Database.DB_NAME));

	    _this.version(1).stores({
	      groups: 'uuid' // indexed primary key
	    });
	    return _this;
	  }

	  return Database;
	}(_dexie2.default);

	Database.DB_NAME = 'tab-sleeper';
	exports.default = Database;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(setImmediate) {/* A Minimalistic Wrapper for IndexedDB
	   ====================================

	   By David Fahlander, david.fahlander@gmail.com

	   Version 1.2.0 - September 22, 2015.

	   Tested successfully on Chrome, Opera, Firefox, Edge, and IE.

	   Official Website: www.dexie.com

	   Licensed under the Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
	*/
	(function (global, publish, undefined) {

	    "use strict";

	    function extend(obj, extension) {
	        if (typeof extension !== 'object') extension = extension(); // Allow to supply a function returning the extension. Useful for simplifying private scopes.
	        Object.keys(extension).forEach(function (key) {
	            obj[key] = extension[key];
	        });
	        return obj;
	    }

	    function derive(Child) {
	        return {
	            from: function (Parent) {
	                Child.prototype = Object.create(Parent.prototype);
	                Child.prototype.constructor = Child;
	                return {
	                    extend: function (extension) {
	                        extend(Child.prototype, typeof extension !== 'object' ? extension(Parent.prototype) : extension);
	                    }
	                };
	            }
	        };
	    }

	    function override(origFunc, overridedFactory) {
	        return overridedFactory(origFunc);
	    }

	    function Dexie(dbName, options) {
	        /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
	        var addons = (options && options.addons) || Dexie.addons;
	        // Resolve all external dependencies:
	        var deps = Dexie.dependencies;
	        var indexedDB = deps.indexedDB,
	            IDBKeyRange = deps.IDBKeyRange,
	            IDBTransaction = deps.IDBTransaction;

	        var DOMError = deps.DOMError,
	            TypeError = deps.TypeError,
	            Error = deps.Error;

	        var globalSchema = this._dbSchema = {};
	        var versions = [];
	        var dbStoreNames = [];
	        var allTables = {};
	        var notInTransFallbackTables = {};
	        ///<var type="IDBDatabase" />
	        var idbdb = null; // Instance of IDBDatabase
	        var db_is_blocked = true;
	        var dbOpenError = null;
	        var isBeingOpened = false;
	        var READONLY = "readonly", READWRITE = "readwrite";
	        var db = this;
	        var pausedResumeables = [];
	        var autoSchema = true;
	        var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn();

	        function init() {
	            // If browser (not node.js or other), subscribe to versionchange event and reload page
	            db.on("versionchange", function (ev) {
	                // Default behavior for versionchange event is to close database connection.
	                // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
	                // Let's not block the other window from making it's delete() or open() call.
	                db.close();
	                db.on('error').fire(new Error("Database version changed by other database connection."));
	                // In many web applications, it would be recommended to force window.reload()
	                // when this event occurs. Do do that, subscribe to the versionchange event
	                // and call window.location.reload(true);
	            });
	        }

	        //
	        //
	        //
	        // ------------------------- Versioning Framework---------------------------
	        //
	        //
	        //

	        this.version = function (versionNumber) {
	            /// <param name="versionNumber" type="Number"></param>
	            /// <returns type="Version"></returns>
	            if (idbdb) throw new Error("Cannot add version when database is open");
	            this.verno = Math.max(this.verno, versionNumber);
	            var versionInstance = versions.filter(function (v) { return v._cfg.version === versionNumber; })[0];
	            if (versionInstance) return versionInstance;
	            versionInstance = new Version(versionNumber);
	            versions.push(versionInstance);
	            versions.sort(lowerVersionFirst);
	            return versionInstance;
	        }; 

	        function Version(versionNumber) {
	            this._cfg = {
	                version: versionNumber,
	                storesSource: null,
	                dbschema: {},
	                tables: {},
	                contentUpgrade: null
	            }; 
	            this.stores({}); // Derive earlier schemas by default.
	        }

	        extend(Version.prototype, {
	            stores: function (stores) {
	                /// <summary>
	                ///   Defines the schema for a particular version
	                /// </summary>
	                /// <param name="stores" type="Object">
	                /// Example: <br/>
	                ///   {users: "id++,first,last,&amp;username,*email", <br/>
	                ///   passwords: "id++,&amp;username"}<br/>
	                /// <br/>
	                /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
	                /// Special characters:<br/>
	                ///  "&amp;"  means unique key, <br/>
	                ///  "*"  means value is multiEntry, <br/>
	                ///  "++" means auto-increment and only applicable for primary key <br/>
	                /// </param>
	                this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;

	                // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
	                var storesSpec = {};
	                versions.forEach(function (version) { // 'versions' is always sorted by lowest version first.
	                    extend(storesSpec, version._cfg.storesSource);
	                });

	                var dbschema = (this._cfg.dbschema = {});
	                this._parseStoresSpec(storesSpec, dbschema);
	                // Update the latest schema to this version
	                // Update API
	                globalSchema = db._dbSchema = dbschema;
	                removeTablesApi([allTables, db, notInTransFallbackTables]);
	                setApiOnPlace([notInTransFallbackTables], tableNotInTransaction, Object.keys(dbschema), READWRITE, dbschema);
	                setApiOnPlace([allTables, db, this._cfg.tables], db._transPromiseFactory, Object.keys(dbschema), READWRITE, dbschema, true);
	                dbStoreNames = Object.keys(dbschema);
	                return this;
	            },
	            upgrade: function (upgradeFunction) {
	                /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
	                var self = this;
	                fakeAutoComplete(function () {
	                    upgradeFunction(db._createTransaction(READWRITE, Object.keys(self._cfg.dbschema), self._cfg.dbschema));// BUGBUG: No code completion for prev version's tables wont appear.
	                });
	                this._cfg.contentUpgrade = upgradeFunction;
	                return this;
	            },
	            _parseStoresSpec: function (stores, outSchema) {
	                Object.keys(stores).forEach(function (tableName) {
	                    if (stores[tableName] !== null) {
	                        var instanceTemplate = {};
	                        var indexes = parseIndexSyntax(stores[tableName]);
	                        var primKey = indexes.shift();
	                        if (primKey.multi) throw new Error("Primary key cannot be multi-valued");
	                        if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
	                        indexes.forEach(function (idx) {
	                            if (idx.auto) throw new Error("Only primary key can be marked as autoIncrement (++)");
	                            if (!idx.keyPath) throw new Error("Index must have a name and cannot be an empty string");
	                            setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () { return ""; }) : "");
	                        });
	                        outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
	                    }
	                });
	            }
	        });

	        function runUpgraders(oldVersion, idbtrans, reject, openReq) {
	            if (oldVersion === 0) {
	                //globalSchema = versions[versions.length - 1]._cfg.dbschema;
	                // Create tables:
	                Object.keys(globalSchema).forEach(function (tableName) {
	                    createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
	                });
	                // Populate data
	                var t = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
	                t.idbtrans = idbtrans;
	                t.idbtrans.onerror = eventRejectHandler(reject, ["populating database"]);
	                t.on('error').subscribe(reject);
	                Promise.newPSD(function () {
	                    Promise.PSD.trans = t;
	                    try {
	                        db.on("populate").fire(t);
	                    } catch (err) {
	                        openReq.onerror = idbtrans.onerror = function (ev) { ev.preventDefault(); };  // Prohibit AbortError fire on db.on("error") in Firefox.
	                        try { idbtrans.abort(); } catch (e) { }
	                        idbtrans.db.close();
	                        reject(err);
	                    }
	                });
	            } else {
	                // Upgrade version to version, step-by-step from oldest to newest version.
	                // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
	                var queue = [];
	                var oldVersionStruct = versions.filter(function (version) { return version._cfg.version === oldVersion; })[0];
	                if (!oldVersionStruct) throw new Error("Dexie specification of currently installed DB version is missing");
	                globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
	                var anyContentUpgraderHasRun = false;

	                var versToRun = versions.filter(function (v) { return v._cfg.version > oldVersion; });
	                versToRun.forEach(function (version) {
	                    /// <param name="version" type="Version"></param>
	                    var oldSchema = globalSchema;
	                    var newSchema = version._cfg.dbschema;
	                    adjustToExistingIndexNames(oldSchema, idbtrans);
	                    adjustToExistingIndexNames(newSchema, idbtrans);
	                    globalSchema = db._dbSchema = newSchema;
	                    {
	                        var diff = getSchemaDiff(oldSchema, newSchema);
	                        diff.add.forEach(function (tuple) {
	                            queue.push(function (idbtrans, cb) {
	                                createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
	                                cb();
	                            });
	                        });
	                        diff.change.forEach(function (change) {
	                            if (change.recreate) {
	                                throw new Error("Not yet support for changing primary key");
	                            } else {
	                                queue.push(function (idbtrans, cb) {
	                                    var store = idbtrans.objectStore(change.name);
	                                    change.add.forEach(function (idx) {
	                                        addIndex(store, idx);
	                                    });
	                                    change.change.forEach(function (idx) {
	                                        store.deleteIndex(idx.name);
	                                        addIndex(store, idx);
	                                    });
	                                    change.del.forEach(function (idxName) {
	                                        store.deleteIndex(idxName);
	                                    });
	                                    cb();
	                                });
	                            }
	                        });
	                        if (version._cfg.contentUpgrade) {
	                            queue.push(function (idbtrans, cb) {
	                                anyContentUpgraderHasRun = true;
	                                var t = db._createTransaction(READWRITE, [].slice.call(idbtrans.db.objectStoreNames, 0), newSchema);
	                                t.idbtrans = idbtrans;
	                                var uncompletedRequests = 0;
	                                t._promise = override(t._promise, function (orig_promise) {
	                                    return function (mode, fn, writeLock) {
	                                        ++uncompletedRequests;
	                                        function proxy(fn) {
	                                            return function () {
	                                                fn.apply(this, arguments);
	                                                if (--uncompletedRequests === 0) cb(); // A called db operation has completed without starting a new operation. The flow is finished, now run next upgrader.
	                                            }
	                                        }
	                                        return orig_promise.call(this, mode, function (resolve, reject, trans) {
	                                            arguments[0] = proxy(resolve);
	                                            arguments[1] = proxy(reject);
	                                            fn.apply(this, arguments);
	                                        }, writeLock);
	                                    };
	                                });
	                                idbtrans.onerror = eventRejectHandler(reject, ["running upgrader function for version", version._cfg.version]);
	                                t.on('error').subscribe(reject);
	                                version._cfg.contentUpgrade(t);
	                                if (uncompletedRequests === 0) cb(); // contentUpgrade() didnt call any db operations at all.
	                            });
	                        }
	                        if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug()) { // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
	                            queue.push(function (idbtrans, cb) {
	                                // Delete old tables
	                                deleteRemovedTables(newSchema, idbtrans);
	                                cb();
	                            });
	                        }
	                    }
	                });

	                // Now, create a queue execution engine
	                var runNextQueuedFunction = function () {
	                    try {
	                        if (queue.length)
	                            queue.shift()(idbtrans, runNextQueuedFunction);
	                        else
	                            createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
	                    } catch (err) {
	                        openReq.onerror = idbtrans.onerror = function (ev) { ev.preventDefault(); };  // Prohibit AbortError fire on db.on("error") in Firefox.
	                        try { idbtrans.abort(); } catch(e) {}
	                        idbtrans.db.close();
	                        reject(err);
	                    }
	                };
	                runNextQueuedFunction();
	            }
	        }

	        function getSchemaDiff(oldSchema, newSchema) {
	            var diff = {
	                del: [], // Array of table names
	                add: [], // Array of [tableName, newDefinition]
	                change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
	            };
	            for (var table in oldSchema) {
	                if (!newSchema[table]) diff.del.push(table);
	            }
	            for (var table in newSchema) {
	                var oldDef = oldSchema[table],
	                    newDef = newSchema[table];
	                if (!oldDef) diff.add.push([table, newDef]);
	                else {
	                    var change = {
	                        name: table,
	                        def: newSchema[table],
	                        recreate: false,
	                        del: [],
	                        add: [],
	                        change: []
	                    };
	                    if (oldDef.primKey.src !== newDef.primKey.src) {
	                        // Primary key has changed. Remove and re-add table.
	                        change.recreate = true;
	                        diff.change.push(change);
	                    } else {
	                        var oldIndexes = oldDef.indexes.reduce(function (prev, current) { prev[current.name] = current; return prev; }, {});
	                        var newIndexes = newDef.indexes.reduce(function (prev, current) { prev[current.name] = current; return prev; }, {});
	                        for (var idxName in oldIndexes) {
	                            if (!newIndexes[idxName]) change.del.push(idxName);
	                        }
	                        for (var idxName in newIndexes) {
	                            var oldIdx = oldIndexes[idxName],
	                                newIdx = newIndexes[idxName];
	                            if (!oldIdx) change.add.push(newIdx);
	                            else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
	                        }
	                        if (change.recreate || change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
	                            diff.change.push(change);
	                        }
	                    }
	                }
	            }
	            return diff;
	        }

	        function createTable(idbtrans, tableName, primKey, indexes) {
	            /// <param name="idbtrans" type="IDBTransaction"></param>
	            var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
	            indexes.forEach(function (idx) { addIndex(store, idx); });
	            return store;
	        }

	        function createMissingTables(newSchema, idbtrans) {
	            Object.keys(newSchema).forEach(function (tableName) {
	                if (!idbtrans.db.objectStoreNames.contains(tableName)) {
	                    createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
	                }
	            });
	        }

	        function deleteRemovedTables(newSchema, idbtrans) {
	            for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
	                var storeName = idbtrans.db.objectStoreNames[i];
	                if (newSchema[storeName] === null || newSchema[storeName] === undefined) {
	                    idbtrans.db.deleteObjectStore(storeName);
	                }
	            }
	        }

	        function addIndex(store, idx) {
	            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
	        }

	        //
	        //
	        //      Dexie Protected API
	        //
	        //

	        this._allTables = allTables;

	        this._tableFactory = function createTable(mode, tableSchema, transactionPromiseFactory) {
	            /// <param name="tableSchema" type="TableSchema"></param>
	            if (mode === READONLY)
	                return new Table(tableSchema.name, transactionPromiseFactory, tableSchema, Collection);
	            else
	                return new WriteableTable(tableSchema.name, transactionPromiseFactory, tableSchema);
	        }; 

	        this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
	            return new Transaction(mode, storeNames, dbschema, parentTransaction);
	        }; 

	        function tableNotInTransaction(mode, storeNames) {
	            throw new Error("Table " + storeNames[0] + " not part of transaction. Original Scope Function Source: " + Dexie.Promise.PSD.trans.scopeFunc.toString());
	        }

	        this._transPromiseFactory = function transactionPromiseFactory(mode, storeNames, fn) { // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
	            if (db_is_blocked && (!Promise.PSD || !Promise.PSD.letThrough)) {
	                // Database is paused. Wait til resumed.
	                var blockedPromise = new Promise(function (resolve, reject) {
	                    pausedResumeables.push({
	                        resume: function () {
	                            var p = db._transPromiseFactory(mode, storeNames, fn);
	                            blockedPromise.onuncatched = p.onuncatched;
	                            p.then(resolve, reject);
	                        }
	                    });
	                });
	                return blockedPromise;
	            } else {
	                var trans = db._createTransaction(mode, storeNames, globalSchema);
	                return trans._promise(mode, function (resolve, reject) {
	                    // An uncatched operation will bubble to this anonymous transaction. Make sure
	                    // to continue bubbling it up to db.on('error'):
	                    trans.error(function (err) {
	                        db.on('error').fire(err);
	                    });
	                    fn(function (value) {
	                        // Instead of resolving value directly, wait with resolving it until transaction has completed.
	                        // Otherwise the data would not be in the DB if requesting it in the then() operation.
	                        // Specifically, to ensure that the following expression will work:
	                        //
	                        //   db.friends.put({name: "Arne"}).then(function () {
	                        //       db.friends.where("name").equals("Arne").count(function(count) {
	                        //           assert (count === 1);
	                        //       });
	                        //   });
	                        //
	                        trans.complete(function () {
	                            resolve(value);
	                        });
	                    }, reject, trans);
	                });
	            }
	        }; 

	        this._whenReady = function (fn) {
	            if (!fake && db_is_blocked && (!Promise.PSD || !Promise.PSD.letThrough)) {
	                return new Promise(function (resolve, reject) {
	                    pausedResumeables.push({
	                        resume: function () {
	                            fn(resolve, reject);
	                        }
	                    });
	                });
	            }
	            return new Promise(fn);
	        }; 

	        //
	        //
	        //
	        //
	        //      Dexie API
	        //
	        //
	        //

	        this.verno = 0;

	        this.open = function () {
	            return new Promise(function (resolve, reject) {
	                if (fake) resolve(db);
	                if (idbdb || isBeingOpened) throw new Error("Database already opened or being opened");
	                var req, dbWasCreated = false;
	                function openError(err) {
	                    try { req.transaction.abort(); } catch (e) { }
	                    /*if (dbWasCreated) {
	                        // Workaround for issue with some browsers. Seem not to be needed though.
	                        // Unit test "Issue#100 - not all indexes are created" works without it on chrome,FF,opera and IE.
	                        idbdb.close();
	                        indexedDB.deleteDatabase(db.name); 
	                    }*/
	                    isBeingOpened = false;
	                    dbOpenError = err;
	                    db_is_blocked = false;
	                    reject(dbOpenError);
	                    pausedResumeables.forEach(function (resumable) {
	                        // Resume all stalled operations. They will fail once they wake up.
	                        resumable.resume();
	                    });
	                    pausedResumeables = [];
	                }
	                try {
	                    dbOpenError = null;
	                    isBeingOpened = true;

	                    // Make sure caller has specified at least one version
	                    if (versions.length > 0) autoSchema = false;

	                    // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE: 
	                    // IE fails when deleting objectStore after reading from it.
	                    // A future version of Dexie.js will stopover an intermediate version to workaround this.
	                    // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
	                    if (!indexedDB) throw new Error("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using Safari, make sure to include indexedDB polyfill.");
	                    req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
	                    if (!req) throw new Error("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134 
	                    req.onerror = eventRejectHandler(openError, ["opening database", dbName]);
	                    req.onblocked = function (ev) {
	                        db.on("blocked").fire(ev);
	                    }; 
	                    req.onupgradeneeded = trycatch (function (e) {
	                        if (autoSchema && !db._allowEmptyDB) { // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
	                            // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
	                            // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we 
	                            // do not create a new database by accident here.
	                            req.onerror = function (event) { event.preventDefault(); }; // Prohibit onabort error from firing before we're done!
	                            req.transaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
	                            // Close database and delete it.
	                            req.result.close();
	                            var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
	                            delreq.onsuccess = delreq.onerror = function () {
	                                openError(new Error("Database '" + dbName + "' doesnt exist"));
	                            }; 
	                        } else {
	                            if (e.oldVersion === 0) dbWasCreated = true;
	                            req.transaction.onerror = eventRejectHandler(openError);
	                            var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
	                            runUpgraders(oldVer / 10, req.transaction, openError, req);
	                        }
	                    }, openError);
	                    req.onsuccess = trycatch(function (e) {
	                        isBeingOpened = false;
	                        idbdb = req.result;
	                        if (autoSchema) readGlobalSchema();
	                        else if (idbdb.objectStoreNames.length > 0)
	                            adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
	                        idbdb.onversionchange = db.on("versionchange").fire; // Not firing it here, just setting the function callback to any registered subscriber.
	                        if (!hasNativeGetDatabaseNames) {
	                            // Update localStorage with list of database names
	                            globalDatabaseList(function (databaseNames) {
	                                if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
	                            });
	                        }
	                        // Now, let any subscribers to the on("ready") fire BEFORE any other db operations resume!
	                        // If an the on("ready") subscriber returns a Promise, we will wait til promise completes or rejects before 
	                        Promise.newPSD(function () {
	                            Promise.PSD.letThrough = true; // Set a Promise-Specific Data property informing that onready is firing. This will make db._whenReady() let the subscribers use the DB but block all others (!). Quite cool ha?
	                            try {
	                                var res = db.on.ready.fire();
	                                if (res && typeof res.then === 'function') {
	                                    // If on('ready') returns a promise, wait for it to complete and then resume any pending operations.
	                                    res.then(resume, function (err) {
	                                        idbdb.close();
	                                        idbdb = null;
	                                        openError(err);
	                                    });
	                                } else {
	                                    asap(resume); // Cannot call resume directly because then the pauseResumables would inherit from our PSD scope.
	                                }
	                            } catch (e) {
	                                openError(e);
	                            }

	                            function resume() {
	                                db_is_blocked = false;
	                                pausedResumeables.forEach(function (resumable) {
	                                    // If anyone has made operations on a table instance before the db was opened, the operations will start executing now.
	                                    resumable.resume();
	                                });
	                                pausedResumeables = [];
	                                resolve(db);
	                            }
	                        });
	                    }, openError);
	                } catch (err) {
	                    openError(err);
	                }
	            });
	        }; 

	        this.close = function () {
	            if (idbdb) {
	                idbdb.close();
	                idbdb = null;
	                db_is_blocked = true;
	                dbOpenError = null;
	            }
	        }; 

	        this.delete = function () {
	            var args = arguments;
	            return new Promise(function (resolve, reject) {
	                if (args.length > 0) throw new Error("Arguments not allowed in db.delete()");
	                function doDelete() {
	                    db.close();
	                    var req = indexedDB.deleteDatabase(dbName);
	                    req.onsuccess = function () {
	                        if (!hasNativeGetDatabaseNames) {
	                            globalDatabaseList(function(databaseNames) {
	                                var pos = databaseNames.indexOf(dbName);
	                                if (pos >= 0) return databaseNames.splice(pos, 1);
	                            });
	                        }
	                        resolve();
	                    };
	                    req.onerror = eventRejectHandler(reject, ["deleting", dbName]);
	                    req.onblocked = function() {
	                        db.on("blocked").fire();
	                    };
	                }
	                if (isBeingOpened) {
	                    pausedResumeables.push({ resume: doDelete });
	                } else {
	                    doDelete();
	                }
	            });
	        }; 

	        this.backendDB = function () {
	            return idbdb;
	        }; 

	        this.isOpen = function () {
	            return idbdb !== null;
	        }; 
	        this.hasFailed = function () {
	            return dbOpenError !== null;
	        };
	        this.dynamicallyOpened = function() {
	            return autoSchema;
	        }

	        /*this.dbg = function (collection, counter) {
	            if (!this._dbgResult || !this._dbgResult[counter]) {
	                if (typeof collection === 'string') collection = this.table(collection).toCollection().limit(100);
	                if (!this._dbgResult) this._dbgResult = [];
	                var db = this;
	                new Promise(function () {
	                    Promise.PSD.letThrough = true;
	                    db._dbgResult[counter] = collection.toArray();
	                });
	            }
	            return this._dbgResult[counter]._value;
	        }*/

	        //
	        // Properties
	        //
	        this.name = dbName;

	        // db.tables - an array of all Table instances.
	        // TODO: Change so that tables is a simple member and make sure to update it whenever allTables changes.
	        Object.defineProperty(this, "tables", {
	            get: function () {
	                /// <returns type="Array" elementType="WriteableTable" />
	                return Object.keys(allTables).map(function (name) { return allTables[name]; });
	            }
	        });

	        //
	        // Events
	        //
	        this.on = events(this, "error", "populate", "blocked", { "ready": [promisableChain, nop], "versionchange": [reverseStoppableEventChain, nop] });

	        // Handle on('ready') specifically: If DB is already open, trigger the event immediately. Also, default to unsubscribe immediately after being triggered.
	        this.on.ready.subscribe = override(this.on.ready.subscribe, function (origSubscribe) {
	            return function (subscriber, bSticky) {
	                function proxy () {
	                    if (!bSticky) db.on.ready.unsubscribe(proxy);
	                    return subscriber.apply(this, arguments);
	                }
	                origSubscribe.call(this, proxy);
	                if (db.isOpen()) {
	                    if (db_is_blocked) {
	                        pausedResumeables.push({ resume: proxy });
	                    } else {
	                        proxy();
	                    }
	                }
	            };
	        });

	        fakeAutoComplete(function () {
	            db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
	            db.on("error").fire(new Error());
	        });

	        this.transaction = function (mode, tableInstances, scopeFunc) {
	            /// <summary>
	            /// 
	            /// </summary>
	            /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
	            /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
	            /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

	            // Let table arguments be all arguments between mode and last argument.
	            tableInstances = [].slice.call(arguments, 1, arguments.length - 1);
	            // Let scopeFunc be the last argument
	            scopeFunc = arguments[arguments.length - 1];
	            var parentTransaction = Promise.PSD && Promise.PSD.trans;
				// Check if parent transactions is bound to this db instance, and if caller wants to reuse it
	            if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
	            var onlyIfCompatible = mode.indexOf('?') !== -1;
	            mode = mode.replace('!', '').replace('?', '');
	            //
	            // Get storeNames from arguments. Either through given table instances, or through given table names.
	            //
	            var tables = Array.isArray(tableInstances[0]) ? tableInstances.reduce(function (a, b) { return a.concat(b); }) : tableInstances;
	            var error = null;
	            var storeNames = tables.map(function (tableInstance) {
	                if (typeof tableInstance === "string") {
	                    return tableInstance;
	                } else {
	                    if (!(tableInstance instanceof Table)) error = error || new TypeError("Invalid type. Arguments following mode must be instances of Table or String");
	                    return tableInstance.name;
	                }
	            });

	            //
	            // Resolve mode. Allow shortcuts "r" and "rw".
	            //
	            if (mode == "r" || mode == READONLY)
	                mode = READONLY;
	            else if (mode == "rw" || mode == READWRITE)
	                mode = READWRITE;
	            else
	                error = new Error("Invalid transaction mode: " + mode);

	            if (parentTransaction) {
	                // Basic checks
	                if (!error) {
	                    if (parentTransaction && parentTransaction.mode === READONLY && mode === READWRITE) {
	                        if (onlyIfCompatible) parentTransaction = null; // Spawn new transaction instead.
	                        else error = error || new Error("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
	                    }
	                    if (parentTransaction) {
	                        storeNames.forEach(function (storeName) {
	                            if (!parentTransaction.tables.hasOwnProperty(storeName)) {
	                                if (onlyIfCompatible) parentTransaction = null; // Spawn new transaction instead.
	                                else error = error || new Error("Table " + storeName + " not included in parent transaction. Parent Transaction function: " + parentTransaction.scopeFunc.toString());
	                            }
	                        });
	                    }
	                }
	            }
	            if (parentTransaction) {
	                // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
	                return parentTransaction._promise(mode, enterTransactionScope, "lock");
	            } else {
	                // If this is a root-level transaction, wait til database is ready and then launch the transaction.
	                return db._whenReady(enterTransactionScope);
	            }
	            
	            function enterTransactionScope(resolve, reject) {
	                // Our transaction. To be set later.
	                var trans = null;

	                try {
	                    // Throw any error if any of the above checks failed.
	                    // Real error defined some lines up. We throw it here from within a Promise to reject Promise
	                    // rather than make caller need to both use try..catch and promise catching. The reason we still
	                    // throw here rather than do Promise.reject(error) is that we like to have the stack attached to the
	                    // error. Also because there is a catch() clause bound to this try() that will bubble the error
	                    // to the parent transaction.
	                    if (error) throw error;

	                    //
	                    // Create Transaction instance
	                    //
	                    trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);

	                    // Provide arguments to the scope function (for backward compatibility)
	                    var tableArgs = storeNames.map(function (name) { return trans.tables[name]; });
	                    tableArgs.push(trans);

	                    // If transaction completes, resolve the Promise with the return value of scopeFunc.
	                    var returnValue;
	                    var uncompletedRequests = 0;

	                    // Create a new PSD frame to hold Promise.PSD.trans. Must not be bound to the current PSD frame since we want
	                    // it to pop before then() callback is called of our returned Promise.
	                    Promise.newPSD(function () {
	                        // Let the transaction instance be part of a Promise-specific data (PSD) value.
	                        Promise.PSD.trans = trans;
	                        trans.scopeFunc = scopeFunc; // For Error ("Table " + storeNames[0] + " not part of transaction") when it happens. This may help localizing the code that started a transaction used on another place.

	                        if (parentTransaction) {
	                            // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
	                            trans.idbtrans = parentTransaction.idbtrans;
	                            trans._promise = override(trans._promise, function (orig) {
	                                return function (mode, fn, writeLock) {
	                                    ++uncompletedRequests;
	                                    function proxy(fn2) {
	                                        return function (val) {
	                                            var retval;
	                                            // _rootExec needed so that we do not loose any IDBTransaction in a setTimeout() call.
	                                            Promise._rootExec(function () {
	                                                retval = fn2(val);
	                                                // _tickFinalize makes sure to support lazy micro tasks executed in Promise._rootExec().
	                                                // We certainly do not want to copy the bad pattern from IndexedDB but instead allow
	                                                // execution of Promise.then() callbacks until the're all done.
	                                                Promise._tickFinalize(function () {
	                                                    if (--uncompletedRequests === 0 && trans.active) {
	                                                        trans.active = false;
	                                                        trans.on.complete.fire(); // A called db operation has completed without starting a new operation. The flow is finished
	                                                    }
	                                                });
	                                            });
	                                            return retval;
	                                        }
	                                    }
	                                    return orig.call(this, mode, function (resolve2, reject2, trans) {
	                                        return fn(proxy(resolve2), proxy(reject2), trans);
	                                    }, writeLock);
	                                };
	                            });
	                        }
	                        trans.complete(function () {
	                            resolve(returnValue);
	                        });
	                        // If transaction fails, reject the Promise and bubble to db if noone catched this rejection.
	                        trans.error(function (e) {
	                            if (trans.idbtrans) trans.idbtrans.onerror = preventDefault; // Prohibit AbortError from firing.
	                            try {trans.abort();} catch(e2){}
	                            if (parentTransaction) {
	                                parentTransaction.active = false;
	                                parentTransaction.on.error.fire(e); // Bubble to parent transaction
	                            }
	                            var catched = reject(e);
	                            if (!parentTransaction && !catched) {
	                                db.on.error.fire(e);// If not catched, bubble error to db.on("error").
	                            }
	                        });

	                        // Finally, call the scope function with our table and transaction arguments.
	                        Promise._rootExec(function() {
	                            returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
	                        });
	                    });
	                    if (!trans.idbtrans || (parentTransaction && uncompletedRequests === 0)) {
	                        trans._nop(); // Make sure transaction is being used so that it will resolve.
	                    }
	                } catch (e) {
	                    // If exception occur, abort the transaction and reject Promise.
	                    if (trans && trans.idbtrans) trans.idbtrans.onerror = preventDefault; // Prohibit AbortError from firing.
	                    if (trans) trans.abort();
	                    if (parentTransaction) parentTransaction.on.error.fire(e);
	                    asap(function () {
	                        // Need to use asap(=setImmediate/setTimeout) before calling reject because we are in the Promise constructor and reject() will always return false if so.
	                        if (!reject(e)) db.on("error").fire(e); // If not catched, bubble exception to db.on("error");
	                    });
	                }
	            }
	        }; 

	        this.table = function (tableName) {
	            /// <returns type="WriteableTable"></returns>
	            if (fake && autoSchema) return new WriteableTable(tableName);
	            if (!allTables.hasOwnProperty(tableName)) { throw new Error("Table does not exist"); return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
	            return allTables[tableName];
	        };

	        //
	        //
	        //
	        // Table Class
	        //
	        //
	        //
	        function Table(name, transactionPromiseFactory, tableSchema, collClass) {
	            /// <param name="name" type="String"></param>
	            this.name = name;
	            this.schema = tableSchema;
	            this.hook = allTables[name] ? allTables[name].hook : events(null, {
	                "creating": [hookCreatingChain, nop],
	                "reading": [pureFunctionChain, mirror],
	                "updating": [hookUpdatingChain, nop],
	                "deleting": [nonStoppableEventChain, nop]
	            });
	            this._tpf = transactionPromiseFactory;
	            this._collClass = collClass || Collection;
	        }

	        extend(Table.prototype, function () {
	            function failReadonly() {
	                throw new Error("Current Transaction is READONLY");
	            }
	            return {
	                //
	                // Table Protected Methods
	                //

	                _trans: function getTransaction(mode, fn, writeLocked) {
	                    return this._tpf(mode, [this.name], fn, writeLocked);
	                },
	                _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
	                    if (fake) return new Promise(fn); // Simplify the work for Intellisense/Code completion.
	                    var self = this;
	                    return this._tpf(mode, [this.name], function (resolve, reject, trans) {
	                        fn(resolve, reject, trans.idbtrans.objectStore(self.name), trans);
	                    }, writeLocked);
	                },

	                //
	                // Table Public Methods
	                //
	                get: function (key, cb) {
	                    var self = this;
	                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
	                        fake && resolve(self.schema.instanceTemplate);
	                        var req = idbstore.get(key);
	                        req.onerror = eventRejectHandler(reject, ["getting", key, "from", self.name]);
	                        req.onsuccess = function () {
	                            resolve(self.hook.reading.fire(req.result));
	                        };
	                    }).then(cb);
	                },
	                where: function (indexName) {
	                    return new WhereClause(this, indexName);
	                },
	                count: function (cb) {
	                    return this.toCollection().count(cb);
	                },
	                offset: function (offset) {
	                    return this.toCollection().offset(offset);
	                },
	                limit: function (numRows) {
	                    return this.toCollection().limit(numRows);
	                },
	                reverse: function () {
	                    return this.toCollection().reverse();
	                },
	                filter: function (filterFunction) {
	                    return this.toCollection().and(filterFunction);
	                },
	                each: function (fn) {
	                    var self = this;
	                    fake && fn(self.schema.instanceTemplate);
	                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
	                        var req = idbstore.openCursor();
	                        req.onerror = eventRejectHandler(reject, ["calling", "Table.each()", "on", self.name]);
	                        iterate(req, null, fn, resolve, reject, self.hook.reading.fire);
	                    });
	                },
	                toArray: function (cb) {
	                    var self = this;
	                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
	                        fake && resolve([self.schema.instanceTemplate]);
	                        var a = [];
	                        var req = idbstore.openCursor();
	                        req.onerror = eventRejectHandler(reject, ["calling", "Table.toArray()", "on", self.name]);
	                        iterate(req, null, function (item) { a.push(item); }, function () { resolve(a); }, reject, self.hook.reading.fire);
	                    }).then(cb);
	                },
	                orderBy: function (index) {
	                    return new this._collClass(new WhereClause(this, index));
	                },

	                toCollection: function () {
	                    return new this._collClass(new WhereClause(this));
	                },

	                mapToClass: function (constructor, structure) {
	                    /// <summary>
	                    ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
	                    ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
	                    /// </summary>
	                    /// <param name="constructor">Constructor function representing the class.</param>
	                    /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
	                    /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
	                    this.schema.mappedClass = constructor;
	                    var instanceTemplate = Object.create(constructor.prototype);
	                    if (structure) {
	                        // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
	                        applyStructure(instanceTemplate, structure);
	                    }
	                    this.schema.instanceTemplate = instanceTemplate;

	                    // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
	                    // no matter which method to use for reading (Table.get() or Table.where(...)... )
	                    var readHook = function (obj) {
	                        if (!obj) return obj; // No valid object. (Value is null). Return as is.
	                        // Create a new object that derives from constructor:
	                        var res = Object.create(constructor.prototype);
	                        // Clone members:
	                        for (var m in obj) if (obj.hasOwnProperty(m)) res[m] = obj[m];
	                        return res;
	                    };

	                    if (this.schema.readHook) {
	                        this.hook.reading.unsubscribe(this.schema.readHook);
	                    }
	                    this.schema.readHook = readHook;
	                    this.hook("reading", readHook);
	                    return constructor;
	                },
	                defineClass: function (structure) {
	                    /// <summary>
	                    ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
	                    ///     as well as making it possible to extend the prototype of the returned constructor function.
	                    /// </summary>
	                    /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
	                    /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
	                    return this.mapToClass(Dexie.defineClass(structure), structure);
	                },
	                add: failReadonly,
	                put: failReadonly,
	                'delete': failReadonly,
	                clear: failReadonly,
	                update: failReadonly
	            };
	        });

	        //
	        //
	        //
	        // WriteableTable Class (extends Table)
	        //
	        //
	        //
	        function WriteableTable(name, transactionPromiseFactory, tableSchema, collClass) {
	            Table.call(this, name, transactionPromiseFactory, tableSchema, collClass || WriteableCollection);
	        }

	        derive(WriteableTable).from(Table).extend(function () {
	            return {
	                add: function (obj, key) {
	                    /// <summary>
	                    ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
	                    /// </summary>
	                    /// <param name="obj" type="Object">A javascript object to insert</param>
	                    /// <param name="key" optional="true">Primary key</param>
	                    var self = this,
	                        creatingHook = this.hook.creating.fire;
	                    return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
	                        var thisCtx = {};
	                        if (creatingHook !== nop) {
	                            var effectiveKey = key || (idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined);
	                            var keyToUse = creatingHook.call(thisCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
	                            if (effectiveKey === undefined && keyToUse !== undefined) {
	                                if (idbstore.keyPath)
	                                    setByKeyPath(obj, idbstore.keyPath, keyToUse);
	                                else
	                                    key = keyToUse;
	                            }
	                        }
	                        //try {
	                            var req = key ? idbstore.add(obj, key) : idbstore.add(obj);
	                            req.onerror = eventRejectHandler(function (e) {
	                                if (thisCtx.onerror) thisCtx.onerror(e);
	                                return reject(e);
	                            }, ["adding", obj, "into", self.name]);
	                            req.onsuccess = function (ev) {
	                                var keyPath = idbstore.keyPath;
	                                if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
	                                if (thisCtx.onsuccess) thisCtx.onsuccess(ev.target.result);
	                                resolve(req.result);
	                            };
	                        /*} catch (e) {
	                            trans.on("error").fire(e);
	                            trans.abort();
	                            reject(e);
	                        }*/
	                    });
	                },

	                put: function (obj, key) {
	                    /// <summary>
	                    ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
	                    /// </summary>
	                    /// <param name="obj" type="Object">A javascript object to insert or update</param>
	                    /// <param name="key" optional="true">Primary key</param>
	                    var self = this,
	                        creatingHook = this.hook.creating.fire,
	                        updatingHook = this.hook.updating.fire;
	                    if (creatingHook !== nop || updatingHook !== nop) {
	                        //
	                        // People listens to when("creating") or when("updating") events!
	                        // We must know whether the put operation results in an CREATE or UPDATE.
	                        //
	                        return this._trans(READWRITE, function (resolve, reject, trans) {
	                            // Since key is optional, make sure we get it from obj if not provided
	                            var effectiveKey = key || (self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath));
	                            if (effectiveKey === undefined) {
	                                // No primary key. Must use add().
	                                trans.tables[self.name].add(obj).then(resolve, reject);
	                            } else {
	                                // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
	                                trans._lock(); // Needed because operation is splitted into modify() and add().
	                                // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
	                                obj = deepClone(obj);
	                                trans.tables[self.name].where(":id").equals(effectiveKey).modify(function (value) {
	                                    // Replace extisting value with our object
	                                    // CRUD event firing handled in WriteableCollection.modify()
	                                    this.value = obj;
	                                }).then(function (count) {
	                                    if (count === 0) {
	                                        // Object's key was not found. Add the object instead.
	                                        // CRUD event firing will be done in add()
	                                        return trans.tables[self.name].add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
	                                    } else {
	                                        return effectiveKey; // Resolve with the provided key.
	                                    }
	                                }).finally(function () {
	                                    trans._unlock();
	                                }).then(resolve, reject);
	                            }
	                        });
	                    } else {
	                        // Use the standard IDB put() method.
	                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                            var req = key ? idbstore.put(obj, key) : idbstore.put(obj);
	                            req.onerror = eventRejectHandler(reject, ["putting", obj, "into", self.name]);
	                            req.onsuccess = function (ev) {
	                                var keyPath = idbstore.keyPath;
	                                if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
	                                resolve(req.result);
	                            };
	                        });
	                    }
	                },

	                'delete': function (key) {
	                    /// <param name="key">Primary key of the object to delete</param>
	                    if (this.hook.deleting.subscribers.length) {
	                        // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
	                        // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
	                        return this.where(":id").equals(key).delete();
	                    } else {
	                        // No one listens. Use standard IDB delete() method.
	                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                            var req = idbstore.delete(key);
	                            req.onerror = eventRejectHandler(reject, ["deleting", key, "from", idbstore.name]);
	                            req.onsuccess = function (ev) {
	                                resolve(req.result);
	                            };
	                        });
	                    }
	                },

	                clear: function () {
	                    if (this.hook.deleting.subscribers.length) {
	                        // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
	                        // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
	                        return this.toCollection().delete();
	                    } else {
	                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                            var req = idbstore.clear();
	                            req.onerror = eventRejectHandler(reject, ["clearing", idbstore.name]);
	                            req.onsuccess = function (ev) {
	                                resolve(req.result);
	                            };
	                        });
	                    }
	                },

	                update: function (keyOrObject, modifications) {
	                    if (typeof modifications !== 'object' || Array.isArray(modifications)) throw new Error("db.update(keyOrObject, modifications). modifications must be an object.");
	                    if (typeof keyOrObject === 'object' && !Array.isArray(keyOrObject)) {
	                        // object to modify. Also modify given object with the modifications:
	                        Object.keys(modifications).forEach(function (keyPath) {
	                            setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
	                        });
	                        var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
	                        if (key === undefined) Promise.reject(new Error("Object does not contain its primary key"));
	                        return this.where(":id").equals(key).modify(modifications);
	                    } else {
	                        // key to modify
	                        return this.where(":id").equals(keyOrObject).modify(modifications);
	                    }
	                },
	            };
	        });

	        //
	        //
	        //
	        // Transaction Class
	        //
	        //
	        //
	        function Transaction(mode, storeNames, dbschema, parent) {
	            /// <summary>
	            ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
	            /// </summary>
	            /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
	            /// <param name="storeNames" type="Array">Array of table names to operate on</param>
	            var self = this;
	            this.db = db;
	            this.mode = mode;
	            this.storeNames = storeNames;
	            this.idbtrans = null;
	            this.on = events(this, ["complete", "error"], "abort");
	            this._reculock = 0;
	            this._blockedFuncs = [];
	            this._psd = null;
	            this.active = true;
	            this._dbschema = dbschema;
	            if (parent) this.parent = parent;
	            this._tpf = transactionPromiseFactory;
	            this.tables = Object.create(notInTransFallbackTables); // ...so that all non-included tables exists as instances (possible to call table.name for example) but will fail as soon as trying to execute a query on it.

	            function transactionPromiseFactory(mode, storeNames, fn, writeLocked) {
	                // Creates a Promise instance and calls fn (resolve, reject, trans) where trans is the instance of this transaction object.
	                // Support for write-locking the transaction during the promise life time from creation to success/failure.
	                // This is actually not needed when just using single operations on IDB, since IDB implements this internally.
	                // However, when implementing a write operation as a series of operations on top of IDB(collection.delete() and collection.modify() for example),
	                // lock is indeed needed if Dexie APIshould behave in a consistent manner for the API user.
	                // Another example of this is if we want to support create/update/delete events,
	                // we need to implement put() using a series of other IDB operations but still need to lock the transaction all the way.
	                return self._promise(mode, fn, writeLocked);
	            }

	            for (var i = storeNames.length - 1; i !== -1; --i) {
	                var name = storeNames[i];
	                var table = db._tableFactory(mode, dbschema[name], transactionPromiseFactory);
	                this.tables[name] = table;
	                if (!this[name]) this[name] = table;
	            }
	        }

	        extend(Transaction.prototype, {
	            //
	            // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
	            //

	            _lock: function () {
	                // Temporary set all requests into a pending queue if they are called before database is ready.
	                ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
	                if (this._reculock === 1 && Promise.PSD) Promise.PSD.lockOwnerFor = this;
	                return this;
	            },
	            _unlock: function () {
	                if (--this._reculock === 0) {
	                    if (Promise.PSD) Promise.PSD.lockOwnerFor = null;
	                    while (this._blockedFuncs.length > 0 && !this._locked()) {
	                        var fn = this._blockedFuncs.shift();
	                        try { fn(); } catch (e) { }
	                    }
	                }
	                return this;
	            },
	            _locked: function () {
	                // Checks if any write-lock is applied on this transaction.
	                // To simplify the Dexie API for extension implementations, we support recursive locks.
	                // This is accomplished by using "Promise Specific Data" (PSD).
	                // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
	                // Promise.PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
	                //         * callback given to the Promise() constructor  (function (resolve, reject){...})
	                //         * callbacks given to then()/catch()/finally() methods (function (value){...})
	                // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
	                // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
	                // Promise.PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
	                return this._reculock && (!Promise.PSD || Promise.PSD.lockOwnerFor !== this);
	            },
	            _nop: function (cb) {
	                // An asyncronic no-operation that may call given callback when done doing nothing. An alternative to asap() if we must not lose the transaction.
	                this.tables[this.storeNames[0]].get(0).then(cb);
	            },
	            _promise: function (mode, fn, bWriteLock) {
	                var self = this;
	                return Promise.newPSD(function() {
	                    var p;
	                    // Read lock always
	                    if (!self._locked()) {
	                        p = self.active ? new Promise(function (resolve, reject) {
	                            if (!self.idbtrans && mode) {
	                                if (!idbdb) throw dbOpenError ? new Error("Database not open. Following error in populate, ready or upgrade function made Dexie.open() fail: " + dbOpenError) : new Error("Database not open");
	                                var idbtrans = self.idbtrans = idbdb.transaction(safariMultiStoreFix(self.storeNames), self.mode);
	                                idbtrans.onerror = function (e) {
	                                    self.on("error").fire(e && e.target.error);
	                                    e.preventDefault(); // Prohibit default bubbling to window.error
	                                    self.abort(); // Make sure transaction is aborted since we preventDefault.
	                                }; 
	                                idbtrans.onabort = function (e) {
	                                    // Workaround for issue #78 - low disk space on chrome.
	                                    // onabort is called but never onerror. Call onerror explicitely.
	                                    // Do this in a future tick so we allow default onerror to execute before doing the fallback.
	                                    asap(function () { self.on('error').fire(new Error("Transaction aborted for unknown reason")); });

	                                    self.active = false;
	                                    self.on("abort").fire(e);
	                                };
	                                idbtrans.oncomplete = function (e) {
	                                    self.active = false;
	                                    self.on("complete").fire(e);
	                                }; 
	                            }
	                            if (bWriteLock) self._lock(); // Write lock if write operation is requested
	                            try {
	                                fn(resolve, reject, self);
	                            } catch (e) {
	                                // Direct exception happened when doin operation.
	                                // We must immediately fire the error and abort the transaction.
	                                // When this happens we are still constructing the Promise so we don't yet know
	                                // whether the caller is about to catch() the error or not. Have to make
	                                // transaction fail. Catching such an error wont stop transaction from failing.
	                                // This is a limitation we have to live with.
	                                Dexie.ignoreTransaction(function () { self.on('error').fire(e); });
	                                self.abort();
	                                reject(e);
	                            }
	                        }) : Promise.reject(stack(new Error("Transaction is inactive. Original Scope Function Source: " + self.scopeFunc.toString())));
	                        if (self.active && bWriteLock) p.finally(function () {
	                            self._unlock();
	                        });
	                    } else {
	                        // Transaction is write-locked. Wait for mutex.
	                        p = new Promise(function (resolve, reject) {
	                            self._blockedFuncs.push(function () {
	                                self._promise(mode, fn, bWriteLock).then(resolve, reject);
	                            });
	                        });
	                    }
	                    p.onuncatched = function (e) {
	                        // Bubble to transaction. Even though IDB does this internally, it would just do it for error events and not for caught exceptions.
	                        Dexie.ignoreTransaction(function () { self.on("error").fire(e); });
	                        self.abort();
	                    };
	                    return p;
	                });
	            },

	            //
	            // Transaction Public Methods
	            //

	            complete: function (cb) {
	                return this.on("complete", cb);
	            },
	            error: function (cb) {
	                return this.on("error", cb);
	            },
	            abort: function () {
	                if (this.idbtrans && this.active) try { // TODO: if !this.idbtrans, enqueue an abort() operation.
	                    this.active = false;
	                    this.idbtrans.abort();
	                    this.on.error.fire(new Error("Transaction Aborted"));
	                } catch (e) { }
	            },
	            table: function (name) {
	                if (!this.tables.hasOwnProperty(name)) { throw new Error("Table " + name + " not in transaction"); return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
	                return this.tables[name];
	            }
	        });

	        //
	        //
	        //
	        // WhereClause
	        //
	        //
	        //
	        function WhereClause(table, index, orCollection) {
	            /// <param name="table" type="Table"></param>
	            /// <param name="index" type="String" optional="true"></param>
	            /// <param name="orCollection" type="Collection" optional="true"></param>
	            this._ctx = {
	                table: table,
	                index: index === ":id" ? null : index,
	                collClass: table._collClass,
	                or: orCollection
	            }; 
	        }

	        extend(WhereClause.prototype, function () {

	            // WhereClause private methods

	            function fail(collection, err) {
	                try { throw err; } catch (e) {
	                    collection._ctx.error = e;
	                }
	                return collection;
	            }

	            function getSetArgs(args) {
	                return Array.prototype.slice.call(args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
	            }

	            function upperFactory(dir) {
	                return dir === "next" ? function (s) { return s.toUpperCase(); } : function (s) { return s.toLowerCase(); };
	            }
	            function lowerFactory(dir) {
	                return dir === "next" ? function (s) { return s.toLowerCase(); } : function (s) { return s.toUpperCase(); };
	            }
	            function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
	                var length = Math.min(key.length, lowerNeedle.length);
	                var llp = -1;
	                for (var i = 0; i < length; ++i) {
	                    var lwrKeyChar = lowerKey[i];
	                    if (lwrKeyChar !== lowerNeedle[i]) {
	                        if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
	                        if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
	                        if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
	                        return null;
	                    }
	                    if (cmp(key[i], lwrKeyChar) < 0) llp = i;
	                }
	                if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
	                if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
	                return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
	            }

	            function addIgnoreCaseAlgorithm(c, match, needle) {
	                /// <param name="needle" type="String"></param>
	                var upper, lower, compare, upperNeedle, lowerNeedle, direction;
	                function initDirection(dir) {
	                    upper = upperFactory(dir);
	                    lower = lowerFactory(dir);
	                    compare = (dir === "next" ? ascending : descending);
	                    upperNeedle = upper(needle);
	                    lowerNeedle = lower(needle);
	                    direction = dir;
	                }
	                initDirection("next");
	                c._ondirectionchange = function (direction) {
	                    // This event onlys occur before filter is called the first time.
	                    initDirection(direction);
	                };
	                c._addAlgorithm(function (cursor, advance, resolve) {
	                    /// <param name="cursor" type="IDBCursor"></param>
	                    /// <param name="advance" type="Function"></param>
	                    /// <param name="resolve" type="Function"></param>
	                    var key = cursor.key;
	                    if (typeof key !== 'string') return false;
	                    var lowerKey = lower(key);
	                    if (match(lowerKey, lowerNeedle)) {
	                        advance(function () { cursor.continue(); });
	                        return true;
	                    } else {
	                        var nextNeedle = nextCasing(key, lowerKey, upperNeedle, lowerNeedle, compare, direction);
	                        if (nextNeedle) {
	                            advance(function () { cursor.continue(nextNeedle); });
	                        } else {
	                            advance(resolve);
	                        }
	                        return false;
	                    }
	                });
	            }

	            //
	            // WhereClause public methods
	            //
	            return {
	                between: function (lower, upper, includeLower, includeUpper) {
	                    /// <summary>
	                    ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
	                    /// </summary>
	                    /// <param name="lower"></param>
	                    /// <param name="upper"></param>
	                    /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
	                    /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
	                    /// <returns type="Collection"></returns>
	                    includeLower = includeLower !== false;   // Default to true
	                    includeUpper = includeUpper === true;    // Default to false
	                    if ((lower > upper) ||
	                        (lower === upper && (includeLower || includeUpper) && !(includeLower && includeUpper)))
	                        return new this._ctx.collClass(this, function() { return IDBKeyRange.only(lower); }).limit(0); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
	                    return new this._ctx.collClass(this, function() { return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper); });
	                },
	                equals: function (value) {
	                    return new this._ctx.collClass(this, function() { return IDBKeyRange.only(value); });
	                },
	                above: function (value) {
	                    return new this._ctx.collClass(this, function() { return IDBKeyRange.lowerBound(value, true); });
	                },
	                aboveOrEqual: function (value) {
	                    return new this._ctx.collClass(this, function() { return IDBKeyRange.lowerBound(value); });
	                },
	                below: function (value) {
	                    return new this._ctx.collClass(this, function() { return IDBKeyRange.upperBound(value, true); });
	                },
	                belowOrEqual: function (value) {
	                    return new this._ctx.collClass(this, function() { return IDBKeyRange.upperBound(value); });
	                },
	                startsWith: function (str) {
	                    /// <param name="str" type="String"></param>
	                    if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
	                    return this.between(str, str + String.fromCharCode(65535), true, true);
	                },
	                startsWithIgnoreCase: function (str) {
	                    /// <param name="str" type="String"></param>
	                    if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
	                    if (str === "") return this.startsWith(str);
	                    var c = new this._ctx.collClass(this, function() { return IDBKeyRange.bound(str.toUpperCase(), str.toLowerCase() + String.fromCharCode(65535)); });
	                    addIgnoreCaseAlgorithm(c, function (a, b) { return a.indexOf(b) === 0; }, str);
	                    c._ondirectionchange = function () { fail(c, new Error("reverse() not supported with WhereClause.startsWithIgnoreCase()")); };
	                    return c;
	                },
	                equalsIgnoreCase: function (str) {
	                    /// <param name="str" type="String"></param>
	                    if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
	                    var c = new this._ctx.collClass(this, function() { return IDBKeyRange.bound(str.toUpperCase(), str.toLowerCase()); });
	                    addIgnoreCaseAlgorithm(c, function (a, b) { return a === b; }, str);
	                    return c;
	                },
	                anyOf: function (valueArray) {
	                    var ctx = this._ctx,
	                        schema = ctx.table.schema;
	                    var idxSpec = ctx.index ? schema.idxByName[ctx.index] : schema.primKey;
	                    var isCompound = idxSpec && idxSpec.compound;
	                    var set = getSetArgs(arguments);
	                    var compare = isCompound ? compoundCompare(ascending) : ascending;
	                    set.sort(compare);
	                    if (set.length === 0) return new this._ctx.collClass(this, function() { return IDBKeyRange.only(""); }).limit(0); // Return an empty collection.
	                    var c = new this._ctx.collClass(this, function () { return IDBKeyRange.bound(set[0], set[set.length - 1]); });
	                    
	                    c._ondirectionchange = function (direction) {
	                        compare = (direction === "next" ? ascending : descending);
	                        if (isCompound) compare = compoundCompare(compare);
	                        set.sort(compare);
	                    };
	                    var i = 0;
	                    c._addAlgorithm(function (cursor, advance, resolve) {
	                        var key = cursor.key;
	                        while (compare(key, set[i]) > 0) {
	                            // The cursor has passed beyond this key. Check next.
	                            ++i;
	                            if (i === set.length) {
	                                // There is no next. Stop searching.
	                                advance(resolve);
	                                return false;
	                            }
	                        }
	                        if (compare(key, set[i]) === 0) {
	                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
	                            advance(function () { cursor.continue(); });
	                            return true;
	                        } else {
	                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
	                            advance(function () { cursor.continue(set[i]); });
	                            return false;
	                        }
	                    });
	                    return c;
	                },

	                notEqual: function(value) {
	                    return this.below(value).or(this._ctx.index).above(value);
	                },

	                noneOf: function(valueArray) {
	                    var ctx = this._ctx,
	                        schema = ctx.table.schema;
	                    var idxSpec = ctx.index ? schema.idxByName[ctx.index] : schema.primKey;
	                    var isCompound = idxSpec && idxSpec.compound;
	                    var set = getSetArgs(arguments);
	                    if (set.length === 0) return new this._ctx.collClass(this); // Return entire collection.
	                    var compare = isCompound ? compoundCompare(ascending) : ascending;
	                    set.sort(compare);
	                    // Transform ["a","b","c"] to a set of ranges for between/above/below: [[null,"a"], ["a","b"], ["b","c"], ["c",null]]
	                    var ranges = set.reduce(function (res, val) { return res ? res.concat([[res[res.length - 1][1], val]]) : [[null, val]]; }, null);
	                    ranges.push([set[set.length - 1], null]);
	                    // Transform range-sets to a big or() expression between ranges:
	                    var thiz = this, index = ctx.index;
	                    return ranges.reduce(function(collection, range) {
	                        return collection ?
	                            range[1] === null ?
	                                collection.or(index).above(range[0]) :
	                                collection.or(index).between(range[0], range[1], false, false)
	                            : thiz.below(range[1]);
	                    }, null);
	                },

	                startsWithAnyOf: function (valueArray) {
	                    var ctx = this._ctx,
	                        set = getSetArgs(arguments);

	                    if (!set.every(function (s) { return typeof s === 'string'; })) {
	                        return fail(new ctx.collClass(this), new TypeError("startsWithAnyOf() only works with strings"));
	                    }
	                    if (set.length === 0) return new ctx.collClass(this, function () { return IDBKeyRange.only(""); }).limit(0); // Return an empty collection.

	                    var setEnds = set.map(function (s) { return s + String.fromCharCode(65535); });
	                    
	                    var sortDirection = ascending;
	                    set.sort(sortDirection);
	                    var i = 0;
	                    function keyIsBeyondCurrentEntry(key) { return key > setEnds[i]; }
	                    function keyIsBeforeCurrentEntry(key) { return key < set[i]; }
	                    var checkKey = keyIsBeyondCurrentEntry;

	                    var c = new ctx.collClass(this, function () {
	                        return IDBKeyRange.bound(set[0], set[set.length - 1] + String.fromCharCode(65535));
	                    });
	                    
	                    c._ondirectionchange = function (direction) {
	                        if (direction === "next") {
	                            checkKey = keyIsBeyondCurrentEntry;
	                            sortDirection = ascending;
	                        } else {
	                            checkKey = keyIsBeforeCurrentEntry;
	                            sortDirection = descending;
	                        }
	                        set.sort(sortDirection);
	                        setEnds.sort(sortDirection);
	                    };

	                    c._addAlgorithm(function (cursor, advance, resolve) {
	                        var key = cursor.key;
	                        while (checkKey(key)) {
	                            // The cursor has passed beyond this key. Check next.
	                            ++i;
	                            if (i === set.length) {
	                                // There is no next. Stop searching.
	                                advance(resolve);
	                                return false;
	                            }
	                        }
	                        if (key >= set[i] && key <= setEnds[i]) {
	                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
	                            advance(function () { cursor.continue(); });
	                            return true;
	                        } else {
	                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
	                            advance(function() {
	                                if (sortDirection === ascending) cursor.continue(set[i]);
	                                else cursor.continue(setEnds[i]);
	                            });
	                            return false;
	                        }
	                    });
	                    return c;
	                }
	            };
	        });




	        //
	        //
	        //
	        // Collection Class
	        //
	        //
	        //
	        function Collection(whereClause, keyRangeGenerator) {
	            /// <summary>
	            /// 
	            /// </summary>
	            /// <param name="whereClause" type="WhereClause">Where clause instance</param>
	            /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
	            var keyRange = null, error = null;
	            if (keyRangeGenerator) try {
	                keyRange = keyRangeGenerator();
	            } catch (ex) {
	                error = ex;
	            }

	            var whereCtx = whereClause._ctx;
	            this._ctx = {
	                table: whereCtx.table,
	                index: whereCtx.index,
	                isPrimKey: (!whereCtx.index || (whereCtx.table.schema.primKey.keyPath && whereCtx.index === whereCtx.table.schema.primKey.name)),
	                range: keyRange,
	                op: "openCursor",
	                dir: "next",
	                unique: "",
	                algorithm: null,
	                filter: null,
	                isMatch: null,
	                offset: 0,
	                limit: Infinity,
	                error: error, // If set, any promise must be rejected with this error
	                or: whereCtx.or
	            };
	        }

	        extend(Collection.prototype, function () {

	            //
	            // Collection Private Functions
	            //

	            function addFilter(ctx, fn) {
	                ctx.filter = combine(ctx.filter, fn);
	            }

	            function addMatchFilter(ctx, fn) {
	                ctx.isMatch = combine(ctx.isMatch, fn);
	            }

	            function getIndexOrStore(ctx, store) {
	                if (ctx.isPrimKey) return store;
	                var indexSpec = ctx.table.schema.idxByName[ctx.index];
	                if (!indexSpec) throw new Error("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
	                return ctx.isPrimKey ? store : store.index(indexSpec.name);
	            }

	            function openCursor(ctx, store) {
	                return getIndexOrStore(ctx, store)[ctx.op](ctx.range || null, ctx.dir + ctx.unique);
	            }

	            function iter(ctx, fn, resolve, reject, idbstore) {
	                if (!ctx.or) {
	                    iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, ctx.filter), fn, resolve, reject, ctx.table.hook.reading.fire);
	                } else {
	                    (function () {
	                        var filter = ctx.filter;
	                        var set = {};
	                        var primKey = ctx.table.schema.primKey.keyPath;
	                        var resolved = 0;

	                        function resolveboth() {
	                            if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
	                        }

	                        function union(item, cursor, advance) {
	                            if (!filter || filter(cursor, advance, resolveboth, reject)) {
	                                var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
	                                if (!set.hasOwnProperty(key)) {
	                                    set[key] = true;
	                                    fn(item, cursor, advance);
	                                }
	                            }
	                        }

	                        ctx.or._iterate(union, resolveboth, reject, idbstore);
	                        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, ctx.table.hook.reading.fire);
	                    })();
	                }
	            }
	            function getInstanceTemplate(ctx) {
	                return ctx.table.schema.instanceTemplate;
	            }


	            return {

	                //
	                // Collection Protected Functions
	                //

	                _read: function (fn, cb) {
	                    var ctx = this._ctx;
	                    if (ctx.error)
	                        return ctx.table._trans(null, function rejector(resolve, reject) { reject(ctx.error); });
	                    else
	                        return ctx.table._idbstore(READONLY, fn).then(cb);
	                },
	                _write: function (fn) {
	                    var ctx = this._ctx;
	                    if (ctx.error)
	                        return ctx.table._trans(null, function rejector(resolve, reject) { reject(ctx.error); });
	                    else
	                        return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
	                },
	                _addAlgorithm: function (fn) {
	                    var ctx = this._ctx;
	                    ctx.algorithm = combine(ctx.algorithm, fn);
	                },

	                _iterate: function (fn, resolve, reject, idbstore) {
	                    return iter(this._ctx, fn, resolve, reject, idbstore);
	                },

	                //
	                // Collection Public methods
	                //

	                each: function (fn) {
	                    var ctx = this._ctx;

	                    fake && fn(getInstanceTemplate(ctx));

	                    return this._read(function (resolve, reject, idbstore) {
	                        iter(ctx, fn, resolve, reject, idbstore);
	                    });
	                },

	                count: function (cb) {
	                    if (fake) return Promise.resolve(0).then(cb);
	                    var self = this,
	                        ctx = this._ctx;

	                    if (ctx.filter || ctx.algorithm || ctx.or) {
	                        // When filters are applied or 'ored' collections are used, we must count manually
	                        var count = 0;
	                        return this._read(function (resolve, reject, idbstore) {
	                            iter(ctx, function () { ++count; return false; }, function () { resolve(count); }, reject, idbstore);
	                        }, cb);
	                    } else {
	                        // Otherwise, we can use the count() method if the index.
	                        return this._read(function (resolve, reject, idbstore) {
	                            var idx = getIndexOrStore(ctx, idbstore);
	                            var req = (ctx.range ? idx.count(ctx.range) : idx.count());
	                            req.onerror = eventRejectHandler(reject, ["calling", "count()", "on", self.name]);
	                            req.onsuccess = function (e) {
	                                resolve(Math.min(e.target.result, Math.max(0, ctx.limit - ctx.offset)));
	                            };
	                        }, cb);
	                    }
	                },

	                sortBy: function (keyPath, cb) {
	                    /// <param name="keyPath" type="String"></param>
	                    var ctx = this._ctx;
	                    var parts = keyPath.split('.').reverse(),
	                        lastPart = parts[0],
	                        lastIndex = parts.length - 1;
	                    function getval(obj, i) {
	                        if (i) return getval(obj[parts[i]], i - 1);
	                        return obj[lastPart];
	                    }
	                    var order = this._ctx.dir === "next" ? 1 : -1;

	                    function sorter(a, b) {
	                        var aVal = getval(a, lastIndex),
	                            bVal = getval(b, lastIndex);
	                        return aVal < bVal ? -order : aVal > bVal ? order : 0;
	                    }
	                    return this.toArray(function (a) {
	                        return a.sort(sorter);
	                    }).then(cb);
	                },

	                toArray: function (cb) {
	                    var ctx = this._ctx;
	                    return this._read(function (resolve, reject, idbstore) {
	                        fake && resolve([getInstanceTemplate(ctx)]);
	                        var a = [];
	                        iter(ctx, function (item) { a.push(item); }, function arrayComplete() {
	                            resolve(a);
	                        }, reject, idbstore);
	                    }, cb);
	                },

	                offset: function (offset) {
	                    var ctx = this._ctx;
	                    if (offset <= 0) return this;
	                    ctx.offset += offset; // For count()
	                    if (!ctx.or && !ctx.algorithm && !ctx.filter) {
	                        addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
	                            if (offset === 0) return true;
	                            if (offset === 1) { --offset; return false; }
	                            advance(function () { cursor.advance(offset); offset = 0; });
	                            return false;
	                        });
	                    } else {
	                        addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
	                            return (--offset < 0);
	                        });
	                    }
	                    return this;
	                },

	                limit: function (numRows) {
	                    this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
	                    addFilter(this._ctx, function (cursor, advance, resolve) {
	                        if (--numRows <= 0) advance(resolve); // Stop after this item has been included
	                        return numRows >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
	                    });
	                    return this;
	                },

	                until: function (filterFunction, bIncludeStopEntry) {
	                    var ctx = this._ctx;
	                    fake && filterFunction(getInstanceTemplate(ctx));
	                    addFilter(this._ctx, function (cursor, advance, resolve) {
	                        if (filterFunction(cursor.value)) {
	                            advance(resolve);
	                            return bIncludeStopEntry;
	                        } else {
	                            return true;
	                        }
	                    });
	                    return this;
	                },

	                first: function (cb) {
	                    return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
	                },

	                last: function (cb) {
	                    return this.reverse().first(cb);
	                },

	                and: function (filterFunction) {
	                    /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
	                    fake && filterFunction(getInstanceTemplate(this._ctx));
	                    addFilter(this._ctx, function (cursor) {
	                        return filterFunction(cursor.value);
	                    });
	                    addMatchFilter(this._ctx, filterFunction); // match filters not used in Dexie.js but can be used by 3rd part libraries to test a collection for a match without querying DB. Used by Dexie.Observable.
	                    return this;
	                },

	                or: function (indexName) {
	                    return new WhereClause(this._ctx.table, indexName, this);
	                },

	                reverse: function () {
	                    this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
	                    if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
	                    return this;
	                },

	                desc: function () {
	                    return this.reverse();
	                },

	                eachKey: function (cb) {
	                    var ctx = this._ctx;
	                    fake && cb(getByKeyPath(getInstanceTemplate(this._ctx), this._ctx.index ? this._ctx.table.schema.idxByName[this._ctx.index].keyPath : this._ctx.table.schema.primKey.keyPath));
	                    if (!ctx.isPrimKey) ctx.op = "openKeyCursor"; // Need the check because IDBObjectStore does not have "openKeyCursor()" while IDBIndex has.
	                    return this.each(function (val, cursor) { cb(cursor.key, cursor); });
	                },

	                eachUniqueKey: function (cb) {
	                    this._ctx.unique = "unique";
	                    return this.eachKey(cb);
	                },

	                keys: function (cb) {
	                    var ctx = this._ctx;
	                    if (!ctx.isPrimKey) ctx.op = "openKeyCursor"; // Need the check because IDBObjectStore does not have "openKeyCursor()" while IDBIndex has.
	                    var a = [];
	                    if (fake) return new Promise(this.eachKey.bind(this)).then(function(x) { return [x]; }).then(cb);
	                    return this.each(function (item, cursor) {
	                        a.push(cursor.key);
	                    }).then(function () {
	                        return a;
	                    }).then(cb);
	                },

	                uniqueKeys: function (cb) {
	                    this._ctx.unique = "unique";
	                    return this.keys(cb);
	                },

	                firstKey: function (cb) {
	                    return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
	                },

	                lastKey: function (cb) {
	                    return this.reverse().firstKey(cb);
	                },


	                distinct: function () {
	                    var set = {};
	                    addFilter(this._ctx, function (cursor) {
	                        var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
	                        var found = set.hasOwnProperty(strKey);
	                        set[strKey] = true;
	                        return !found;
	                    });
	                    return this;
	                }
	            };
	        });

	        //
	        //
	        // WriteableCollection Class
	        //
	        //
	        function WriteableCollection() {
	            Collection.apply(this, arguments);
	        }

	        derive(WriteableCollection).from(Collection).extend({

	            //
	            // WriteableCollection Public Methods
	            //

	            modify: function (changes) {
	                var self = this,
	                    ctx = this._ctx,
	                    hook = ctx.table.hook,
	                    updatingHook = hook.updating.fire,
	                    deletingHook = hook.deleting.fire;

	                fake && typeof changes === 'function' && changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);

	                return this._write(function (resolve, reject, idbstore, trans) {
	                    var modifyer;
	                    if (typeof changes === 'function') {
	                        // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
	                        if (updatingHook === nop && deletingHook === nop) {
	                            // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
	                            modifyer = changes;
	                        } else {
	                            // People want to know exactly what is being modified or deleted.
	                            // Let modifyer be a proxy function that finds out what changes the caller is actually doing
	                            // and call the hooks accordingly!
	                            modifyer = function (item) {
	                                var origItem = deepClone(item); // Clone the item first so we can compare laters.
	                                if (changes.call(this, item) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
	                                if (!this.hasOwnProperty("value")) {
	                                    // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
	                                    deletingHook.call(this, this.primKey, item, trans);
	                                } else {
	                                    // No deletion. Check what was changed
	                                    var objectDiff = getObjectDiff(origItem, this.value);
	                                    var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
	                                    if (additionalChanges) {
	                                        // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
	                                        item = this.value;
	                                        Object.keys(additionalChanges).forEach(function (keyPath) {
	                                            setByKeyPath(item, keyPath, additionalChanges[keyPath]);  // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
	                                        });
	                                    }
	                                }
	                            }; 
	                        }
	                    } else if (updatingHook === nop) {
	                        // changes is a set of {keyPath: value} and no one is listening to the updating hook.
	                        var keyPaths = Object.keys(changes);
	                        var numKeys = keyPaths.length;
	                        modifyer = function (item) {
	                            var anythingModified = false;
	                            for (var i = 0; i < numKeys; ++i) {
	                                var keyPath = keyPaths[i], val = changes[keyPath];
	                                if (getByKeyPath(item, keyPath) !== val) {
	                                    setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
	                                    anythingModified = true;
	                                }
	                            }
	                            return anythingModified;
	                        }; 
	                    } else {
	                        // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
	                        // allow it to add additional modifications to make.
	                        var origChanges = changes;
	                        changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
	                        modifyer = function (item) {
	                            var anythingModified = false;
	                            var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
	                            if (additionalChanges) extend(changes, additionalChanges);
	                            Object.keys(changes).forEach(function (keyPath) {
	                                var val = changes[keyPath];
	                                if (getByKeyPath(item, keyPath) !== val) {
	                                    setByKeyPath(item, keyPath, val);
	                                    anythingModified = true;
	                                }
	                            });
	                            if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
	                            return anythingModified;
	                        }; 
	                    }

	                    var count = 0;
	                    var successCount = 0;
	                    var iterationComplete = false;
	                    var failures = [];
	                    var failKeys = [];
	                    var currentKey = null;

	                    function modifyItem(item, cursor, advance) {
	                        currentKey = cursor.primaryKey;
	                        var thisContext = { primKey: cursor.primaryKey, value: item };
	                        if (modifyer.call(thisContext, item) !== false) { // If a callback explicitely returns false, do not perform the update!
	                            var bDelete = !thisContext.hasOwnProperty("value");
	                            var req = (bDelete ? cursor.delete() : cursor.update(thisContext.value));
	                            ++count;
	                            req.onerror = eventRejectHandler(function (e) {
	                                failures.push(e);
	                                failKeys.push(thisContext.primKey);
	                                if (thisContext.onerror) thisContext.onerror(e);
	                                checkFinished();
	                                return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
	                            }, bDelete ? ["deleting", item, "from", ctx.table.name] : ["modifying", item, "on", ctx.table.name]);
	                            req.onsuccess = function (ev) {
	                                if (thisContext.onsuccess) thisContext.onsuccess(thisContext.value);
	                                ++successCount;
	                                checkFinished();
	                            }; 
	                        } else if (thisContext.onsuccess) {
	                            // Hook will expect either onerror or onsuccess to always be called!
	                            thisContext.onsuccess(thisContext.value);
	                        }
	                    }

	                    function doReject(e) {
	                        if (e) {
	                            failures.push(e);
	                            failKeys.push(currentKey);
	                        }
	                        return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
	                    }

	                    function checkFinished() {
	                        if (iterationComplete && successCount + failures.length === count) {
	                            if (failures.length > 0)
	                                doReject();
	                            else
	                                resolve(successCount);
	                        }
	                    }
	                    self._iterate(modifyItem, function () {
	                        iterationComplete = true;
	                        checkFinished();
	                    }, doReject, idbstore);
	                });
	            },

	            'delete': function () {
	                return this.modify(function () { delete this.value; });
	            }
	        });


	        //
	        //
	        //
	        // ------------------------- Help functions ---------------------------
	        //
	        //
	        //

	        function lowerVersionFirst(a, b) {
	            return a._cfg.version - b._cfg.version;
	        }

	        function setApiOnPlace(objs, transactionPromiseFactory, tableNames, mode, dbschema, enableProhibitedDB) {
	            tableNames.forEach(function (tableName) {
	                var tableInstance = db._tableFactory(mode, dbschema[tableName], transactionPromiseFactory);
	                objs.forEach(function (obj) {
	                    if (!obj[tableName]) {
	                        if (enableProhibitedDB) {
	                            Object.defineProperty(obj, tableName, {
	                                configurable: true,
	                                enumerable: true,
	                                get: function () {
										var currentTrans = Promise.PSD && Promise.PSD.trans;
	                                    if (currentTrans && currentTrans.db === db) {
	                                        return currentTrans.tables[tableName];
	                                    }
	                                    return tableInstance;
	                                }
	                            });
	                        } else {
	                            obj[tableName] = tableInstance;
	                        }
	                    }
	                });
	            });
	        }

	        function removeTablesApi(objs) {
	            objs.forEach(function (obj) {
	                for (var key in obj) {
	                    if (obj[key] instanceof Table) delete obj[key];
	                }
	            });
	        }

	        function iterate(req, filter, fn, resolve, reject, readingHook) {
	            var psd = Promise.PSD;
	            readingHook = readingHook || mirror;
	            if (!req.onerror) req.onerror = eventRejectHandler(reject);
	            if (filter) {
	                req.onsuccess = trycatch(function filter_record(e) {
	                    var cursor = req.result;
	                    if (cursor) {
	                        var c = function () { cursor.continue(); };
	                        if (filter(cursor, function (advancer) { c = advancer; }, resolve, reject))
	                            fn(readingHook(cursor.value), cursor, function (advancer) { c = advancer; });
	                        c();
	                    } else {
	                        resolve();
	                    }
	                }, reject, psd);
	            } else {
	                req.onsuccess = trycatch(function filter_record(e) {
	                    var cursor = req.result;
	                    if (cursor) {
	                        var c = function () { cursor.continue(); };
	                        fn(readingHook(cursor.value), cursor, function (advancer) { c = advancer; });
	                        c();
	                    } else {
	                        resolve();
	                    }
	                }, reject, psd);
	            }
	        }

	        function parseIndexSyntax(indexes) {
	            /// <param name="indexes" type="String"></param>
	            /// <returns type="Array" elementType="IndexSpec"></returns>
	            var rv = [];
	            indexes.split(',').forEach(function (index) {
	                index = index.trim();
	                var name = index.replace("&", "").replace("++", "").replace("*", "");
	                var keyPath = (name.indexOf('[') !== 0 ? name : index.substring(index.indexOf('[') + 1, index.indexOf(']')).split('+'));

	                rv.push(new IndexSpec(
	                    name,
	                    keyPath || null,
	                    index.indexOf('&') !== -1,
	                    index.indexOf('*') !== -1,
	                    index.indexOf("++") !== -1,
	                    Array.isArray(keyPath),
	                    keyPath.indexOf('.') !== -1
	                ));
	            });
	            return rv;
	        }

	        function ascending(a, b) {
	            return a < b ? -1 : a > b ? 1 : 0;
	        }

	        function descending(a, b) {
	            return a < b ? 1 : a > b ? -1 : 0;
	        }

	        function compoundCompare(itemCompare) {
	            return function (a, b) {
	                var i = 0;
	                while (true) {
	                    var result = itemCompare(a[i], b[i]);
	                    if (result !== 0) return result;
	                    ++i;
	                    if (i === a.length || i === b.length)
	                        return itemCompare(a.length, b.length);
	                }
	            };
	        }

	        function combine(filter1, filter2) {
	            return filter1 ? filter2 ? function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } : filter1 : filter2;
	        }

	        function hasIEDeleteObjectStoreBug() {
	            // Assume bug is present in IE10 and IE11 but dont expect it in next version of IE (IE12)
	            return navigator.userAgent.indexOf("Trident") >= 0 || navigator.userAgent.indexOf("MSIE") >= 0;
	        }

	        function readGlobalSchema() {
	            db.verno = idbdb.version / 10;
	            db._dbSchema = globalSchema = {};
	            dbStoreNames = [].slice.call(idbdb.objectStoreNames, 0);
	            if (dbStoreNames.length === 0) return; // Database contains no stores.
	            var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
	            dbStoreNames.forEach(function (storeName) {
	                var store = trans.objectStore(storeName),
	                    keyPath = store.keyPath,
	                    dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
	                var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
	                var indexes = [];
	                for (var j = 0; j < store.indexNames.length; ++j) {
	                    var idbindex = store.index(store.indexNames[j]);
	                    keyPath = idbindex.keyPath;
	                    dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
	                    var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
	                    indexes.push(index);
	                }
	                globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
	            });
	            setApiOnPlace([allTables], db._transPromiseFactory, Object.keys(globalSchema), READWRITE, globalSchema);
	        }

	        function adjustToExistingIndexNames(schema, idbtrans) {
	            /// <summary>
	            /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
	            /// </summary>
	            /// <param name="schema" type="Object">Map between name and TableSchema</param>
	            /// <param name="idbtrans" type="IDBTransaction"></param>
	            var storeNames = idbtrans.db.objectStoreNames;
	            for (var i = 0; i < storeNames.length; ++i) {
	                var storeName = storeNames[i];
	                var store = idbtrans.objectStore(storeName);
	                for (var j = 0; j < store.indexNames.length; ++j) {
	                    var indexName = store.indexNames[j];
	                    var keyPath = store.index(indexName).keyPath;
	                    var dexieName = typeof keyPath === 'string' ? keyPath : "[" + [].slice.call(keyPath).join('+') + "]";
	                    if (schema[storeName]) {
	                        var indexSpec = schema[storeName].idxByName[dexieName];
	                        if (indexSpec) indexSpec.name = indexName;
	                    }
	                }
	            }
	        }

	        extend(this, {
	            Collection: Collection,
	            Table: Table,
	            Transaction: Transaction,
	            Version: Version,
	            WhereClause: WhereClause,
	            WriteableCollection: WriteableCollection,
	            WriteableTable: WriteableTable
	        });

	        init();

	        addons.forEach(function (fn) {
	            fn(db);
	        });
	    }

	    //
	    // Promise Class
	    //
	    // A variant of promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
	    //
	    // Modified by David Fahlander to be indexedDB compliant (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
	    // This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
	    // the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise. We fix this by using the member variable constructing to check
	    // whether the object is being constructed when reject or resolve is called. If so, the use setTimeout/setImmediate to fulfill the promise, otherwise, we know that it's not needed.
	    //
	    // This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45 and this implementation solves that issue.
	    //
	    // Another feature with this Promise implementation is that reject will return false in case no one catched the reject call. This is used
	    // to stopPropagation() on the IDBRequest error event in case it was catched but not otherwise.
	    //
	    // Also, the event new Promise().onuncatched is called in case no one catches a reject call. This is used for us to manually bubble any request
	    // errors to the transaction. We must not rely on IndexedDB implementation to do this, because it only does so when the source of the rejection
	    // is an error event on a request, not in case an ordinary exception is thrown.
	    var Promise = (function () {

	        // The use of asap in handle() is remarked because we must NOT use setTimeout(fn,0) because it causes premature commit of indexedDB transactions - which is according to indexedDB specification.
	        var _slice = [].slice;
	        var _asap = typeof setImmediate === 'undefined' ? function(fn, arg1, arg2, argN) {
	            var args = arguments;
	            setTimeout(function() { fn.apply(global, _slice.call(args, 1)); }, 0); // If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
	        } : setImmediate; // IE10+ and node.

	        doFakeAutoComplete(function () {
	            // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
	            _asap = asap = enqueueImmediate = function(fn) {
	                var args = arguments; setTimeout(function() { fn.apply(global, _slice.call(args, 1)); }, 0);
	            };
	        });

	        var asap = _asap,
	            isRootExecution = true;

	        var operationsQueue = [];
	        var tickFinalizers = [];
	        function enqueueImmediate(fn, args) {
	            operationsQueue.push([fn, _slice.call(arguments, 1)]);
	        }

	        function executeOperationsQueue() {
	            var queue = operationsQueue;
	            operationsQueue = [];
	            for (var i = 0, l = queue.length; i < l; ++i) {
	                var item = queue[i];
	                item[0].apply(global, item[1]);
	            }
	        }

	        //var PromiseID = 0;
	        function Promise(fn) {
	            if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
	            if (typeof fn !== 'function') throw new TypeError('not a function');
	            this._state = null; // null (=pending), false (=rejected) or true (=resolved)
	            this._value = null; // error or result
	            this._deferreds = [];
	            this._catched = false; // for onuncatched
	            //this._id = ++PromiseID;
	            var self = this;
	            var constructing = true;
	            this._PSD = Promise.PSD;

	            try {
	                doResolve(this, fn, function (data) {
	                    if (constructing)
	                        asap(resolve, self, data);
	                    else
	                        resolve(self, data);
	                }, function (reason) {
	                    if (constructing) {
	                        asap(reject, self, reason);
	                        return false;
	                    } else {
	                        return reject(self, reason);
	                    }
	                });
	            } finally {
	                constructing = false;
	            }
	        }

	        function handle(self, deferred) {
	            if (self._state === null) {
	                self._deferreds.push(deferred);
	                return;
	            }

	            var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
	            if (cb === null) {
	                // This Deferred doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
	                return (self._state ? deferred.resolve : deferred.reject)(self._value);
	            }
	            var ret, isRootExec = isRootExecution;
	            isRootExecution = false;
	            asap = enqueueImmediate;
	            try {
	                var outerPSD = Promise.PSD;
	                Promise.PSD = self._PSD;
	                ret = cb(self._value);
	                if (!self._state && (!ret || typeof ret.then !== 'function' || ret._state !== false)) setCatched(self); // Caller did 'return Promise.reject(err);' - don't regard it as catched!
	                deferred.resolve(ret);
	            } catch (e) {
	                var catched = deferred.reject(e);
	                if (!catched && self.onuncatched) {
	                    try {
	                        self.onuncatched(e);
	                    } catch (e) {
	                    }
	                }
	            } finally {
	                Promise.PSD = outerPSD;
	                if (isRootExec) {
	                    do {
	                        while (operationsQueue.length > 0) executeOperationsQueue();
	                        var finalizer = tickFinalizers.pop();
	                        if (finalizer) try {finalizer();} catch(e){}
	                    } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
	                    asap = _asap;
	                    isRootExecution = true;
	                }
	            }
	        }

	        function _rootExec(fn) {
	            var isRootExec = isRootExecution;
	            isRootExecution = false;
	            asap = enqueueImmediate;
	            try {
	                fn();
	            } finally {
	                if (isRootExec) {
	                    do {
	                        while (operationsQueue.length > 0) executeOperationsQueue();
	                        var finalizer = tickFinalizers.pop();
	                        if (finalizer) try { finalizer(); } catch (e) { }
	                    } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
	                    asap = _asap;
	                    isRootExecution = true;
	                }
	            }
	        }

	        function setCatched(promise) {
	            promise._catched = true;
	            if (promise._parent) setCatched(promise._parent);
	        }

	        function resolve(promise, newValue) {
	            var outerPSD = Promise.PSD;
	            Promise.PSD = promise._PSD;
	            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	                if (newValue === promise) throw new TypeError('A promise cannot be resolved with itself.');
	                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
	                    if (typeof newValue.then === 'function') {
	                        doResolve(promise, function (resolve, reject) {
	                            //newValue instanceof Promise ? newValue._then(resolve, reject) : newValue.then(resolve, reject);
	                            newValue.then(resolve, reject);
	                        }, function (data) {
	                            resolve(promise, data);
	                        }, function (reason) {
	                            reject(promise, reason);
	                        });
	                        return;
	                    }
	                }
	                promise._state = true;
	                promise._value = newValue;
	                finale.call(promise);
	            } catch (e) { reject(e); } finally {
	                Promise.PSD = outerPSD;
	            }
	        }

	        function reject(promise, newValue) {
	            var outerPSD = Promise.PSD;
	            Promise.PSD = promise._PSD;
	            promise._state = false;
	            promise._value = newValue;

	            finale.call(promise);
	            if (!promise._catched) {
	                try {
	                    if (promise.onuncatched)
	                        promise.onuncatched(promise._value);
	                    Promise.on.error.fire(promise._value);
	                } catch (e) {
	                }
	            }
	            Promise.PSD = outerPSD;
	            return promise._catched;
	        }

	        function finale() {
	            for (var i = 0, len = this._deferreds.length; i < len; i++) {
	                handle(this, this._deferreds[i]);
	            }
	            this._deferreds = [];
	        }

	        function Deferred(onFulfilled, onRejected, resolve, reject) {
	            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	            this.resolve = resolve;
	            this.reject = reject;
	        }

	        /**
	         * Take a potentially misbehaving resolver function and make sure
	         * onFulfilled and onRejected are only called once.
	         *
	         * Makes no guarantees about asynchrony.
	         */
	        function doResolve(promise, fn, onFulfilled, onRejected) {
	            var done = false;
	            try {
	                fn(function Promise_resolve(value) {
	                    if (done) return;
	                    done = true;
	                    onFulfilled(value);
	                }, function Promise_reject(reason) {
	                    if (done) return promise._catched;
	                    done = true;
	                    return onRejected(reason);
	                });
	            } catch (ex) {
	                if (done) return;
	                return onRejected(ex);
	            }
	        }

	        Promise.on = events(null, "error");

	        Promise.all = function () {
	            var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);

	            return new Promise(function (resolve, reject) {
	                if (args.length === 0) return resolve([]);
	                var remaining = args.length;
	                function res(i, val) {
	                    try {
	                        if (val && (typeof val === 'object' || typeof val === 'function')) {
	                            var then = val.then;
	                            if (typeof then === 'function') {
	                                then.call(val, function (val) { res(i, val); }, reject);
	                                return;
	                            }
	                        }
	                        args[i] = val;
	                        if (--remaining === 0) {
	                            resolve(args);
	                        }
	                    } catch (ex) {
	                        reject(ex);
	                    }
	                }
	                for (var i = 0; i < args.length; i++) {
	                    res(i, args[i]);
	                }
	            });
	        };

	        /* Prototype Methods */
	        Promise.prototype.then = function (onFulfilled, onRejected) {
	            var self = this;
	            var p = new Promise(function (resolve, reject) {
	                if (self._state === null)
	                    handle(self, new Deferred(onFulfilled, onRejected, resolve, reject));
	                else
	                    asap(handle, self, new Deferred(onFulfilled, onRejected, resolve, reject));
	            });
	            p._PSD = this._PSD;
	            p.onuncatched = this.onuncatched; // Needed when exception occurs in a then() clause of a successful parent promise. Want onuncatched to be called even in callbacks of callbacks of the original promise.
	            p._parent = this; // Used for recursively calling onuncatched event on self and all parents.
	            return p;
	        };

	        Promise.prototype._then = function (onFulfilled, onRejected) {
	            handle(this, new Deferred(onFulfilled, onRejected, nop,nop));
	        };

	        Promise.prototype['catch'] = function (onRejected) {
	            if (arguments.length === 1) return this.then(null, onRejected);
	            // First argument is the Error type to catch
	            var type = arguments[0], callback = arguments[1];
	            if (typeof type === 'function') return this.then(null, function (e) {
	                // Catching errors by its constructor type (similar to java / c++ / c#)
	                // Sample: promise.catch(TypeError, function (e) { ... });
	                if (e instanceof type) return callback(e); else return Promise.reject(e);
	            });
	            else return this.then(null, function (e) {
	                // Catching errors by the error.name property. Makes sense for indexedDB where error type
	                // is always DOMError but where e.name tells the actual error type.
	                // Sample: promise.catch('ConstraintError', function (e) { ... });
	                if (e && e.name === type) return callback(e); else return Promise.reject(e);
	            });
	        };

	        Promise.prototype['finally'] = function (onFinally) {
	            return this.then(function (value) {
	                onFinally();
	                return value;
	            }, function (err) {
	                onFinally();
	                return Promise.reject(err);
	            });
	        };

	        Promise.prototype.onuncatched = null; // Optional event triggered if promise is rejected but no one listened.

	        Promise.resolve = function (value) {
	            var p = new Promise(function () { });
	            p._state = true;
	            p._value = value;
	            return p;
	        };

	        Promise.reject = function (value) {
	            var p = new Promise(function () { });
	            p._state = false;
	            p._value = value;
	            return p;
	        };

	        Promise.race = function (values) {
	            return new Promise(function (resolve, reject) {
	                values.map(function (value) {
	                    value.then(resolve, reject);
	                });
	            });
	        };

	        Promise.PSD = null; // Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises. TODO: Rename Promise.PSD to Promise.data

	        Promise.newPSD = function (fn) {
	            // Create new PSD scope (Promise Specific Data)
	            var outerScope = Promise.PSD;
	            Promise.PSD = outerScope ? Object.create(outerScope) : {};
	            try {
	                return fn();
	            } finally {
	                Promise.PSD = outerScope;
	            }
	        };

	        Promise._rootExec = _rootExec;
	        Promise._tickFinalize = function(callback) {
	            if (isRootExecution) throw new Error("Not in a virtual tick");
	            tickFinalizers.push(callback);
	        };

	        return Promise;
	    })();


	    //
	    //
	    // ------ Exportable Help Functions -------
	    //
	    //

	    function nop() { }
	    function mirror(val) { return val; }

	    function pureFunctionChain(f1, f2) {
	        // Enables chained events that takes ONE argument and returns it to the next function in chain.
	        // This pattern is used in the hook("reading") event.
	        if (f1 === mirror) return f2;
	        return function (val) {
	            return f2(f1(val));
	        }; 
	    }

	    function callBoth(on1, on2) {
	        return function () {
	            on1.apply(this, arguments);
	            on2.apply(this, arguments);
	        }; 
	    }

	    function hookCreatingChain(f1, f2) {
	        // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
	        // This pattern is used in the hook("creating") event.
	        if (f1 === nop) return f2;
	        return function () {
	            var res = f1.apply(this, arguments);
	            if (res !== undefined) arguments[0] = res;
	            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
	                onerror = this.onerror;     // In case event listener has set this.onerror
	            delete this.onsuccess;
	            delete this.onerror;
	            var res2 = f2.apply(this, arguments);
	            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	            return res2 !== undefined ? res2 : res;
	        }; 
	    }

	    function hookUpdatingChain(f1, f2) {
	        if (f1 === nop) return f2;
	        return function () {
	            var res = f1.apply(this, arguments);
	            if (res !== undefined) extend(arguments[0], res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
	            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
	                onerror = this.onerror;     // In case event listener has set this.onerror
	            delete this.onsuccess;
	            delete this.onerror;
	            var res2 = f2.apply(this, arguments);
	            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	            return res === undefined ?
	                (res2 === undefined ? undefined : res2) :
	                (res2 === undefined ? res : extend(res, res2));
	        }; 
	    }

	    function stoppableEventChain(f1, f2) {
	        // Enables chained events that may return false to stop the event chain.
	        if (f1 === nop) return f2;
	        return function () {
	            if (f1.apply(this, arguments) === false) return false;
	            return f2.apply(this, arguments);
	        }; 
	    }

	    function reverseStoppableEventChain(f1, f2) {
	        if (f1 === nop) return f2;
	        return function () {
	            if (f2.apply(this, arguments) === false) return false;
	            return f1.apply(this, arguments);
	        }; 
	    }

	    function nonStoppableEventChain(f1, f2) {
	        if (f1 === nop) return f2;
	        return function () {
	            f1.apply(this, arguments);
	            f2.apply(this, arguments);
	        }; 
	    }

	    function promisableChain(f1, f2) {
	        if (f1 === nop) return f2;
	        return function () {
	            var res = f1.apply(this, arguments);
	            if (res && typeof res.then === 'function') {
	                var thiz = this, args = arguments;
	                return res.then(function () {
	                    return f2.apply(thiz, args);
	                });
	            }
	            return f2.apply(this, arguments);
	        }; 
	    }

	    function events(ctx, eventNames) {
	        var args = arguments;
	        var evs = {};
	        var rv = function (eventName, subscriber) {
	            if (subscriber) {
	                // Subscribe
	                var args = [].slice.call(arguments, 1);
	                var ev = evs[eventName];
	                ev.subscribe.apply(ev, args);
	                return ctx;
	            } else if (typeof (eventName) === 'string') {
	                // Return interface allowing to fire or unsubscribe from event
	                return evs[eventName];
	            }
	        }; 
	        rv.addEventType = add;

	        function add(eventName, chainFunction, defaultFunction) {
	            if (Array.isArray(eventName)) return addEventGroup(eventName);
	            if (typeof eventName === 'object') return addConfiguredEvents(eventName);
	            if (!chainFunction) chainFunction = stoppableEventChain;
	            if (!defaultFunction) defaultFunction = nop;

	            var context = {
	                subscribers: [],
	                fire: defaultFunction,
	                subscribe: function (cb) {
	                    context.subscribers.push(cb);
	                    context.fire = chainFunction(context.fire, cb);
	                },
	                unsubscribe: function (cb) {
	                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
	                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
	                }
	            };
	            evs[eventName] = rv[eventName] = context;
	            return context;
	        }

	        function addConfiguredEvents(cfg) {
	            // events(this, {reading: [functionChain, nop]});
	            Object.keys(cfg).forEach(function (eventName) {
	                var args = cfg[eventName];
	                if (Array.isArray(args)) {
	                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
	                } else if (args === 'asap') {
	                    // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
	                    // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
	                    var context = add(eventName, null, function fire() {
	                        var args = arguments;
	                        context.subscribers.forEach(function (fn) {
	                            asap(function fireEvent() {
	                                fn.apply(global, args);
	                            });
	                        });
	                    });
	                    context.subscribe = function (fn) {
	                        // Change how subscribe works to not replace the fire function but to just add the subscriber to subscribers
	                        if (context.subscribers.indexOf(fn) === -1)
	                            context.subscribers.push(fn);
	                    }; 
	                    context.unsubscribe = function (fn) {
	                        // Change how unsubscribe works for the same reason as above.
	                        var idxOfFn = context.subscribers.indexOf(fn);
	                        if (idxOfFn !== -1) context.subscribers.splice(idxOfFn, 1);
	                    }; 
	                } else throw new Error("Invalid event config");
	            });
	        }

	        function addEventGroup(eventGroup) {
	            // promise-based event group (i.e. we promise to call one and only one of the events in the pair, and to only call it once.
	            var done = false;
	            eventGroup.forEach(function (name) {
	                add(name).subscribe(checkDone);
	            });
	            function checkDone() {
	                if (done) return false;
	                done = true;
	            }
	        }

	        for (var i = 1, l = args.length; i < l; ++i) {
	            add(args[i]);
	        }

	        return rv;
	    }

	    function assert(b) {
	        if (!b) throw new Error("Assertion failed");
	    }

	    function asap(fn) {
	        if (global.setImmediate) setImmediate(fn); else setTimeout(fn, 0);
	    }

	    var fakeAutoComplete = function () { };// Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())
	    var fake = false; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())

	    function doFakeAutoComplete(fn) {
	        var to = setTimeout(fn, 1000);
	        clearTimeout(to);
	    }

	    function trycatch(fn, reject, psd) {
	        return function () {
	            var outerPSD = Promise.PSD; // Support Promise-specific data (PSD) in callback calls
	            Promise.PSD = psd;
	            try {
	                fn.apply(this, arguments);
	            } catch (e) {
	                reject(e);
	            } finally {
	                Promise.PSD = outerPSD;
	            }
	        };
	    }

	    function getByKeyPath(obj, keyPath) {
	        // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
	        if (obj.hasOwnProperty(keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
	        if (!keyPath) return obj;
	        if (typeof keyPath !== 'string') {
	            var rv = [];
	            for (var i = 0, l = keyPath.length; i < l; ++i) {
	                var val = getByKeyPath(obj, keyPath[i]);
	                rv.push(val);
	            }
	            return rv;
	        }
	        var period = keyPath.indexOf('.');
	        if (period !== -1) {
	            var innerObj = obj[keyPath.substr(0, period)];
	            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
	        }
	        return undefined;
	    }

	    function setByKeyPath(obj, keyPath, value) {
	        if (!obj || keyPath === undefined) return;
	        if (typeof keyPath !== 'string' && 'length' in keyPath) {
	            assert(typeof value !== 'string' && 'length' in value);
	            for (var i = 0, l = keyPath.length; i < l; ++i) {
	                setByKeyPath(obj, keyPath[i], value[i]);
	            }
	        } else {
	            var period = keyPath.indexOf('.');
	            if (period !== -1) {
	                var currentKeyPath = keyPath.substr(0, period);
	                var remainingKeyPath = keyPath.substr(period + 1);
	                if (remainingKeyPath === "")
	                    if (value === undefined) delete obj[currentKeyPath]; else obj[currentKeyPath] = value;
	                else {
	                    var innerObj = obj[currentKeyPath];
	                    if (!innerObj) innerObj = (obj[currentKeyPath] = {});
	                    setByKeyPath(innerObj, remainingKeyPath, value);
	                }
	            } else {
	                if (value === undefined) delete obj[keyPath]; else obj[keyPath] = value;
	            }
	        }
	    }

	    function delByKeyPath(obj, keyPath) {
	        if (typeof keyPath === 'string')
	            setByKeyPath(obj, keyPath, undefined);
	        else if ('length' in keyPath)
	            [].map.call(keyPath, function(kp) {
	                 setByKeyPath(obj, kp, undefined);
	            });
	    }

	    function shallowClone(obj) {
	        var rv = {};
	        for (var m in obj) {
	            if (obj.hasOwnProperty(m)) rv[m] = obj[m];
	        }
	        return rv;
	    }

	    function deepClone(any) {
	        if (!any || typeof any !== 'object') return any;
	        var rv;
	        if (Array.isArray(any)) {
	            rv = [];
	            for (var i = 0, l = any.length; i < l; ++i) {
	                rv.push(deepClone(any[i]));
	            }
	        } else if (any instanceof Date) {
	            rv = new Date();
	            rv.setTime(any.getTime());
	        } else {
	            rv = any.constructor ? Object.create(any.constructor.prototype) : {};
	            for (var prop in any) {
	                if (any.hasOwnProperty(prop)) {
	                    rv[prop] = deepClone(any[prop]);
	                }
	            }
	        }
	        return rv;
	    }

	    function getObjectDiff(a, b) {
	        // This is a simplified version that will always return keypaths on the root level.
	        // If for example a and b differs by: (a.somePropsObject.x != b.somePropsObject.x), we will return that "somePropsObject" is changed
	        // and not "somePropsObject.x". This is acceptable and true but could be optimized to support nestled changes if that would give a
	        // big optimization benefit.
	        var rv = {};
	        for (var prop in a) if (a.hasOwnProperty(prop)) {
	            if (!b.hasOwnProperty(prop))
	                rv[prop] = undefined; // Property removed
	            else if (a[prop] !== b[prop] && JSON.stringify(a[prop]) != JSON.stringify(b[prop]))
	                rv[prop] = b[prop]; // Property changed
	        }
	        for (var prop in b) if (b.hasOwnProperty(prop) && !a.hasOwnProperty(prop)) {
	            rv[prop] = b[prop]; // Property added
	        }
	        return rv;
	    }

	    function parseType(type) {
	        if (typeof type === 'function') {
	            return new type();
	        } else if (Array.isArray(type)) {
	            return [parseType(type[0])];
	        } else if (type && typeof type === 'object') {
	            var rv = {};
	            applyStructure(rv, type);
	            return rv;
	        } else {
	            return type;
	        }
	    }

	    function applyStructure(obj, structure) {
	        Object.keys(structure).forEach(function (member) {
	            var value = parseType(structure[member]);
	            obj[member] = value;
	        });
	    }

	    function eventRejectHandler(reject, sentance) {
	        return function (event) {
	            var errObj = (event && event.target.error) || new Error();
	            if (sentance) {
	                var occurredWhen = " occurred when " + sentance.map(function (word) {
	                    switch (typeof (word)) {
	                        case 'function': return word();
	                        case 'string': return word;
	                        default: return JSON.stringify(word);
	                    }
	                }).join(" ");
	                if (errObj.name) {
	                    errObj.toString = function toString() {
	                        return errObj.name + occurredWhen + (errObj.message ? ". " + errObj.message : "");
	                        // Code below works for stacked exceptions, BUT! stack is never present in event errors (not in any of the browsers). So it's no use to include it!
	                        /*delete this.toString; // Prohibiting endless recursiveness in IE.
	                        if (errObj.stack) rv += (errObj.stack ? ". Stack: " + errObj.stack : "");
	                        this.toString = toString;
	                        return rv;*/
	                    };
	                } else {
	                    errObj = errObj + occurredWhen;
	                }
	            };
	            reject(errObj);

	            if (event) {// Old versions of IndexedDBShim doesnt provide an error event
	                // Stop error from propagating to IDBTransaction. Let us handle that manually instead.
	                if (event.stopPropagation) // IndexedDBShim doesnt support this
	                    event.stopPropagation();
	                if (event.preventDefault) // IndexedDBShim doesnt support this
	                    event.preventDefault();
	            }

	            return false;
	        };
	    }

	    function stack(error) {
	        try {
	            throw error;
	        } catch (e) {
	            return e;
	        }
	    }
	    function preventDefault(e) {
	        e.preventDefault();
	    }

	    function globalDatabaseList(cb) {
	        var val,
	            localStorage = Dexie.dependencies.localStorage;
	        if (!localStorage) return cb([]); // Envs without localStorage support
	        try {
	            val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
	        } catch (e) {
	            val = [];
	        }
	        if (cb(val)) {
	            localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
	        }
	    }

	    //
	    // IndexSpec struct
	    //
	    function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
	        /// <param name="name" type="String"></param>
	        /// <param name="keyPath" type="String"></param>
	        /// <param name="unique" type="Boolean"></param>
	        /// <param name="multi" type="Boolean"></param>
	        /// <param name="auto" type="Boolean"></param>
	        /// <param name="compound" type="Boolean"></param>
	        /// <param name="dotted" type="Boolean"></param>
	        this.name = name;
	        this.keyPath = keyPath;
	        this.unique = unique;
	        this.multi = multi;
	        this.auto = auto;
	        this.compound = compound;
	        this.dotted = dotted;
	        var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && ('[' + [].join.call(keyPath, '+') + ']');
	        this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
	    }

	    //
	    // TableSchema struct
	    //
	    function TableSchema(name, primKey, indexes, instanceTemplate) {
	        /// <param name="name" type="String"></param>
	        /// <param name="primKey" type="IndexSpec"></param>
	        /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
	        /// <param name="instanceTemplate" type="Object"></param>
	        this.name = name;
	        this.primKey = primKey || new IndexSpec();
	        this.indexes = indexes || [new IndexSpec()];
	        this.instanceTemplate = instanceTemplate;
	        this.mappedClass = null;
	        this.idxByName = indexes.reduce(function (hashSet, index) {
	            hashSet[index.name] = index;
	            return hashSet;
	        }, {});
	    }

	    //
	    // ModifyError Class (extends Error)
	    //
	    function ModifyError(msg, failures, successCount, failedKeys) {
	        this.name = "ModifyError";
	        this.failures = failures;
	        this.failedKeys = failedKeys;
	        this.successCount = successCount;
	        this.message = failures.join('\n');
	    }
	    derive(ModifyError).from(Error);

	    //
	    // Static delete() method.
	    //
	    Dexie.delete = function (databaseName) {
	        var db = new Dexie(databaseName),
	            promise = db.delete();
	        promise.onblocked = function (fn) {
	            db.on("blocked", fn);
	            return this;
	        };
	        return promise;
	    };

	    //
	    // Static exists() method.
	    //
	    Dexie.exists = function(name) {
	        return new Dexie(name).open().then(function(db) {
	            db.close();
	            return true;
	        }, function() {
	            return false;
	        });
	    }

	    //
	    // Static method for retrieving a list of all existing databases at current host.
	    //
	    Dexie.getDatabaseNames = function (cb) {
	        return new Promise(function (resolve, reject) {
	            var getDatabaseNames = getNativeGetDatabaseNamesFn();
	            if (getDatabaseNames) { // In case getDatabaseNames() becomes standard, let's prepare to support it:
	                var req = getDatabaseNames();
	                req.onsuccess = function (event) {
	                    resolve([].slice.call(event.target.result, 0)); // Converst DOMStringList to Array<String>
	                }; 
	                req.onerror = eventRejectHandler(reject);
	            } else {
	                globalDatabaseList(function (val) {
	                    resolve(val);
	                    return false;
	                });
	            }
	        }).then(cb);
	    }; 

	    Dexie.defineClass = function (structure) {
	        /// <summary>
	        ///     Create a javascript constructor based on given template for which properties to expect in the class.
	        ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
	        /// </summary>
	        /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
	        /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

	        // Default constructor able to copy given properties into this object.
	        function Class(properties) {
	            /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
	            /// </param>
	            properties ? extend(this, properties) : fake && applyStructure(this, structure);
	        }
	        return Class;
	    }; 

	    Dexie.ignoreTransaction = function (scopeFunc) {
	        // In case caller is within a transaction but needs to create a separate transaction.
	        // Example of usage:
	        // 
	        // Let's say we have a logger function in our app. Other application-logic should be unaware of the
	        // logger function and not need to include the 'logentries' table in all transaction it performs.
	        // The logging should always be done in a separate transaction and not be dependant on the current
	        // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
	        //
	        //     Dexie.ignoreTransaction(function() {
	        //         db.logentries.add(newLogEntry);
	        //     });
	        //
	        // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
	        // in current Promise-scope.
	        //
	        // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
	        // API for this because
	        //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
	        //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
	        //  3) setImmediate() is not supported in the ES standard.
	        return Promise.newPSD(function () {
	            Promise.PSD.trans = null;
	            return scopeFunc();
	        });
	    };
	    Dexie.spawn = function () {
	        if (global.console) console.warn("Dexie.spawn() is deprecated. Use Dexie.ignoreTransaction() instead.");
	        return Dexie.ignoreTransaction.apply(this, arguments);
	    }

	    Dexie.vip = function (fn) {
	        // To be used by subscribers to the on('ready') event.
	        // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
	        // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
	        // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
	        // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
	        // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
	        // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
	        // the caller will not resolve until database is opened.
	        return Promise.newPSD(function () {
	            Promise.PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
	            return fn();
	        });
	    }; 

	    // Dexie.currentTransaction property. Only applicable for transactions entered using the new "transact()" method.
	    Object.defineProperty(Dexie, "currentTransaction", {
	        get: function () {
	            /// <returns type="Transaction"></returns>
	            return Promise.PSD && Promise.PSD.trans || null;
	        }
	    }); 

	    function safariMultiStoreFix(storeNames) {
	        return storeNames.length === 1 ? storeNames[0] : storeNames;
	    }

	    // Export our Promise implementation since it can be handy as a standalone Promise implementation
	    Dexie.Promise = Promise;
	    // Export our derive/extend/override methodology
	    Dexie.derive = derive;
	    Dexie.extend = extend;
	    Dexie.override = override;
	    // Export our events() function - can be handy as a toolkit
	    Dexie.events = events;
	    Dexie.getByKeyPath = getByKeyPath;
	    Dexie.setByKeyPath = setByKeyPath;
	    Dexie.delByKeyPath = delByKeyPath;
	    Dexie.shallowClone = shallowClone;
	    Dexie.deepClone = deepClone;
	    Dexie.addons = [];
	    Dexie.fakeAutoComplete = fakeAutoComplete;
	    Dexie.asap = asap;
	    // Export our static classes
	    Dexie.ModifyError = ModifyError;
	    Dexie.MultiModifyError = ModifyError; // Backward compatibility pre 0.9.8
	    Dexie.IndexSpec = IndexSpec;
	    Dexie.TableSchema = TableSchema;
	    //
	    // Dependencies
	    //
	    // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
	    //
	    // In node.js, however, these properties must be set "manually" before instansiating a new Dexie(). For node.js, you need to require indexeddb-js or similar and then set these deps.
	    //
	    var idbshim = global.idbModules && global.idbModules.shimIndexedDB ? global.idbModules : {};
	    Dexie.dependencies = {
	        // Required:
	        // NOTE: The "_"-prefixed versions are for prioritizing IDB-shim on IOS8 before the native IDB in case the shim was included.
	        indexedDB: idbshim.shimIndexedDB || global.indexedDB || global.mozIndexedDB || global.webkitIndexedDB || global.msIndexedDB,
	        IDBKeyRange: idbshim.IDBKeyRange || global.IDBKeyRange || global.webkitIDBKeyRange,
	        IDBTransaction: idbshim.IDBTransaction || global.IDBTransaction || global.webkitIDBTransaction,
	        // Optional:
	        Error: global.Error || String,
	        SyntaxError: global.SyntaxError || String,
	        TypeError: global.TypeError || String,
	        DOMError: global.DOMError || String,
	        localStorage: ((typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : global.localStorage)
	    }; 

	    // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
	    Dexie.version = 1.20;

	    function getNativeGetDatabaseNamesFn() {
	        var indexedDB = Dexie.dependencies.indexedDB;
	        var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
	        return fn && fn.bind(indexedDB);
	    }

	    // Export Dexie to window or as a module depending on environment.
	    publish("Dexie", Dexie);

	    // Fool IDE to improve autocomplete. Tested with Visual Studio 2013 and 2015.
	    doFakeAutoComplete(function() {
	        Dexie.fakeAutoComplete = fakeAutoComplete = doFakeAutoComplete;
	        Dexie.fake = fake = true;
	    });
	}).apply(null,

	    // AMD:
	     true ?
	    [self || window, function (name, value) { !(__WEBPACK_AMD_DEFINE_RESULT__ = function () { return value; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); }] :

	    // CommonJS:
	    typeof global !== 'undefined' && typeof module !== 'undefined' && module.exports ?
	    [global, function (name, value) { module.exports = value; }]

	    // Vanilla HTML and WebWorkers:
	    : [self || window, function (name, value) { (self || window)[name] = value; }]);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(29).setImmediate))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(15).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(29).setImmediate, __webpack_require__(29).clearImmediate))

/***/ }
/******/ ]);