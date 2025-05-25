import { Style$1 as Style } from "../dom/style.js";
import { TaroElement$1 as TaroElement } from "../dom/element.js";

//#region src/bom/getComputedStyle.d.ts
type TGetComputedStyle = typeof window.getComputedStyle | ((el: TaroElement) => Style);
declare const taroGetComputedStyleProvider: TGetComputedStyle;

//#endregion
export { TGetComputedStyle, taroGetComputedStyleProvider as taroGetComputedStyleProvider$1 };
//# sourceMappingURL=getComputedStyle.d.ts.map