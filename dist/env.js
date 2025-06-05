import { __toESM } from "./_virtual/rolldown_runtime.js";
import { require_index_cjs } from "./node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";

//#region src/env.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
const env = {
	window: process.env.TARO_PLATFORM === "web" ? window : import_index_cjs.EMPTY_OBJ,
	document: process.env.TARO_PLATFORM === "web" ? document : import_index_cjs.EMPTY_OBJ
};
var env_default = env;

//#endregion
export { env_default as default };
//# sourceMappingURL=env.js.map