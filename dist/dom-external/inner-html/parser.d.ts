import { TaroText$1 as TaroText } from "../../dom/text.js";
import { TaroElement$1 as TaroElement } from "../../dom/element.js";
import { TaroDocument$1 as TaroDocument } from "../../dom/document.js";

//#region src/dom-external/inner-html/parser.d.ts
interface Node {
  type: string;
}
interface Comment extends Node {
  type: 'comment';
  content: string;
}
interface Text extends Node {
  type: 'text';
  content: string;
}
interface Element extends Node {
  type: 'element';
  tagName: string;
  children: ChildNode[];
  attributes: string[];
}
interface ParsedTaroElement extends TaroElement {
  h5tagName?: string;
}
type ChildNode = Comment | Text | Element;
declare function parser(html: string, document: TaroDocument): (TaroElement | TaroText)[];

//#endregion
export { Element, Text };
//# sourceMappingURL=parser.d.ts.map