import { TFunc } from "../interface/utils.js";
import { TaroText } from "../dom/text.js";
import { TaroNode } from "../dom/node.js";
import { TaroElement } from "../dom/element.js";
import { debounce, throttle } from "./lodash.js";
import { addLeadingSlash, getCurrentPage, getHomePage, hasBasename, stripBasename, stripSuffix, stripTrailing } from "./router.js";

//#region src/utils/index.d.ts
declare const incrementId: () => () => string;
declare function isElement(node: TaroNode): node is TaroElement;
declare function isText(node: TaroNode): node is TaroText;
declare function isComment(node: TaroNode): boolean;
declare function isHasExtractProp(el: TaroElement): boolean;
/**
 * 往上寻找组件树直到 root，寻找是否有祖先组件绑定了同类型的事件
 * @param node 当前组件
 * @param type 事件类型
 */
declare function isParentBinded(node: TaroElement | null, type: string): boolean;
declare function shortcutAttr(key: string): string;
declare const customWrapperCache: Map<string, Record<string, any>>;
interface Ctor {
  new (...args: any[]): any;
}
declare function extend(ctor: Ctor, methodName: string, options: TFunc | Record<string, any>): void;
declare function getComponentsAlias(): any;
declare function convertNumber2PX(value: number): string;
//#endregion
export { convertNumber2PX, customWrapperCache, extend, getComponentsAlias, incrementId, isComment, isElement, isHasExtractProp, isParentBinded, isText, shortcutAttr };
//# sourceMappingURL=index.d.ts.map