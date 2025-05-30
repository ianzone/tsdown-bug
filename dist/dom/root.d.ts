import { TFunc } from "../interface/utils.js";
import { MpInstance } from "../interface/hydrate.js";
import { UpdatePayload } from "../interface/node.js";
import { TaroElement } from "./element.js";

//#region src/dom/root.d.ts
declare class TaroRootElement extends TaroElement {
  private updatePayloads;
  private updateCallbacks;
  pendingUpdate: boolean;
  ctx: null | MpInstance;
  constructor();
  get _path(): string;
  get _root(): TaroRootElement;
  scheduleTask(fn: TFunc): void;
  enqueueUpdate(payload: UpdatePayload): void;
  performUpdate(initRender?: boolean, prerender?: TFunc): void;
  enqueueUpdateCallback(cb: TFunc, ctx?: Record<string, any>): void;
  flushUpdateCallback(): void;
}
//#endregion
export { TaroRootElement };
//# sourceMappingURL=root.d.ts.map