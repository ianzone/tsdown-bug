import { NodeType$1 as NodeType } from "./node_types.js";
import { TaroNode$1 as TaroNode } from "./node.js";

//#region src/dom/text.d.ts
declare class TaroText extends TaroNode {
  _value: string;
  nodeType: NodeType;
  nodeName: string;
  constructor(value: any);
  set textContent(text: string);
  get textContent(): string;
  set nodeValue(text: string);
  get nodeValue(): string;
  set data(text: string);
  get data(): string;
} //#endregion
export { TaroText as TaroText$1 };
//# sourceMappingURL=text.d.ts.map