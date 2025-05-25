import { handleArrayFindPolyfill, handleArrayIncludesPolyfill } from "./array.js";
import { handleIntersectionObserverPolyfill } from "./intersection-observer.js";
import { handleObjectAssignPolyfill, handleObjectDefinePropertyPolyfill, handleObjectEntriesPolyfill } from "./object.js";
import { isObject } from "@tarojs/shared";

//#region src/polyfill/index.ts
function handlePolyfill() {
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.assign") handleObjectAssignPolyfill();
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.entries") handleObjectEntriesPolyfill();
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Object" || process.env.SUPPORT_TARO_POLYFILL === "Object.defineProperty") handleObjectDefinePropertyPolyfill();
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Array" || process.env.SUPPORT_TARO_POLYFILL === "Array.find") handleArrayFindPolyfill();
	if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "Array" || process.env.SUPPORT_TARO_POLYFILL === "Array.includes") handleArrayIncludesPolyfill();
	if (process.env.TARO_PLATFORM === "web" && isObject(window)) {
		if (process.env.SUPPORT_TARO_POLYFILL === "enabled" || process.env.SUPPORT_TARO_POLYFILL === "IntersectionObserver") handleIntersectionObserverPolyfill();
	}
}
if (process.env.SUPPORT_TARO_POLYFILL !== "disabled" && process.env.TARO_PLATFORM !== "web") handlePolyfill();

//#endregion
export { handlePolyfill };
//# sourceMappingURL=index.js.map