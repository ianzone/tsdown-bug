import { TaroNode } from "../../dom/node.js";
import { MutationRecord } from "./record.js";

//#region src/dom-external/mutation-observer/implements.d.ts
type MutationCallback = (mutations: MutationRecord[]) => any;
/**
 * @see https://dom.spec.whatwg.org/#dictdef-mutationobserverinit
 */
interface MutationObserverInit {
  attributeFilter?: string[];
  attributeOldValue?: boolean;
  attributes?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
  childList?: boolean;
  subtree?: boolean;
}
/**
 * The MutationObserver provides the ability
 * to watch for changes being made to the DOM tree.
 * It will invoke a specified callback function
 * when DOM changes occur.
 * @see https://dom.spec.whatwg.org/#mutationobserver
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */
declare class MutationObserverImpl {
  callback: MutationCallback;
  target: TaroNode | null;
  options: MutationObserverInit;
  records: MutationRecord[];
  constructor(callback: MutationCallback);
  /**
   * Configures the MutationObserver
   * to begin receiving notifications
   * through its callback function
   * when DOM changes matching the given options occur.
   *
   * Options matching is to be implemented.
   */
  observe(target: TaroNode, options?: MutationObserverInit): void;
  /**
   * Stop the MutationObserver instance
   * from receiving further notifications
   * until and unless observe() is called again.
   */
  disconnect(): void;
  /**
   * Removes all pending notifications
   * from the MutationObserver's notification queue
   * and returns them in a new Array of MutationRecord objects.
   */
  takeRecords(): MutationRecord[];
}
declare function recordMutation(record: MutationRecord): void;
//#endregion
export { MutationCallback, MutationObserverImpl, MutationObserverInit };
//# sourceMappingURL=implements.d.ts.map