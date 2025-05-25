import { CATCHMOVE, CATCH_VIEW, CLASS, CLICK_VIEW, EVENT_CALLBACK_RESULT, FOCUS, ID, PROPERTY_THRESHOLD, PURE_VIEW, STATIC_VIEW, STYLE, VIEW } from "../constants/index.js";
import { MutationRecordType } from "../dom-external/mutation-observer/record.js";
import { MutationObserver } from "../dom-external/mutation-observer/index.js";
import { NodeType } from "./node_types.js";
import { extend, getComponentsAlias, isElement, isHasExtractProp, shortcutAttr } from "../utils/index.js";
import { ClassList } from "./class-list.js";
import { eventSource } from "./event-source.js";
import { TaroNode } from "./node.js";
import { Style } from "./style.js";
import { treeToArray } from "./tree.js";
import { EMPTY_OBJ, Shortcuts, hooks, isArray, isFunction, isObject, isString, isUndefined, toCamelCase, warn } from "@tarojs/shared";

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
		hooks.call("patchElement", this);
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
		const style = this.style.cssText;
		const attrs = propKeys.map((key) => ({
			name: key,
			value: props[key]
		}));
		return attrs.concat(style ? {
			name: STYLE,
			value: style
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
			MutationObserver.record({
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
		const componentsAlias = getComponentsAlias();
		const _alias = componentsAlias[this.nodeName];
		const viewAlias = componentsAlias[VIEW]._num;
		const clickViewAlias = componentsAlias[CLICK_VIEW]._num;
		const staticViewAlias = componentsAlias[STATIC_VIEW]._num;
		const catchViewAlias = componentsAlias[CATCH_VIEW]._num;
		const _path = this._path;
		qualifiedName = shortcutAttr(qualifiedName);
		const qualifiedNameInCamelCase = toCamelCase(qualifiedName);
		const payload = {
			path: `${_path}.${qualifiedNameInCamelCase}`,
			value: isFunction(value) ? () => value : value
		};
		hooks.call("modifySetAttrPayload", this, qualifiedName, payload, componentsAlias);
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
		MutationObserver.record({
			target: this,
			type: MutationRecordType.ATTRIBUTES,
			attributeName: qualifiedName,
			oldValue: this.getAttribute(qualifiedName)
		});
		if (qualifiedName === STYLE) {
			this.style.cssText = "";
		} else {
			const isInterrupt = hooks.call("onRemoveAttribute", this, qualifiedName);
			if (isInterrupt) {
				return;
			}
			if (!this.props.hasOwnProperty(qualifiedName)) {
				return;
			}
			delete this.props[qualifiedName];
		}
		if (!this._root) return;
		const componentsAlias = getComponentsAlias();
		const _alias = componentsAlias[this.nodeName];
		const viewAlias = componentsAlias[VIEW]._num;
		const staticViewAlias = componentsAlias[STATIC_VIEW]._num;
		const pureViewAlias = componentsAlias[PURE_VIEW]._num;
		const clickViewAlias = componentsAlias[CLICK_VIEW]._num;
		const _path = this._path;
		qualifiedName = shortcutAttr(qualifiedName);
		const qualifiedNameInCamelCase = toCamelCase(qualifiedName);
		const payload = {
			path: `${_path}.${qualifiedNameInCamelCase}`,
			value: ""
		};
		hooks.call("modifyRmAttrPayload", this, qualifiedName, payload, componentsAlias);
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
				hooks.call("modifyDispatchEvent", event, this);
				result = listener.call(this, event);
			}
			if ((result === false || event._end) && cancelable) {
				event.defaultPrevented = true;
			}
			if (!isUndefined(result) && event.mpEvent) {
				const res = hooks.call("modifyTaroEventReturn", this, event, result);
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
	addEventListener(type, handler, options) {
		const name = this.nodeName;
		const SPECIAL_NODES = hooks.call("getSpecialNodes");
		let sideEffect = true;
		if (isObject(options) && options.sideEffect === false) {
			sideEffect = false;
			delete options.sideEffect;
		}
		hooks.call("modifyAddEventListener", this, sideEffect, getComponentsAlias);
		if (sideEffect !== false && !this.isAnyEventBinded() && SPECIAL_NODES.indexOf(name) > -1) {
			const componentsAlias = getComponentsAlias();
			const alias = componentsAlias[name]._num;
			this.enqueueUpdate({
				path: `${this._path}.${Shortcuts.NodeName}`,
				value: alias
			});
		}
		super.addEventListener(type, handler, options);
	}
	removeEventListener(type, handler, sideEffect = true) {
		super.removeEventListener(type, handler);
		const name = this.nodeName;
		const SPECIAL_NODES = hooks.call("getSpecialNodes");
		hooks.call("modifyRemoveEventListener", this, sideEffect, getComponentsAlias);
		if (sideEffect !== false && !this.isAnyEventBinded() && SPECIAL_NODES.indexOf(name) > -1) {
			const componentsAlias = getComponentsAlias();
			const value = isHasExtractProp(this) ? `static-${name}` : `pure-${name}`;
			const valueAlias = componentsAlias[value]._num;
			this.enqueueUpdate({
				path: `${this._path}.${Shortcuts.NodeName}`,
				value: valueAlias
			});
		}
	}
	static extend(methodName, options) {
		extend(TaroElement, methodName, options);
	}
};

//#endregion
export { TaroElement };
//# sourceMappingURL=element.js.map