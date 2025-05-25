import { PageConfig } from "./utils.js";
import { Shortcuts } from "@tarojs/shared";

//#region src/interface/hydrate.d.ts
interface MpInstance {
  config: PageConfig;
  setData: (data: unknown, cb: () => void) => void;
  route?: string;
  __route__: string;
  $taroParams?: Record<string, unknown>;
  $taroPath: string;
  __data__: any;
  data: any;
  exitState?: any;
  selectComponent: (selector: string) => any;
}
interface MiniElementData {
  [Shortcuts.Childnodes]?: MiniData[];
  [Shortcuts.NodeName]: string;
  [Shortcuts.Class]?: string;
  [Shortcuts.Style]?: string;
  uid?: string;
  sid: string;
  [key: string]: unknown;
}
interface MiniTextData {
  [Shortcuts.Text]: string;
  [Shortcuts.NodeName]: string;
}
type MiniData = MiniElementData | MiniTextData;
type HydratedData = () => MiniData | MiniData[];

//#endregion
export { HydratedData, MiniData, MiniElementData, MiniTextData, MpInstance };
//# sourceMappingURL=hydrate.d.ts.map