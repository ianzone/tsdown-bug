import { TaroNode } from "../../dom/node.js";

//#region src/dom-external/mutation-observer/record.d.ts

/**
 * A MutationRecord represents an individual DOM mutation.
 * It is the object that is passed to MutationObserver's callback.
 * @see https://dom.spec.whatwg.org/#interface-mutationrecord
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord
*/
interface MutationRecord {
  readonly target: TaroNode;
  readonly addedNodes?: TaroNode[];
  readonly removedNodes?: TaroNode[];
  readonly previousSibling?: TaroNode | null;
  readonly nextSibling?: TaroNode | null;
  readonly attributeName?: string | null;
  readonly attributeNamespace?: string | null;
  oldValue?: string | null;
  readonly type: MutationRecordType;
  readonly value?: string | null;
}
declare const enum MutationRecordType {
  ATTRIBUTES = "attributes",
  CHARACTER_DATA = "characterData",
  CHILD_LIST = "childList",
}
//#endregion
export { MutationRecord, MutationRecordType };
//# sourceMappingURL=record.d.ts.map