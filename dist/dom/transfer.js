import { TaroElement } from "./element.js";

//#region src/dom/transfer.ts
var TransferElement = class extends TaroElement {
	isTransferElement = true;
	constructor(dataName) {
		super();
		this.dataName = dataName;
	}
	get _path() {
		return this.dataName;
	}
};

//#endregion
export { TransferElement };
//# sourceMappingURL=transfer.js.map