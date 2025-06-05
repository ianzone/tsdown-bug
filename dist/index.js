import { __toESM } from "./_virtual/rolldown_runtime.js";
import { require_index_cjs } from "./node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { A, APP, BEHAVIORS, BODY, CATCHMOVE, CATCH_VIEW, CHANGE, CLASS, CLICK_VIEW, COMMENT, COMPILE_MODE, CONFIRM, CONTAINER, CONTEXT_ACTIONS, CURRENT_TARGET, CUSTOM_WRAPPER, DATASET, DATE, DOCUMENT_ELEMENT_NAME, DOCUMENT_FRAGMENT, EVENT_CALLBACK_RESULT, EXTERNAL_CLASSES, FOCUS, HEAD, HOOKS_APP_ID, HTML, ID, INPUT, KEY_CODE, OBJECT, ON_HIDE, ON_LOAD, ON_READY, ON_SHOW, OPTIONS, PAGE_INIT, PROPERTY_THRESHOLD, PROPS, PURE_VIEW, ROOT_STR, SET_DATA, SET_TIMEOUT, STATIC_VIEW, STYLE, TARGET, TARO_RUNTIME, TIME_STAMP, TOUCHMOVE, TYPE, UID, VALUE, VIEW } from "./constants/index.js";
import { MutationObserver } from "./dom-external/mutation-observer/index.js";
import { debounce, throttle } from "./utils/lodash.js";
import { eventCenter, import_index_cjs } from "./emitter/emitter.js";
import env_default from "./env.js";
import { taroGetComputedStyleProvider } from "./bom/getComputedStyle.js";
import { History } from "./bom/history.js";
import { Current, getCurrentInstance } from "./current.js";
import { URLSearchParams } from "./bom/URLSearchParams.js";
import { TaroURLProvider, parseUrl } from "./bom/URL.js";
import { Location } from "./bom/location.js";
import { nav } from "./bom/navigator.js";
import { _caf, _raf, now } from "./bom/raf.js";
import { taroHistoryProvider, taroLocationProvider, taroWindowProvider } from "./bom/window.js";
import { addLeadingSlash, getCurrentPage, getHomePage, hasBasename, stripBasename, stripSuffix, stripTrailing } from "./utils/router.js";
import { convertNumber2PX, customWrapperCache, extend, getComponentsAlias, incrementId, isComment, isElement, isHasExtractProp, isParentBinded, isText, shortcutAttr } from "./utils/index.js";
import { eventSource } from "./dom/event-source.js";
import { hydrate } from "./hydrate.js";
import { TaroNode } from "./dom/node.js";
import { Style } from "./dom/style.js";
import { TaroElement } from "./dom/element.js";
import { options } from "./options.js";
import "./dom-external/index.js";
import { TaroEvent, createEvent, eventHandler } from "./dom/event.js";
import { FormElement } from "./dom/form.js";
import { perf } from "./perf.js";
import { TaroRootElement } from "./dom/root.js";
import { TaroText } from "./dom/text.js";
import { taroDocumentProvider } from "./bom/document.js";
import { SVGElement } from "./dom/svg.js";
import { createComponentConfig, createPageConfig, createRecursiveComponentConfig, getOnHideEventKey, getOnReadyEventKey, getOnShowEventKey, getPageInstance, getPath, injectPageInstance, removePageInstance, safeExecute, stringify } from "./dsl/common.js";
import { nextTick } from "./next-tick.js";
import "./dsl/instance.js";
import "./interface/index.js";
import { handlePolyfill } from "./polyfill/index.js";

//#region src/index.ts
var import_index_cjs$1 = __toESM(require_index_cjs(), 1);

//#endregion
var Events = import_index_cjs.Events;
var hooks = import_index_cjs$1.hooks;
export { A, APP, BEHAVIORS, BODY, CATCHMOVE, CATCH_VIEW, CHANGE, CLASS, CLICK_VIEW, COMMENT, COMPILE_MODE, CONFIRM, CONTAINER, CONTEXT_ACTIONS, CURRENT_TARGET, CUSTOM_WRAPPER, Current, DATASET, DATE, DOCUMENT_ELEMENT_NAME, DOCUMENT_FRAGMENT, EVENT_CALLBACK_RESULT, EXTERNAL_CLASSES, Events, FOCUS, FormElement, HEAD, HOOKS_APP_ID, HTML, History, ID, INPUT, KEY_CODE, Location, MutationObserver, OBJECT, ON_HIDE, ON_LOAD, ON_READY, ON_SHOW, OPTIONS, PAGE_INIT, PROPERTY_THRESHOLD, PROPS, PURE_VIEW, ROOT_STR, SET_DATA, SET_TIMEOUT, STATIC_VIEW, STYLE, SVGElement, Style, TARGET, TARO_RUNTIME, TIME_STAMP, TOUCHMOVE, TYPE, TaroElement, TaroEvent, TaroNode, TaroRootElement, TaroText, UID, TaroURLProvider as URL, URLSearchParams, VALUE, VIEW, addLeadingSlash, _caf as cancelAnimationFrame, convertNumber2PX, createComponentConfig, createEvent, createPageConfig, createRecursiveComponentConfig, customWrapperCache, debounce, taroDocumentProvider as document, env_default as env, eventCenter, eventHandler, eventSource, extend, getComponentsAlias, taroGetComputedStyleProvider as getComputedStyle, getCurrentInstance, getCurrentPage, getHomePage, getOnHideEventKey, getOnReadyEventKey, getOnShowEventKey, getPageInstance, getPath, handlePolyfill, hasBasename, taroHistoryProvider as history, hooks, hydrate, incrementId, injectPageInstance, isComment, isElement, isHasExtractProp, isParentBinded, isText, taroLocationProvider as location, nav as navigator, nextTick, now, options, parseUrl, perf, removePageInstance, _raf as requestAnimationFrame, safeExecute, shortcutAttr, stringify, stripBasename, stripSuffix, stripTrailing, throttle, taroWindowProvider as window };
//# sourceMappingURL=index.js.map