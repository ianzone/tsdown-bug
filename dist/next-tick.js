import { env_default } from "./env.js";
import { Current } from "./current.js";

//#region src/next-tick.ts
const TIMEOUT = 100;
const nextTick = (cb, ctx) => {
	const beginTime = Date.now();
	const router = Current.router;
	const timerFunc = () => {
		setTimeout(function() {
			ctx ? cb.call(ctx) : cb();
		}, 1);
	};
	if (router === null) return timerFunc();
	const path = router.$taroPath;
	/**
	* 三种情况
	*   1. 调用 nextTick 时，pendingUpdate 已经从 true 变为 false（即已更新完成），那么需要光等 100ms
	*   2. 调用 nextTick 时，pendingUpdate 为 true，那么刚好可以搭上便车
	*   3. 调用 nextTick 时，pendingUpdate 还是 false，框架仍未启动更新逻辑，这时最多轮询 100ms，等待 pendingUpdate 变为 true。
	*/
	function next() {
		const pageElement = env_default.document.getElementById(path);
		if (pageElement?.pendingUpdate) {
			if (process.env.TARO_PLATFORM === "web") {
				pageElement.firstChild?.["componentOnReady"]?.().then(() => {
					timerFunc();
				}) ?? timerFunc();
			} else {
				pageElement.enqueueUpdateCallback(cb, ctx);
			}
		} else if (Date.now() - beginTime > TIMEOUT) {
			timerFunc();
		} else {
			setTimeout(() => next(), 20);
		}
	}
	next();
};

//#endregion
export { nextTick };
//# sourceMappingURL=next-tick.js.map