import { Events$1 as Events } from "../emitter/emitter.js";
import { RuntimeCache$1 as RuntimeCache } from "../utils/cache.js";
import { TaroLocation } from "./location.js";

//#region src/bom/history.d.ts
interface HistoryState {
  state: Record<string, any> | null;
  title: string;
  url: string;
}
type Options = {
  window: any;
};
type HistoryContext = {
  location: TaroLocation;
  stack: HistoryState[];
  cur: number;
};
declare class TaroHistory extends Events {
  #private;
  constructor(location: TaroLocation, options: Options);
  get length(): number;
  get state(): Record<string, any> | null;
  go(delta: number): void;
  back(): void;
  forward(): void;
  pushState(state: any, title: string, url: string): void;
  replaceState(state: any, title: string, url: string): void;
  get cache(): RuntimeCache<HistoryContext>;
}
declare const History: typeof TaroHistory; //#endregion
export { History as History$1, TaroHistory };
//# sourceMappingURL=history.d.ts.map