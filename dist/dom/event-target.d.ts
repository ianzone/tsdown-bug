import { AddEventListenerOptions, EventHandler } from "../interface/event-target.js";

//#region src/dom/event-target.d.ts
declare class TaroEventTarget {
  __handlers: Record<string, EventHandler[]>;
  addEventListener(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, handler: EventHandler): void;
  isAnyEventBinded(): boolean;
  isOnlyClickBinded(): boolean;
}

//#endregion
export { TaroEventTarget as TaroEventTarget$1 };
//# sourceMappingURL=event-target.d.ts.map