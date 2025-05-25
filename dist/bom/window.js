import { CONTEXT_ACTIONS } from "../constants/index.js";
import { Events } from "../emitter/emitter.js";
import { env_default } from "../env.js";
import { taroGetComputedStyleProvider } from "./getComputedStyle.js";
import { History } from "./history.js";
import { Location } from "./location.js";
import { nav } from "./navigator.js";
import { _caf, _raf } from "./raf.js";
import { isString } from "@tarojs/shared";

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
		this.on(CONTEXT_ACTIONS.INIT, (pageId) => {
			_location.trigger(CONTEXT_ACTIONS.INIT, pageId);
		}, null);
		this.on(CONTEXT_ACTIONS.RECOVER, (pageId) => {
			_location.trigger(CONTEXT_ACTIONS.RECOVER, pageId);
			_history.trigger(CONTEXT_ACTIONS.RECOVER, pageId);
		}, null);
		this.on(CONTEXT_ACTIONS.RESTORE, (pageId) => {
			_location.trigger(CONTEXT_ACTIONS.RESTORE, pageId);
			_history.trigger(CONTEXT_ACTIONS.RESTORE, pageId);
		}, null);
		this.on(CONTEXT_ACTIONS.DESTORY, (pageId) => {
			_location.trigger(CONTEXT_ACTIONS.DESTORY, pageId);
			_history.trigger(CONTEXT_ACTIONS.DESTORY, pageId);
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
export { taroHistoryProvider, taroLocationProvider, taroWindowProvider };
//# sourceMappingURL=window.js.map