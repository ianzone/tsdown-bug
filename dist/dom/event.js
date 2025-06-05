import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { CONFIRM, CURRENT_TARGET, EVENT_CALLBACK_RESULT, INPUT, KEY_CODE, TARGET, TIME_STAMP, TOUCHMOVE, TYPE } from "../constants/index.js";
import env_default from "../env.js";
import { isParentBinded } from "../utils/index.js";

//#region src/dom/event.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
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
				...currentEle !== null ? currentEle.dataset : import_index_cjs.EMPTY_OBJ,
				...element !== null ? element.dataset : import_index_cjs.EMPTY_OBJ
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
	if (!(0, import_index_cjs.isUndefined)(result)) {
		delete event[EVENT_CALLBACK_RESULT];
	}
	return result;
}
function eventHandler(event) {
	event.type === undefined && Object.defineProperty(event, "type", { value: event._type });
	event.detail === undefined && Object.defineProperty(event, "detail", { value: event._detail || { ...event } });
	event.currentTarget = event.currentTarget || event.target || { ...event };
	import_index_cjs.call("modifyMpEventImpl", event);
	const currentTarget = event.currentTarget;
	const id = currentTarget.dataset?.sid || currentTarget.id || event.detail?.id || "";
	const node = env_default.document.getElementById(id);
	if (node) {
		const dispatch = () => {
			const e = createEvent(event, node);
			import_index_cjs.call("modifyTaroEvent", e, node);
			import_index_cjs.call("dispatchTaroEvent", e, node);
			import_index_cjs.call("dispatchTaroEventFinish", e, node);
		};
		if (import_index_cjs.isExist("batchedEventUpdates")) {
			const type = event.type;
			if (!import_index_cjs.call("isBubbleEvents", type) || !isParentBinded(node, type) || type === TOUCHMOVE && !!node.props.catchMove) {
				import_index_cjs.call("batchedEventUpdates", () => {
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
export { TaroEvent, createEvent, eventHandler };
//# sourceMappingURL=event.js.map