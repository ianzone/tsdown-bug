import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { A, COMMENT, DOCUMENT_ELEMENT_NAME, ROOT_STR } from "../constants/index.js";
import { NodeType } from "./node_types.js";
import env_default from "../env.js";
import { eventSource } from "./event-source.js";
import { TaroElement } from "./element.js";
import { createEvent } from "./event.js";
import { FormElement } from "./form.js";
import { TaroRootElement } from "./root.js";
import { TaroText } from "./text.js";
import { AnchorElement } from "./anchor-element.js";
import { TransferElement } from "./transfer.js";

//#region src/dom/document.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
var TaroDocument = class extends TaroElement {
	documentElement;
	head;
	body;
	createEvent = createEvent;
	cookie;
	constructor() {
		super();
		this.nodeType = NodeType.DOCUMENT_NODE;
		this.nodeName = DOCUMENT_ELEMENT_NAME;
	}
	createElement(type) {
		const nodeName = type.toLowerCase();
		let element;
		switch (true) {
			case nodeName === ROOT_STR:
				element = new TaroRootElement();
				return element;
			case import_index_cjs.has(nodeName):
				element = new FormElement();
				break;
			case nodeName === A:
				element = new AnchorElement();
				break;
			case nodeName === "page-meta":
			case nodeName === "navigation-bar":
				element = new TransferElement((0, import_index_cjs.toCamelCase)(nodeName));
				break;
			default:
				element = new TaroElement();
				break;
		}
		element.nodeName = nodeName;
		element.tagName = type.toUpperCase();
		return element;
	}
	createElementNS(_svgNS, type) {
		return this.createElement(type);
	}
	createTextNode(text) {
		return new TaroText(text);
	}
	getElementById(id) {
		const el = eventSource.get(id);
		return (0, import_index_cjs.isUndefined)(el) ? null : el;
	}
	querySelector(query) {
		if (/^#/.test(query)) {
			return this.getElementById(query.slice(1));
		}
		return null;
	}
	querySelectorAll() {
		return [];
	}
	createComment() {
		const textnode = new TaroText("");
		textnode.nodeName = COMMENT;
		return textnode;
	}
	get defaultView() {
		return env_default.window;
	}
};

//#endregion
export { TaroDocument };
//# sourceMappingURL=document.js.map