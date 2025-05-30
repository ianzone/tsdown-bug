//#region src/interface/event-target.d.ts
interface EventListenerOptions {
  capture?: boolean;
}
interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}
interface EventHandler<T = any, R = void> {
  (...args: T[]): R;
  _stop?: boolean;
}
//#endregion
export { AddEventListenerOptions, EventHandler, EventListenerOptions };
//# sourceMappingURL=event-target.d.ts.map