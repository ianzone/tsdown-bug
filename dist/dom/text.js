import { MutationRecordType } from "../dom-external/mutation-observer/record.js";
import { MutationObserver } from "../dom-external/mutation-observer/index.js";
import { NodeType } from "./node_types.js";
import { TaroNode } from "./node.js";
import { Shortcuts } from "@tarojs/shared";

//#region src/dom/text.ts
var TaroText = class extends TaroNode {
	_value;
	nodeType = NodeType.TEXT_NODE;
	nodeName = "#text";
	constructor(value) {
		super();
		this._value = value;
	}
	set textContent(text) {
		MutationObserver.record({
			target: this,
			type: MutationRecordType.CHARACTER_DATA,
			oldValue: this._value
		});
		this._value = text;
		this.enqueueUpdate({
			path: `${this._path}.${Shortcuts.Text}`,
			value: text
		});
	}
	get textContent() {
		return this._value;
	}
	set nodeValue(text) {
		this.textContent = text;
	}
	get nodeValue() {
		return this._value;
	}
	set data(text) {
		this.textContent = text;
	}
	get data() {
		return this._value;
	}
};

//#endregion
export { TaroText };
//# sourceMappingURL=text.js.map