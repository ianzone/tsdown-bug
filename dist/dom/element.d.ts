import { ClassList } from "./class-list.js";
import { Attributes } from "../interface/element.js";
import { TFunc } from "../interface/utils.js";
import { TaroNode } from "./node.js";
import { Style } from "./style.js";
import { TaroEvent } from "./event.js";

//#region src/dom/element.d.ts
declare class TaroElement extends TaroNode {
  ctx?: any;
  tagName: string;
  props: Record<string, any>;
  style: Style;
  dataset: Record<string, unknown>;
  innerHTML: string;
  constructor();
  private _stopPropagation;
  get id(): string;
  set id(val: string);
  get className(): string;
  set className(val: string);
  get cssText(): string;
  get classList(): ClassList;
  get children(): TaroElement[];
  get attributes(): Attributes[];
  get textContent(): string;
  set textContent(text: string);
  hasAttribute(qualifiedName: string): boolean;
  hasAttributes(): boolean;
  get focus(): () => void;
  set focus(value: () => void);
  blur(): void;
  setAttribute(qualifiedName: string, value: any): void;
  removeAttribute(qualifiedName: string): void;
  getAttribute(qualifiedName: string): string;
  getElementsByTagName(tagName: string): TaroElement[];
  getElementsByClassName(className: string): TaroElement[];
  dispatchEvent(event: TaroEvent): boolean;
  addEventListener(type: any, handler: any, options: any): void;
  removeEventListener(type: any, handler: any, sideEffect?: boolean): void;
  static extend(methodName: string, options: TFunc | Record<string, any>): void;
}
//#endregion
export { TaroElement };
//# sourceMappingURL=element.d.ts.map