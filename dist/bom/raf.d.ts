//#region src/bom/raf.d.ts
declare let now: () => number;
declare const _raf: typeof requestAnimationFrame | ((callback: any) => NodeJS.Timeout);
declare const _caf: typeof cancelAnimationFrame;
//#endregion
export { _caf, _raf, now };
//# sourceMappingURL=raf.d.ts.map