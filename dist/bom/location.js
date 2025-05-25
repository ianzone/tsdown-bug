import { CONTEXT_ACTIONS } from "../constants/index.js";
import { Events } from "../emitter/emitter.js";
import { env_default } from "../env.js";
import { RuntimeCache } from "../utils/cache.js";
import { getCurrentInstance } from "../current.js";
import { TaroURLProvider } from "./URL.js";
import { isNumber, isString, warn } from "@tarojs/shared";

//#region src/bom/location.ts
const INIT_URL = "https://taro.com";
const cache = new RuntimeCache("location");
var TaroLocation = class extends Events {
	#url = new TaroURLProvider(INIT_URL);
	#noCheckUrl = false;
	#window;
	constructor(options) {
		super();
		this.#window = options.window;
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
		this.on(CONTEXT_ACTIONS.RESTORE, (pageId) => {
			cache.set(pageId, { lastHref: this.href });
		}, null);
		this.on(CONTEXT_ACTIONS.RECOVER, (pageId) => {
			if (cache.has(pageId)) {
				const ctx = cache.get(pageId);
				this.#noCheckUrl = true;
				this.#url.href = ctx.lastHref;
				this.#noCheckUrl = false;
			}
		}, null);
		this.on(CONTEXT_ACTIONS.DESTORY, (pageId) => {
			cache.delete(pageId);
		}, null);
	}
	#reset() {
		const Current = getCurrentInstance();
		const router = Current.router;
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
export { Location };
//# sourceMappingURL=location.js.map