import { hooks, ensure, isUndefined, EMPTY_OBJ, EventChannel, getComponentsAlias, internalComponents, isArray, isFunction, isString } from '@tarojs/shared';
import { raf as _raf } from '../bom/raf.js';
import { taroWindowProvider } from '../bom/window.js';
import { PAGE_INIT, OPTIONS, EXTERNAL_CLASSES, BEHAVIORS, CONTEXT_ACTIONS, VIEW, ON_HIDE, ON_READY, ON_SHOW, ON_LOAD, CUSTOM_WRAPPER } from '../constants/index.js';
import { Current } from '../current.js';
import { eventHandler } from '../dom/event.js';
import { eventCenter } from '../emitter/emitter.js';
import env from '../env.js';
import { perf } from '../perf.js';
import { incrementId, customWrapperCache } from '../utils/index.js';
import { addLeadingSlash } from '../utils/router.js';

/* eslint-disable dot-notation */
const instances = new Map();
const pageId = incrementId();
function injectPageInstance(inst, id) {
    hooks.call('mergePageInstance', instances.get(id), inst);
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
    const func = hooks.call('getLifecycle', instance, lifecycle);
    if (isArray(func)) {
        const res = func.map(fn => fn.apply(instance, args));
        return res[0];
    }
    if (!isFunction(func)) {
        return;
    }
    return func.apply(instance, args);
}
function stringify(obj) {
    if (obj == null) {
        return '';
    }
    const path = Object.keys(obj).map((key) => {
        return key + '=' + obj[key];
    }).join('&');
    return path === '' ? path : '?' + path;
}
function getPath(id, options) {
    const idx = id.indexOf('?');
    if (process.env.TARO_PLATFORM === 'web') {
        return `${idx > -1 ? id.substring(0, idx) : id}${stringify((options === null || options === void 0 ? void 0 : options.stamp) ? { stamp: options.stamp } : {})}`;
    }
    else {
        return `${idx > -1 ? id.substring(0, idx) : id}${stringify(options)}`;
    }
}
function getOnReadyEventKey(path) {
    return path + '.' + ON_READY;
}
function getOnShowEventKey(path) {
    return path + '.' + ON_SHOW;
}
function getOnHideEventKey(path) {
    return path + '.' + ON_HIDE;
}
function createPageConfig(component, pageName, data, pageConfig) {
    // 小程序 Page 构造器是一个傲娇小公主，不能把复杂的对象挂载到参数上
    const id = pageName !== null && pageName !== void 0 ? pageName : `taro_page_${pageId()}`;
    const [ONLOAD, ONUNLOAD, ONREADY, ONSHOW, ONHIDE, LIFECYCLES, SIDE_EFFECT_LIFECYCLES,] = hooks.call('getMiniLifecycleImpl').page;
    let pageElement = null;
    let unmounting = false;
    let prepareMountList = [];
    function setCurrentRouter(page) {
        const router = process.env.TARO_PLATFORM === 'web' ? page.$taroPath : page.route || page.__route__ || page.$taroPath;
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
        [ONLOAD](options = {}, cb) {
            hasLoaded = new Promise(resolve => { loadResolver = resolve; });
            perf.start(PAGE_INIT);
            Current.page = this;
            this.config = pageConfig || {};
            // this.$taroPath 是页面唯一标识
            const uniqueOptions = Object.assign({}, options, { $taroTimestamp: Date.now() });
            const $taroPath = this.$taroPath = getPath(id, uniqueOptions);
            if (process.env.TARO_PLATFORM === 'web') {
                config.path = $taroPath;
            }
            // this.$taroParams 作为暴露给开发者的页面参数对象，可以被随意修改
            if (this.$taroParams == null) {
                this.$taroParams = uniqueOptions;
            }
            setCurrentRouter(this);
            // 初始化当前页面的上下文信息
            if (process.env.TARO_PLATFORM !== 'web') {
                taroWindowProvider.trigger(CONTEXT_ACTIONS.INIT, $taroPath);
            }
            const mount = () => {
                Current.app.mount(component, $taroPath, () => {
                    pageElement = env.document.getElementById($taroPath);
                    ensure(pageElement !== null, '没有找到页面实例。');
                    safeExecute($taroPath, ON_LOAD, this.$taroParams);
                    loadResolver();
                    if (process.env.TARO_PLATFORM !== 'web') {
                        pageElement.ctx = this;
                        pageElement.performUpdate(true, cb);
                    }
                    else {
                        isFunction(cb) && cb();
                    }
                });
            };
            if (unmounting) {
                prepareMountList.push(mount);
            }
            else {
                mount();
            }
        },
        [ONUNLOAD]() {
            const $taroPath = this.$taroPath;
            // 销毁当前页面的上下文信息
            if (process.env.TARO_PLATFORM !== 'web') {
                taroWindowProvider.trigger(CONTEXT_ACTIONS.DESTORY, $taroPath);
            }
            // 触发onUnload生命周期
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
                    prepareMountList.forEach(fn => fn());
                    prepareMountList = [];
                }
            });
        },
        [ONREADY]() {
            hasLoaded.then(() => {
                // 触发生命周期
                safeExecute(this.$taroPath, ON_READY);
                // 通过事件触发子组件的生命周期
                _raf(() => eventCenter.trigger(getOnReadyEventKey(id)));
                this.onReady.called = true;
            });
        },
        [ONSHOW](options = {}) {
            hasLoaded.then(() => {
                // 设置 Current 的 page 和 router
                Current.page = this;
                setCurrentRouter(this);
                // 恢复上下文信息
                if (process.env.TARO_PLATFORM !== 'web') {
                    taroWindowProvider.trigger(CONTEXT_ACTIONS.RECOVER, this.$taroPath);
                }
                // 触发生命周期
                safeExecute(this.$taroPath, ON_SHOW, options);
                // 通过事件触发子组件的生命周期
                _raf(() => eventCenter.trigger(getOnShowEventKey(id)));
            });
        },
        [ONHIDE]() {
            // 缓存当前页面上下文信息
            if (process.env.TARO_PLATFORM !== 'web') {
                taroWindowProvider.trigger(CONTEXT_ACTIONS.RESTORE, this.$taroPath);
            }
            // 设置 Current 的 page 和 router
            if (Current.page === this) {
                Current.page = null;
                Current.router = null;
            }
            // 触发生命周期
            safeExecute(this.$taroPath, ON_HIDE);
            // 通过事件触发子组件的生命周期
            eventCenter.trigger(getOnHideEventKey(id));
        }
    };
    if (process.env.TARO_PLATFORM === 'web') {
        config.getOpenerEventChannel = () => {
            return EventChannel.pageChannel;
        };
    }
    LIFECYCLES.forEach((lifecycle) => {
        let isDefer = false;
        lifecycle = lifecycle.replace(/^defer:/, () => {
            isDefer = true;
            return '';
        });
        config[lifecycle] = function () {
            const exec = () => safeExecute(this.$taroPath, lifecycle, ...arguments);
            if (isDefer) {
                hasLoaded.then(exec);
            }
            else {
                return exec();
            }
        };
    });
    // onShareAppMessage 和 onShareTimeline 一样，会影响小程序右上方按钮的选项，因此不能默认注册。
    SIDE_EFFECT_LIFECYCLES.forEach(lifecycle => {
        var _a;
        if (component[lifecycle] ||
            ((_a = component.prototype) === null || _a === void 0 ? void 0 : _a[lifecycle]) ||
            component[lifecycle.replace(/^on/, 'enable')] ||
            (pageConfig === null || pageConfig === void 0 ? void 0 : pageConfig[lifecycle.replace(/^on/, 'enable')])) {
            config[lifecycle] = function (...args) {
                var _a;
                const target = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.target;
                if (target === null || target === void 0 ? void 0 : target.id) {
                    const id = target.id;
                    const element = env.document.getElementById(id);
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
    hooks.call('modifyPageObject', config);
    return config;
}
function createComponentConfig(component, componentName, data) {
    const id = componentName !== null && componentName !== void 0 ? componentName : `taro_component_${pageId()}`;
    let componentElement = null;
    const [ATTACHED, DETACHED] = hooks.call('getMiniLifecycleImpl').component;
    const config = {
        [ATTACHED]() {
            var _a;
            perf.start(PAGE_INIT);
            this.pageIdCache = ((_a = this.getPageId) === null || _a === void 0 ? void 0 : _a.call(this)) || pageId();
            const path = getPath(id, { id: this.pageIdCache });
            Current.app.mount(component, path, () => {
                componentElement = env.document.getElementById(path);
                ensure(componentElement !== null, '没有找到组件实例。');
                this.$taroInstances = instances.get(path);
                safeExecute(path, ON_LOAD);
                if (process.env.TARO_PLATFORM !== 'web') {
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
        methods: {
            eh: eventHandler
        }
    };
    if (!isUndefined(data)) {
        config.data = data;
    }
    [OPTIONS, EXTERNAL_CLASSES, BEHAVIORS].forEach(key => {
        var _a;
        config[key] = (_a = component[key]) !== null && _a !== void 0 ? _a : EMPTY_OBJ;
    });
    return config;
}
function createRecursiveComponentConfig(componentName) {
    const isCustomWrapper = componentName === CUSTOM_WRAPPER;
    const [ATTACHED, DETACHED] = hooks.call('getMiniLifecycleImpl').component;
    const lifeCycles = isCustomWrapper
        ? {
            [ATTACHED]() {
                var _a, _b;
                const componentId = ((_a = this.data.i) === null || _a === void 0 ? void 0 : _a.sid) || ((_b = this.props.i) === null || _b === void 0 ? void 0 : _b.sid);
                if (isString(componentId)) {
                    customWrapperCache.set(componentId, this);
                    const el = env.document.getElementById(componentId);
                    if (el) {
                        el.ctx = this;
                    }
                }
            },
            [DETACHED]() {
                var _a, _b;
                const componentId = ((_a = this.data.i) === null || _a === void 0 ? void 0 : _a.sid) || ((_b = this.props.i) === null || _b === void 0 ? void 0 : _b.sid);
                if (isString(componentId)) {
                    customWrapperCache.delete(componentId);
                    const el = env.document.getElementById(componentId);
                    if (el) {
                        el.ctx = null;
                    }
                }
            }
        }
        : EMPTY_OBJ;
    // 不同平台的个性化配置
    const extraOptions = {};
    if (process.env.TARO_ENV === 'jd') {
        extraOptions.addGlobalClass = true;
    }
    return hooks.call('modifyRecursiveComponentConfig', Object.assign({ properties: {
            i: {
                type: Object,
                value: {
                    ["nn" /* Shortcuts.NodeName */]: getComponentsAlias(internalComponents)[VIEW]._num
                }
            },
            l: {
                type: String,
                value: ''
            }
        }, options: Object.assign(Object.assign({}, extraOptions), { virtualHost: !isCustomWrapper }), methods: {
            eh: eventHandler
        } }, lifeCycles), { isCustomWrapper });
}

export { createComponentConfig, createPageConfig, createRecursiveComponentConfig, getOnHideEventKey, getOnReadyEventKey, getOnShowEventKey, getPageInstance, getPath, injectPageInstance, removePageInstance, safeExecute, stringify };
//# sourceMappingURL=common.js.map
