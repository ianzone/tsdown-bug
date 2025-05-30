import { Style } from "../dom/style.js";
import { TaroElement } from "../dom/element.js";

//#region src/bom/getComputedStyle.d.ts
type TGetComputedStyle = typeof window.getComputedStyle | ((el: TaroElement) => Style);
declare const taroGetComputedStyleProvider: TGetComputedStyle;
//#endregion
export { TGetComputedStyle, taroGetComputedStyleProvider };
//# sourceMappingURL=getComputedStyle.d.ts.map