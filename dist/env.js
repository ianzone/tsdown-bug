import { EMPTY_OBJ } from "@tarojs/shared";

//#region src/env.ts
const env = {
	window: process.env.TARO_PLATFORM === "web" ? window : EMPTY_OBJ,
	document: process.env.TARO_PLATFORM === "web" ? document : EMPTY_OBJ
};
var env_default = env;

//#endregion
export { env_default };
//# sourceMappingURL=env.js.map