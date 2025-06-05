import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";

//#region src/polyfill/object.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
function handleObjectAssignPolyfill() {
	if (!(0, import_index_cjs.isFunction)(Object.assign)) {
		Object.assign = function(target) {
			if (target == null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}
			const to = Object(target);
			for (let index = 1; index < arguments.length; index++) {
				const nextSource = arguments[index];
				if (nextSource != null) {
					for (const nextKey in nextSource) {
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		};
	}
}
function handleObjectEntriesPolyfill() {
	if (!(0, import_index_cjs.isFunction)(Object.entries)) {
		Object.entries = function(obj) {
			if (obj == null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}
			const to = [];
			if (obj != null) {
				for (const key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						to.push([key, obj[key]]);
					}
				}
			}
			return to;
		};
	}
}
function handleObjectDefinePropertyPolyfill() {
	if (!(0, import_index_cjs.isFunction)(Object.defineProperties)) {
		Object.defineProperties = function(obj, properties) {
			function convertToDescriptor(desc) {
				function hasProperty(obj$1, prop) {
					return Object.prototype.hasOwnProperty.call(obj$1, prop);
				}
				if (!(0, import_index_cjs.isObject)(desc)) {
					throw new TypeError("bad desc");
				}
				const d = {};
				if (hasProperty(desc, "enumerable")) d.enumerable = !!desc.enumerable;
				if (hasProperty(desc, "configurable")) {
					d.configurable = !!desc.configurable;
				}
				if (hasProperty(desc, "value")) d.value = desc.value;
				if (hasProperty(desc, "writable")) d.writable = !!desc.writable;
				if (hasProperty(desc, "get")) {
					const g = desc.get;
					if (!(0, import_index_cjs.isFunction)(g) && !(0, import_index_cjs.isUndefined)(g)) {
						throw new TypeError("bad get");
					}
					d.get = g;
				}
				if (hasProperty(desc, "set")) {
					const s = desc.set;
					if (!(0, import_index_cjs.isFunction)(s) && !(0, import_index_cjs.isUndefined)(s)) {
						throw new TypeError("bad set");
					}
					d.set = s;
				}
				if (("get" in d || "set" in d) && ("value" in d || "writable" in d)) {
					throw new TypeError("identity-confused descriptor");
				}
				return d;
			}
			if (!(0, import_index_cjs.isObject)(obj)) throw new TypeError("bad obj");
			properties = Object(properties);
			const keys = Object.keys(properties);
			const descs = [];
			for (let i = 0; i < keys.length; i++) {
				descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
			}
			for (let i = 0; i < descs.length; i++) {
				Object.defineProperty(obj, descs[i][0], descs[i][1]);
			}
			return obj;
		};
	}
}

//#endregion
export { handleObjectAssignPolyfill, handleObjectDefinePropertyPolyfill, handleObjectEntriesPolyfill };
//# sourceMappingURL=object.js.map