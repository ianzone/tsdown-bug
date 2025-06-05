import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { PROPERTY_THRESHOLD } from "../constants/index.js";
import { MutationRecordType } from "../dom-external/mutation-observer/record.js";
import { MutationObserver } from "../dom-external/mutation-observer/index.js";
import { styleProperties } from "./style_properties.js";

//#region src/dom/style.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
function recordCss(obj) {
	MutationObserver.record({
		type: MutationRecordType.ATTRIBUTES,
		target: obj._element,
		attributeName: "style",
		oldValue: obj.cssText
	});
}
function enqueueUpdate(obj) {
	const element = obj._element;
	if (element._root) {
		element.enqueueUpdate({
			path: `${element._path}.${import_index_cjs.Style}`,
			value: obj.cssText
		});
	}
}
function setStyle(newVal, styleKey) {
	process.env.NODE_ENV !== "production" && (0, import_index_cjs.warn)((0, import_index_cjs.isString)(newVal) && newVal.length > PROPERTY_THRESHOLD, `Style 属性 ${styleKey} 的值数据量过大，可能会影响渲染性能，考虑使用 CSS 类或其它方案替代。`);
	const old = this[styleKey];
	if (old === newVal) return;
	!this._pending && recordCss(this);
	if ((0, import_index_cjs.isNull)(newVal) || (0, import_index_cjs.isUndefined)(newVal) || newVal === "") {
		this._usedStyleProp.delete(styleKey);
		delete this._value[styleKey];
	} else {
		this._usedStyleProp.add(styleKey);
		this._value[styleKey] = newVal;
	}
	!this._pending && enqueueUpdate(this);
}
function initStyle(ctor, styleProperties$1) {
	const properties = {};
	for (let i = 0; i < styleProperties$1.length; i++) {
		const styleKey = styleProperties$1[i];
		if (ctor[styleKey]) return;
		properties[styleKey] = {
			get() {
				const val = this._value[styleKey];
				return (0, import_index_cjs.isNull)(val) || (0, import_index_cjs.isUndefined)(val) ? "" : val;
			},
			set(newVal) {
				setStyle.call(this, newVal, styleKey);
			}
		};
	}
	Object.defineProperties(ctor.prototype, properties);
}
function isCssVariable(propertyName) {
	return /^--/.test(propertyName);
}
var Style = class {
	_pending;
	_usedStyleProp;
	_value;
	_element;
	constructor(element) {
		this._element = element;
		this._usedStyleProp = new Set();
		this._value = {};
	}
	setCssVariables(styleKey) {
		this.hasOwnProperty(styleKey) || Object.defineProperty(this, styleKey, {
			enumerable: true,
			configurable: true,
			get: () => {
				return this._value[styleKey] || "";
			},
			set: (newVal) => {
				setStyle.call(this, newVal, styleKey);
			}
		});
	}
	get cssText() {
		if (!this._usedStyleProp.size) return "";
		const texts = [];
		this._usedStyleProp.forEach((key) => {
			const val = this[key];
			if ((0, import_index_cjs.isNull)(val) || (0, import_index_cjs.isUndefined)(val)) return;
			let styleName = isCssVariable(key) ? key : (0, import_index_cjs.toDashed)(key);
			if (styleName.indexOf("webkit") === 0 || styleName.indexOf("Webkit") === 0) {
				styleName = `-${styleName}`;
			}
			texts.push(`${styleName}: ${val};`);
		});
		return texts.join(" ");
	}
	set cssText(str) {
		this._pending = true;
		recordCss(this);
		this._usedStyleProp.forEach((prop) => {
			this.removeProperty(prop);
		});
		if (str === "" || (0, import_index_cjs.isUndefined)(str) || (0, import_index_cjs.isNull)(str)) {
			this._pending = false;
			enqueueUpdate(this);
			return;
		}
		const rules = str.split(";");
		for (let i = 0; i < rules.length; i++) {
			const rule = rules[i].trim();
			if (rule === "") {
				continue;
			}
			const [propName, ...valList] = rule.split(":");
			const val = valList.join(":");
			if ((0, import_index_cjs.isUndefined)(val)) {
				continue;
			}
			this.setProperty(propName.trim(), val.trim());
		}
		this._pending = false;
		enqueueUpdate(this);
	}
	setProperty(propertyName, value) {
		if (propertyName[0] === "-") {
			this.setCssVariables(propertyName);
		} else {
			propertyName = (0, import_index_cjs.toCamelCase)(propertyName);
		}
		if ((0, import_index_cjs.isNull)(value) || (0, import_index_cjs.isUndefined)(value)) {
			this.removeProperty(propertyName);
		} else {
			this[propertyName] = value;
		}
	}
	removeProperty(propertyName) {
		propertyName = (0, import_index_cjs.toCamelCase)(propertyName);
		if (!this._usedStyleProp.has(propertyName)) {
			return "";
		}
		const value = this[propertyName];
		this[propertyName] = undefined;
		return value;
	}
	getPropertyValue(propertyName) {
		propertyName = (0, import_index_cjs.toCamelCase)(propertyName);
		const value = this[propertyName];
		if (!value) {
			return "";
		}
		return value;
	}
};
initStyle(Style, styleProperties);
import_index_cjs.tap("injectNewStyleProperties", (newStyleProperties) => {
	if ((0, import_index_cjs.isArray)(newStyleProperties)) {
		initStyle(Style, newStyleProperties);
	} else {
		if (typeof newStyleProperties !== "string") return;
		initStyle(Style, [newStyleProperties]);
	}
});

//#endregion
export { Style };
//# sourceMappingURL=style.js.map