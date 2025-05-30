import { TaroNode } from "../../dom/node.js";
import { MutationRecord, MutationRecordType } from "./record.js";
import { MutationCallback, MutationObserverImpl, MutationObserverInit } from "./implements.js";

//#region src/dom-external/mutation-observer/index.d.ts
declare class MutationObserver {
  core: Pick<MutationObserverImpl, 'observe' | 'disconnect' | 'takeRecords'>;
  constructor(callback: MutationCallback);
  observe(...args: [TaroNode, MutationObserverInit?]): void;
  disconnect(): void;
  takeRecords(): MutationRecord[];
  static record(record: MutationRecord): void;
}
//#endregion
export { MutationObserver };
//# sourceMappingURL=index.d.ts.map