import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { TaroNode } from "../dom/node.js";
import { TaroElement } from "../dom/element.js";
import { setInnerHTML } from "./inner-html/html.js";
import { getBoundingClientRectImpl, getTemplateContent } from "./element.js";
import { cloneNode, contains, insertAdjacentHTML } from "./node.js";

//#region src/dom-external/index.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
if (process.env.TARO_PLATFORM !== import_index_cjs.WEB && process.env.TARO_PLATFORM !== import_index_cjs.HARMONY) {
	if (ENABLE_INNER_HTML) {
		TaroNode.extend("innerHTML", {
			set(html) {
				setInnerHTML.call(this, this, html);
			},
			get() {
				return "";
			}
		});
		if (ENABLE_ADJACENT_HTML) {
			TaroNode.extend("insertAdjacentHTML", insertAdjacentHTML);
		}
	}
	if (ENABLE_CLONE_NODE) {
		TaroNode.extend("cloneNode", cloneNode);
	}
	if (ENABLE_CONTAINS) {
		TaroNode.extend("contains", contains);
	}
	if (ENABLE_SIZE_APIS) {
		TaroElement.extend("getBoundingClientRect", getBoundingClientRectImpl);
	}
	if (ENABLE_TEMPLATE_CONTENT) {
		TaroElement.extend("content", { get() {
			return getTemplateContent(this);
		} });
	}
}

//#endregion
//# sourceMappingURL=index.js.map