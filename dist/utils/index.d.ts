import { TFunc } from "../interface/utils.js";
import { TaroText$1 as TaroText } from "../dom/text.js";
import { TaroNode$1 as TaroNode } from "../dom/node.js";
import { TaroElement$1 as TaroElement } from "../dom/element.js";
import { debounce$1 as debounce, throttle$1 as throttle } from "./lodash.js";
import { addLeadingSlash$1 as addLeadingSlash, getCurrentPage$1 as getCurrentPage, getHomePage$1 as getHomePage, hasBasename$1 as hasBasename, stripBasename$1 as stripBasename, stripSuffix$1 as stripSuffix, stripTrailing$1 as stripTrailing } from "./router.js";

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
export { convertNumber2PX as convertNumber2PX$1, customWrapperCache as customWrapperCache$1, extend as extend$1, getComponentsAlias as getComponentsAlias$1, incrementId as incrementId$1, isComment as isComment$1, isElement as isElement$1, isHasExtractProp as isHasExtractProp$1, isParentBinded as isParentBinded$1, isText as isText$1, shortcutAttr as shortcutAttr$1 };
//# sourceMappingURL=index.d.ts.map