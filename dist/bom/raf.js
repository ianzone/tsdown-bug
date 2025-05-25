//#region src/bom/raf.ts
let now;
(function() {
	let loadTime;
	if (typeof performance !== "undefined" && performance !== null && performance.now) {
		now = () => performance.now();
	} else if (Date.now) {
		loadTime = Date.now();
		now = () => Date.now() - loadTime;
	} else {
		loadTime = new Date().getTime();
		now = () => new Date().getTime() - loadTime;
	}
})();
let lastTime = 0;
const _raf = process.env.TARO_PLATFORM === "web" ? requestAnimationFrame : function(callback) {
	const _now = now();
	const nextTime = Math.max(lastTime + 16, _now);
	return setTimeout(function() {
		callback(lastTime = nextTime);
	}, nextTime - _now);
};
const _caf = process.env.TARO_PLATFORM === "web" ? cancelAnimationFrame : function(seed) {
	clearTimeout(seed);
};

//#endregion
export { _caf, _raf, now };
//# sourceMappingURL=raf.js.map