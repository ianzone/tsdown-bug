import { AppInstance, PageInstance } from "./dsl/instance.js";

//#region src/current.d.ts
interface Router {
  params: Record<string, unknown>;
  path: string;
  $taroPath: string;
  onReady: string;
  onHide: string;
  onShow: string;
  exitState?: any;
}
interface Current {
  app: AppInstance | null;
  router: Router | null;
  page: PageInstance | null;
  preloadData?: any;
}
declare const Current: Current;
declare const getCurrentInstance: () => Current;
//#endregion
export { Current, getCurrentInstance };
//# sourceMappingURL=current.d.ts.map