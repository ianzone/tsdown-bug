//#region src/perf.d.ts
declare class Performance {
  #private;
  private recorder;
  start(id: string): void;
  stop(id: string, now?: number): void;
  delayStop(id: string, delay?: number): ((...args: any[]) => void) | undefined;
}
declare const perf: Performance; //#endregion
export { perf as perf$1 };
//# sourceMappingURL=perf.d.ts.map