import { __toESM } from "./_virtual/rolldown_runtime.js";
import { require_index_cjs } from "./node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { CATCHMOVE, CATCH_VIEW, CLASS, CLICK_VIEW, COMPILE_MODE, ID, PURE_VIEW, STYLE, VIEW } from "./constants/index.js";
import { getComponentsAlias, isComment, isHasExtractProp, isText } from "./utils/index.js";

//#region src/hydrate.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
let SPECIAL_NODES;
let componentsAlias;
/**
* React also has a fancy function's name for this: `hydrate()`.
* You may have been heard `hydrate` as a SSR-related function,
* actually, `hydrate` basicly do the `render()` thing, but ignore some properties,
* it's a vnode traverser and modifier: that's exactly what Taro's doing in here.
*/
function hydrate(node) {
	componentsAlias ||= getComponentsAlias();
	SPECIAL_NODES ||= import_index_cjs.call("getSpecialNodes");
	const nodeName = node.nodeName;
	let compileModeName = null;
	if (isText(node)) {
		return {
			sid: node.sid,
			[import_index_cjs.Text]: node.nodeValue,
			[import_index_cjs.NodeName]: componentsAlias[nodeName]?._num || "8"
		};
	}
	const data = {
		[import_index_cjs.NodeName]: nodeName,
		sid: node.sid
	};
	if (node.uid !== node.sid) {
		data.uid = node.uid;
	}
	if (SPECIAL_NODES.indexOf(nodeName) > -1) {
		if (!node.isAnyEventBinded()) {
			data[import_index_cjs.NodeName] = `static-${nodeName}`;
			if (nodeName === VIEW && !isHasExtractProp(node)) {
				data[import_index_cjs.NodeName] = PURE_VIEW;
			}
		}
		if (nodeName === VIEW && node.isOnlyClickBinded() && !isHasExtractProp(node)) {
			data[import_index_cjs.NodeName] = CLICK_VIEW;
		}
	}
	const { props } = node;
	for (const prop in props) {
		const propInCamelCase = (0, import_index_cjs.toCamelCase)(prop);
		if (!prop.startsWith("data-") && prop !== CLASS && prop !== STYLE && prop !== ID && propInCamelCase !== CATCHMOVE && propInCamelCase !== COMPILE_MODE) {
			data[propInCamelCase] = props[prop];
		}
		if (process.env.TARO_ENV !== "swan" && nodeName === VIEW && propInCamelCase === CATCHMOVE && props[prop] !== false) {
			data[import_index_cjs.NodeName] = CATCH_VIEW;
		}
		if (propInCamelCase === COMPILE_MODE) {
			compileModeName = props[prop];
		}
	}
	data[import_index_cjs.Childnodes] = node.childNodes.filter((node$1) => !isComment(node$1)).map(hydrate);
	if (node.className !== "") {
		data[import_index_cjs.Class] = node.className;
	}
	const cssText = node.cssText;
	if (cssText !== "" && nodeName !== "swiper-item") {
		data[import_index_cjs.Style] = cssText;
	}
	import_index_cjs.call("modifyHydrateData", data, node);
	const nn = data[import_index_cjs.NodeName];
	const componentAlias = componentsAlias[nn];
	if (componentAlias) {
		data[import_index_cjs.NodeName] = componentAlias._num;
		for (const prop in data) {
			if (prop in componentAlias) {
				data[componentAlias[prop]] = data[prop];
				delete data[prop];
			}
		}
	}
	if (compileModeName !== null) {
		data[import_index_cjs.NodeName] = compileModeName;
	}
	const resData = import_index_cjs.call("transferHydrateData", data, node, componentAlias);
	return resData || data;
}

//#endregion
export { hydrate };
//# sourceMappingURL=hydrate.js.map