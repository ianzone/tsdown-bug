import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { CONTEXT_ACTIONS } from "../constants/index.js";
import { import_index_cjs } from "../emitter/emitter.js";
import env_default from "../env.js";
import { RuntimeCache } from "../utils/cache.js";

//#region src/bom/history.ts
var import_index_cjs$1 = __toESM(require_index_cjs(), 1);
const cache = new RuntimeCache("history");
var TaroHistory = class extends import_index_cjs.Events {
	#location;
	#stack = [];
	#cur = 0;
	#window;
	constructor(location, options) {
		super();
		this.#window = options.window;
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
		this.on(CONTEXT_ACTIONS.RESTORE, (pageId) => {
			cache.set(pageId, {
				location: this.#location,
				stack: this.#stack.slice(),
				cur: this.#cur
			});
		}, null);
		this.on(CONTEXT_ACTIONS.RECOVER, (pageId) => {
			if (cache.has(pageId)) {
				const ctx = cache.get(pageId);
				this.#location = ctx.location;
				this.#stack = ctx.stack;
				this.#cur = ctx.cur;
			}
		}, null);
		this.on(CONTEXT_ACTIONS.DESTORY, (pageId) => {
			cache.delete(pageId);
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
		if (!(0, import_index_cjs$1.isNumber)(delta) || isNaN(delta)) return;
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
		if (!url || !(0, import_index_cjs$1.isString)(url)) return;
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
		if (!url || !(0, import_index_cjs$1.isString)(url)) return;
		this.#stack[this.#cur] = {
			state,
			title,
			url
		};
		this.#location.trigger("__set_href_without_history__", url);
	}
	get cache() {
		return cache;
	}
};
const History = process.env.TARO_PLATFORM === "web" ? env_default.window.History : TaroHistory;

//#endregion
export { History };
//# sourceMappingURL=history.js.map