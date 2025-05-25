import { taroLocationProvider } from "../bom/window.js";

//#region src/utils/router.ts
const addLeadingSlash = (url = "") => url.charAt(0) === "/" ? url : "/" + url;
const hasBasename = (path = "", prefix = "") => new RegExp("^" + prefix + "(\\/|\\?|#|$)", "i").test(path) || path === prefix;
const stripBasename = (path = "", prefix = "") => hasBasename(path, prefix) ? path.substring(prefix.length) : path;
const stripTrailing = (str = "") => str.replace(/[?#][\s\S]*$/, "");
const stripSuffix = (path = "", suffix = "") => path.includes(suffix) ? path.substring(0, path.length - suffix.length) : path;
const getHomePage = (path = "", basename = "", customRoutes = {}, entryPagePath = "") => {
	const routePath = addLeadingSlash(stripBasename(path, basename));
	const alias = Object.entries(customRoutes).find(([key]) => key === routePath)?.[1] || routePath;
	return entryPagePath || (typeof alias === "string" ? alias : alias[0]) || basename;
};
const getCurrentPage = (routerMode = "hash", basename = "/") => {
	const pagePath = routerMode === "hash" ? taroLocationProvider.hash.slice(1).split("?")[0] : taroLocationProvider.pathname;
	return addLeadingSlash(stripBasename(pagePath, basename));
};

//#endregion
export { addLeadingSlash, getCurrentPage, getHomePage, hasBasename, stripBasename, stripSuffix, stripTrailing };
//# sourceMappingURL=router.js.map