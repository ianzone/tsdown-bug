import { CHANGE, INPUT, TYPE, VALUE } from "../constants/index.js";
import { TaroElement } from "./element.js";

//#region src/dom/form.ts
var FormElement = class extends TaroElement {
	get type() {
		return this.props[TYPE] ?? "";
	}
	set type(val) {
		this.setAttribute(TYPE, val);
	}
	get value() {
		const val = this.props[VALUE];
		return val == null ? "" : val;
	}
	set value(val) {
		this.setAttribute(VALUE, val);
	}
	dispatchEvent(event) {
		if (event.mpEvent) {
			const val = event.mpEvent.detail.value;
			if (event.type === CHANGE) this.props.value = val;
			else if (event.type === INPUT) this.value = val;
		}
		return super.dispatchEvent(event);
	}
};

//#endregion
export { FormElement };
//# sourceMappingURL=form.js.map