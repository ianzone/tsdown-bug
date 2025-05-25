import { Events, hooks } from "@tarojs/shared";

//#region src/emitter/emitter.ts
const eventCenter = hooks.call("getEventCenter", Events);

//#endregion
export { Events, eventCenter };
//# sourceMappingURL=emitter.js.map