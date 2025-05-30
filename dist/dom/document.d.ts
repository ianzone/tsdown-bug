import { TaroText } from "./text.js";
import { TaroRootElement } from "./root.js";
import { createEvent } from "./event.js";
import { TaroElement } from "./element.js";
import { FormElement } from "./form.js";

//#region src/dom/document.d.ts
declare class TaroDocument extends TaroElement {
  documentElement: TaroElement;
  head: TaroElement;
  body: TaroElement;
  createEvent: typeof createEvent;
  cookie?: string;
  constructor();
  createElement(type: string): TaroElement | TaroRootElement | FormElement;
  createElementNS(_svgNS: string, type: string): TaroElement | TaroRootElement | FormElement;
  createTextNode(text: string): TaroText;
  getElementById<T extends TaroElement>(id: string | undefined | null): T | null;
  querySelector<T extends TaroElement>(query: string): T | null;
  querySelectorAll(): never[];
  createComment(): TaroText;
  get defaultView(): any;
}
//#endregion
export { TaroDocument };
//# sourceMappingURL=document.d.ts.map