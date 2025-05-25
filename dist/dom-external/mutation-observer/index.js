import { MutationRecordType } from "./record.js";
import { MutationObserverImpl, recordMutation } from "./implements.js";
import { noop } from "@tarojs/shared";

//#region src/dom-external/mutation-observer/index.ts
var MutationObserver = class {
	core;
	constructor(callback) {
		if (ENABLE_MUTATION_OBSERVER) this.core = new MutationObserverImpl(callback);
		else {
			if (process.env.NODE_ENV !== "production") console.warn("[Taro Warning] 若要使用 MutationObserver，请在 Taro 编译配置中设置 'mini.runtime.enableMutationObserver: true'");
			this.core = {
				observe: noop,
				disconnect: noop,
				takeRecords: noop
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