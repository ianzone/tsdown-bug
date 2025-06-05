import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { handleArrayFindPolyfill, handleArrayIncludesPolyfill } from "./array.js";
import { handleIntersectionObserverPolyfill } from "./intersection-observer.js";
import { handleObjectAssignPolyfill, handleObjectDefinePropertyPolyfill, handleObjectEntriesPolyfill } from "./object.js";

//#region src/polyfill/index.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
function handlePolyfill() {
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.assign") {
		handleObjectAssignPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.entries") {
		handleObjectEntriesPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.defineProperty") {
		handleObjectDefinePropertyPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Array" || process.env.SUPPORT_TARO_POLYFILL === "Array.find") {
		handleArrayFindPolyfill();
	}
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Array" || process.env.SUPPORT_TARO_POLYFILL === "Array.includes") {
		handleArrayIncludesPolyfill();
	}
	if (process.env.TARO_PLATFORM === "web" && (0, import_index_cjs.isObject)(window)) {
		if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "IntersectionObserver") {
			handleIntersectionObserverPolyfill();
		}
	}
}
if (process.env.SUPPORT_TARO_POLYFILL !== "disabled" && process.env.TARO_PLATFORM !== "web") {
	handlePolyfill();
}

//#endregion
export { handlePolyfill };
//# sourceMappingURL=index.js.map