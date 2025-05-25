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
type ChildNode = Comment | Text | Element; //#endregion
export { Element, Text };
//# sourceMappingURL=parser.d.ts.map