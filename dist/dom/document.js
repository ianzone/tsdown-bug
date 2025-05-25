import { A, COMMENT, DOCUMENT_ELEMENT_NAME, ROOT_STR } from "../constants/index.js";
import { NodeType } from "./node_types.js";
import { env_default } from "../env.js";
import { eventSource } from "./event-source.js";
import { TaroElement } from "./element.js";
import { createEvent } from "./event.js";
import { FormElement } from "./form.js";
import { TaroRootElement } from "./root.js";
import { TaroText } from "./text.js";
import { AnchorElement } from "./anchor-element.js";
import { TransferElement } from "./transfer.js";
import { controlledComponent, isUndefined, toCamelCase } from "@tarojs/shared";

//#region src/dom/document.ts
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
			case controlledComponent.has(nodeName):
				element = new FormElement();
				break;
			case nodeName === A:
				element = new AnchorElement();
				break;
			case nodeName === "page-meta":
			case nodeName === "navigation-bar":
				element = new TransferElement(toCamelCase(nodeName));
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
		return isUndefined(el) ? null : el;
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