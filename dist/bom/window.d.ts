import { TaroDocument } from "../dom/document.js";
import { TGetComputedStyle } from "./getComputedStyle.js";
import { Events } from "../emitter/emitter.js";
import { TaroLocation } from "./location.js";
import { TaroHistory } from "./history.js";

//#region src/bom/window.d.ts
declare class TaroWindow extends Events {
  navigator: Navigator;
  requestAnimationFrame: typeof requestAnimationFrame | ((callback: any) => NodeJS.Timeout);
  cancelAnimationFrame: typeof cancelAnimationFrame;
  getComputedStyle: TGetComputedStyle;
  Date: DateConstructor;
  location: TaroLocation;
  history: TaroHistory;
  XMLHttpRequest?: Partial<XMLHttpRequest>;
  constructor();
  initEvent(): void;
  get document(): TaroDocument;
  addEventListener(event: string, callback: (arg: any) => void): void;
  removeEventListener(event: string, callback: (arg: any) => void): void;
  setTimeout(...args: Parameters<typeof setTimeout>): NodeJS.Timeout;
  clearTimeout(...args: Parameters<typeof clearTimeout>): void;
}
declare const taroWindowProvider: TaroWindow;
declare const taroLocationProvider: TaroLocation;
declare const taroHistoryProvider: TaroHistory;
//#endregion
export { taroHistoryProvider, taroLocationProvider, taroWindowProvider };
//# sourceMappingURL=window.d.ts.map