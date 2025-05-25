import { HydratedData } from "./hydrate.js";

//#region src/interface/node.d.ts
type UpdatePayloadValue = string | boolean | HydratedData;
type DataTree = Record<string, UpdatePayloadValue | ReturnType<HydratedData>>;
interface UpdatePayload {
  path: string;
  value: UpdatePayloadValue;
}

//#endregion
export { DataTree, UpdatePayload, UpdatePayloadValue };
//# sourceMappingURL=node.d.ts.map