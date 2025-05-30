import { TaroEvent } from "./event.js";
import { TaroElement } from "./element.js";

//#region src/dom/form.d.ts
declare class FormElement extends TaroElement {
  get type(): string;
  set type(val: string);
  get value(): string | boolean | number | any[];
  set value(val: string | boolean | number | any[]);
  dispatchEvent(event: TaroEvent): boolean;
}
//#endregion
export { FormElement };
//# sourceMappingURL=form.d.ts.map