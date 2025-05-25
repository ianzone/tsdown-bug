import { env_default } from "../env.js";

//#region src/bom/getComputedStyle.ts
const taroGetComputedStyleProvider = process.env.TARO_PLATFORM === "web" ? env_default.window.getComputedStyle : function(element) {
	return element.style;
};

//#endregion
export { taroGetComputedStyleProvider };
//# sourceMappingURL=getComputedStyle.js.map