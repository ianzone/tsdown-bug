import env_default from "../env.js";

//#region src/bom/navigator.ts
const machine = "Macintosh";
const arch = "Intel Mac OS X 10_14_5";
const engine = "AppleWebKit/534.36 (KHTML, like Gecko) NodeJS/v4.1.0 Chrome/76.0.3809.132 Safari/534.36";
const msg = "(" + machine + "; " + arch + ") " + engine;
const nav = process.env.TARO_PLATFORM === "web" ? env_default.window.navigator : {
	appCodeName: "Mozilla",
	appName: "Netscape",
	appVersion: "5.0 " + msg,
	cookieEnabled: true,
	mimeTypes: [],
	onLine: true,
	platform: "MacIntel",
	plugins: [],
	product: "Taro",
	productSub: "20030107",
	userAgent: "Mozilla/5.0 " + msg,
	vendor: "Joyent",
	vendorSub: ""
};

//#endregion
export { nav };
//# sourceMappingURL=navigator.js.map