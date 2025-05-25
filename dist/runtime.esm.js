import { EMPTY_OBJ, EventChannel, Events, PLATFORM_TYPE, Shortcuts, controlledComponent, ensure, getComponentsAlias as getComponentsAlias$1, hooks, hooks as hooks$1, internalComponents, isArray, isFunction, isNull, isNumber, isObject, isString, isUndefined, noop, toCamelCase, toDashed, warn } from "@tarojs/shared";

//#region src/constants/index.ts
const PROPERTY_THRESHOLD = 2046;
const TARO_RUNTIME = "Taro runtime";
const HOOKS_APP_ID = "taro-app";
const SET_DATA = "小程序 setData";
const PAGE_INIT = "页面初始化";
const ROOT_STR = "root";
const HTML = "html";
const HEAD = "head";
const BODY = "body";
const APP = "app";
const CONTAINER = "container";
const DOCUMENT_ELEMENT_NAME = "#document";
const DOCUMENT_FRAGMENT = "document-fragment";
const ID = "id";
const UID = "uid";
const CLASS = "class";
const STYLE = "style";
const FOCUS = "focus";
const VIEW = "view";
const STATIC_VIEW = "static-view";
const PURE_VIEW = "pure-view";
const CLICK_VIEW = "click-view";
const PROPS = "props";
const DATASET = "dataset";
const OBJECT = "object";
const VALUE = "value";
const INPUT = "input";
const CHANGE = "change";
const CUSTOM_WRAPPER = "custom-wrapper";
const TARGET = "target";
const CURRENT_TARGET = "currentTarget";
const TYPE = "type";
const CONFIRM = "confirm";
const TIME_STAMP = "timeStamp";
const KEY_CODE = "keyCode";
const TOUCHMOVE = "touchmove";
const DATE = "Date";
const SET_TIMEOUT = "setTimeout";
const COMPILE_MODE = "compileMode";
const CATCHMOVE = "catchMove";
const CATCH_VIEW = "catch-view";
const COMMENT = "comment";
const ON_LOAD = "onLoad";
const ON_READY = "onReady";
const ON_SHOW = "onShow";
const ON_HIDE = "onHide";
const OPTIONS = "options";
const EXTERNAL_CLASSES = "externalClasses";
const EVENT_CALLBACK_RESULT = "e_result";
const BEHAVIORS = "behaviors";
const A = "a";
/**
* 页面上下文切换时的行为
*/
let CONTEXT_ACTIONS = /* @__PURE__ */ function(CONTEXT_ACTIONS$1) {
	CONTEXT_ACTIONS$1["INIT"] = "0";
	CONTEXT_ACTIONS$1["RESTORE"] = "1";
	CONTEXT_ACTIONS$1["RECOVER"] = "2";
	CONTEXT_ACTIONS$1["DESTORY"] = "3";
	return CONTEXT_ACTIONS$1;
}({});

//#endregion
//#region src/dom-external/mutation-observer/record.ts
let MutationRecordType = /* @__PURE__ */ function(MutationRecordType$1) {
	MutationRecordType$1["ATTRIBUTES"] = "attributes";
	MutationRecordType$1["CHARACTER_DATA"] = "characterData";
	MutationRecordType$1["CHILD_LIST"] = "childList";
	return MutationRecordType$1;
}({});

//#endregion
//#region src/dom-external/mutation-observer/implements.ts
const observers = [];
/**
* The MutationObserver provides the ability
* to watch for changes being made to the DOM tree.
* It will invoke a specified callback function
* when DOM changes occur.
* @see https://dom.spec.whatwg.org/#mutationobserver
* @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
*/
var MutationObserverImpl = class {
	callback;
	target;
	options;
	records = [];
	constructor(callback) {
		this.callback = callback;
	}
	/**
	* Configures the MutationObserver
	* to begin receiving notifications
	* through its callback function
	* when DOM changes matching the given options occur.
	*
	* Options matching is to be implemented.
	*/
	observe(target, options$1) {
		this.disconnect();
		this.target = target;
		this.options = options$1 || {};
		observers.push(this);
	}
	/**
	* Stop the MutationObserver instance
	* from receiving further notifications
	* until and unless observe() is called again.
	*/
	disconnect() {
		this.target = null;
		const index = observers.indexOf(this);
		if (index >= 0) {
			observers.splice(index, 1);
		}
	}
	/**
	* Removes all pending notifications
	* from the MutationObserver's notification queue
	* and returns them in a new Array of MutationRecord objects.
	*/
	takeRecords() {
		return this.records.splice(0, this.records.length);
	}
};
/** Match two TaroNodes by sid. */
const sidMatches = (observerTarget, target) => {
	return !!observerTarget && observerTarget.sid === target?.sid;
};
const isConcerned = (record, options$1) => {
	const { characterData, characterDataOldValue, attributes, attributeOldValue, childList } = options$1;
	switch (record.type) {
		case MutationRecordType.CHARACTER_DATA:
			if (characterData) {
				if (!characterDataOldValue) record.oldValue = null;
				return true;
			}
			return false;
		case MutationRecordType.ATTRIBUTES:
			if (attributes) {
				if (!attributeOldValue) record.oldValue = null;
				return true;
			}
			return false;
		case MutationRecordType.CHILD_LIST:
			if (childList) {
				return true;
			}
			return false;
	}
};
let pendingMuatations = false;
function logMutation(observer, record) {
	observer.records.push(record);
	if (!pendingMuatations) {
		pendingMuatations = true;
		Promise.resolve().then(() => {
			pendingMuatations = false;
			observers.forEach((observer$1) => {
				return observer$1.callback(observer$1.takeRecords());
			});
		});
	}
}
function recordMutation(record) {
	observers.forEach((observer) => {
		const { options: options$1 } = observer;
		for (let t = record.target; t; t = t.parentNode) {
			if (sidMatches(observer.target, t) && isConcerned(record, options$1)) {
				logMutation(observer, record);
				break;
			}
			if (!options$1.subtree) break;
		}
	});
}

//#endregion
//#region src/dom-external/mutation-observer/index.ts
var MutationObserver$1 = class {
	core;
	constructor(callback) {
		if (ENABLE_MUTATION_OBSERVER) {
			this.core = new MutationObserverImpl(callback);
		} else {
			if (process.env.NODE_ENV !== "production") {
				console.warn("[Taro Warning] 若要使用 MutationObserver，请在 Taro 编译配置中设置 'mini.runtime.enableMutationObserver: true'");
			}
			this.core = {
				observe: noop,
				disconnect: noop,
				takeRecords: noop
			};
		}
	}
	observe(...args) {
		this.core.observe(...args);
	}
	disconnect() {
		this.core.disconnect();
	}
	takeRecords() {
		return this.core.takeRecords();
	}
	static record(record) {
		recordMutation(record);
	}
};

//#endregion
//#region src/dom/node_types.ts
let NodeType = /* @__PURE__ */ function(NodeType$1) {
	NodeType$1[NodeType$1["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
	NodeType$1[NodeType$1["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
	NodeType$1[NodeType$1["TEXT_NODE"] = 3] = "TEXT_NODE";
	NodeType$1[NodeType$1["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
	NodeType$1[NodeType$1["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
	NodeType$1[NodeType$1["COMMENT_NODE"] = 6] = "COMMENT_NODE";
	NodeType$1[NodeType$1["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
	NodeType$1[NodeType$1["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
	return NodeType$1;
}({});

//#endregion
//#region src/utils/lodash.ts
function throttle(fn, threshold = 250, scope) {
	let lastTime$1 = 0;
	let deferTimer;
	return function(...args) {
		const context = scope || this;
		const now$1 = Date.now();
		if (now$1 - lastTime$1 > threshold) {
			fn.apply(this, args);
			lastTime$1 = now$1;
		} else {
			clearTimeout(deferTimer);
			deferTimer = setTimeout(() => {
				lastTime$1 = now$1;
				fn.apply(context, args);
			}, threshold);
		}
	};
}
function debounce(fn, ms = 250, scope) {
	let timer;
	return function(...args) {
		const context = scope || this;
		clearTimeout(timer);
		timer = setTimeout(function() {
			fn.apply(context, args);
		}, ms);
	};
}

//#endregion
//#region src/emitter/emitter.ts
const eventCenter = hooks$1.call("getEventCenter", Events);

//#endregion
//#region src/env.ts
const env = {
	window: process.env.TARO_PLATFORM === "web" ? window : EMPTY_OBJ,
	document: process.env.TARO_PLATFORM === "web" ? document : EMPTY_OBJ
};
var env_default = env;

//#endregion
//#region src/bom/getComputedStyle.ts
const taroGetComputedStyleProvider = process.env.TARO_PLATFORM === "web" ? env_default.window.getComputedStyle : function(element) {
	return element.style;
};

//#endregion
//#region src/utils/cache.ts
/**
* 一个小型缓存池，用于在切换页面时，存储一些上下文信息
*/
var RuntimeCache = class {
	name;
	cache = new Map();
	constructor(name) {
		this.name = name;
	}
	has(identifier) {
		return this.cache.has(identifier);
	}
	set(identifier, ctx) {
		if (identifier && ctx) {
			this.cache.set(identifier, ctx);
		}
	}
	get(identifier) {
		if (this.has(identifier)) return this.cache.get(identifier);
	}
	delete(identifier) {
		this.cache.delete(identifier);
	}
};

//#endregion
//#region src/bom/history.ts
const cache$1 = new RuntimeCache("history");
var TaroHistory = class extends Events {
	#location;
	#stack = [];
	#cur = 0;
	#window;
	constructor(location, options$1) {
		super();
		this.#window = options$1.window;
		this.#location = location;
		this.#location.on("__record_history__", (href) => {
			this.#cur++;
			this.#stack = this.#stack.slice(0, this.#cur);
			this.#stack.push({
				state: null,
				title: "",
				url: href
			});
		}, null);
		this.#location.on("__reset_history__", (href) => {
			this.#reset(href);
		}, null);
		this.on(CONTEXT_ACTIONS.INIT, () => {
			this.#reset();
		}, null);
		this.on(CONTEXT_ACTIONS.RESTORE, (pageId$1) => {
			cache$1.set(pageId$1, {
				location: this.#location,
				stack: this.#stack.slice(),
				cur: this.#cur
			});
		}, null);
		this.on(CONTEXT_ACTIONS.RECOVER, (pageId$1) => {
			if (cache$1.has(pageId$1)) {
				const ctx = cache$1.get(pageId$1);
				this.#location = ctx.location;
				this.#stack = ctx.stack;
				this.#cur = ctx.cur;
			}
		}, null);
		this.on(CONTEXT_ACTIONS.DESTORY, (pageId$1) => {
			cache$1.delete(pageId$1);
		}, null);
		this.#reset();
	}
	#reset(href = "") {
		this.#stack = [{
			state: null,
			title: "",
			url: href || this.#location.href
		}];
		this.#cur = 0;
	}
	get length() {
		return this.#stack.length;
	}
	get state() {
		return this.#stack[this.#cur].state;
	}
	go(delta) {
		if (!isNumber(delta) || isNaN(delta)) return;
		let targetIdx = this.#cur + delta;
		targetIdx = Math.min(Math.max(targetIdx, 0), this.length - 1);
		this.#cur = targetIdx;
		this.#location.trigger("__set_href_without_history__", this.#stack[this.#cur].url);
		this.#window.trigger("popstate", this.#stack[this.#cur]);
	}
	back() {
		this.go(-1);
	}
	forward() {
		this.go(1);
	}
	pushState(state, title, url) {
		if (!url || !isString(url)) return;
		this.#stack = this.#stack.slice(0, this.#cur + 1);
		this.#stack.push({
			state,
			title,
			url
		});
		this.#cur = this.length - 1;
		this.#location.trigger("__set_href_without_history__", url);
	}
	replaceState(state, title, url) {
		if (!url || !isString(url)) return;
		this.#stack[this.#cur] = {
			state,
			title,
			url
		};
		this.#location.trigger("__set_href_without_history__", url);
	}
	get cache() {
		return cache$1;
	}
};
const History = process.env.TARO_PLATFORM === "web" ? env_default.window.History : TaroHistory;

//#endregion
//#region src/current.ts
const Current = {
	app: null,
	router: null,
	page: null
};
const getCurrentInstance = () => Current;

//#endregion
//#region src/bom/URLSearchParams.ts
const findReg = /[!'()~]|%20|%00/g;
const plusReg = /\+/g;
const replaceCharMap = {
	"!": "%21",
	"'": "%27",
	"(": "%28",
	")": "%29",
	"~": "%7E",
	"%20": "+",
	"%00": "\0"
};
function replacer(match) {
	return replaceCharMap[match];
}
function appendTo(dict, name, value) {
	const res = isArray(value) ? value.join(",") : value;
	if (name in dict) dict[name].push(res);
	else dict[name] = [res];
}
function addEach(value, key) {
	appendTo(this, key, value);
}
function decode(str) {
	return decodeURIComponent(str.replace(plusReg, " "));
}
function encode(str) {
	return encodeURIComponent(str).replace(findReg, replacer);
}
const URLSearchParams = process.env.TARO_PLATFORM === "web" ? env_default.window.URLSearchParams : class {
	#dict = Object.create(null);
	constructor(query) {
		query ??= "";
		const dict = this.#dict;
		if (typeof query === "string") {
			if (query.charAt(0) === "?") {
				query = query.slice(1);
			}
			for (let pairs = query.split("&"), i = 0, length = pairs.length; i < length; i++) {
				const value = pairs[i];
				const index = value.indexOf("=");
				try {
					if (index > -1) {
						appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));
					} else if (value.length) {
						appendTo(dict, decode(value), "");
					}
				} catch (err) {
					if (process.env.NODE_ENV !== "production") {
						console.warn(`[Taro warn] URL 参数 ${value} decode 异常`);
					}
				}
			}
		} else {
			if (isArray(query)) {
				for (let i = 0, length = query.length; i < length; i++) {
					const value = query[i];
					appendTo(dict, value[0], value[1]);
				}
			} else if (query.forEach) {
				query.forEach(addEach, dict);
			} else {
				for (const key in query) {
					appendTo(dict, key, query[key]);
				}
			}
		}
	}
	append(name, value) {
		appendTo(this.#dict, name, value);
	}
	delete(name) {
		delete this.#dict[name];
	}
	get(name) {
		const dict = this.#dict;
		return name in dict ? dict[name][0] : null;
	}
	getAll(name) {
		const dict = this.#dict;
		return name in dict ? dict[name].slice(0) : [];
	}
	has(name) {
		return name in this.#dict;
	}
	keys() {
		return Object.keys(this.#dict);
	}
	set(name, value) {
		this.#dict[name] = ["" + value];
	}
	forEach(callback, thisArg) {
		const dict = this.#dict;
		Object.getOwnPropertyNames(dict).forEach(function(name) {
			dict[name].forEach(function(value) {
				callback.call(thisArg, value, name, this);
			}, this);
		}, this);
	}
	toJSON() {
		return {};
	}
	toString() {
		const dict = this.#dict;
		const query = [];
		for (const key in dict) {
			const name = encode(key);
			for (let i = 0, value = dict[key]; i < value.length; i++) {
				query.push(name + "=" + encode(value[i]));
			}
		}
		return query.join("&");
	}
};

//#endregion
//#region src/bom/URL.ts
var TaroURL = class {
	static createObjectURL() {
		throw new Error("Oops, not support URL.createObjectURL() in miniprogram.");
	}
	static revokeObjectURL() {
		throw new Error("Oops, not support URL.revokeObjectURL() in miniprogram.");
	}
	#hash = "";
	#hostname = "";
	#pathname = "";
	#port = "";
	#protocol = "";
	#search;
	constructor(url, base) {
		if (!isString(url)) url = String(url);
		const parseResult = parseUrlBase(url, base);
		const { hash, hostname, pathname, port, protocol, search } = parseResult;
		this.#hash = hash;
		this.#hostname = hostname;
		this.#pathname = pathname || "/";
		this.#port = port;
		this.#protocol = protocol;
		this.#search = new URLSearchParams(search);
	}
	get protocol() {
		return this.#protocol;
	}
	set protocol(val) {
		isString(val) && (this.#protocol = val.trim());
	}
	get host() {
		return this.hostname + (this.port ? ":" + this.port : "");
	}
	set host(val) {
		if (val && isString(val)) {
			val = val.trim();
			const { hostname, port } = parseUrl(`//${val}`);
			this.hostname = hostname;
			this.port = port;
		}
	}
	get hostname() {
		return this.#hostname;
	}
	set hostname(val) {
		val && isString(val) && (this.#hostname = val.trim());
	}
	get port() {
		return this.#port;
	}
	set port(val) {
		isString(val) && (this.#port = val.trim());
	}
	get pathname() {
		return this.#pathname;
	}
	set pathname(val) {
		if (isString(val)) {
			val = val.trim();
			const HEAD_REG = /^(\/|\.\/|\.\.\/)/;
			let temp = val;
			while (HEAD_REG.test(temp)) {
				temp = temp.replace(HEAD_REG, "");
			}
			if (temp) this.#pathname = "/" + temp;
			else this.#pathname = "/";
		}
	}
	get search() {
		const val = this.#search.toString();
		return val.length === 0 || val.startsWith("?") ? val : `?${val}`;
	}
	set search(val) {
		if (isString(val)) {
			val = val.trim();
			this.#search = new URLSearchParams(val);
		}
	}
	get hash() {
		return this.#hash;
	}
	set hash(val) {
		if (isString(val)) {
			val = val.trim();
			if (val) this.#hash = val.startsWith("#") ? val : `#${val}`;
			else this.#hash = "";
		}
	}
	get href() {
		return `${this.protocol}//${this.host}${this.pathname}${this.search}${this.hash}`;
	}
	set href(val) {
		if (val && isString(val)) {
			val = val.trim();
			const { protocol, hostname, port, hash, search, pathname } = parseUrl(val);
			this.protocol = protocol;
			this.hostname = hostname;
			this.pathname = pathname;
			this.port = port;
			this.hash = hash;
			this.search = search;
		}
	}
	get origin() {
		return `${this.protocol}//${this.host}`;
	}
	set origin(val) {
		if (val && isString(val)) {
			val = val.trim();
			const { protocol, hostname, port } = parseUrl(val);
			this.protocol = protocol;
			this.hostname = hostname;
			this.port = port;
		}
	}
	get searchParams() {
		return this.#search;
	}
	toString() {
		return this.href;
	}
	toJSON() {
		return this.toString();
	}
	_toRaw() {
		return {
			protocol: this.protocol,
			port: this.port,
			host: this.host,
			hostname: this.hostname,
			pathname: this.pathname,
			hash: this.hash,
			search: this.search,
			origin: this.origin,
			href: this.href
		};
	}
};
const TaroURLProvider = process.env.TARO_PLATFORM === "web" ? env_default.window.URL : TaroURL;
function parseUrl(url = "") {
	const result = {
		href: "",
		origin: "",
		protocol: "",
		hostname: "",
		host: "",
		port: "",
		pathname: "",
		search: "",
		hash: ""
	};
	if (!url || !isString(url)) return result;
	url = url.trim();
	const PATTERN = /^(([^:/?#]+):)?\/\/(([^/?#]+):(.+)@)?([^/?#:]*)(:(\d+))?([^?#]*)(\?([^#]*))?(#(.*))?/;
	const matches = url.match(PATTERN);
	if (!matches) return result;
	result.protocol = matches[1] || "https:";
	result.hostname = matches[6] || "taro.com";
	result.port = matches[8] || "";
	result.pathname = matches[9] || "/";
	result.search = matches[10] || "";
	result.hash = matches[12] || "";
	result.href = url;
	result.origin = result.protocol + "//" + result.hostname;
	result.host = result.hostname + (result.port ? `:${result.port}` : "");
	return result;
}
function parseUrlBase(url, base) {
	const VALID_URL = /^(https?:)\/\//i;
	let fullUrl = "";
	let parsedBase = null;
	if (!isUndefined(base)) {
		base = String(base).trim();
		if (!VALID_URL.test(base)) throw new TypeError(`Failed to construct 'URL': Invalid base URL`);
		parsedBase = parseUrl(base);
	}
	url = String(url).trim();
	if (VALID_URL.test(url)) {
		fullUrl = url;
	} else if (parsedBase) {
		if (url) {
			if (url.startsWith("//")) {
				fullUrl = parsedBase.protocol + url;
			} else {
				fullUrl = parsedBase.origin + (url.startsWith("/") ? url : `/${url}`);
			}
		} else {
			fullUrl = parsedBase.href;
		}
	} else {
		throw new TypeError(`Failed to construct 'URL': Invalid URL`);
	}
	return parseUrl(fullUrl);
}

//#endregion
//#region src/bom/location.ts
const INIT_URL = "https://taro.com";
const cache = new RuntimeCache("location");
var TaroLocation = class extends Events {
	#url = new TaroURLProvider(INIT_URL);
	#noCheckUrl = false;
	#window;
	constructor(options$1) {
		super();
		this.#window = options$1.window;
		this.#reset();
		this.on("__set_href_without_history__", (href) => {
			this.#noCheckUrl = true;
			const lastHash = this.#url.hash;
			this.#url.href = generateFullUrl(href);
			if (lastHash !== this.#url.hash) {
				this.#window.trigger("hashchange");
			}
			this.#noCheckUrl = false;
		}, null);
		this.on(CONTEXT_ACTIONS.INIT, () => {
			this.#reset();
		}, null);
		this.on(CONTEXT_ACTIONS.RESTORE, (pageId$1) => {
			cache.set(pageId$1, { lastHref: this.href });
		}, null);
		this.on(CONTEXT_ACTIONS.RECOVER, (pageId$1) => {
			if (cache.has(pageId$1)) {
				const ctx = cache.get(pageId$1);
				this.#noCheckUrl = true;
				this.#url.href = ctx.lastHref;
				this.#noCheckUrl = false;
			}
		}, null);
		this.on(CONTEXT_ACTIONS.DESTORY, (pageId$1) => {
			cache.delete(pageId$1);
		}, null);
	}
	#reset() {
		const Current$1 = getCurrentInstance();
		const router = Current$1.router;
		if (router) {
			const { path, params } = router;
			const searchArr = Object.keys(params).map((key) => {
				return `${key}=${params[key]}`;
			});
			const searchStr = searchArr.length > 0 ? "?" + searchArr.join("&") : "";
			const url = `${INIT_URL}${path.startsWith("/") ? path : "/" + path}${searchStr}`;
			this.#url = new TaroURLProvider(url);
			this.trigger("__reset_history__", this.href);
		}
	}
	#getPreValue() {
		return this.#url._toRaw();
	}
	#rollBack(href) {
		this.#url.href = href;
	}
	#recordHistory() {
		this.trigger("__record_history__", this.href);
	}
	/**
	* 校验url的变化，是否需要更新history
	*/
	#checkUrlChange(preValue) {
		if (this.#noCheckUrl) {
			return false;
		}
		const { protocol, hostname, port, pathname, search, hash } = this.#url._toRaw();
		if (protocol !== preValue.protocol || hostname !== preValue.hostname || port !== preValue.port) {
			this.#rollBack(preValue.href);
			return false;
		}
		if (pathname !== preValue.pathname) {
			return true;
		}
		if (search !== preValue.search) {
			return true;
		}
		if (hash !== preValue.hash) {
			this.#window.trigger("hashchange");
			return true;
		}
		this.#rollBack(preValue.href);
		return false;
	}
	get protocol() {
		return this.#url.protocol;
	}
	set protocol(val) {
		const REG = /^(http|https):$/i;
		if (!val || !isString(val) || !REG.test(val.trim())) return;
		val = val.trim();
		const preValue = this.#getPreValue();
		this.#url.protocol = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get host() {
		return this.#url.host;
	}
	set host(val) {
		if (!val || !isString(val)) return;
		val = val.trim();
		const preValue = this.#getPreValue();
		this.#url.host = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get hostname() {
		return this.#url.hostname;
	}
	set hostname(val) {
		if (!val || !isString(val)) return;
		val = val.trim();
		const preValue = this.#getPreValue();
		this.#url.hostname = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get port() {
		return this.#url.port;
	}
	set port(val) {
		const xVal = Number(val = val.trim());
		if (!isNumber(xVal) || xVal <= 0) return;
		const preValue = this.#getPreValue();
		this.#url.port = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get pathname() {
		return this.#url.pathname;
	}
	set pathname(val) {
		if (!val || !isString(val)) return;
		val = val.trim();
		const preValue = this.#getPreValue();
		this.#url.pathname = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get search() {
		return this.#url.search;
	}
	set search(val) {
		if (!val || !isString(val)) return;
		val = val.trim();
		val = val.startsWith("?") ? val : `?${val}`;
		const preValue = this.#getPreValue();
		this.#url.search = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get hash() {
		return this.#url.hash;
	}
	set hash(val) {
		if (!val || !isString(val)) return;
		val = val.trim();
		val = val.startsWith("#") ? val : `#${val}`;
		const preValue = this.#getPreValue();
		this.#url.hash = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get href() {
		return this.#url.href;
	}
	set href(val) {
		const REG = /^(http:|https:)?\/\/.+/;
		if (!val || !isString(val) || !REG.test(val = val.trim())) return;
		const preValue = this.#getPreValue();
		this.#url.href = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	get origin() {
		return this.#url.origin;
	}
	set origin(val) {
		const REG = /^(http:|https:)?\/\/.+/;
		if (!val || !isString(val) || !REG.test(val = val.trim())) return;
		const preValue = this.#getPreValue();
		this.#url.origin = val;
		if (this.#checkUrlChange(preValue)) this.#recordHistory();
	}
	assign() {
		warn(true, "小程序环境中调用location.assign()无效.");
	}
	reload() {
		warn(true, "小程序环境中调用location.reload()无效.");
	}
	replace(url) {
		this.trigger("__set_href_without_history__", url);
	}
	toString() {
		return this.href;
	}
	get cache() {
		return cache;
	}
};
const Location = process.env.TARO_PLATFORM === "web" ? env_default.window.Location : TaroLocation;
function generateFullUrl(val = "") {
	const origin = INIT_URL;
	if (/^[/?#]/.test(val)) {
		return origin + val;
	}
	return val;
}

//#endregion
//#region src/bom/navigator.ts
const machine = "Macintosh";
const arch = "Intel Mac OS X 10_14_5";
const engine = "AppleWebKit/534.36 (KHTML, like Gecko) NodeJS/v4.1.0 Chrome/76.0.3809.132 Safari/534.36";
const msg = "(" + machine + "; " + arch + ") " + engine;
const nav = process.env.TARO_PLATFORM === "web" ? env_default.window.navigator : {
	appCodeName: "Mozilla",
	appName: "Netscape",
	appVersion: "5.0 " + msg,
	cookieEnabled: true,
	mimeTypes: [],
	onLine: true,
	platform: "MacIntel",
	plugins: [],
	product: "Taro",
	productSub: "20030107",
	userAgent: "Mozilla/5.0 " + msg,
	vendor: "Joyent",
	vendorSub: ""
};

//#endregion
//#region src/bom/raf.ts
let now;
(function() {
	let loadTime;
	if (typeof performance !== "undefined" && performance !== null && performance.now) {
		now = () => performance.now();
	} else if (Date.now) {
		loadTime = Date.now();
		now = () => Date.now() - loadTime;
	} else {
		loadTime = new Date().getTime();
		now = () => new Date().getTime() - loadTime;
	}
})();
let lastTime = 0;
const _raf = process.env.TARO_PLATFORM === "web" ? requestAnimationFrame : function(callback) {
	const _now = now();
	const nextTime = Math.max(lastTime + 16, _now);
	return setTimeout(function() {
		callback(lastTime = nextTime);
	}, nextTime - _now);
};
const _caf = process.env.TARO_PLATFORM === "web" ? cancelAnimationFrame : function(seed) {
	clearTimeout(seed);
};

//#endregion
//#region src/bom/window.ts
var TaroWindow = class extends Events {
	navigator = nav;
	requestAnimationFrame = _raf;
	cancelAnimationFrame = _caf;
	getComputedStyle = taroGetComputedStyleProvider;
	Date;
	location;
	history;
	XMLHttpRequest;
	constructor() {
		super();
		const globalProperties = [...Object.getOwnPropertyNames(global || {}), ...Object.getOwnPropertySymbols(global || {})];
		globalProperties.forEach((property) => {
			if (property === "atob" || property === "document") return;
			if (!Object.prototype.hasOwnProperty.call(this, property)) {
				try {
					this[property] = global[property];
				} catch (e) {
					if (process.env.NODE_ENV !== "production") {
						console.warn(`[Taro warn] window.${String(property)} 在赋值到 window 时报错`);
					}
				}
			}
		});
		this.Date ||= Date;
		this.location = new Location({ window: this });
		this.history = new History(this.location, { window: this });
		this.initEvent();
	}
	initEvent() {
		const _location = this.location;
		const _history = this.history;
		this.on(CONTEXT_ACTIONS.INIT, (pageId$1) => {
			_location.trigger(CONTEXT_ACTIONS.INIT, pageId$1);
		}, null);
		this.on(CONTEXT_ACTIONS.RECOVER, (pageId$1) => {
			_location.trigger(CONTEXT_ACTIONS.RECOVER, pageId$1);
			_history.trigger(CONTEXT_ACTIONS.RECOVER, pageId$1);
		}, null);
		this.on(CONTEXT_ACTIONS.RESTORE, (pageId$1) => {
			_location.trigger(CONTEXT_ACTIONS.RESTORE, pageId$1);
			_history.trigger(CONTEXT_ACTIONS.RESTORE, pageId$1);
		}, null);
		this.on(CONTEXT_ACTIONS.DESTORY, (pageId$1) => {
			_location.trigger(CONTEXT_ACTIONS.DESTORY, pageId$1);
			_history.trigger(CONTEXT_ACTIONS.DESTORY, pageId$1);
		}, null);
	}
	get document() {
		return env_default.document;
	}
	addEventListener(event, callback) {
		if (!isString(event)) return;
		this.on(event, callback, null);
	}
	removeEventListener(event, callback) {
		if (!isString(event)) return;
		this.off(event, callback, null);
	}
	setTimeout(...args) {
		return setTimeout(...args);
	}
	clearTimeout(...args) {
		return clearTimeout(...args);
	}
};
const taroWindowProvider = process.env.TARO_PLATFORM === "web" ? env_default.window : env_default.window = new TaroWindow();
const taroLocationProvider = taroWindowProvider.location;
const taroHistoryProvider = taroWindowProvider.history;

//#endregion
//#region src/utils/router.ts
const addLeadingSlash = (url = "") => url.charAt(0) === "/" ? url : "/" + url;
const hasBasename = (path = "", prefix = "") => new RegExp("^" + prefix + "(\\/|\\?|#|$)", "i").test(path) || path === prefix;
const stripBasename = (path = "", prefix = "") => hasBasename(path, prefix) ? path.substring(prefix.length) : path;
const stripTrailing = (str = "") => str.replace(/[?#][\s\S]*$/, "");
const stripSuffix = (path = "", suffix = "") => path.includes(suffix) ? path.substring(0, path.length - suffix.length) : path;
const getHomePage = (path = "", basename = "", customRoutes = {}, entryPagePath = "") => {
	const routePath = addLeadingSlash(stripBasename(path, basename));
	const alias = Object.entries(customRoutes).find(([key]) => key === routePath)?.[1] || routePath;
	return entryPagePath || (typeof alias === "string" ? alias : alias[0]) || basename;
};
const getCurrentPage = (routerMode = "hash", basename = "/") => {
	const pagePath = routerMode === "hash" ? taroLocationProvider.hash.slice(1).split("?")[0] : taroLocationProvider.pathname;
	return addLeadingSlash(stripBasename(pagePath, basename));
};

//#endregion
//#region src/utils/index.ts
const incrementId = () => {
	const chatCodes = [];
	for (let i = 65; i <= 90; i++) {
		chatCodes.push(i);
	}
	for (let i = 97; i <= 122; i++) {
		chatCodes.push(i);
	}
	const chatCodesLen = chatCodes.length - 1;
	const list = [0, 0];
	return () => {
		const target = list.map((item) => chatCodes[item]);
		const res = String.fromCharCode(...target);
		let tailIdx = list.length - 1;
		list[tailIdx]++;
		while (list[tailIdx] > chatCodesLen) {
			list[tailIdx] = 0;
			tailIdx = tailIdx - 1;
			if (tailIdx < 0) {
				list.push(0);
				break;
			}
			list[tailIdx]++;
		}
		return res;
	};
};
function isElement(node) {
	return node.nodeType === NodeType.ELEMENT_NODE;
}
function isText(node) {
	return node.nodeType === NodeType.TEXT_NODE;
}
function isComment(node) {
	return node.nodeName === COMMENT;
}
function isHasExtractProp(el) {
	const res = Object.keys(el.props).find((prop) => {
		return !(/^(class|style|id)$/.test(prop) || prop.startsWith("data-"));
	});
	return Boolean(res);
}
/**
* 往上寻找组件树直到 root，寻找是否有祖先组件绑定了同类型的事件
* @param node 当前组件
* @param type 事件类型
*/
function isParentBinded(node, type) {
	while (node = node?.parentElement || null) {
		if (!node || node.nodeName === ROOT_STR || node.nodeName === "root-portal") {
			return false;
		} else if (node.__handlers[type]?.length) {
			return true;
		}
	}
	return false;
}
function shortcutAttr(key) {
	switch (key) {
		case STYLE: return Shortcuts.Style;
		case ID: return UID;
		case CLASS: return Shortcuts.Class;
		default: return key;
	}
}
const customWrapperCache = new Map();
function extend(ctor, methodName, options$1) {
	if (isFunction(options$1)) {
		options$1 = { value: options$1 };
	}
	Object.defineProperty(ctor.prototype, methodName, {
		configurable: true,
		enumerable: true,
		...options$1
	});
}
let componentsAlias$1;
function getComponentsAlias() {
	if (!componentsAlias$1) {
		componentsAlias$1 = getComponentsAlias$1(internalComponents);
	}
	return componentsAlias$1;
}
function convertNumber2PX(value) {
	return value + "px";
}

//#endregion
//#region src/dom/class-list.ts
var ClassList = class {
	el;
	tokenList = [];
	constructor(className, el) {
		this.el = el;
		className.trim().split(/\s+/).forEach((token) => this.tokenList.push(token));
	}
	get value() {
		return this.toString();
	}
	get length() {
		return this.tokenList.length;
	}
	add() {
		let index = 0;
		let updated = false;
		const tokens = arguments;
		const length = tokens.length;
		const tokenList = this.tokenList;
		do {
			const token = tokens[index];
			if (this.checkTokenIsValid(token) && !~tokenList.indexOf(token)) {
				tokenList.push(token);
				updated = true;
			}
		} while (++index < length);
		if (updated) {
			this._update();
		}
	}
	remove() {
		let i = 0;
		let updated = false;
		const tokens = arguments;
		const length = tokens.length;
		const tokenList = this.tokenList;
		do {
			const token = tokens[i] + "";
			if (!this.checkTokenIsValid(token)) continue;
			const index = tokenList.indexOf(token);
			if (~tokenList.indexOf(token)) {
				tokenList.splice(index, 1);
				updated = true;
			}
		} while (++i < length);
		if (updated) {
			this._update();
		}
	}
	contains(token) {
		if (!this.checkTokenIsValid(token)) return false;
		return !!~this.tokenList.indexOf(token);
	}
	toggle(token, force) {
		const result = this.contains(token);
		const method = result ? force !== true && "remove" : force !== false && "add";
		if (method) {
			this[method](token);
		}
		if (force === true || force === false) {
			return force;
		} else {
			return !result;
		}
	}
	replace(token, replacement_token) {
		if (!this.checkTokenIsValid(token) || !this.checkTokenIsValid(replacement_token)) return;
		const index = this.tokenList.indexOf(token);
		if (~index) {
			this.tokenList.splice(index, 1, replacement_token);
			this._update();
		}
	}
	toString() {
		return this.tokenList.filter((v) => v !== "").join(" ");
	}
	checkTokenIsValid(token) {
		if (token === "" || /\s/.test(token)) return false;
		return true;
	}
	_update() {
		this.el.className = this.value;
	}
};

//#endregion
//#region src/dom/event-source.ts
var EventSource = class extends Map {
	removeNode(child) {
		const { sid, uid } = child;
		this.delete(sid);
		if (uid !== sid && uid) this.delete(uid);
	}
	removeNodeTree(child) {
		this.removeNode(child);
		const { childNodes } = child;
		childNodes.forEach((node) => this.removeNodeTree(node));
	}
};
const eventSource = new EventSource();

//#endregion
//#region src/hydrate.ts
let SPECIAL_NODES;
let componentsAlias;
/**
* React also has a fancy function's name for this: `hydrate()`.
* You may have been heard `hydrate` as a SSR-related function,
* actually, `hydrate` basicly do the `render()` thing, but ignore some properties,
* it's a vnode traverser and modifier: that's exactly what Taro's doing in here.
*/
function hydrate(node) {
	componentsAlias ||= getComponentsAlias();
	SPECIAL_NODES ||= hooks$1.call("getSpecialNodes");
	const nodeName = node.nodeName;
	let compileModeName = null;
	if (isText(node)) {
		return {
			sid: node.sid,
			[Shortcuts.Text]: node.nodeValue,
			[Shortcuts.NodeName]: componentsAlias[nodeName]?._num || "8"
		};
	}
	const data = {
		[Shortcuts.NodeName]: nodeName,
		sid: node.sid
	};
	if (node.uid !== node.sid) {
		data.uid = node.uid;
	}
	if (SPECIAL_NODES.indexOf(nodeName) > -1) {
		if (!node.isAnyEventBinded()) {
			data[Shortcuts.NodeName] = `static-${nodeName}`;
			if (nodeName === VIEW && !isHasExtractProp(node)) {
				data[Shortcuts.NodeName] = PURE_VIEW;
			}
		}
		if (nodeName === VIEW && node.isOnlyClickBinded() && !isHasExtractProp(node)) {
			data[Shortcuts.NodeName] = CLICK_VIEW;
		}
	}
	const { props } = node;
	for (const prop in props) {
		const propInCamelCase = toCamelCase(prop);
		if (!prop.startsWith("data-") && prop !== CLASS && prop !== STYLE && prop !== ID && propInCamelCase !== CATCHMOVE && propInCamelCase !== COMPILE_MODE) {
			data[propInCamelCase] = props[prop];
		}
		if (process.env.TARO_ENV !== "swan" && nodeName === VIEW && propInCamelCase === CATCHMOVE && props[prop] !== false) {
			data[Shortcuts.NodeName] = CATCH_VIEW;
		}
		if (propInCamelCase === COMPILE_MODE) {
			compileModeName = props[prop];
		}
	}
	data[Shortcuts.Childnodes] = node.childNodes.filter((node$1) => !isComment(node$1)).map(hydrate);
	if (node.className !== "") {
		data[Shortcuts.Class] = node.className;
	}
	const cssText = node.cssText;
	if (cssText !== "" && nodeName !== "swiper-item") {
		data[Shortcuts.Style] = cssText;
	}
	hooks$1.call("modifyHydrateData", data, node);
	const nn = data[Shortcuts.NodeName];
	const componentAlias = componentsAlias[nn];
	if (componentAlias) {
		data[Shortcuts.NodeName] = componentAlias._num;
		for (const prop in data) {
			if (prop in componentAlias) {
				data[componentAlias[prop]] = data[prop];
				delete data[prop];
			}
		}
	}
	if (compileModeName !== null) {
		data[Shortcuts.NodeName] = compileModeName;
	}
	const resData = hooks$1.call("transferHydrateData", data, node, componentAlias);
	return resData || data;
}

//#endregion
//#region src/dom/event-target.ts
var TaroEventTarget = class {
	__handlers = {};
	addEventListener(type, handler, options$1) {
		type = type.toLowerCase();
		hooks$1.call("onAddEvent", type, handler, options$1, this);
		if (type === "regionchange") {
			this.addEventListener("begin", handler, options$1);
			this.addEventListener("end", handler, options$1);
			return;
		}
		let isCapture = Boolean(options$1);
		let isOnce = false;
		if (isObject(options$1)) {
			isCapture = Boolean(options$1.capture);
			isOnce = Boolean(options$1.once);
		}
		if (isOnce) {
			const wrapper = function() {
				handler.apply(this, arguments);
				this.removeEventListener(type, wrapper);
			};
			this.addEventListener(type, wrapper, {
				...options$1,
				once: false
			});
			return;
		}
		process.env.NODE_ENV !== "production" && warn(isCapture, "Taro 暂未实现 event 的 capture 特性。");
		const oldHandler = handler;
		handler = function() {
			return oldHandler.apply(this, arguments);
		};
		handler.oldHandler = oldHandler;
		const handlers = this.__handlers[type];
		if (isArray(handlers)) {
			handlers.push(handler);
		} else {
			this.__handlers[type] = [handler];
		}
	}
	removeEventListener(type, handler) {
		type = type.toLowerCase();
		if (type === "regionchange") {
			this.removeEventListener("begin", handler);
			this.removeEventListener("end", handler);
			return;
		}
		if (!handler) {
			return;
		}
		const handlers = this.__handlers[type];
		if (!isArray(handlers)) {
			return;
		}
		const index = handlers.findIndex((item) => {
			if (item === handler || item.oldHandler === handler) return true;
		});
		process.env.NODE_ENV !== "production" && warn(index === -1, `事件: '${type}' 没有注册在 DOM 中，因此不会被移除。`);
		handlers.splice(index, 1);
	}
	isAnyEventBinded() {
		const handlers = this.__handlers;
		const isAnyEventBinded = Object.keys(handlers).find((key) => handlers[key].length);
		return Boolean(isAnyEventBinded);
	}
	isOnlyClickBinded() {
		const handlers = this.__handlers;
		const isOnlyClickBinded = handlers.tap && Object.keys(handlers).length === 1;
		return Boolean(isOnlyClickBinded);
	}
};

//#endregion
//#region src/dom/node.ts
const CHILDNODES = Shortcuts.Childnodes;
const nodeId = incrementId();
var TaroNode = class TaroNode extends TaroEventTarget {
	uid;
	sid;
	nodeType;
	nodeName;
	parentNode = null;
	childNodes = [];
	constructor() {
		super();
		this.uid = "_" + nodeId();
		this.sid = this.uid;
		eventSource.set(this.sid, this);
	}
	hydrate = (node) => () => hydrate(node);
	updateChildNodes(isClean) {
		const cleanChildNodes = () => [];
		const rerenderChildNodes = () => {
			const childNodes = this.childNodes.filter((node) => !isComment(node));
			return childNodes.map(hydrate);
		};
		this.enqueueUpdate({
			path: `${this._path}.${CHILDNODES}`,
			value: isClean ? cleanChildNodes : rerenderChildNodes
		});
	}
	updateSingleChild(index) {
		this.childNodes.forEach((child, childIndex) => {
			if (isComment(child)) return;
			if (index && childIndex < index) return;
			this.enqueueUpdate({
				path: child._path,
				value: this.hydrate(child)
			});
		});
	}
	get _root() {
		return this.parentNode?._root || null;
	}
	findIndex(refChild) {
		const index = this.childNodes.indexOf(refChild);
		ensure(index !== -1, "The node to be replaced is not a child of this node.");
		return index;
	}
	get _path() {
		const parentNode = this.parentNode;
		if (parentNode) {
			const list = parentNode.childNodes.filter((node) => !isComment(node));
			const indexOfNode = list.indexOf(this);
			const index = hooks$1.call("getPathIndex", indexOfNode);
			return `${parentNode._path}.${CHILDNODES}.${index}`;
		}
		return "";
	}
	get nextSibling() {
		const parentNode = this.parentNode;
		return parentNode?.childNodes[parentNode.findIndex(this) + 1] || null;
	}
	get previousSibling() {
		const parentNode = this.parentNode;
		return parentNode?.childNodes[parentNode.findIndex(this) - 1] || null;
	}
	get parentElement() {
		const parentNode = this.parentNode;
		if (parentNode?.nodeType === NodeType.ELEMENT_NODE) {
			return parentNode;
		}
		return null;
	}
	get firstChild() {
		return this.childNodes[0] || null;
	}
	get lastChild() {
		const childNodes = this.childNodes;
		return childNodes[childNodes.length - 1] || null;
	}
	/**
	* @textContent 目前只能置空子元素
	* @TODO 等待完整 innerHTML 实现
	*/
	set textContent(text) {
		const removedNodes = this.childNodes.slice();
		const addedNodes = [];
		while (this.firstChild) {
			this.removeChild(this.firstChild, { doUpdate: false });
		}
		if (text === "") {
			this.updateChildNodes(true);
		} else {
			const newText = env_default.document.createTextNode(text);
			addedNodes.push(newText);
			this.appendChild(newText);
			this.updateChildNodes();
		}
		MutationObserver$1.record({
			type: MutationRecordType.CHILD_LIST,
			target: this,
			removedNodes,
			addedNodes
		});
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
	* @scenario
	* [A,B,C]
	*   1. insert D before C, D has no parent
	*   2. insert D before C, D has the same parent of C
	*   3. insert D before C, D has the different parent of C
	*/
	insertBefore(newChild, refChild, isReplace) {
		if (newChild.nodeName === DOCUMENT_FRAGMENT) {
			newChild.childNodes.reduceRight((previousValue, currentValue) => {
				this.insertBefore(currentValue, previousValue);
				return currentValue;
			}, refChild);
			return newChild;
		}
		newChild.remove({ cleanRef: false });
		let index = 0;
		newChild.parentNode = this;
		if (refChild) {
			index = this.findIndex(refChild);
			this.childNodes.splice(index, 0, newChild);
		} else {
			this.childNodes.push(newChild);
		}
		const childNodesLength = this.childNodes.length;
		if (this._root) {
			if (!refChild) {
				const isOnlyChild = childNodesLength === 1;
				if (isOnlyChild) {
					this.updateChildNodes();
				} else {
					this.enqueueUpdate({
						path: newChild._path,
						value: this.hydrate(newChild)
					});
				}
			} else if (isReplace) {
				this.enqueueUpdate({
					path: newChild._path,
					value: this.hydrate(newChild)
				});
			} else {
				const mark = childNodesLength * 2 / 3;
				if (mark > index) {
					this.updateChildNodes();
				} else {
					this.updateSingleChild(index);
				}
			}
		}
		MutationObserver$1.record({
			type: MutationRecordType.CHILD_LIST,
			target: this,
			addedNodes: [newChild],
			removedNodes: isReplace ? [refChild] : [],
			nextSibling: isReplace ? refChild.nextSibling : refChild || null,
			previousSibling: newChild.previousSibling
		});
		return newChild;
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
	* @scenario
	* [A,B,C]
	*   1. append C, C has no parent
	*   2. append C, C has the same parent of B
	*   3. append C, C has the different parent of B
	*/
	appendChild(newChild) {
		return this.insertBefore(newChild);
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
	* @scenario
	* [A,B,C]
	*   1. replace B with C, C has no parent
	*   2. replace B with C, C has no parent, C has the same parent of B
	*   3. replace B with C, C has no parent, C has the different parent of B
	*/
	replaceChild(newChild, oldChild) {
		if (oldChild.parentNode !== this) return;
		this.insertBefore(newChild, oldChild, true);
		oldChild.remove({ doUpdate: false });
		return oldChild;
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
	* @scenario
	* [A,B,C]
	*   1. remove A or B
	*   2. remove C
	*/
	removeChild(child, options$1 = {}) {
		const { cleanRef, doUpdate } = options$1;
		if (cleanRef !== false && doUpdate !== false) {
			MutationObserver$1.record({
				type: MutationRecordType.CHILD_LIST,
				target: this,
				removedNodes: [child],
				nextSibling: child.nextSibling,
				previousSibling: child.previousSibling
			});
		}
		const index = this.findIndex(child);
		this.childNodes.splice(index, 1);
		child.parentNode = null;
		if (cleanRef !== false) {
			eventSource.removeNodeTree(child);
		}
		if (this._root && doUpdate !== false) {
			this.updateChildNodes();
		}
		return child;
	}
	remove(options$1) {
		this.parentNode?.removeChild(this, options$1);
	}
	hasChildNodes() {
		return this.childNodes.length > 0;
	}
	enqueueUpdate(payload) {
		this._root?.enqueueUpdate(payload);
	}
	get ownerDocument() {
		return env_default.document;
	}
	static extend(methodName, options$1) {
		extend(TaroNode, methodName, options$1);
	}
};

//#endregion
//#region src/dom/style_properties.ts
const WEBKIT = "webkit";
const styleProperties = [
	"all",
	"appearance",
	"backdropFilter",
	"blockOverflow",
	"blockSize",
	"bottom",
	"clear",
	"contain",
	"content",
	"continue",
	"cursor",
	"direction",
	"display",
	"filter",
	"float",
	"gap",
	"height",
	"inset",
	"isolation",
	"left",
	"letterSpacing",
	"lightingColor",
	"markerSide",
	"mixBlendMode",
	"opacity",
	"order",
	"position",
	"quotes",
	"resize",
	"right",
	"rowGap",
	"tabSize",
	"tableLayout",
	"top",
	"userSelect",
	"verticalAlign",
	"visibility",
	"voiceFamily",
	"volume",
	"whiteSpace",
	"widows",
	"width",
	"zIndex",
	"pointerEvents",
	"aspectRatio"
];
function combine(prefix, list, excludeSelf) {
	!excludeSelf && styleProperties.push(prefix);
	list.forEach((item) => {
		styleProperties.push(prefix + item);
		if (prefix === WEBKIT) {
			styleProperties.push("Webkit" + item);
		}
	});
}
const color = "Color";
const style = "Style";
const width = "Width";
const image = "Image";
const size = "Size";
const color_style_width = [
	color,
	style,
	width
];
const fitlength_fitwidth_image = [
	"FitLength",
	"FitWidth",
	image
];
const fitlength_fitwidth_image_radius = [...fitlength_fitwidth_image, "Radius"];
const color_style_width_fitlength_fitwidth_image = [...color_style_width, ...fitlength_fitwidth_image];
const endRadius_startRadius = ["EndRadius", "StartRadius"];
const bottom_left_right_top = [
	"Bottom",
	"Left",
	"Right",
	"Top"
];
const end_start = ["End", "Start"];
const content_items_self = [
	"Content",
	"Items",
	"Self"
];
const blockSize_height_inlineSize_width = [
	"BlockSize",
	"Height",
	"InlineSize",
	width
];
const after_before = ["After", "Before"];
combine("borderBlock", color_style_width);
combine("borderBlockEnd", color_style_width);
combine("borderBlockStart", color_style_width);
combine("outline", [...color_style_width, "Offset"]);
combine("border", [
	...color_style_width,
	"Boundary",
	"Break",
	"Collapse",
	"Radius",
	"Spacing"
]);
combine("borderFit", ["Length", width]);
combine("borderInline", color_style_width);
combine("borderInlineEnd", color_style_width);
combine("borderInlineStart", color_style_width);
combine("borderLeft", color_style_width_fitlength_fitwidth_image);
combine("borderRight", color_style_width_fitlength_fitwidth_image);
combine("borderTop", color_style_width_fitlength_fitwidth_image);
combine("borderBottom", color_style_width_fitlength_fitwidth_image);
combine("textDecoration", [
	color,
	style,
	"Line"
]);
combine("textEmphasis", [
	color,
	style,
	"Position"
]);
combine("scrollMargin", bottom_left_right_top);
combine("scrollPadding", bottom_left_right_top);
combine("padding", bottom_left_right_top);
combine("margin", [...bottom_left_right_top, "Trim"]);
combine("scrollMarginBlock", end_start);
combine("scrollMarginInline", end_start);
combine("scrollPaddingBlock", end_start);
combine("scrollPaddingInline", end_start);
combine("gridColumn", end_start);
combine("gridRow", end_start);
combine("insetBlock", end_start);
combine("insetInline", end_start);
combine("marginBlock", end_start);
combine("marginInline", end_start);
combine("paddingBlock", end_start);
combine("paddingInline", end_start);
combine("pause", after_before);
combine("cue", after_before);
combine("mask", [
	"Clip",
	"Composite",
	image,
	"Mode",
	"Origin",
	"Position",
	"Repeat",
	size,
	"Type"
]);
combine("borderImage", [
	"Outset",
	"Repeat",
	"Slice",
	"Source",
	"Transform",
	width
]);
combine("maskBorder", [
	"Mode",
	"Outset",
	"Repeat",
	"Slice",
	"Source",
	width
]);
combine("font", [
	"Family",
	"FeatureSettings",
	"Kerning",
	"LanguageOverride",
	"MaxSize",
	"MinSize",
	"OpticalSizing",
	"Palette",
	size,
	"SizeAdjust",
	"Stretch",
	style,
	"Weight",
	"VariationSettings"
]);
combine("transform", [
	"Box",
	"Origin",
	style
]);
combine("background", [
	color,
	image,
	"Attachment",
	"BlendMode",
	"Clip",
	"Origin",
	"Position",
	"Repeat",
	size
]);
combine("listStyle", [
	image,
	"Position",
	"Type"
]);
combine("scrollSnap", [
	"Align",
	"Stop",
	"Type"
]);
combine("grid", [
	"Area",
	"AutoColumns",
	"AutoFlow",
	"AutoRows"
]);
combine("gridTemplate", [
	"Areas",
	"Columns",
	"Rows"
]);
combine("overflow", [
	"Block",
	"Inline",
	"Wrap",
	"X",
	"Y"
]);
combine("transition", [
	"Delay",
	"Duration",
	"Property",
	"TimingFunction"
]);
combine("color", [
	"Adjust",
	"InterpolationFilters",
	"Scheme"
]);
combine("textAlign", ["All", "Last"]);
combine("page", [
	"BreakAfter",
	"BreakBefore",
	"BreakInside"
]);
combine("animation", [
	"Delay",
	"Direction",
	"Duration",
	"FillMode",
	"IterationCount",
	"Name",
	"PlayState",
	"TimingFunction"
]);
combine("flex", [
	"Basis",
	"Direction",
	"Flow",
	"Grow",
	"Shrink",
	"Wrap"
]);
combine("offset", [
	...after_before,
	...end_start,
	"Anchor",
	"Distance",
	"Path",
	"Position",
	"Rotate"
]);
combine("perspective", ["Origin"]);
combine("clip", ["Path", "Rule"]);
combine("flow", ["From", "Into"]);
combine("align", [
	"Content",
	"Items",
	"Self"
], true);
combine("alignment", ["Adjust", "Baseline"], true);
combine("borderStart", endRadius_startRadius, true);
combine("borderEnd", endRadius_startRadius, true);
combine("borderCorner", [
	"Fit",
	image,
	"ImageTransform"
], true);
combine("borderTopLeft", fitlength_fitwidth_image_radius, true);
combine("borderTopRight", fitlength_fitwidth_image_radius, true);
combine("borderBottomLeft", fitlength_fitwidth_image_radius, true);
combine("borderBottomRight", fitlength_fitwidth_image_radius, true);
combine("column", [
	"s",
	"Count",
	"Fill",
	"Gap",
	"Rule",
	"RuleColor",
	"RuleStyle",
	"RuleWidth",
	"Span",
	width
], true);
combine("break", [...after_before, "Inside"], true);
combine("wrap", [
	...after_before,
	"Flow",
	"Inside",
	"Through"
], true);
combine("justify", content_items_self, true);
combine("place", content_items_self, true);
combine("max", [...blockSize_height_inlineSize_width, "Lines"], true);
combine("min", blockSize_height_inlineSize_width, true);
combine("line", [
	"Break",
	"Clamp",
	"Grid",
	"Height",
	"Padding",
	"Snap"
], true);
combine("inline", [
	"BoxAlign",
	size,
	"Sizing"
], true);
combine("text", [
	"CombineUpright",
	"GroupAlign",
	"Height",
	"Indent",
	"Justify",
	"Orientation",
	"Overflow",
	"Shadow",
	"SpaceCollapse",
	"SpaceTrim",
	"Spacing",
	"Transform",
	"UnderlinePosition",
	"Wrap"
], true);
combine("shape", [
	"ImageThreshold",
	"Inside",
	"Margin",
	"Outside"
], true);
combine("word", [
	"Break",
	"Spacing",
	"Wrap"
], true);
combine("object", ["Fit", "Position"], true);
combine("box", [
	"DecorationBreak",
	"Shadow",
	"Sizing",
	"Snap"
], true);
combine(WEBKIT, [
	"LineClamp",
	"BoxOrient",
	"TextFillColor",
	"TextStroke",
	"TextStrokeColor",
	"TextStrokeWidth"
], true);

//#endregion
//#region src/dom/style.ts
function recordCss(obj) {
	MutationObserver$1.record({
		type: MutationRecordType.ATTRIBUTES,
		target: obj._element,
		attributeName: "style",
		oldValue: obj.cssText
	});
}
function enqueueUpdate(obj) {
	const element = obj._element;
	if (element._root) {
		element.enqueueUpdate({
			path: `${element._path}.${Shortcuts.Style}`,
			value: obj.cssText
		});
	}
}
function setStyle(newVal, styleKey) {
	process.env.NODE_ENV !== "production" && warn(isString(newVal) && newVal.length > PROPERTY_THRESHOLD, `Style 属性 ${styleKey} 的值数据量过大，可能会影响渲染性能，考虑使用 CSS 类或其它方案替代。`);
	const old = this[styleKey];
	if (old === newVal) return;
	!this._pending && recordCss(this);
	if (isNull(newVal) || isUndefined(newVal) || newVal === "") {
		this._usedStyleProp.delete(styleKey);
		delete this._value[styleKey];
	} else {
		this._usedStyleProp.add(styleKey);
		this._value[styleKey] = newVal;
	}
	!this._pending && enqueueUpdate(this);
}
function initStyle(ctor, styleProperties$1) {
	const properties = {};
	for (let i = 0; i < styleProperties$1.length; i++) {
		const styleKey = styleProperties$1[i];
		if (ctor[styleKey]) return;
		properties[styleKey] = {
			get() {
				const val = this._value[styleKey];
				return isNull(val) || isUndefined(val) ? "" : val;
			},
			set(newVal) {
				setStyle.call(this, newVal, styleKey);
			}
		};
	}
	Object.defineProperties(ctor.prototype, properties);
}
function isCssVariable(propertyName) {
	return /^--/.test(propertyName);
}
var Style = class {
	_pending;
	_usedStyleProp;
	_value;
	_element;
	constructor(element) {
		this._element = element;
		this._usedStyleProp = new Set();
		this._value = {};
	}
	setCssVariables(styleKey) {
		this.hasOwnProperty(styleKey) || Object.defineProperty(this, styleKey, {
			enumerable: true,
			configurable: true,
			get: () => {
				return this._value[styleKey] || "";
			},
			set: (newVal) => {
				setStyle.call(this, newVal, styleKey);
			}
		});
	}
	get cssText() {
		if (!this._usedStyleProp.size) return "";
		const texts = [];
		this._usedStyleProp.forEach((key) => {
			const val = this[key];
			if (isNull(val) || isUndefined(val)) return;
			let styleName = isCssVariable(key) ? key : toDashed(key);
			if (styleName.indexOf("webkit") === 0 || styleName.indexOf("Webkit") === 0) {
				styleName = `-${styleName}`;
			}
			texts.push(`${styleName}: ${val};`);
		});
		return texts.join(" ");
	}
	set cssText(str) {
		this._pending = true;
		recordCss(this);
		this._usedStyleProp.forEach((prop) => {
			this.removeProperty(prop);
		});
		if (str === "" || isUndefined(str) || isNull(str)) {
			this._pending = false;
			enqueueUpdate(this);
			return;
		}
		const rules = str.split(";");
		for (let i = 0; i < rules.length; i++) {
			const rule = rules[i].trim();
			if (rule === "") {
				continue;
			}
			const [propName, ...valList] = rule.split(":");
			const val = valList.join(":");
			if (isUndefined(val)) {
				continue;
			}
			this.setProperty(propName.trim(), val.trim());
		}
		this._pending = false;
		enqueueUpdate(this);
	}
	setProperty(propertyName, value) {
		if (propertyName[0] === "-") {
			this.setCssVariables(propertyName);
		} else {
			propertyName = toCamelCase(propertyName);
		}
		if (isNull(value) || isUndefined(value)) {
			this.removeProperty(propertyName);
		} else {
			this[propertyName] = value;
		}
	}
	removeProperty(propertyName) {
		propertyName = toCamelCase(propertyName);
		if (!this._usedStyleProp.has(propertyName)) {
			return "";
		}
		const value = this[propertyName];
		this[propertyName] = undefined;
		return value;
	}
	getPropertyValue(propertyName) {
		propertyName = toCamelCase(propertyName);
		const value = this[propertyName];
		if (!value) {
			return "";
		}
		return value;
	}
};
initStyle(Style, styleProperties);
hooks$1.tap("injectNewStyleProperties", (newStyleProperties) => {
	if (isArray(newStyleProperties)) {
		initStyle(Style, newStyleProperties);
	} else {
		if (typeof newStyleProperties !== "string") return;
		initStyle(Style, [newStyleProperties]);
	}
});

//#endregion
//#region src/dom/tree.ts
function returnTrue() {
	return true;
}
function treeToArray(root, predict) {
	const array = [];
	const filter = predict ?? returnTrue;
	let object = root;
	while (object) {
		if (object.nodeType === NodeType.ELEMENT_NODE && filter(object)) {
			array.push(object);
		}
		object = following(object, root);
	}
	return array;
}
function following(el, root) {
	const firstChild = el.firstChild;
	const isElmentTypeValid = el.nodeType === NodeType.ELEMENT_NODE || el.nodeType === NodeType.DOCUMENT_NODE;
	if (firstChild && isElmentTypeValid) {
		return firstChild;
	}
	let current = el;
	do {
		if (current === root) {
			return null;
		}
		const nextSibling = current.nextSibling;
		if (nextSibling) {
			return nextSibling;
		}
		current = current.parentElement;
	} while (current);
	return null;
}

//#endregion
//#region src/dom/element.ts
var TaroElement = class TaroElement extends TaroNode {
	ctx;
	tagName;
	props = {};
	style;
	dataset = EMPTY_OBJ;
	innerHTML;
	constructor() {
		super();
		this.nodeType = NodeType.ELEMENT_NODE;
		this.style = new Style(this);
		hooks$1.call("patchElement", this);
	}
	_stopPropagation(event) {
		let target = this;
		while (target = target.parentNode) {
			const listeners = target.__handlers[event.type];
			if (!isArray(listeners)) {
				continue;
			}
			for (let i = listeners.length; i--;) {
				const l = listeners[i];
				l._stop = true;
			}
		}
	}
	get id() {
		return this.getAttribute(ID);
	}
	set id(val) {
		this.setAttribute(ID, val);
	}
	get className() {
		return this.getAttribute(CLASS) || "";
	}
	set className(val) {
		this.setAttribute(CLASS, val);
	}
	get cssText() {
		return this.getAttribute(STYLE) || "";
	}
	get classList() {
		return new ClassList(this.className, this);
	}
	get children() {
		return this.childNodes.filter(isElement);
	}
	get attributes() {
		const props = this.props;
		const propKeys = Object.keys(props);
		const style$1 = this.style.cssText;
		const attrs = propKeys.map((key) => ({
			name: key,
			value: props[key]
		}));
		return attrs.concat(style$1 ? {
			name: STYLE,
			value: style$1
		} : []);
	}
	get textContent() {
		let text = "";
		const childNodes = this.childNodes;
		for (let i = 0; i < childNodes.length; i++) {
			text += childNodes[i].textContent;
		}
		return text;
	}
	set textContent(text) {
		super.textContent = text;
	}
	hasAttribute(qualifiedName) {
		return !isUndefined(this.props[qualifiedName]);
	}
	hasAttributes() {
		return this.attributes.length > 0;
	}
	get focus() {
		return function() {
			this.setAttribute(FOCUS, true);
		};
	}
	set focus(value) {
		this.setAttribute(FOCUS, value);
	}
	blur() {
		this.setAttribute(FOCUS, false);
	}
	setAttribute(qualifiedName, value) {
		process.env.NODE_ENV !== "production" && warn(isString(value) && value.length > PROPERTY_THRESHOLD, `元素 ${this.nodeName} 的 ${qualifiedName} 属性值数据量过大，可能会影响渲染性能。考虑降低图片转为 base64 的阈值或在 CSS 中使用 base64。`);
		const isPureView = this.nodeName === VIEW && !isHasExtractProp(this) && !this.isAnyEventBinded();
		if (qualifiedName !== STYLE) {
			MutationObserver$1.record({
				target: this,
				type: MutationRecordType.ATTRIBUTES,
				attributeName: qualifiedName,
				oldValue: this.getAttribute(qualifiedName)
			});
		}
		switch (qualifiedName) {
			case STYLE:
				this.style.cssText = value;
				break;
			case ID:
				if (this.uid !== this.sid) {
					eventSource.delete(this.uid);
				}
				value = String(value);
				this.props[qualifiedName] = this.uid = value;
				eventSource.set(value, this);
				break;
			default:
				this.props[qualifiedName] = value;
				if (qualifiedName.startsWith("data-")) {
					if (this.dataset === EMPTY_OBJ) {
						this.dataset = Object.create(null);
					}
					this.dataset[toCamelCase(qualifiedName.replace(/^data-/, ""))] = value;
				}
				break;
		}
		if (!this._root) return;
		const componentsAlias$2 = getComponentsAlias();
		const _alias = componentsAlias$2[this.nodeName];
		const viewAlias = componentsAlias$2[VIEW]._num;
		const clickViewAlias = componentsAlias$2[CLICK_VIEW]._num;
		const staticViewAlias = componentsAlias$2[STATIC_VIEW]._num;
		const catchViewAlias = componentsAlias$2[CATCH_VIEW]._num;
		const _path = this._path;
		qualifiedName = shortcutAttr(qualifiedName);
		const qualifiedNameInCamelCase = toCamelCase(qualifiedName);
		const payload = {
			path: `${_path}.${qualifiedNameInCamelCase}`,
			value: isFunction(value) ? () => value : value
		};
		hooks$1.call("modifySetAttrPayload", this, qualifiedName, payload, componentsAlias$2);
		if (_alias) {
			const qualifiedNameAlias = _alias[qualifiedNameInCamelCase] || qualifiedName;
			payload.path = `${_path}.${toCamelCase(qualifiedNameAlias)}`;
		}
		this.enqueueUpdate(payload);
		if (this.nodeName === VIEW) {
			if (qualifiedNameInCamelCase === CATCHMOVE) {
				this.enqueueUpdate({
					path: `${_path}.${Shortcuts.NodeName}`,
					value: value ? catchViewAlias : this.isOnlyClickBinded() && !isHasExtractProp(this) ? clickViewAlias : this.isAnyEventBinded() ? viewAlias : staticViewAlias
				});
			} else if (isPureView && isHasExtractProp(this)) {
				this.enqueueUpdate({
					path: `${_path}.${Shortcuts.NodeName}`,
					value: staticViewAlias
				});
			}
		}
	}
	removeAttribute(qualifiedName) {
		const isStaticView = this.nodeName === VIEW && isHasExtractProp(this) && !this.isAnyEventBinded();
		MutationObserver$1.record({
			target: this,
			type: MutationRecordType.ATTRIBUTES,
			attributeName: qualifiedName,
			oldValue: this.getAttribute(qualifiedName)
		});
		if (qualifiedName === STYLE) {
			this.style.cssText = "";
		} else {
			const isInterrupt = hooks$1.call("onRemoveAttribute", this, qualifiedName);
			if (isInterrupt) {
				return;
			}
			if (!this.props.hasOwnProperty(qualifiedName)) {
				return;
			}
			delete this.props[qualifiedName];
		}
		if (!this._root) return;
		const componentsAlias$2 = getComponentsAlias();
		const _alias = componentsAlias$2[this.nodeName];
		const viewAlias = componentsAlias$2[VIEW]._num;
		const staticViewAlias = componentsAlias$2[STATIC_VIEW]._num;
		const pureViewAlias = componentsAlias$2[PURE_VIEW]._num;
		const clickViewAlias = componentsAlias$2[CLICK_VIEW]._num;
		const _path = this._path;
		qualifiedName = shortcutAttr(qualifiedName);
		const qualifiedNameInCamelCase = toCamelCase(qualifiedName);
		const payload = {
			path: `${_path}.${qualifiedNameInCamelCase}`,
			value: ""
		};
		hooks$1.call("modifyRmAttrPayload", this, qualifiedName, payload, componentsAlias$2);
		if (_alias) {
			const qualifiedNameAlias = _alias[qualifiedNameInCamelCase] || qualifiedName;
			payload.path = `${_path}.${toCamelCase(qualifiedNameAlias)}`;
		}
		this.enqueueUpdate(payload);
		if (this.nodeName === VIEW) {
			if (qualifiedNameInCamelCase === CATCHMOVE) {
				this.enqueueUpdate({
					path: `${_path}.${Shortcuts.NodeName}`,
					value: this.isOnlyClickBinded() && !isHasExtractProp(this) ? clickViewAlias : this.isAnyEventBinded() ? viewAlias : isHasExtractProp(this) ? staticViewAlias : pureViewAlias
				});
			} else if (isStaticView && !isHasExtractProp(this)) {
				this.enqueueUpdate({
					path: `${_path}.${Shortcuts.NodeName}`,
					value: pureViewAlias
				});
			}
		}
	}
	getAttribute(qualifiedName) {
		const attr = qualifiedName === STYLE ? this.style.cssText : this.props[qualifiedName];
		return attr ?? "";
	}
	getElementsByTagName(tagName) {
		return treeToArray(this, (el) => {
			return el.nodeName === tagName || tagName === "*" && this !== el;
		});
	}
	getElementsByClassName(className) {
		const classNames = className.trim().split(/\s+/);
		return treeToArray(this, (el) => {
			const classList = el.classList;
			return classNames.every((c) => classList.contains(c));
		});
	}
	dispatchEvent(event) {
		const cancelable = event.cancelable;
		const listeners = this.__handlers[event.type];
		if (!isArray(listeners)) {
			return false;
		}
		for (let i = listeners.length; i--;) {
			const listener = listeners[i];
			let result;
			if (listener._stop) {
				listener._stop = false;
			} else {
				hooks$1.call("modifyDispatchEvent", event, this);
				result = listener.call(this, event);
			}
			if ((result === false || event._end) && cancelable) {
				event.defaultPrevented = true;
			}
			if (!isUndefined(result) && event.mpEvent) {
				const res = hooks$1.call("modifyTaroEventReturn", this, event, result);
				if (res) {
					event.mpEvent[EVENT_CALLBACK_RESULT] = result;
				}
			}
			if (event._end && event._stop) {
				break;
			}
		}
		if (event._stop) {
			this._stopPropagation(event);
		}
		return listeners != null;
	}
	addEventListener(type, handler, options$1) {
		const name = this.nodeName;
		const SPECIAL_NODES$1 = hooks$1.call("getSpecialNodes");
		let sideEffect = true;
		if (isObject(options$1) && options$1.sideEffect === false) {
			sideEffect = false;
			delete options$1.sideEffect;
		}
		hooks$1.call("modifyAddEventListener", this, sideEffect, getComponentsAlias);
		if (sideEffect !== false && !this.isAnyEventBinded() && SPECIAL_NODES$1.indexOf(name) > -1) {
			const componentsAlias$2 = getComponentsAlias();
			const alias = componentsAlias$2[name]._num;
			this.enqueueUpdate({
				path: `${this._path}.${Shortcuts.NodeName}`,
				value: alias
			});
		}
		super.addEventListener(type, handler, options$1);
	}
	removeEventListener(type, handler, sideEffect = true) {
		super.removeEventListener(type, handler);
		const name = this.nodeName;
		const SPECIAL_NODES$1 = hooks$1.call("getSpecialNodes");
		hooks$1.call("modifyRemoveEventListener", this, sideEffect, getComponentsAlias);
		if (sideEffect !== false && !this.isAnyEventBinded() && SPECIAL_NODES$1.indexOf(name) > -1) {
			const componentsAlias$2 = getComponentsAlias();
			const value = isHasExtractProp(this) ? `static-${name}` : `pure-${name}`;
			const valueAlias = componentsAlias$2[value]._num;
			this.enqueueUpdate({
				path: `${this._path}.${Shortcuts.NodeName}`,
				value: valueAlias
			});
		}
	}
	static extend(methodName, options$1) {
		extend(TaroElement, methodName, options$1);
	}
};

//#endregion
//#region src/options.ts
const options = {
	prerender: true,
	debug: false
};

//#endregion
//#region src/dom-external/inner-html/scaner.ts
function initPosition() {
	return {
		index: 0,
		column: 0,
		line: 0
	};
}
function feedPosition(position, str, len) {
	const start = position.index;
	const end = position.index = start + len;
	for (let i = start; i < end; i++) {
		const char = str.charAt(i);
		if (char === "\n") {
			position.line++;
			position.column = 0;
		} else {
			position.column++;
		}
	}
}
function jumpPosition(position, str, end) {
	const len = end - position.index;
	return feedPosition(position, str, len);
}
function copyPosition(position) {
	return {
		index: position.index,
		line: position.line,
		column: position.column
	};
}
const whitespace = /\s/;
function isWhitespaceChar(char) {
	return whitespace.test(char);
}
const equalSign = /=/;
function isEqualSignChar(char) {
	return equalSign.test(char);
}
function shouldBeIgnore(tagName) {
	const name = tagName.toLowerCase();
	if (options.html.skipElements.has(name)) {
		return true;
	}
	return false;
}
const alphanumeric = /[A-Za-z0-9]/;
function findTextEnd(str, index) {
	while (true) {
		const textEnd = str.indexOf("<", index);
		if (textEnd === -1) {
			return textEnd;
		}
		const char = str.charAt(textEnd + 1);
		if (char === "/" || char === "!" || alphanumeric.test(char)) {
			return textEnd;
		}
		index = textEnd + 1;
	}
}
function isWordEnd(cursor, wordBegin, html) {
	if (!isWhitespaceChar(html.charAt(cursor))) return false;
	const len = html.length;
	for (let i = cursor - 1; i > wordBegin; i--) {
		const char = html.charAt(i);
		if (!isWhitespaceChar(char)) {
			if (isEqualSignChar(char)) return false;
			break;
		}
	}
	for (let i = cursor + 1; i < len; i++) {
		const char = html.charAt(i);
		if (!isWhitespaceChar(char)) {
			if (isEqualSignChar(char)) return false;
			return true;
		}
	}
}
var Scaner = class {
	tokens = [];
	position = initPosition();
	html;
	constructor(html) {
		this.html = html;
	}
	scan() {
		const { html, position } = this;
		const len = html.length;
		while (position.index < len) {
			const start = position.index;
			this.scanText();
			if (position.index === start) {
				const isComment$1 = html.startsWith("!--", start + 1);
				if (isComment$1) {
					this.scanComment();
				} else {
					const tagName = this.scanTag();
					if (shouldBeIgnore(tagName)) {
						this.scanSkipTag(tagName);
					}
				}
			}
		}
		return this.tokens;
	}
	scanText() {
		const type = "text";
		const { html, position } = this;
		let textEnd = findTextEnd(html, position.index);
		if (textEnd === position.index) {
			return;
		}
		if (textEnd === -1) {
			textEnd = html.length;
		}
		const start = copyPosition(position);
		const content = html.slice(position.index, textEnd);
		jumpPosition(position, html, textEnd);
		const end = copyPosition(position);
		this.tokens.push({
			type,
			content,
			position: {
				start,
				end
			}
		});
	}
	scanComment() {
		const type = "comment";
		const { html, position } = this;
		const start = copyPosition(position);
		feedPosition(position, html, 4);
		let contentEnd = html.indexOf("-->", position.index);
		let commentEnd = contentEnd + 3;
		if (contentEnd === -1) {
			contentEnd = commentEnd = html.length;
		}
		const content = html.slice(position.index, contentEnd);
		jumpPosition(position, html, commentEnd);
		this.tokens.push({
			type,
			content,
			position: {
				start,
				end: copyPosition(position)
			}
		});
	}
	scanTag() {
		this.scanTagStart();
		const tagName = this.scanTagName();
		this.scanAttrs();
		this.scanTagEnd();
		return tagName;
	}
	scanTagStart() {
		const type = "tag-start";
		const { html, position } = this;
		const secondChar = html.charAt(position.index + 1);
		const close = secondChar === "/";
		const start = copyPosition(position);
		feedPosition(position, html, close ? 2 : 1);
		this.tokens.push({
			type,
			close,
			position: { start }
		});
	}
	scanTagEnd() {
		const type = "tag-end";
		const { html, position } = this;
		const firstChar = html.charAt(position.index);
		const close = firstChar === "/";
		feedPosition(position, html, close ? 2 : 1);
		const end = copyPosition(position);
		this.tokens.push({
			type,
			close,
			position: { end }
		});
	}
	scanTagName() {
		const type = "tag";
		const { html, position } = this;
		const len = html.length;
		let start = position.index;
		while (start < len) {
			const char = html.charAt(start);
			const isTagChar = !(isWhitespaceChar(char) || char === "/" || char === ">");
			if (isTagChar) break;
			start++;
		}
		let end = start + 1;
		while (end < len) {
			const char = html.charAt(end);
			const isTagChar = !(isWhitespaceChar(char) || char === "/" || char === ">");
			if (!isTagChar) break;
			end++;
		}
		jumpPosition(position, html, end);
		const tagName = html.slice(start, end);
		this.tokens.push({
			type,
			content: tagName
		});
		return tagName;
	}
	scanAttrs() {
		const { html, position, tokens } = this;
		let cursor = position.index;
		let quote = null;
		let wordBegin = cursor;
		const words = [];
		const len = html.length;
		while (cursor < len) {
			const char = html.charAt(cursor);
			if (quote) {
				const isQuoteEnd = char === quote;
				if (isQuoteEnd) {
					quote = null;
				}
				cursor++;
				continue;
			}
			const isTagEnd = char === "/" || char === ">";
			if (isTagEnd) {
				if (cursor !== wordBegin) {
					words.push(html.slice(wordBegin, cursor));
				}
				break;
			}
			if (isWordEnd(cursor, wordBegin, html)) {
				if (cursor !== wordBegin) {
					words.push(html.slice(wordBegin, cursor));
				}
				wordBegin = cursor + 1;
				cursor++;
				continue;
			}
			const isQuoteStart = char === "'" || char === "\"";
			if (isQuoteStart) {
				quote = char;
				cursor++;
				continue;
			}
			cursor++;
		}
		jumpPosition(position, html, cursor);
		const wLen = words.length;
		const type = "attribute";
		for (let i = 0; i < wLen; i++) {
			const word = words[i];
			const isNotPair = word.includes("=");
			if (isNotPair) {
				const secondWord = words[i + 1];
				if (secondWord && secondWord.startsWith("=")) {
					if (secondWord.length > 1) {
						const newWord = word + secondWord;
						tokens.push({
							type,
							content: newWord
						});
						i += 1;
						continue;
					}
					const thirdWord = words[i + 2];
					i += 1;
					if (thirdWord) {
						const newWord = word + "=" + thirdWord;
						tokens.push({
							type,
							content: newWord
						});
						i += 1;
						continue;
					}
				}
			}
			if (word.endsWith("=")) {
				const secondWord = words[i + 1];
				if (secondWord && !secondWord.includes("=")) {
					const newWord$1 = word + secondWord;
					tokens.push({
						type,
						content: newWord$1
					});
					i += 1;
					continue;
				}
				const newWord = word.slice(0, -1);
				tokens.push({
					type,
					content: newWord
				});
				continue;
			}
			tokens.push({
				type,
				content: word
			});
		}
	}
	scanSkipTag(tagName) {
		const { html, position } = this;
		const safeTagName = tagName.toLowerCase();
		const len = html.length;
		while (position.index < len) {
			const nextTag = html.indexOf("</", position.index);
			if (nextTag === -1) {
				this.scanText();
				break;
			}
			jumpPosition(position, html, nextTag);
			const name = this.scanTag();
			if (safeTagName === name.toLowerCase()) {
				break;
			}
		}
	}
};

//#endregion
//#region src/dom-external/inner-html/utils.ts
function unquote(str) {
	const car = str.charAt(0);
	const end = str.length - 1;
	const isQuoteStart = car === "\"" || car === "'";
	if (isQuoteStart && car === str.charAt(end)) {
		return str.slice(1, end);
	}
	return str;
}

//#endregion
//#region src/dom-external/inner-html/style.ts
const LEFT_BRACKET = "{";
const RIGHT_BRACKET = "}";
const CLASS_SELECTOR = ".";
const ID_SELECTOR = "#";
const CHILD_COMBINATOR = ">";
const GENERAL_SIBLING_COMBINATOR = "~";
const ADJACENT_SIBLING_COMBINATOR = "+";
var StyleTagParser = class {
	styles = [];
	extractStyle(src) {
		const REG_STYLE = /<style\s?[^>]*>((.|\n|\s)+?)<\/style>/g;
		let html = src;
		html = html.replace(REG_STYLE, (_, $1) => {
			const style$1 = $1.trim();
			this.stringToSelector(style$1);
			return "";
		});
		return html.trim();
	}
	stringToSelector(style$1) {
		let lb = style$1.indexOf(LEFT_BRACKET);
		while (lb > -1) {
			const rb = style$1.indexOf(RIGHT_BRACKET);
			const selectors = style$1.slice(0, lb).trim();
			let content = style$1.slice(lb + 1, rb);
			content = content.replace(/:(.*);/g, function(_, $1) {
				const t = $1.trim().replace(/ +/g, "+++");
				return `:${t};`;
			});
			content = content.replace(/ /g, "");
			content = content.replace(/\+\+\+/g, " ");
			if (!/;$/.test(content)) {
				content += ";";
			}
			selectors.split(",").forEach((src) => {
				const selectorList = this.parseSelector(src);
				this.styles.push({
					content,
					selectorList
				});
			});
			style$1 = style$1.slice(rb + 1);
			lb = style$1.indexOf(LEFT_BRACKET);
		}
	}
	parseSelector(src) {
		const list = src.trim().replace(/ *([>~+]) */g, " $1").replace(/ +/g, " ").replace(/\[\s*([^[\]=\s]+)\s*=\s*([^[\]=\s]+)\s*\]/g, "[$1=$2]").split(" ");
		const selectors = list.map((item) => {
			const firstChar = item.charAt(0);
			const selector = {
				isChild: firstChar === CHILD_COMBINATOR,
				isGeneralSibling: firstChar === GENERAL_SIBLING_COMBINATOR,
				isAdjacentSibling: firstChar === ADJACENT_SIBLING_COMBINATOR,
				tag: null,
				id: null,
				class: [],
				attrs: []
			};
			item = item.replace(/^[>~+]/, "");
			item = item.replace(/\[(.+?)\]/g, function(_, $1) {
				const [key, value] = $1.split("=");
				const all = $1.indexOf("=") === -1;
				const attr = {
					all,
					key,
					value: all ? null : value
				};
				selector.attrs.push(attr);
				return "";
			});
			item = item.replace(/([.#][A-Za-z0-9-_]+)/g, function(_, $1) {
				if ($1[0] === ID_SELECTOR) {
					selector.id = $1.substr(1);
				} else if ($1[0] === CLASS_SELECTOR) {
					selector.class.push($1.substr(1));
				}
				return "";
			});
			if (item !== "") {
				selector.tag = item;
			}
			return selector;
		});
		return selectors;
	}
	matchStyle(tagName, el, list) {
		const res = sortStyles(this.styles).reduce((str, { content, selectorList }, i) => {
			let idx = list[i];
			let selector = selectorList[idx];
			const nextSelector = selectorList[idx + 1];
			if (nextSelector?.isGeneralSibling || nextSelector?.isAdjacentSibling) {
				selector = nextSelector;
				idx += 1;
				list[i] += 1;
			}
			let isMatch = this.matchCurrent(tagName, el, selector);
			if (isMatch && selector.isGeneralSibling) {
				let prev = getPreviousElement(el);
				while (prev) {
					if (prev.h5tagName && this.matchCurrent(prev.h5tagName, prev, selectorList[idx - 1])) {
						isMatch = true;
						break;
					}
					prev = getPreviousElement(prev);
					isMatch = false;
				}
			}
			if (isMatch && selector.isAdjacentSibling) {
				const prev = getPreviousElement(el);
				if (!prev || !prev.h5tagName) {
					isMatch = false;
				} else {
					const isSiblingMatch = this.matchCurrent(prev.h5tagName, prev, selectorList[idx - 1]);
					if (!isSiblingMatch) {
						isMatch = false;
					}
				}
			}
			if (isMatch) {
				if (idx === selectorList.length - 1) {
					return str + content;
				} else if (idx < selectorList.length - 1) {
					list[i] += 1;
				}
			} else {
				if (selector.isChild && idx > 0) {
					list[i] -= 1;
					if (this.matchCurrent(tagName, el, selectorList[list[i]])) {
						list[i] += 1;
					}
				}
			}
			return str;
		}, "");
		return res;
	}
	matchCurrent(tagName, el, selector) {
		if (selector.tag && selector.tag !== tagName) return false;
		if (selector.id && selector.id !== el.id) return false;
		if (selector.class.length) {
			const classList = el.className.split(" ");
			for (let i = 0; i < selector.class.length; i++) {
				const cls = selector.class[i];
				if (classList.indexOf(cls) === -1) {
					return false;
				}
			}
		}
		if (selector.attrs.length) {
			for (let i = 0; i < selector.attrs.length; i++) {
				const { all, key, value } = selector.attrs[i];
				if (all && !el.hasAttribute(key)) {
					return false;
				} else {
					const attr = el.getAttribute(key);
					if (attr !== unquote(value || "")) {
						return false;
					}
				}
			}
		}
		return true;
	}
};
function getPreviousElement(el) {
	const parent = el.parentElement;
	if (!parent) return null;
	const prev = el.previousSibling;
	if (!prev) return null;
	if (prev.nodeType === NodeType.ELEMENT_NODE) {
		return prev;
	} else {
		return getPreviousElement(prev);
	}
}
function sortStyles(styles) {
	return styles.sort((s1, s2) => {
		const hundreds1 = getHundredsWeight(s1.selectorList);
		const hundreds2 = getHundredsWeight(s2.selectorList);
		if (hundreds1 !== hundreds2) return hundreds1 - hundreds2;
		const tens1 = getTensWeight(s1.selectorList);
		const tens2 = getTensWeight(s2.selectorList);
		if (tens1 !== tens2) return tens1 - tens2;
		const ones1 = getOnesWeight(s1.selectorList);
		const ones2 = getOnesWeight(s2.selectorList);
		return ones1 - ones2;
	});
}
function getHundredsWeight(selectors) {
	return selectors.reduce((pre, cur) => pre + (cur.id ? 1 : 0), 0);
}
function getTensWeight(selectors) {
	return selectors.reduce((pre, cur) => pre + cur.class.length + cur.attrs.length, 0);
}
function getOnesWeight(selectors) {
	return selectors.reduce((pre, cur) => pre + (cur.tag ? 1 : 0), 0);
}

//#endregion
//#region src/dom-external/inner-html/tags.ts
function makeMap(str, expectsLowerCase) {
	const map = Object.create(null);
	const list = str.split(",");
	for (let i = 0; i < list.length; i++) {
		map[list[i]] = true;
	}
	return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const specialMiniElements = {
	img: "image",
	iframe: "web-view"
};
const internalCompsList = Object.keys(internalComponents).map((i) => i.toLowerCase()).join(",");
const isMiniElements = makeMap(internalCompsList, true);
const isInlineElements = makeMap("a,i,abbr,iframe,select,acronym,slot,small,span,bdi,kbd,strong,big,map,sub,sup,br,mark,mark,meter,template,canvas,textarea,cite,object,time,code,output,u,data,picture,tt,datalist,var,dfn,del,q,em,s,embed,samp,b", true);
const isBlockElements = makeMap("address,fieldset,li,article,figcaption,main,aside,figure,nav,blockquote,footer,ol,details,form,p,dialog,h1,h2,h3,h4,h5,h6,pre,dd,header,section,div,hgroup,table,dl,hr,ul,dt", true);

//#endregion
//#region src/dom-external/inner-html/parser.ts
const closingTagAncestorBreakers = {
	li: [
		"ul",
		"ol",
		"menu"
	],
	dt: ["dl"],
	dd: ["dl"],
	tbody: ["table"],
	thead: ["table"],
	tfoot: ["table"],
	tr: ["table"],
	td: ["table"]
};
function hasTerminalParent(tagName, stack) {
	const tagParents = closingTagAncestorBreakers[tagName];
	if (tagParents) {
		let currentIndex = stack.length - 1;
		while (currentIndex >= 0) {
			const parentTagName = stack[currentIndex].tagName;
			if (parentTagName === tagName) {
				break;
			}
			if (tagParents && tagParents.includes(parentTagName)) {
				return true;
			}
			currentIndex--;
		}
	}
	return false;
}
function getTagName(tag) {
	if (options.html.renderHTMLTag) {
		return tag;
	}
	if (specialMiniElements[tag]) {
		return specialMiniElements[tag];
	} else if (isMiniElements(tag)) {
		return tag;
	} else if (isBlockElements(tag)) {
		return "view";
	} else if (isInlineElements(tag)) {
		return "text";
	}
	return "view";
}
function splitEqual(str) {
	const sep = "=";
	const idx = str.indexOf(sep);
	if (idx === -1) return [str];
	const key = str.slice(0, idx).trim();
	const value = str.slice(idx + sep.length).trim();
	return [key, value];
}
function format(children, document$1, styleOptions, parent) {
	return children.filter((child) => {
		if (child.type === "comment") {
			return false;
		} else if (child.type === "text") {
			return child.content !== "";
		}
		return true;
	}).map((child) => {
		if (child.type === "text") {
			let text = document$1.createTextNode(child.content);
			if (isFunction(options.html.transformText)) {
				text = options.html.transformText(text, child);
			}
			parent?.appendChild(text);
			return text;
		}
		const el = document$1.createElement(getTagName(child.tagName));
		el.h5tagName = child.tagName;
		parent?.appendChild(el);
		if (!options.html.renderHTMLTag) {
			el.className = `h5-${child.tagName}`;
		}
		for (let i = 0; i < child.attributes.length; i++) {
			const attr = child.attributes[i];
			const [key, value] = splitEqual(attr);
			if (key === "class") {
				el.className += " " + unquote(value);
			} else if (key[0] === "o" && key[1] === "n") {
				continue;
			} else {
				el.setAttribute(key, value == null ? true : unquote(value));
			}
		}
		const { styleTagParser, descendantList } = styleOptions;
		const list = descendantList.slice();
		const style$1 = styleTagParser.matchStyle(child.tagName, el, list);
		el.setAttribute("style", style$1 + el.style.cssText);
		format(child.children, document$1, {
			styleTagParser,
			descendantList: list
		}, el);
		if (isFunction(options.html.transformElement)) {
			return options.html.transformElement(el, child);
		}
		return el;
	});
}
function parser(html, document$1) {
	const styleTagParser = new StyleTagParser();
	html = styleTagParser.extractStyle(html);
	const tokens = new Scaner(html).scan();
	const root = {
		tagName: "",
		children: [],
		type: "element",
		attributes: []
	};
	const state = {
		tokens,
		options,
		cursor: 0,
		stack: [root]
	};
	parse(state);
	return format(root.children, document$1, {
		styleTagParser,
		descendantList: Array(styleTagParser.styles.length).fill(0)
	});
}
function parse(state) {
	const { tokens, stack } = state;
	let { cursor } = state;
	const len = tokens.length;
	let nodes = stack[stack.length - 1].children;
	while (cursor < len) {
		const token = tokens[cursor];
		if (token.type !== "tag-start") {
			nodes.push(token);
			cursor++;
			continue;
		}
		const tagToken = tokens[++cursor];
		cursor++;
		const tagName = tagToken.content.toLowerCase();
		if (token.close) {
			let index = stack.length;
			let shouldRewind = false;
			while (--index > -1) {
				if (stack[index].tagName === tagName) {
					shouldRewind = true;
					break;
				}
			}
			while (cursor < len) {
				const endToken = tokens[cursor];
				if (endToken.type !== "tag-end") break;
				cursor++;
			}
			if (shouldRewind) {
				stack.splice(index);
				break;
			} else {
				continue;
			}
		}
		const isClosingTag = options.html.closingElements.has(tagName);
		let shouldRewindToAutoClose = isClosingTag;
		if (shouldRewindToAutoClose) {
			shouldRewindToAutoClose = !hasTerminalParent(tagName, stack);
		}
		if (shouldRewindToAutoClose) {
			let currentIndex = stack.length - 1;
			while (currentIndex > 0) {
				if (tagName === stack[currentIndex].tagName) {
					stack.splice(currentIndex);
					const previousIndex = currentIndex - 1;
					nodes = stack[previousIndex].children;
					break;
				}
				currentIndex = currentIndex - 1;
			}
		}
		const attributes = [];
		let attrToken;
		while (cursor < len) {
			attrToken = tokens[cursor];
			if (attrToken.type === "tag-end") break;
			attributes.push(attrToken.content);
			cursor++;
		}
		cursor++;
		const children = [];
		const element = {
			type: "element",
			tagName: tagToken.content,
			attributes,
			children
		};
		nodes.push(element);
		const hasChildren = !(attrToken.close || options.html.voidElements.has(tagName));
		if (hasChildren) {
			stack.push({
				tagName,
				children
			});
			const innerState = {
				tokens,
				cursor,
				stack
			};
			parse(innerState);
			cursor = innerState.cursor;
		}
	}
	state.cursor = cursor;
}

//#endregion
//#region src/dom-external/inner-html/html.ts
options.html = {
	skipElements: new Set(["style", "script"]),
	voidElements: new Set([
		"!doctype",
		"area",
		"base",
		"br",
		"col",
		"command",
		"embed",
		"hr",
		"img",
		"input",
		"keygen",
		"link",
		"meta",
		"param",
		"source",
		"track",
		"wbr"
	]),
	closingElements: new Set([
		"html",
		"head",
		"body",
		"p",
		"dt",
		"dd",
		"li",
		"option",
		"thead",
		"th",
		"tbody",
		"tr",
		"td",
		"tfoot",
		"colgroup"
	]),
	renderHTMLTag: false
};
function setInnerHTML(element, html) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
	const children = parser(html, element.ownerDocument);
	for (let i = 0; i < children.length; i++) {
		element.appendChild(children[i]);
	}
}

//#endregion
//#region src/dom-external/element.ts
function getBoundingClientRectImpl() {
	if (!options.miniGlobal) return Promise.resolve(null);
	return new Promise((resolve) => {
		const query = options.miniGlobal.createSelectorQuery();
		if (process.env.TARO_ENV === "alipay") {
			query.select(`#${this.uid}`).boundingClientRect().exec((res) => {
				resolve(res);
			});
			return;
		}
		query.select(`#${this.uid}`).boundingClientRect((res) => {
			resolve(res);
		}).exec();
	});
}
function getTemplateContent(ctx) {
	if (ctx.nodeName === "template") {
		const document$1 = ctx.ownerDocument;
		const content = document$1.createElement(DOCUMENT_FRAGMENT);
		content.childNodes = ctx.childNodes;
		ctx.childNodes = [content];
		content.parentNode = ctx;
		content.childNodes.forEach((nodes) => {
			nodes.parentNode = content;
		});
		return content;
	}
}

//#endregion
//#region src/dom-external/node.ts
/**
* An implementation of `Element.insertAdjacentHTML()`
* to support Vue 3 with a version of or greater than `vue@3.1.2`
*/
function insertAdjacentHTML(position, html) {
	const parsedNodes = parser(html, this.ownerDocument);
	for (let i = 0; i < parsedNodes.length; i++) {
		const n = parsedNodes[i];
		switch (position) {
			case "beforebegin":
				this.parentNode?.insertBefore(n, this);
				break;
			case "afterbegin":
				if (this.hasChildNodes()) {
					this.insertBefore(n, this.childNodes[0]);
				} else {
					this.appendChild(n);
				}
				break;
			case "beforeend":
				this.appendChild(n);
				break;
			case "afterend":
				this.parentNode?.appendChild(n);
				break;
		}
	}
}
function cloneNode(isDeep = false) {
	const document$1 = this.ownerDocument;
	let newNode;
	if (this.nodeType === NodeType.ELEMENT_NODE) {
		newNode = document$1.createElement(this.nodeName);
	} else if (this.nodeType === NodeType.TEXT_NODE) {
		newNode = document$1.createTextNode("");
	}
	for (const key in this) {
		const value = this[key];
		if ([PROPS, DATASET].includes(key) && typeof value === OBJECT) {
			newNode[key] = { ...value };
		} else if (key === "_value") {
			newNode[key] = value;
		} else if (key === STYLE) {
			newNode.style._value = { ...value._value };
			newNode.style._usedStyleProp = new Set(Array.from(value._usedStyleProp));
		}
	}
	if (isDeep) {
		newNode.childNodes = this.childNodes.map((node) => node.cloneNode(true));
	}
	return newNode;
}
function contains(node) {
	let isContains = false;
	this.childNodes.some((childNode) => {
		const { uid } = childNode;
		if (uid === node.uid || uid === node.id || childNode.contains(node)) {
			isContains = true;
			return true;
		}
	});
	return isContains;
}

//#endregion
//#region src/dom-external/index.ts
if (process.env.TARO_PLATFORM !== PLATFORM_TYPE.WEB && process.env.TARO_PLATFORM !== PLATFORM_TYPE.HARMONY) {
	if (ENABLE_INNER_HTML) {
		TaroNode.extend("innerHTML", {
			set(html) {
				setInnerHTML.call(this, this, html);
			},
			get() {
				return "";
			}
		});
		if (ENABLE_ADJACENT_HTML) {
			TaroNode.extend("insertAdjacentHTML", insertAdjacentHTML);
		}
	}
	if (ENABLE_CLONE_NODE) {
		TaroNode.extend("cloneNode", cloneNode);
	}
	if (ENABLE_CONTAINS) {
		TaroNode.extend("contains", contains);
	}
	if (ENABLE_SIZE_APIS) {
		TaroElement.extend("getBoundingClientRect", getBoundingClientRectImpl);
	}
	if (ENABLE_TEMPLATE_CONTENT) {
		TaroElement.extend("content", { get() {
			return getTemplateContent(this);
		} });
	}
}

//#endregion
//#region src/dom/event.ts
var TaroEvent = class {
	cacheTarget;
	cacheCurrentTarget;
	type;
	bubbles;
	cancelable;
	_stop = false;
	_end = false;
	defaultPrevented = false;
	button = 0;
	timeStamp = Date.now();
	mpEvent;
	constructor(type, opts, event) {
		this.type = type.toLowerCase();
		this.mpEvent = event;
		this.bubbles = Boolean(opts && opts.bubbles);
		this.cancelable = Boolean(opts && opts.cancelable);
	}
	stopPropagation() {
		this._stop = true;
	}
	stopImmediatePropagation() {
		this._end = this._stop = true;
	}
	preventDefault() {
		this.defaultPrevented = true;
	}
	get target() {
		const cacheTarget = this.cacheTarget;
		if (!cacheTarget) {
			const target = Object.create(this.mpEvent?.target || null);
			const currentEle = env_default.document.getElementById(target.dataset?.sid || target.id || null);
			const element = env_default.document.getElementById(target.targetDataset?.sid || target.dataset?.sid || target.id || null);
			target.dataset = {
				...currentEle !== null ? currentEle.dataset : EMPTY_OBJ,
				...element !== null ? element.dataset : EMPTY_OBJ
			};
			for (const key in this.mpEvent?.detail) {
				target[key] = this.mpEvent.detail[key];
			}
			this.cacheTarget = target;
			return target;
		} else {
			return cacheTarget;
		}
	}
	get currentTarget() {
		const cacheCurrentTarget = this.cacheCurrentTarget;
		if (!cacheCurrentTarget) {
			const doc = env_default.document;
			const currentTarget = Object.create(this.mpEvent?.currentTarget || null);
			const element = doc.getElementById(currentTarget.dataset?.sid || currentTarget.id || null);
			const targetElement = doc.getElementById(this.mpEvent?.target?.dataset?.sid || this.mpEvent?.target?.id || null);
			if (element === null || element && element === targetElement) {
				this.cacheCurrentTarget = this.target;
				return this.target;
			}
			currentTarget.dataset = element.dataset;
			for (const key in this.mpEvent?.detail) {
				currentTarget[key] = this.mpEvent.detail[key];
			}
			this.cacheCurrentTarget = currentTarget;
			return currentTarget;
		} else {
			return cacheCurrentTarget;
		}
	}
};
function createEvent(event, node) {
	if (typeof event === "string") {
		return new TaroEvent(event, {
			bubbles: true,
			cancelable: true
		});
	}
	const domEv = new TaroEvent(event.type, {
		bubbles: true,
		cancelable: true
	}, event);
	for (const key in event) {
		if (key === CURRENT_TARGET || key === TARGET || key === TYPE || key === TIME_STAMP) {
			continue;
		} else {
			domEv[key] = event[key];
		}
	}
	if (domEv.type === CONFIRM && node?.nodeName === INPUT) {
		domEv[KEY_CODE] = 13;
	}
	return domEv;
}
const eventsBatch = {};
function getEventCBResult(event) {
	const result = event[EVENT_CALLBACK_RESULT];
	if (!isUndefined(result)) {
		delete event[EVENT_CALLBACK_RESULT];
	}
	return result;
}
function eventHandler(event) {
	event.type === undefined && Object.defineProperty(event, "type", { value: event._type });
	event.detail === undefined && Object.defineProperty(event, "detail", { value: event._detail || { ...event } });
	event.currentTarget = event.currentTarget || event.target || { ...event };
	hooks$1.call("modifyMpEventImpl", event);
	const currentTarget = event.currentTarget;
	const id = currentTarget.dataset?.sid || currentTarget.id || event.detail?.id || "";
	const node = env_default.document.getElementById(id);
	if (node) {
		const dispatch = () => {
			const e = createEvent(event, node);
			hooks$1.call("modifyTaroEvent", e, node);
			hooks$1.call("dispatchTaroEvent", e, node);
			hooks$1.call("dispatchTaroEventFinish", e, node);
		};
		if (hooks$1.isExist("batchedEventUpdates")) {
			const type = event.type;
			if (!hooks$1.call("isBubbleEvents", type) || !isParentBinded(node, type) || type === TOUCHMOVE && !!node.props.catchMove) {
				hooks$1.call("batchedEventUpdates", () => {
					if (eventsBatch[type]) {
						eventsBatch[type].forEach((fn) => fn());
						delete eventsBatch[type];
					}
					dispatch();
				});
				return getEventCBResult(event);
			} else {
				(eventsBatch[type] ||= []).push(dispatch);
			}
		} else {
			dispatch();
			return getEventCBResult(event);
		}
	}
}

//#endregion
//#region src/dom/form.ts
var FormElement = class extends TaroElement {
	get type() {
		return this.props[TYPE] ?? "";
	}
	set type(val) {
		this.setAttribute(TYPE, val);
	}
	get value() {
		const val = this.props[VALUE];
		return val == null ? "" : val;
	}
	set value(val) {
		this.setAttribute(VALUE, val);
	}
	dispatchEvent(event) {
		if (event.mpEvent) {
			const val = event.mpEvent.detail.value;
			if (event.type === CHANGE) {
				this.props.value = val;
			} else if (event.type === INPUT) {
				this.value = val;
			}
		}
		return super.dispatchEvent(event);
	}
};

//#endregion
//#region src/perf.ts
var Performance = class {
	recorder = new Map();
	start(id) {
		if (!options.debug) {
			return;
		}
		this.recorder.set(id, Date.now());
	}
	stop(id, now$1 = Date.now()) {
		if (!options.debug) {
			return;
		}
		const prev = this.recorder.get(id);
		if (!(prev >= 0)) return;
		this.recorder.delete(id);
		const time = now$1 - prev;
		console.log(`${id} 时长： ${time}ms 开始时间：${this.#parseTime(prev)} 结束时间：${this.#parseTime(now$1)}`);
	}
	delayStop(id, delay = 500) {
		if (!options.debug) {
			return;
		}
		return debounce((now$1 = Date.now(), cb) => {
			this.stop(id, now$1);
			cb?.();
		}, delay);
	}
	#parseTime(time) {
		const d = new Date(time);
		return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${`${d.getMilliseconds()}`.padStart(3, "0")}`;
	}
};
const perf = new Performance();

//#endregion
//#region src/dom/root.ts
function findCustomWrapper(root, dataPathArr) {
	const list = dataPathArr.slice(1);
	let currentData = root;
	let customWrapper;
	let splitedPath = "";
	list.some((item, i) => {
		const key = item.replace(/^\[(.+)\]$/, "$1").replace(/\bcn\b/g, "childNodes");
		currentData = currentData[key];
		if (isArray(currentData)) {
			currentData = currentData.filter((el) => !isComment(el));
		}
		if (isUndefined(currentData)) return true;
		if (currentData.nodeName === CUSTOM_WRAPPER) {
			const res = customWrapperCache.get(currentData.sid);
			if (res) {
				customWrapper = res;
				splitedPath = dataPathArr.slice(i + 2).join(".");
			}
		}
	});
	if (customWrapper) {
		return {
			customWrapper,
			splitedPath
		};
	}
}
var TaroRootElement = class extends TaroElement {
	updatePayloads = [];
	updateCallbacks = [];
	pendingUpdate = false;
	ctx = null;
	constructor() {
		super();
		this.nodeName = ROOT_STR;
		this.tagName = ROOT_STR.toUpperCase();
	}
	get _path() {
		return ROOT_STR;
	}
	get _root() {
		return this;
	}
	scheduleTask(fn) {
		setTimeout(fn);
	}
	enqueueUpdate(payload) {
		this.updatePayloads.push(payload);
		if (!this.pendingUpdate && this.ctx) {
			this.performUpdate();
		}
	}
	performUpdate(initRender = false, prerender) {
		this.pendingUpdate = true;
		const ctx = hooks$1.call("proxyToRaw", this.ctx);
		this.scheduleTask(() => {
			const setDataMark = `${SET_DATA} 开始时间戳 ${Date.now()}`;
			perf.start(setDataMark);
			const data = Object.create(null);
			const resetPaths = new Set(initRender ? ["root.cn.[0]", "root.cn[0]"] : []);
			while (this.updatePayloads.length > 0) {
				const { path, value } = this.updatePayloads.shift();
				if (path.endsWith(Shortcuts.Childnodes)) {
					resetPaths.add(path);
				}
				data[path] = value;
			}
			for (const path in data) {
				resetPaths.forEach((p) => {
					if (path.includes(p) && path !== p) {
						delete data[path];
					}
				});
				const value = data[path];
				if (isFunction(value)) {
					data[path] = value();
				}
			}
			if (isFunction(prerender)) return prerender(data);
			this.pendingUpdate = false;
			let normalUpdate = {};
			const customWrapperMap = new Map();
			if (initRender) {
				normalUpdate = data;
			} else {
				for (const p in data) {
					const dataPathArr = p.split(".");
					const found = findCustomWrapper(this, dataPathArr);
					if (found) {
						const { customWrapper, splitedPath } = found;
						customWrapperMap.set(customWrapper, {
							...customWrapperMap.get(customWrapper) || {},
							[`i.${splitedPath}`]: data[p]
						});
					} else {
						normalUpdate[p] = data[p];
					}
				}
			}
			const customWrapperCount = customWrapperMap.size;
			const isNeedNormalUpdate = Object.keys(normalUpdate).length > 0;
			const updateArrLen = customWrapperCount + (isNeedNormalUpdate ? 1 : 0);
			let executeTime = 0;
			const cb = () => {
				if (++executeTime === updateArrLen) {
					perf.stop(setDataMark);
					this.flushUpdateCallback();
					initRender && perf.stop(PAGE_INIT);
				}
			};
			if (customWrapperCount) {
				customWrapperMap.forEach((data$1, ctx$1) => {
					if (process.env.NODE_ENV !== "production" && options.debug) {
						console.log("custom wrapper setData: ", data$1);
					}
					ctx$1.setData(data$1, cb);
				});
			}
			if (isNeedNormalUpdate) {
				if (process.env.NODE_ENV !== "production" && options.debug) {
					console.log("page setData:", normalUpdate);
				}
				ctx.setData(normalUpdate, cb);
			}
		});
	}
	enqueueUpdateCallback(cb, ctx) {
		this.updateCallbacks.push(() => {
			ctx ? cb.call(ctx) : cb();
		});
	}
	flushUpdateCallback() {
		const updateCallbacks = this.updateCallbacks;
		if (!updateCallbacks.length) return;
		const copies = updateCallbacks.slice(0);
		this.updateCallbacks.length = 0;
		for (let i = 0; i < copies.length; i++) {
			copies[i]();
		}
	}
};

//#endregion
//#region src/dom/text.ts
var TaroText = class extends TaroNode {
	_value;
	nodeType = NodeType.TEXT_NODE;
	nodeName = "#text";
	constructor(value) {
		super();
		this._value = value;
	}
	set textContent(text) {
		MutationObserver$1.record({
			target: this,
			type: MutationRecordType.CHARACTER_DATA,
			oldValue: this._value
		});
		this._value = text;
		this.enqueueUpdate({
			path: `${this._path}.${Shortcuts.Text}`,
			value: text
		});
	}
	get textContent() {
		return this._value;
	}
	set nodeValue(text) {
		this.textContent = text;
	}
	get nodeValue() {
		return this._value;
	}
	set data(text) {
		this.textContent = text;
	}
	get data() {
		return this._value;
	}
};

//#endregion
//#region src/dom/anchor-element.ts
var AnchorElementAttrs = /* @__PURE__ */ function(AnchorElementAttrs$1) {
	AnchorElementAttrs$1["HREF"] = "href";
	AnchorElementAttrs$1["PROTOCOL"] = "protocol";
	AnchorElementAttrs$1["HOST"] = "host";
	AnchorElementAttrs$1["SEARCH"] = "search";
	AnchorElementAttrs$1["HASH"] = "hash";
	AnchorElementAttrs$1["HOSTNAME"] = "hostname";
	AnchorElementAttrs$1["PORT"] = "port";
	AnchorElementAttrs$1["PATHNAME"] = "pathname";
	return AnchorElementAttrs$1;
}(AnchorElementAttrs || {});
var AnchorElement = class extends TaroElement {
	get href() {
		return this.props[AnchorElementAttrs.HREF] ?? "";
	}
	set href(val) {
		this.setAttribute(AnchorElementAttrs.HREF, val);
	}
	get protocol() {
		return this.props[AnchorElementAttrs.PROTOCOL] ?? "";
	}
	get host() {
		return this.props[AnchorElementAttrs.HOST] ?? "";
	}
	get search() {
		return this.props[AnchorElementAttrs.SEARCH] ?? "";
	}
	get hash() {
		return this.props[AnchorElementAttrs.HASH] ?? "";
	}
	get hostname() {
		return this.props[AnchorElementAttrs.HOSTNAME] ?? "";
	}
	get port() {
		return this.props[AnchorElementAttrs.PORT] ?? "";
	}
	get pathname() {
		return this.props[AnchorElementAttrs.PATHNAME] ?? "";
	}
	setAttribute(qualifiedName, value) {
		if (qualifiedName === AnchorElementAttrs.HREF) {
			const willSetAttr = parseUrl(value);
			for (const k in willSetAttr) {
				super.setAttribute(k, willSetAttr[k]);
			}
		} else {
			super.setAttribute(qualifiedName, value);
		}
	}
};

//#endregion
//#region src/dom/transfer.ts
var TransferElement = class extends TaroElement {
	isTransferElement = true;
	constructor(dataName) {
		super();
		this.dataName = dataName;
	}
	get _path() {
		return this.dataName;
	}
};

//#endregion
//#region src/dom/document.ts
var TaroDocument = class extends TaroElement {
	documentElement;
	head;
	body;
	createEvent = createEvent;
	cookie;
	constructor() {
		super();
		this.nodeType = NodeType.DOCUMENT_NODE;
		this.nodeName = DOCUMENT_ELEMENT_NAME;
	}
	createElement(type) {
		const nodeName = type.toLowerCase();
		let element;
		switch (true) {
			case nodeName === ROOT_STR:
				element = new TaroRootElement();
				return element;
			case controlledComponent.has(nodeName):
				element = new FormElement();
				break;
			case nodeName === A:
				element = new AnchorElement();
				break;
			case nodeName === "page-meta":
			case nodeName === "navigation-bar":
				element = new TransferElement(toCamelCase(nodeName));
				break;
			default:
				element = new TaroElement();
				break;
		}
		element.nodeName = nodeName;
		element.tagName = type.toUpperCase();
		return element;
	}
	createElementNS(_svgNS, type) {
		return this.createElement(type);
	}
	createTextNode(text) {
		return new TaroText(text);
	}
	getElementById(id) {
		const el = eventSource.get(id);
		return isUndefined(el) ? null : el;
	}
	querySelector(query) {
		if (/^#/.test(query)) {
			return this.getElementById(query.slice(1));
		}
		return null;
	}
	querySelectorAll() {
		return [];
	}
	createComment() {
		const textnode = new TaroText("");
		textnode.nodeName = COMMENT;
		return textnode;
	}
	get defaultView() {
		return env_default.window;
	}
};

//#endregion
//#region src/bom/document.ts
function createDocument() {
	/**
	* <document>
	*   <html>
	*     <head></head>
	*     <body>
	*       <container>
	*         <app id="app" />
	*       </container>
	*     </body>
	*   </html>
	* </document>
	*/
	const doc = new TaroDocument();
	const documentCreateElement = doc.createElement.bind(doc);
	const html = documentCreateElement(HTML);
	const head = documentCreateElement(HEAD);
	const body = documentCreateElement(BODY);
	const app = documentCreateElement(APP);
	app.id = APP;
	const container = documentCreateElement(CONTAINER);
	doc.appendChild(html);
	html.appendChild(head);
	html.appendChild(body);
	body.appendChild(container);
	container.appendChild(app);
	doc.documentElement = html;
	doc.head = head;
	doc.body = body;
	return doc;
}
const taroDocumentProvider = process.env.TARO_PLATFORM === "web" ? env_default.document : env_default.document = createDocument();

//#endregion
//#region src/dom/svg.ts
var SVGElement = class extends TaroElement {};

//#endregion
//#region src/dsl/common.ts
const instances = new Map();
const pageId = incrementId();
function injectPageInstance(inst, id) {
	hooks$1.call("mergePageInstance", instances.get(id), inst);
	instances.set(id, inst);
}
function getPageInstance(id) {
	return instances.get(id);
}
function removePageInstance(id) {
	instances.delete(id);
}
function safeExecute(path, lifecycle, ...args) {
	const instance = instances.get(path);
	if (instance == null) {
		return;
	}
	const func = hooks$1.call("getLifecycle", instance, lifecycle);
	if (isArray(func)) {
		const res = func.map((fn) => fn.apply(instance, args));
		return res[0];
	}
	if (!isFunction(func)) {
		return;
	}
	return func.apply(instance, args);
}
function stringify(obj) {
	if (obj == null) {
		return "";
	}
	const path = Object.keys(obj).map((key) => {
		return key + "=" + obj[key];
	}).join("&");
	return path === "" ? path : "?" + path;
}
function getPath(id, options$1) {
	const idx = id.indexOf("?");
	if (process.env.TARO_PLATFORM === "web") {
		return `${idx > -1 ? id.substring(0, idx) : id}${stringify(options$1?.stamp ? { stamp: options$1.stamp } : {})}`;
	} else {
		return `${idx > -1 ? id.substring(0, idx) : id}${stringify(options$1)}`;
	}
}
function getOnReadyEventKey(path) {
	return path + "." + ON_READY;
}
function getOnShowEventKey(path) {
	return path + "." + ON_SHOW;
}
function getOnHideEventKey(path) {
	return path + "." + ON_HIDE;
}
function createPageConfig(component, pageName, data, pageConfig) {
	const id = pageName ?? `taro_page_${pageId()}`;
	const [ONLOAD, ONUNLOAD, ONREADY, ONSHOW, ONHIDE, LIFECYCLES, SIDE_EFFECT_LIFECYCLES] = hooks$1.call("getMiniLifecycleImpl").page;
	let pageElement = null;
	let unmounting = false;
	let prepareMountList = [];
	function setCurrentRouter(page) {
		const router = process.env.TARO_PLATFORM === "web" ? page.$taroPath : page.route || page.__route__ || page.$taroPath;
		Current.router = {
			params: page.$taroParams,
			path: addLeadingSlash(router),
			$taroPath: page.$taroPath,
			onReady: getOnReadyEventKey(id),
			onShow: getOnShowEventKey(id),
			onHide: getOnHideEventKey(id)
		};
		if (!isUndefined(page.exitState)) {
			Current.router.exitState = page.exitState;
		}
	}
	let loadResolver;
	let hasLoaded;
	const config = {
		[ONLOAD](options$1 = {}, cb) {
			hasLoaded = new Promise((resolve) => {
				loadResolver = resolve;
			});
			perf.start(PAGE_INIT);
			Current.page = this;
			this.config = pageConfig || {};
			const uniqueOptions = Object.assign({}, options$1, { $taroTimestamp: Date.now() });
			const $taroPath = this.$taroPath = getPath(id, uniqueOptions);
			if (process.env.TARO_PLATFORM === "web") {
				config.path = $taroPath;
			}
			if (this.$taroParams == null) {
				this.$taroParams = uniqueOptions;
			}
			setCurrentRouter(this);
			if (process.env.TARO_PLATFORM !== "web") {
				taroWindowProvider.trigger(CONTEXT_ACTIONS.INIT, $taroPath);
			}
			const mount = () => {
				Current.app.mount(component, $taroPath, () => {
					pageElement = env_default.document.getElementById($taroPath);
					ensure(pageElement !== null, "没有找到页面实例。");
					safeExecute($taroPath, ON_LOAD, this.$taroParams);
					loadResolver();
					if (process.env.TARO_PLATFORM !== "web") {
						pageElement.ctx = this;
						pageElement.performUpdate(true, cb);
					} else {
						isFunction(cb) && cb();
					}
				});
			};
			if (unmounting) {
				prepareMountList.push(mount);
			} else {
				mount();
			}
		},
		[ONUNLOAD]() {
			const $taroPath = this.$taroPath;
			if (process.env.TARO_PLATFORM !== "web") {
				taroWindowProvider.trigger(CONTEXT_ACTIONS.DESTORY, $taroPath);
			}
			safeExecute($taroPath, ONUNLOAD);
			unmounting = true;
			Current.app.unmount($taroPath, () => {
				unmounting = false;
				instances.delete($taroPath);
				if (pageElement) {
					pageElement.ctx = null;
					pageElement = null;
				}
				if (prepareMountList.length) {
					prepareMountList.forEach((fn) => fn());
					prepareMountList = [];
				}
			});
		},
		[ONREADY]() {
			hasLoaded.then(() => {
				safeExecute(this.$taroPath, ON_READY);
				_raf(() => eventCenter.trigger(getOnReadyEventKey(id)));
				this.onReady.called = true;
			});
		},
		[ONSHOW](options$1 = {}) {
			hasLoaded.then(() => {
				Current.page = this;
				setCurrentRouter(this);
				if (process.env.TARO_PLATFORM !== "web") {
					taroWindowProvider.trigger(CONTEXT_ACTIONS.RECOVER, this.$taroPath);
				}
				safeExecute(this.$taroPath, ON_SHOW, options$1);
				_raf(() => eventCenter.trigger(getOnShowEventKey(id)));
			});
		},
		[ONHIDE]() {
			if (process.env.TARO_PLATFORM !== "web") {
				taroWindowProvider.trigger(CONTEXT_ACTIONS.RESTORE, this.$taroPath);
			}
			if (Current.page === this) {
				Current.page = null;
				Current.router = null;
			}
			safeExecute(this.$taroPath, ON_HIDE);
			eventCenter.trigger(getOnHideEventKey(id));
		}
	};
	if (process.env.TARO_PLATFORM === "web") {
		config.getOpenerEventChannel = () => {
			return EventChannel.pageChannel;
		};
	}
	LIFECYCLES.forEach((lifecycle) => {
		let isDefer = false;
		lifecycle = lifecycle.replace(/^defer:/, () => {
			isDefer = true;
			return "";
		});
		config[lifecycle] = function() {
			const exec = () => safeExecute(this.$taroPath, lifecycle, ...arguments);
			if (isDefer) {
				hasLoaded.then(exec);
			} else {
				return exec();
			}
		};
	});
	SIDE_EFFECT_LIFECYCLES.forEach((lifecycle) => {
		if (component[lifecycle] || component.prototype?.[lifecycle] || component[lifecycle.replace(/^on/, "enable")] || pageConfig?.[lifecycle.replace(/^on/, "enable")]) {
			config[lifecycle] = function(...args) {
				const target = args[0]?.target;
				if (target?.id) {
					const id$1 = target.id;
					const element = env_default.document.getElementById(id$1);
					if (element) {
						target.dataset = element.dataset;
					}
				}
				return safeExecute(this.$taroPath, lifecycle, ...args);
			};
		}
	});
	config.eh = eventHandler;
	if (!isUndefined(data)) {
		config.data = data;
	}
	hooks$1.call("modifyPageObject", config);
	return config;
}
function createComponentConfig(component, componentName, data) {
	const id = componentName ?? `taro_component_${pageId()}`;
	let componentElement = null;
	const [ATTACHED, DETACHED] = hooks$1.call("getMiniLifecycleImpl").component;
	const config = {
		[ATTACHED]() {
			perf.start(PAGE_INIT);
			this.pageIdCache = this.getPageId?.() || pageId();
			const path = getPath(id, { id: this.pageIdCache });
			Current.app.mount(component, path, () => {
				componentElement = env_default.document.getElementById(path);
				ensure(componentElement !== null, "没有找到组件实例。");
				this.$taroInstances = instances.get(path);
				safeExecute(path, ON_LOAD);
				if (process.env.TARO_PLATFORM !== "web") {
					componentElement.ctx = this;
					componentElement.performUpdate(true);
				}
			});
		},
		[DETACHED]() {
			const path = getPath(id, { id: this.pageIdCache });
			Current.app.unmount(path, () => {
				instances.delete(path);
				if (componentElement) {
					componentElement.ctx = null;
				}
			});
		},
		methods: { eh: eventHandler }
	};
	if (!isUndefined(data)) {
		config.data = data;
	}
	[
		OPTIONS,
		EXTERNAL_CLASSES,
		BEHAVIORS
	].forEach((key) => {
		config[key] = component[key] ?? EMPTY_OBJ;
	});
	return config;
}
function createRecursiveComponentConfig(componentName) {
	const isCustomWrapper = componentName === CUSTOM_WRAPPER;
	const [ATTACHED, DETACHED] = hooks$1.call("getMiniLifecycleImpl").component;
	const lifeCycles = isCustomWrapper ? {
		[ATTACHED]() {
			const componentId = this.data.i?.sid || this.props.i?.sid;
			if (isString(componentId)) {
				customWrapperCache.set(componentId, this);
				const el = env_default.document.getElementById(componentId);
				if (el) {
					el.ctx = this;
				}
			}
		},
		[DETACHED]() {
			const componentId = this.data.i?.sid || this.props.i?.sid;
			if (isString(componentId)) {
				customWrapperCache.delete(componentId);
				const el = env_default.document.getElementById(componentId);
				if (el) {
					el.ctx = null;
				}
			}
		}
	} : EMPTY_OBJ;
	const extraOptions = {};
	if (process.env.TARO_ENV === "jd") {
		extraOptions.addGlobalClass = true;
	}
	return hooks$1.call("modifyRecursiveComponentConfig", {
		properties: {
			i: {
				type: Object,
				value: { [Shortcuts.NodeName]: getComponentsAlias$1(internalComponents)[VIEW]._num }
			},
			l: {
				type: String,
				value: ""
			}
		},
		options: {
			...extraOptions,
			virtualHost: !isCustomWrapper
		},
		methods: { eh: eventHandler },
		...lifeCycles
	}, { isCustomWrapper });
}

//#endregion
//#region src/next-tick.ts
const TIMEOUT = 100;
const nextTick = (cb, ctx) => {
	const beginTime = Date.now();
	const router = Current.router;
	const timerFunc = () => {
		setTimeout(function() {
			ctx ? cb.call(ctx) : cb();
		}, 1);
	};
	if (router === null) return timerFunc();
	const path = router.$taroPath;
	/**
	* 三种情况
	*   1. 调用 nextTick 时，pendingUpdate 已经从 true 变为 false（即已更新完成），那么需要光等 100ms
	*   2. 调用 nextTick 时，pendingUpdate 为 true，那么刚好可以搭上便车
	*   3. 调用 nextTick 时，pendingUpdate 还是 false，框架仍未启动更新逻辑，这时最多轮询 100ms，等待 pendingUpdate 变为 true。
	*/
	function next() {
		const pageElement = env_default.document.getElementById(path);
		if (pageElement?.pendingUpdate) {
			if (process.env.TARO_PLATFORM === "web") {
				pageElement.firstChild?.["componentOnReady"]?.().then(() => {
					timerFunc();
				}) ?? timerFunc();
			} else {
				pageElement.enqueueUpdateCallback(cb, ctx);
			}
		} else if (Date.now() - beginTime > TIMEOUT) {
			timerFunc();
		} else {
			setTimeout(() => next(), 20);
		}
	}
	next();
};

//#endregion
//#region src/polyfill/array.ts
function handleArrayFindPolyfill() {
	if (!isFunction(Array.prototype.find)) {
		Object.defineProperty(Array.prototype, "find", { value(predicate) {
			if (this == null) {
				throw new TypeError("\"this\" is null or not defined");
			}
			const o = Object(this);
			const len = o.length >>> 0;
			if (!isFunction(predicate)) {
				throw new TypeError("predicate must be a function");
			}
			const thisArg = arguments[1];
			let k = 0;
			while (k < len) {
				const kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return kValue;
				}
				k++;
			}
			return undefined;
		} });
	}
}
function handleArrayIncludesPolyfill() {
	if (!isFunction(Array.prototype.includes)) {
		Object.defineProperty(Array.prototype, "includes", { value(searchElement, fromIndex) {
			if (this == null) {
				throw new TypeError("\"this\" is null or not defined");
			}
			const o = Object(this);
			const len = o.length >>> 0;
			if (len === 0) {
				return false;
			}
			const n = fromIndex | 0;
			let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
			while (k < len) {
				if (o[k] === searchElement) {
					return true;
				}
				k++;
			}
			return false;
		} });
	}
}

//#endregion
//#region src/polyfill/intersection-observer.ts
function handleIntersectionObserverPolyfill() {
	if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
		if (!("isIntersecting" in window.IntersectionObserverEntry.prototype)) {
			Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", { get: function() {
				return this.intersectionRatio > 0;
			} });
		}
	} else {
		handleIntersectionObserverObjectPolyfill();
	}
}
function handleIntersectionObserverObjectPolyfill() {
	const document$1 = window.document;
	/**
	* An IntersectionObserver registry. This registry exists to hold a strong
	* reference to IntersectionObserver instances currently observing a target
	* element. Without this registry, instances without another reference may be
	* garbage collected.
	*/
	const registry = [];
	/**
	* Creates the global IntersectionObserverEntry constructor.
	* https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
	* @param {Object} entry A dictionary of instance properties.
	* @constructor
	*/
	function IntersectionObserverEntry(entry) {
		this.time = entry.time;
		this.target = entry.target;
		this.rootBounds = entry.rootBounds;
		this.boundingClientRect = entry.boundingClientRect;
		this.intersectionRect = entry.intersectionRect || getEmptyRect();
		this.isIntersecting = !!entry.intersectionRect;
		const targetRect = this.boundingClientRect;
		const targetArea = targetRect.width * targetRect.height;
		const intersectionRect = this.intersectionRect;
		const intersectionArea = intersectionRect.width * intersectionRect.height;
		if (targetArea) {
			this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
		} else {
			this.intersectionRatio = this.isIntersecting ? 1 : 0;
		}
	}
	/**
	* Creates the global IntersectionObserver constructor.
	* https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
	* @param {Function} callback The function to be invoked after intersection
	*     changes have queued. The function is not invoked if the queue has
	*     been emptied by calling the `takeRecords` method.
	* @param {Object=} opt_options Optional configuration options.
	* @constructor
	*/
	function IntersectionObserver(callback, options$1 = {}) {
		if (!isFunction(callback)) {
			throw new Error("callback must be a function");
		}
		if (options$1.root && options$1.root.nodeType != 1) {
			throw new Error("root must be an Element");
		}
		this._checkForIntersections = throttle(this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);
		this._callback = callback;
		this._observationTargets = [];
		this._queuedEntries = [];
		this._rootMarginValues = this._parseRootMargin(options$1.rootMargin);
		this.thresholds = this._initThresholds(options$1.threshold);
		this.root = options$1.root || null;
		this.rootMargin = this._rootMarginValues.map((margin) => margin.value + margin.unit).join(" ");
	}
	/**
	* The minimum interval within which the document will be checked for
	* intersection changes.
	*/
	IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;
	/**
	* The frequency in which the polyfill polls for intersection changes.
	* this can be updated on a per instance basis and must be set prior to
	* calling `observe` on the first target.
	*/
	IntersectionObserver.prototype.POLL_INTERVAL = null;
	/**
	* Use a mutation observer on the root element
	* to detect intersection changes.
	*/
	IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;
	/**
	* Starts observing a target element for intersection changes based on
	* the thresholds values.
	* @param {Element} target The DOM element to observe.
	*/
	IntersectionObserver.prototype.observe = function(target) {
		const isTargetAlreadyObserved = this._observationTargets.some((item) => item.element == target);
		if (isTargetAlreadyObserved) return;
		if (!(target && target.nodeType == 1)) {
			throw new Error("target must be an Element");
		}
		this._registerInstance();
		this._observationTargets.push({
			element: target,
			entry: null
		});
		this._monitorIntersections();
		this._checkForIntersections();
	};
	/**
	* Stops observing a target element for intersection changes.
	* @param {Element} target The DOM element to observe.
	*/
	IntersectionObserver.prototype.unobserve = function(target) {
		this._observationTargets = this._observationTargets.filter((item) => item.element != target);
		if (!this._observationTargets.length) {
			this._unmonitorIntersections();
			this._unregisterInstance();
		}
	};
	/**
	* Stops observing all target elements for intersection changes.
	*/
	IntersectionObserver.prototype.disconnect = function() {
		this._observationTargets = [];
		this._unmonitorIntersections();
		this._unregisterInstance();
	};
	/**
	* Returns any queue entries that have not yet been reported to the
	* callback and clears the queue. This can be used in conjunction with the
	* callback to obtain the absolute most up-to-date intersection information.
	* @return {Array} The currently queued entries.
	*/
	IntersectionObserver.prototype.takeRecords = function() {
		const records = this._queuedEntries.slice();
		this._queuedEntries = [];
		return records;
	};
	/**
	* Accepts the threshold value from the user configuration object and
	* returns a sorted array of unique threshold values. If a value is not
	* between 0 and 1 and error is thrown.
	* @private
	* @param {Array|number=} opt_threshold An optional threshold value or
	*     a list of threshold values, defaulting to [0].
	* @return {Array} A sorted list of unique and valid threshold values.
	*/
	IntersectionObserver.prototype._initThresholds = (opt_threshold) => {
		let threshold = opt_threshold || [0];
		if (!Array.isArray(threshold)) threshold = [threshold];
		return threshold.sort().filter((t, i, a) => {
			if (!isNumber(t) || isNaN(t) || t < 0 || t > 1) {
				throw new Error("threshold must be a number between 0 and 1 inclusively");
			}
			return t !== a[i - 1];
		});
	};
	/**
	* Accepts the rootMargin value from the user configuration object
	* and returns an array of the four margin values as an object containing
	* the value and unit properties. If any of the values are not properly
	* formatted or use a unit other than px or %, and error is thrown.
	* @private
	* @param {string=} opt_rootMargin An optional rootMargin value,
	*     defaulting to '0px'.
	* @return {Array<Object>} An array of margin objects with the keys
	*     value and unit.
	*/
	IntersectionObserver.prototype._parseRootMargin = (opt_rootMargin) => {
		const marginString = opt_rootMargin || "0px";
		const margins = marginString.split(/\s+/).map((margin) => {
			const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
			if (!parts) {
				throw new Error("rootMargin must be specified in pixels or percent");
			}
			return {
				value: Number.parseFloat(parts[1]),
				unit: parts[2]
			};
		});
		margins[1] = margins[1] || margins[0];
		margins[2] = margins[2] || margins[0];
		margins[3] = margins[3] || margins[1];
		return margins;
	};
	/**
	* Starts polling for intersection changes if the polling is not already
	* happening, and if the page's visibility state is visible.
	* @private
	*/
	IntersectionObserver.prototype._monitorIntersections = function() {
		if (!this._monitoringIntersections) {
			this._monitoringIntersections = true;
			if (this.POLL_INTERVAL) {
				this._monitoringInterval = setInterval(this._checkForIntersections, this.POLL_INTERVAL);
			} else {
				addEvent(window, "resize", this._checkForIntersections, true);
				addEvent(document$1, "scroll", this._checkForIntersections, true);
				if (this.USE_MUTATION_OBSERVER && "MutationObserver" in window) {
					this._domObserver = new MutationObserver(this._checkForIntersections);
					this._domObserver.observe(document$1, {
						attributes: true,
						childList: true,
						characterData: true,
						subtree: true
					});
				}
			}
		}
	};
	/**
	* Stops polling for intersection changes.
	* @private
	*/
	IntersectionObserver.prototype._unmonitorIntersections = function() {
		if (this._monitoringIntersections) {
			this._monitoringIntersections = false;
			clearInterval(this._monitoringInterval);
			this._monitoringInterval = null;
			removeEvent(window, "resize", this._checkForIntersections, true);
			removeEvent(document$1, "scroll", this._checkForIntersections, true);
			if (this._domObserver) {
				this._domObserver.disconnect();
				this._domObserver = null;
			}
		}
	};
	/**
	* Scans each observation target for intersection changes and adds them
	* to the internal entries queue. If new entries are found, it
	* schedules the callback to be invoked.
	* @private
	*/
	IntersectionObserver.prototype._checkForIntersections = function() {
		const rootIsInDom = this._rootIsInDom();
		const rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();
		this._observationTargets.forEach(function(item) {
			const target = item.element;
			const targetRect = getBoundingClientRect(target);
			const rootContainsTarget = this._rootContainsTarget(target);
			const oldEntry = item.entry;
			const intersectionRect = rootIsInDom && rootContainsTarget && this._computeTargetAndRootIntersection(target, rootRect);
			const newEntry = item.entry = new IntersectionObserverEntry({
				time: now$1(),
				target,
				boundingClientRect: targetRect,
				rootBounds: rootRect,
				intersectionRect,
				intersectionRatio: -1,
				isIntersecting: false
			});
			if (!oldEntry) {
				this._queuedEntries.push(newEntry);
			} else if (rootIsInDom && rootContainsTarget) {
				if (this._hasCrossedThreshold(oldEntry, newEntry)) {
					this._queuedEntries.push(newEntry);
				}
			} else {
				if (oldEntry && oldEntry.isIntersecting) {
					this._queuedEntries.push(newEntry);
				}
			}
		}, this);
		if (this._queuedEntries.length) {
			this._callback(this.takeRecords(), this);
		}
	};
	/**
	* Accepts a target and root rect computes the intersection between then
	* following the algorithm in the spec.
	* TODO(philipwalton): at this time clip-path is not considered.
	* https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
	* @param {Element} target The target DOM element
	* @param {Object} rootRect The bounding rect of the root after being
	*     expanded by the rootMargin value.
	* @return {?Object} The final intersection rect object or undefined if no
	*     intersection is found.
	* @private
	*/
	IntersectionObserver.prototype._computeTargetAndRootIntersection = function(target, rootRect) {
		if (window.getComputedStyle(target).display === "none") return;
		const targetRect = getBoundingClientRect(target);
		let intersectionRect = targetRect;
		let parent = getParentNode(target);
		let atRoot = false;
		while (!atRoot) {
			let parentRect = null;
			const parentComputedStyle = parent.nodeType == 1 ? window.getComputedStyle(parent) : {};
			if (parentComputedStyle.display === "none") return;
			if (parent == this.root || parent == document$1) {
				atRoot = true;
				parentRect = rootRect;
			} else {
				if (parent != document$1.body && parent != document$1.documentElement && parentComputedStyle.overflow != "visible") {
					parentRect = getBoundingClientRect(parent);
				}
			}
			if (parentRect) {
				intersectionRect = computeRectIntersection(parentRect, intersectionRect);
				if (!intersectionRect) break;
			}
			parent = getParentNode(parent);
		}
		return intersectionRect;
	};
	/**
	* Returns the root rect after being expanded by the rootMargin value.
	* @return {Object} The expanded root rect.
	* @private
	*/
	IntersectionObserver.prototype._getRootRect = function() {
		let rootRect;
		if (this.root) {
			rootRect = getBoundingClientRect(this.root);
		} else {
			const html = document$1.documentElement;
			const body = document$1.body;
			rootRect = {
				top: 0,
				left: 0,
				right: html.clientWidth || body.clientWidth,
				width: html.clientWidth || body.clientWidth,
				bottom: html.clientHeight || body.clientHeight,
				height: html.clientHeight || body.clientHeight
			};
		}
		return this._expandRectByRootMargin(rootRect);
	};
	/**
	* Accepts a rect and expands it by the rootMargin value.
	* @param {Object} rect The rect object to expand.
	* @return {Object} The expanded rect.
	* @private
	*/
	IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
		const margins = this._rootMarginValues.map((margin, i) => margin.unit === "px" ? margin.value : margin.value * (i % 2 ? rect.width : rect.height) / 100);
		const newRect = {
			top: rect.top - margins[0],
			right: rect.right + margins[1],
			bottom: rect.bottom + margins[2],
			left: rect.left - margins[3]
		};
		newRect.width = newRect.right - newRect.left;
		newRect.height = newRect.bottom - newRect.top;
		return newRect;
	};
	/**
	* Accepts an old and new entry and returns true if at least one of the
	* threshold values has been crossed.
	* @param {?IntersectionObserverEntry} oldEntry The previous entry for a
	*    particular target element or null if no previous entry exists.
	* @param {IntersectionObserverEntry} newEntry The current entry for a
	*    particular target element.
	* @return {boolean} Returns true if a any threshold has been crossed.
	* @private
	*/
	IntersectionObserver.prototype._hasCrossedThreshold = function(oldEntry, newEntry) {
		const oldRatio = oldEntry && oldEntry.isIntersecting ? oldEntry.intersectionRatio || 0 : -1;
		const newRatio = newEntry.isIntersecting ? newEntry.intersectionRatio || 0 : -1;
		if (oldRatio === newRatio) return;
		for (let i = 0; i < this.thresholds.length; i++) {
			const threshold = this.thresholds[i];
			if (threshold == oldRatio || threshold == newRatio || threshold < oldRatio !== threshold < newRatio) {
				return true;
			}
		}
	};
	/**
	* Returns whether or not the root element is an element and is in the DOM.
	* @return {boolean} True if the root element is an element and is in the DOM.
	* @private
	*/
	IntersectionObserver.prototype._rootIsInDom = function() {
		return !this.root || containsDeep(document$1, this.root);
	};
	/**
	* Returns whether or not the target element is a child of root.
	* @param {Element} target The target element to check.
	* @return {boolean} True if the target element is a child of root.
	* @private
	*/
	IntersectionObserver.prototype._rootContainsTarget = function(target) {
		return containsDeep(this.root || document$1, target);
	};
	/**
	* Adds the instance to the global IntersectionObserver registry if it isn't
	* already present.
	* @private
	*/
	IntersectionObserver.prototype._registerInstance = function() {
		if (registry.indexOf(this) < 0) {
			registry.push(this);
		}
	};
	/**
	* Removes the instance from the global IntersectionObserver registry.
	* @private
	*/
	IntersectionObserver.prototype._unregisterInstance = function() {
		const index = registry.indexOf(this);
		if (index != -1) registry.splice(index, 1);
	};
	/**
	* Returns the result of the performance.now() method or null in browsers
	* that don't support the API.
	* @return {number} The elapsed time since the page was requested.
	*/
	function now$1() {
		return window.performance && performance.now && performance.now();
	}
	/**
	* Adds an event handler to a DOM node ensuring cross-browser compatibility.
	* @param {Node} node The DOM node to add the event handler to.
	* @param {string} event The event name.
	* @param {Function} fn The event handler to add.
	* @param {boolean} opt_useCapture Optionally adds the even to the capture
	*     phase. Note: this only works in modern browsers.
	*/
	function addEvent(node, event, fn, opt_useCapture) {
		if (isFunction(node.addEventListener)) {
			node.addEventListener(event, fn, opt_useCapture || false);
		} else if (isFunction(node.attachEvent)) {
			node.attachEvent("on" + event, fn);
		}
	}
	/**
	* Removes a previously added event handler from a DOM node.
	* @param {Node} node The DOM node to remove the event handler from.
	* @param {string} event The event name.
	* @param {Function} fn The event handler to remove.
	* @param {boolean} opt_useCapture If the event handler was added with this
	*     flag set to true, it should be set to true here in order to remove it.
	*/
	function removeEvent(node, event, fn, opt_useCapture) {
		if (isFunction(node.removeEventListener)) {
			node.removeEventListener(event, fn, opt_useCapture || false);
		} else if (isFunction(node.detatchEvent)) {
			node.detatchEvent("on" + event, fn);
		}
	}
	/**
	* Returns the intersection between two rect objects.
	* @param {Object} rect1 The first rect.
	* @param {Object} rect2 The second rect.
	* @return {?Object} The intersection rect or undefined if no intersection
	*     is found.
	*/
	function computeRectIntersection(rect1, rect2) {
		const top = Math.max(rect1.top, rect2.top);
		const bottom = Math.min(rect1.bottom, rect2.bottom);
		const left = Math.max(rect1.left, rect2.left);
		const right = Math.min(rect1.right, rect2.right);
		const width$1 = right - left;
		const height = bottom - top;
		return width$1 >= 0 && height >= 0 && {
			top,
			bottom,
			left,
			right,
			width: width$1,
			height
		};
	}
	/**
	* Shims the native getBoundingClientRect for compatibility with older IE.
	* @param {Element} el The element whose bounding rect to get.
	* @return {Object} The (possibly shimmed) rect of the element.
	*/
	function getBoundingClientRect(el) {
		let rect;
		try {
			rect = el.getBoundingClientRect();
		} catch (err) {}
		if (!rect) return getEmptyRect();
		if (!(rect.width && rect.height)) {
			rect = {
				top: rect.top,
				right: rect.right,
				bottom: rect.bottom,
				left: rect.left,
				width: rect.right - rect.left,
				height: rect.bottom - rect.top
			};
		}
		return rect;
	}
	/**
	* Returns an empty rect object. An empty rect is returned when an element
	* is not in the DOM.
	* @return {Object} The empty rect.
	*/
	function getEmptyRect() {
		return {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			width: 0,
			height: 0
		};
	}
	/**
	* Checks to see if a parent element contains a child element (including inside
	* shadow DOM).
	* @param {Node} parent The parent element.
	* @param {Node} child The child element.
	* @return {boolean} True if the parent node contains the child node.
	*/
	function containsDeep(parent, child) {
		let node = child;
		while (node) {
			if (node == parent) return true;
			node = getParentNode(node);
		}
		return false;
	}
	/**
	* Gets the parent node of an element or its host element if the parent node
	* is a shadow root.
	* @param {Node} node The node whose parent to get.
	* @return {Node|null} The parent node or null if no parent exists.
	*/
	function getParentNode(node) {
		const parent = node.parentNode;
		if (parent && parent.nodeType == 11 && parent.host) {
			return parent.host;
		}
		if (parent && parent.assignedSlot) {
			return parent.assignedSlot.parentNode;
		}
		return parent;
	}
	window.IntersectionObserver = IntersectionObserver;
	window.IntersectionObserverEntry = IntersectionObserverEntry;
}

//#endregion
//#region src/polyfill/object.ts
function handleObjectAssignPolyfill() {
	if (!isFunction(Object.assign)) {
		Object.assign = function(target) {
			if (target == null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}
			const to = Object(target);
			for (let index = 1; index < arguments.length; index++) {
				const nextSource = arguments[index];
				if (nextSource != null) {
					for (const nextKey in nextSource) {
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		};
	}
}
function handleObjectEntriesPolyfill() {
	if (!isFunction(Object.entries)) {
		Object.entries = function(obj) {
			if (obj == null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}
			const to = [];
			if (obj != null) {
				for (const key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						to.push([key, obj[key]]);
					}
				}
			}
			return to;
		};
	}
}
function handleObjectDefinePropertyPolyfill() {
	if (!isFunction(Object.defineProperties)) {
		Object.defineProperties = function(obj, properties) {
			function convertToDescriptor(desc) {
				function hasProperty(obj$1, prop) {
					return Object.prototype.hasOwnProperty.call(obj$1, prop);
				}
				if (!isObject(desc)) {
					throw new TypeError("bad desc");
				}
				const d = {};
				if (hasProperty(desc, "enumerable")) d.enumerable = !!desc.enumerable;
				if (hasProperty(desc, "configurable")) {
					d.configurable = !!desc.configurable;
				}
				if (hasProperty(desc, "value")) d.value = desc.value;
				if (hasProperty(desc, "writable")) d.writable = !!desc.writable;
				if (hasProperty(desc, "get")) {
					const g = desc.get;
					if (!isFunction(g) && !isUndefined(g)) {
						throw new TypeError("bad get");
					}
					d.get = g;
				}
				if (hasProperty(desc, "set")) {
					const s = desc.set;
					if (!isFunction(s) && !isUndefined(s)) {
						throw new TypeError("bad set");
					}
					d.set = s;
				}
				if (("get" in d || "set" in d) && ("value" in d || "writable" in d)) {
					throw new TypeError("identity-confused descriptor");
				}
				return d;
			}
			if (!isObject(obj)) throw new TypeError("bad obj");
			properties = Object(properties);
			const keys = Object.keys(properties);
			const descs = [];
			for (let i = 0; i < keys.length; i++) {
				descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
			}
			for (let i = 0; i < descs.length; i++) {
				Object.defineProperty(obj, descs[i][0], descs[i][1]);
			}
			return obj;
		};
	}
}

//#endregion
//#region src/polyfill/index.ts
function handlePolyfill() {
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.assign") {
		handleObjectAssignPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.entries") {
		handleObjectEntriesPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.defineProperty") {
		handleObjectDefinePropertyPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Array" || process.env.SUPPORT_TARO_POLYFILL === "Array.find") {
		handleArrayFindPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Array" || process.env.SUPPORT_TARO_POLYFILL === "Array.includes") {
		handleArrayIncludesPolyfill();
	}
	if (process.env.TARO_PLATFORM === "web" && isObject(window)) {
		if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "IntersectionObserver") {
			handleIntersectionObserverPolyfill();
		}
	}
}
if (process.env.SUPPORT_TARO_POLYFILL !== "disabled" && process.env.TARO_PLATFORM !== "web") {
	handlePolyfill();
}

//#endregion
export { A, APP, BEHAVIORS, BODY, CATCHMOVE, CATCH_VIEW, CHANGE, CLASS, CLICK_VIEW, COMMENT, COMPILE_MODE, CONFIRM, CONTAINER, CONTEXT_ACTIONS, CURRENT_TARGET, CUSTOM_WRAPPER, Current, DATASET, DATE, DOCUMENT_ELEMENT_NAME, DOCUMENT_FRAGMENT, EVENT_CALLBACK_RESULT, EXTERNAL_CLASSES, Events, FOCUS, FormElement, HEAD, HOOKS_APP_ID, HTML, History, ID, INPUT, KEY_CODE, Location, MutationObserver$1 as MutationObserver, OBJECT, ON_HIDE, ON_LOAD, ON_READY, ON_SHOW, OPTIONS, PAGE_INIT, PROPERTY_THRESHOLD, PROPS, PURE_VIEW, ROOT_STR, SET_DATA, SET_TIMEOUT, STATIC_VIEW, STYLE, SVGElement, Style, TARGET, TARO_RUNTIME, TIME_STAMP, TOUCHMOVE, TYPE, TaroElement, TaroEvent, TaroNode, TaroRootElement, TaroText, UID, TaroURLProvider as URL, URLSearchParams, VALUE, VIEW, addLeadingSlash, _caf as cancelAnimationFrame, convertNumber2PX, createComponentConfig, createEvent, createPageConfig, createRecursiveComponentConfig, customWrapperCache, debounce, taroDocumentProvider as document, env_default as env, eventCenter, eventHandler, eventSource, extend, getComponentsAlias, taroGetComputedStyleProvider as getComputedStyle, getCurrentInstance, getCurrentPage, getHomePage, getOnHideEventKey, getOnReadyEventKey, getOnShowEventKey, getPageInstance, getPath, handlePolyfill, hasBasename, taroHistoryProvider as history, hooks, hydrate, incrementId, injectPageInstance, isComment, isElement, isHasExtractProp, isParentBinded, isText, taroLocationProvider as location, nav as navigator, nextTick, now, options, parseUrl, perf, removePageInstance, _raf as requestAnimationFrame, safeExecute, shortcutAttr, stringify, stripBasename, stripSuffix, stripTrailing, throttle, taroWindowProvider as window };
//# sourceMappingURL=runtime.esm.js.map