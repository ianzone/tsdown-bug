import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { CUSTOM_WRAPPER, PAGE_INIT, ROOT_STR, SET_DATA } from "../constants/index.js";
import { customWrapperCache, isComment } from "../utils/index.js";
import { TaroElement } from "./element.js";
import { options } from "../options.js";
import { perf } from "../perf.js";

//#region src/dom/root.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
function findCustomWrapper(root, dataPathArr) {
	const list = dataPathArr.slice(1);
	let currentData = root;
	let customWrapper;
	let splitedPath = "";
	list.some((item, i) => {
		const key = item.replace(/^\[(.+)\]$/, "$1").replace(/\bcn\b/g, "childNodes");
		currentData = currentData[key];
		if ((0, import_index_cjs.isArray)(currentData)) {
			currentData = currentData.filter((el) => !isComment(el));
		}
		if ((0, import_index_cjs.isUndefined)(currentData)) return true;
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
		const ctx = import_index_cjs.call("proxyToRaw", this.ctx);
		this.scheduleTask(() => {
			const setDataMark = `${SET_DATA} 开始时间戳 ${Date.now()}`;
			perf.start(setDataMark);
			const data = Object.create(null);
			const resetPaths = new Set(initRender ? ["root.cn.[0]", "root.cn[0]"] : []);
			while (this.updatePayloads.length > 0) {
				const { path, value } = this.updatePayloads.shift();
				if (path.endsWith(import_index_cjs.Childnodes)) {
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
				if ((0, import_index_cjs.isFunction)(value)) {
					data[path] = value();
				}
			}
			if ((0, import_index_cjs.isFunction)(prerender)) return prerender(data);
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
export { TaroRootElement };
//# sourceMappingURL=root.js.map