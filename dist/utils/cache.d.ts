//#region src/utils/cache.d.ts
/**
 * 一个小型缓存池，用于在切换页面时，存储一些上下文信息
 */
declare class RuntimeCache<T> {
  name: string;
  cache: Map<string, T>;
  constructor(name: string);
  has(identifier: string): boolean;
  set(identifier: string, ctx: T): void;
  get(identifier: string): T | undefined;
  delete(identifier: string): void;
}
//#endregion
export { RuntimeCache };
//# sourceMappingURL=cache.d.ts.map