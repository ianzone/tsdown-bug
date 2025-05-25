import { debounce } from "./utils/lodash.js";
import { options } from "./options.js";

//#region src/perf.ts
var Performance = class {
	recorder = new Map();
	start(id) {
		if (!options.debug) return;
		this.recorder.set(id, Date.now());
	}
	stop(id, now = Date.now()) {
		if (!options.debug) return;
		const prev = this.recorder.get(id);
		if (!(prev >= 0)) return;
		this.recorder.delete(id);
		const time = now - prev;
		console.log(`${id} 时长： ${time}ms 开始时间：${this.#parseTime(prev)} 结束时间：${this.#parseTime(now)}`);
	}
	delayStop(id, delay = 500) {
		if (!options.debug) return;
		return debounce((now = Date.now(), cb) => {
			this.stop(id, now);
			cb?.();
		}, delay);
	}
	#parseTime(time) {
		const d = new Date(time);
		return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${`${d.getMilliseconds()}`.padStart(3, "0")}`;
	}
};
const perf = new Performance();

//#endregion
export { perf };
//# sourceMappingURL=perf.js.map