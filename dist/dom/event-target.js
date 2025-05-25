import { hooks, isArray, isObject, warn } from "@tarojs/shared";

//#region src/dom/event-target.ts
var TaroEventTarget = class {
	__handlers = {};
	addEventListener(type, handler, options) {
		type = type.toLowerCase();
		hooks.call("onAddEvent", type, handler, options, this);
		if (type === "regionchange") {
			this.addEventListener("begin", handler, options);
			this.addEventListener("end", handler, options);
			return;
		}
		let isCapture = Boolean(options);
		let isOnce = false;
		if (isObject(options)) {
			isCapture = Boolean(options.capture);
			isOnce = Boolean(options.once);
		}
		if (isOnce) {
			const wrapper = function() {
				handler.apply(this, arguments);
				this.removeEventListener(type, wrapper);
			};
			this.addEventListener(type, wrapper, {
				...options,
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
export { TaroEventTarget };
//# sourceMappingURL=event-target.js.map