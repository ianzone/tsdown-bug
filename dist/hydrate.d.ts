import { MiniData } from "./interface/hydrate.js";
import { TaroText } from "./dom/text.js";
import { TaroElement } from "./dom/element.js";

//#region src/hydrate.d.ts

/**
 * React also has a fancy function's name for this: `hydrate()`.
 * You may have been heard `hydrate` as a SSR-related function,
 * actually, `hydrate` basicly do the `render()` thing, but ignore some properties,
 * it's a vnode traverser and modifier: that's exactly what Taro's doing in here.
 */
declare function hydrate(node: TaroElement | TaroText): MiniData;
//#endregion
export { hydrate };
//# sourceMappingURL=hydrate.d.ts.map