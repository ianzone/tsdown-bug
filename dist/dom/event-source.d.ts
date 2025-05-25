import { TaroNode$1 as TaroNode } from "./node.js";

//#region src/dom/event-source.d.ts
interface IEventSource extends Map<string | undefined | null, TaroNode> {
  removeNode(child: TaroNode): void;
  removeNodeTree(child: TaroNode): void;
}
declare const eventSource: IEventSource;

//#endregion
export { eventSource as eventSource$1 };
//# sourceMappingURL=event-source.d.ts.map