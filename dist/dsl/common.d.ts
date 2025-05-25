import { PageConfig } from "../interface/utils.js";
import { Instance, PageInstance, PageProps } from "./instance.js";

//#region src/dsl/common.d.ts
declare function injectPageInstance(inst: Instance<PageProps>, id: string): void;
declare function getPageInstance(id: string): Instance | undefined;
declare function removePageInstance(id: string): void;
declare function safeExecute(path: string, lifecycle: string, ...args: unknown[]): any;
declare function stringify(obj?: Record<string, unknown>): string;
declare function getPath(id: string, options?: Record<string, unknown>): string;
declare function getOnReadyEventKey(path: string): string;
declare function getOnShowEventKey(path: string): string;
declare function getOnHideEventKey(path: string): string;
declare function createPageConfig(component: any, pageName?: string, data?: Record<string, unknown>, pageConfig?: PageConfig): PageInstance;
declare function createComponentConfig(component: React.ComponentClass, componentName?: string, data?: Record<string, unknown>): any;
declare function createRecursiveComponentConfig(componentName?: string): any;

//#endregion
export { createComponentConfig as createComponentConfig$1, createPageConfig as createPageConfig$1, createRecursiveComponentConfig as createRecursiveComponentConfig$1, getOnHideEventKey as getOnHideEventKey$1, getOnReadyEventKey as getOnReadyEventKey$1, getOnShowEventKey as getOnShowEventKey$1, getPageInstance as getPageInstance$1, getPath as getPath$1, injectPageInstance as injectPageInstance$1, removePageInstance as removePageInstance$1, safeExecute as safeExecute$1, stringify as stringify$1 };
//# sourceMappingURL=common.d.ts.map