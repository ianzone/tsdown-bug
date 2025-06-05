import { __toESM } from "../../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { MutationRecordType } from "./record.js";
import { MutationObserverImpl, recordMutation } from "./implements.js";

//#region src/dom-external/mutation-observer/index.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
var MutationObserver = class {
	core;
	constructor(callback) {
		if (ENABLE_MUTATION_OBSERVER) {
			this.core = new MutationObserverImpl(callback);
		} else {
			if (process.env.NODE_ENV !== "production") {
				console.warn("[Taro Warning] 若要使用 MutationObserver，请在 Taro 编译配置中设置 'mini.runtime.enableMutationObserver: true'");
			}
			this.core = {
				observe: import_index_cjs.noop,
				disconnect: import_index_cjs.noop,
				takeRecords: import_index_cjs.noop
			};
		}
	}
	observe(...args) {
		this.core.observe(...args);
	}
	disconnect() {
		this.core.disconnect();
	}
	takeRecords() {
		return this.core.takeRecords();
	}
	static record(record) {
		recordMutation(record);
	}
};

//#endregion
export { MutationObserver };
//# sourceMappingURL=index.js.map