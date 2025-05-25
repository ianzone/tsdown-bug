import { CLASS, COMMENT, ID, ROOT_STR, STYLE, UID } from "../constants/index.js";
import { NodeType } from "../dom/node_types.js";
import { debounce, throttle } from "./lodash.js";
import { addLeadingSlash, getCurrentPage, getHomePage, hasBasename, stripBasename, stripSuffix, stripTrailing } from "./router.js";
import { Shortcuts, getComponentsAlias, internalComponents, isFunction } from "@tarojs/shared";

//#region src/utils/index.ts
const incrementId = () => {
	const chatCodes = [];
	for (let i = 65; i <= 90; i++) chatCodes.push(i);
	for (let i = 97; i <= 122; i++) chatCodes.push(i);
	const chatCodesLen = chatCodes.length - 1;
	const list = [0, 0];
	return () => {
		const target = list.map((item) => chatCodes[item]);
		const res = String.fromCharCode(...target);
		let tailIdx = list.length - 1;
		list[tailIdx]++;
		while (list[tailIdx] > chatCodesLen) {
			list[tailIdx] = 0;
			tailIdx = tailIdx - 1;
			if (tailIdx < 0) {
				list.push(0);
				break;
			}
			list[tailIdx]++;
		}
		return res;
	};
};
function isElement(node) {
	return node.nodeType === NodeType.ELEMENT_NODE;
}
function isText(node) {
	return node.nodeType === NodeType.TEXT_NODE;
}
function isComment(node) {
	return node.nodeName === COMMENT;
}
function isHasExtractProp(el) {
	const res = Object.keys(el.props).find((prop) => {
		return !(/^(class|style|id)$/.test(prop) || prop.startsWith("data-"));
	});
	return Boolean(res);
}
/**
* 往上寻找组件树直到 root，寻找是否有祖先组件绑定了同类型的事件
* @param node 当前组件
* @param type 事件类型
*/
function isParentBinded(node, type) {
	while (node = node?.parentElement || null) if (!node || node.nodeName === ROOT_STR || node.nodeName === "root-portal") return false;
	else if (node.__handlers[type]?.length) return true;
	return false;
}
function shortcutAttr(key) {
	switch (key) {
		case STYLE: return Shortcuts.Style;
		case ID: return UID;
		case CLASS: return Shortcuts.Class;
		default: return key;
	}
}
const customWrapperCache = new Map();
function extend(ctor, methodName, options) {
	if (isFunction(options)) options = { value: options };
	Object.defineProperty(ctor.prototype, methodName, {
		configurable: true,
		enumerable: true,
		...options
	});
}
let componentsAlias;
function getComponentsAlias$1() {
	if (!componentsAlias) componentsAlias = getComponentsAlias(internalComponents);
	return componentsAlias;
}
function convertNumber2PX(value) {
	return value + "px";
}

//#endregion
export { convertNumber2PX, customWrapperCache, extend, getComponentsAlias$1 as getComponentsAlias, incrementId, isComment, isElement, isHasExtractProp, isParentBinded, isText, shortcutAttr };
//# sourceMappingURL=index.js.map