//#region src/utils/router.d.ts
declare const addLeadingSlash: (url?: string) => string;
declare const hasBasename: (path?: string, prefix?: string) => boolean;
declare const stripBasename: (path?: string, prefix?: string) => string;
declare const stripTrailing: (str?: string) => string;
declare const stripSuffix: (path?: string, suffix?: string) => string;
declare const getHomePage: (path?: string, basename?: string, customRoutes?: Record<string, string | string[]>, entryPagePath?: string) => string;
declare const getCurrentPage: (routerMode?: string, basename?: string) => string;
//#endregion
export { addLeadingSlash, getCurrentPage, getHomePage, hasBasename, stripBasename, stripSuffix, stripTrailing };
//# sourceMappingURL=router.d.ts.map