import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { BEHAVIORS, CONTEXT_ACTIONS, CUSTOM_WRAPPER, EXTERNAL_CLASSES, ON_HIDE, ON_LOAD, ON_READY, ON_SHOW, OPTIONS, PAGE_INIT, VIEW } from "../constants/index.js";
import { eventCenter } from "../emitter/emitter.js";
import env_default from "../env.js";
import { Current } from "../current.js";
import { _raf } from "../bom/raf.js";
import { taroWindowProvider } from "../bom/window.js";
import { addLeadingSlash } from "../utils/router.js";
import { customWrapperCache, incrementId } from "../utils/index.js";
import { eventHandler } from "../dom/event.js";
import { perf } from "../perf.js";

//#region src/dsl/common.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
const instances = new Map();
const pageId = incrementId();
function injectPageInstance(inst, id) {
	import_index_cjs.call("mergePageInstance", instances.get(id), inst);
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
	const func = import_index_cjs.call("getLifecycle", instance, lifecycle);
	if ((0, import_index_cjs.isArray)(func)) {
		const res = func.map((fn) => fn.apply(instance, args));
		return res[0];
	}
	if (!(0, import_index_cjs.isFunction)(func)) {
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
function getPath(id, options) {
	const idx = id.indexOf("?");
	if (process.env.TARO_PLATFORM === "web") {
		return `${idx > -1 ? id.substring(0, idx) : id}${stringify(options?.stamp ? { stamp: options.stamp } : {})}`;
	} else {
		return `${idx > -1 ? id.substring(0, idx) : id}${stringify(options)}`;
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
	const [ONLOAD, ONUNLOAD, ONREADY, ONSHOW, ONHIDE, LIFECYCLES, SIDE_EFFECT_LIFECYCLES] = import_index_cjs.call("getMiniLifecycleImpl").page;
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
		if (!(0, import_index_cjs.isUndefined)(page.exitState)) {
			Current.router.exitState = page.exitState;
		}
	}
	let loadResolver;
	let hasLoaded;
	const config = {
		[ONLOAD](options = {}, cb) {
			hasLoaded = new Promise((resolve) => {
				loadResolver = resolve;
			});
			perf.start(PAGE_INIT);
			Current.page = this;
			this.config = pageConfig || {};
			const uniqueOptions = Object.assign({}, options, { $taroTimestamp: Date.now() });
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
					(0, import_index_cjs.ensure)(pageElement !== null, "没有找到页面实例。");
					safeExecute($taroPath, ON_LOAD, this.$taroParams);
					loadResolver();
					if (process.env.TARO_PLATFORM !== "web") {
						pageElement.ctx = this;
						pageElement.performUpdate(true, cb);
					} else {
						(0, import_index_cjs.isFunction)(cb) && cb();
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
		[ONSHOW](options = {}) {
			hasLoaded.then(() => {
				Current.page = this;
				setCurrentRouter(this);
				if (process.env.TARO_PLATFORM !== "web") {
					taroWindowProvider.trigger(CONTEXT_ACTIONS.RECOVER, this.$taroPath);
				}
				safeExecute(this.$taroPath, ON_SHOW, options);
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
			return import_index_cjs.pageChannel;
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
	if (!(0, import_index_cjs.isUndefined)(data)) {
		config.data = data;
	}
	import_index_cjs.call("modifyPageObject", config);
	return config;
}
function createComponentConfig(component, componentName, data) {
	const id = componentName ?? `taro_component_${pageId()}`;
	let componentElement = null;
	const [ATTACHED, DETACHED] = import_index_cjs.call("getMiniLifecycleImpl").component;
	const config = {
		[ATTACHED]() {
			perf.start(PAGE_INIT);
			this.pageIdCache = this.getPageId?.() || pageId();
			const path = getPath(id, { id: this.pageIdCache });
			Current.app.mount(component, path, () => {
				componentElement = env_default.document.getElementById(path);
				(0, import_index_cjs.ensure)(componentElement !== null, "没有找到组件实例。");
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
	if (!(0, import_index_cjs.isUndefined)(data)) {
		config.data = data;
	}
	[
		OPTIONS,
		EXTERNAL_CLASSES,
		BEHAVIORS
	].forEach((key) => {
		config[key] = component[key] ?? import_index_cjs.EMPTY_OBJ;
	});
	return config;
}
function createRecursiveComponentConfig(componentName) {
	const isCustomWrapper = componentName === CUSTOM_WRAPPER;
	const [ATTACHED, DETACHED] = import_index_cjs.call("getMiniLifecycleImpl").component;
	const lifeCycles = isCustomWrapper ? {
		[ATTACHED]() {
			const componentId = this.data.i?.sid || this.props.i?.sid;
			if ((0, import_index_cjs.isString)(componentId)) {
				customWrapperCache.set(componentId, this);
				const el = env_default.document.getElementById(componentId);
				if (el) {
					el.ctx = this;
				}
			}
		},
		[DETACHED]() {
			const componentId = this.data.i?.sid || this.props.i?.sid;
			if ((0, import_index_cjs.isString)(componentId)) {
				customWrapperCache.delete(componentId);
				const el = env_default.document.getElementById(componentId);
				if (el) {
					el.ctx = null;
				}
			}
		}
	} : import_index_cjs.EMPTY_OBJ;
	const extraOptions = {};
	if (process.env.TARO_ENV === "jd") {
		extraOptions.addGlobalClass = true;
	}
	return import_index_cjs.call("modifyRecursiveComponentConfig", {
		properties: {
			i: {
				type: Object,
				value: { [import_index_cjs.NodeName]: (0, import_index_cjs.getComponentsAlias)(import_index_cjs.internalComponents)[VIEW]._num }
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
export { createComponentConfig, createPageConfig, createRecursiveComponentConfig, getOnHideEventKey, getOnReadyEventKey, getOnShowEventKey, getPageInstance, getPath, injectPageInstance, removePageInstance, safeExecute, stringify };
//# sourceMappingURL=common.js.map