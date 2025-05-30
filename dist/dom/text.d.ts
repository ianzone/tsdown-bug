import { NodeType } from "./node_types.js";
import { TaroNode } from "./node.js";

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
}
//#endregion
export { TaroText };
//# sourceMappingURL=text.d.ts.map