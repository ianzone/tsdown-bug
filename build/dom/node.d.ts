import { TaroEventTarget } from "./event-target.js";
import { NodeType } from "../node_types-9ac5b4dd.js";
import { TFunc, UpdatePayload } from "../index-26658829.js";
import { TaroDocument } from "./document.js";
import { TaroElement } from "./element.js";
import { TaroRootElement } from "./root.js";
interface RemoveChildOptions {
    cleanRef?: boolean;
    doUpdate?: boolean;
}
declare class TaroNode extends TaroEventTarget {
    uid: string;
    sid: string;
    nodeType: NodeType;
    nodeName: string;
    parentNode: TaroNode | null;
    childNodes: TaroNode[];
    constructor();
    private hydrate;
    private updateChildNodes;
    private updateSingleChild;
    get _root(): TaroRootElement | null;
    protected findIndex(refChild: TaroNode): number;
    get _path(): string;
    get nextSibling(): TaroNode | null;
    get previousSibling(): TaroNode | null;
    get parentElement(): TaroElement | null;
    get firstChild(): TaroNode | null;
    get lastChild(): TaroNode | null;
    /**
     * @textContent 目前只能置空子元素
     * @TODO 等待完整 innerHTML 实现
     */
    set textContent(text: string);
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
     * @scenario
     * [A,B,C]
     *   1. insert D before C, D has no parent
     *   2. insert D before C, D has the same parent of C
     *   3. insert D before C, D has the different parent of C
     */
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
     * @scenario
     * [A,B,C]
     *   1. insert D before C, D has no parent
     *   2. insert D before C, D has the same parent of C
     *   3. insert D before C, D has the different parent of C
     */
    insertBefore<T extends TaroNode>(newChild: T, refChild?: TaroNode | null, isReplace?: boolean): T;
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
     * @scenario
     * [A,B,C]
     *   1. append C, C has no parent
     *   2. append C, C has the same parent of B
     *   3. append C, C has the different parent of B
     */
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
     * @scenario
     * [A,B,C]
     *   1. append C, C has no parent
     *   2. append C, C has the same parent of B
     *   3. append C, C has the different parent of B
     */
    appendChild(newChild: TaroNode): TaroNode;
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
     * @scenario
     * [A,B,C]
     *   1. replace B with C, C has no parent
     *   2. replace B with C, C has no parent, C has the same parent of B
     *   3. replace B with C, C has no parent, C has the different parent of B
     */
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
     * @scenario
     * [A,B,C]
     *   1. replace B with C, C has no parent
     *   2. replace B with C, C has no parent, C has the same parent of B
     *   3. replace B with C, C has no parent, C has the different parent of B
     */
    replaceChild(newChild: TaroNode, oldChild: TaroNode): TaroNode | undefined;
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
     * @scenario
     * [A,B,C]
     *   1. remove A or B
     *   2. remove C
     */
    /**
     * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
     * @scenario
     * [A,B,C]
     *   1. remove A or B
     *   2. remove C
     */
    removeChild<T extends TaroNode>(child: T, options?: RemoveChildOptions): T;
    remove(options?: RemoveChildOptions): void;
    hasChildNodes(): boolean;
    enqueueUpdate(payload: UpdatePayload): void;
    get ownerDocument(): TaroDocument;
    static extend(methodName: string, options: TFunc | Record<string, any>): void;
}
export { TaroNode };
