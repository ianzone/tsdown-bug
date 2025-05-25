//#region src/bom/raf.d.ts
declare let now: () => number;
declare const _raf: typeof requestAnimationFrame | ((callback: any) => NodeJS.Timeout);
declare const _caf: typeof cancelAnimationFrame;

//#endregion
export { _caf as _caf$1, _raf as _raf$1, now as now$1 };
//# sourceMappingURL=raf.d.ts.map