//#region src/utils/router.d.ts
declare const addLeadingSlash: (url?: string) => string;
declare const hasBasename: (path?: string, prefix?: string) => boolean;
declare const stripBasename: (path?: string, prefix?: string) => string;
declare const stripTrailing: (str?: string) => string;
declare const stripSuffix: (path?: string, suffix?: string) => string;
declare const getHomePage: (path?: string, basename?: string, customRoutes?: Record<string, string | string[]>, entryPagePath?: string) => string;
declare const getCurrentPage: (routerMode?: string, basename?: string) => string;

//#endregion
export { addLeadingSlash as addLeadingSlash$1, getCurrentPage as getCurrentPage$1, getHomePage as getHomePage$1, hasBasename as hasBasename$1, stripBasename as stripBasename$1, stripSuffix as stripSuffix$1, stripTrailing as stripTrailing$1 };
//# sourceMappingURL=router.d.ts.map