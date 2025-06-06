import { MpEvent } from "../interface/event.js";
import { TFunc } from "../interface/utils.js";
import { TaroElement } from "../dom/element.js";
import { Component } from "@vue/runtime-core";
import { Component as Component$1, ComponentClass } from "react";

//#region src/dsl/instance.d.ts
interface Instance<T = Record<string, any>> extends Component$1<T>, Show, PageInstance {
  tid?: string;
  node?: TaroElement;
  $forceUpdate?(): void;
  $nextTick?(cb: () => void): void;
  $options: Instance;
}
interface PageProps {
  tid?: string;
}
interface ReactPageComponent<T = PageProps> extends ComponentClass<T>, PageInstance {}
interface ReactPageInstance<T = PageProps> extends Component$1<T>, PageInstance {
  componentDidShow?(): void;
  componentDidHide?(): void;
}
interface ReactAppInstance<T = AppInstance> extends Component$1<T>, AppInstance {}
interface PageLifeCycle extends Show {
  eh?(event: MpEvent): void;
  onAddToFavorites?(): void;
  onLoad?(options: Record<string, unknown>, cb?: TFunc): void;
  onOptionMenuClick?(): void;
  onPageScroll?(obj: {
    scrollTop: number;
  }): void;
  onPullDownRefresh?(): void;
  onPullIntercept?(): void;
  onPopMenuClick?(): void;
  onReachBottom?(): void;
  onReady?(): void;
  onResize?(options: unknown): void;
  onSaveExitState?(): void;
  onShareAppMessage?(obj: {
    from: string;
    target?: TaroElement;
    webViewUrl: string;
  }): void;
  onShareTimeline?(): void;
  onTabItemTap?(obj: {
    index: string;
    pagePath: string;
    text: string;
  }): void;
  onTitleClick?(): void;
  onUnload?(): void;
}
interface PageInstance extends PageLifeCycle {
  /** 页面的初始数据 */
  data?: Record<string, unknown>;
  /** 页面路径 */
  path?: string;
  /** 页面的组件选项 */
  options?: Record<string, unknown>;
  /** 页面渲染引擎类型 */
  renderer?: 'webview' | 'skyline';
  /** 获得一个 EventChannel 对象，用于页面间通讯 */
  getOpenerEventChannel?(): Record<string, any>;
}
interface Show {
  componentDidShow?(): void;
  componentDidHide?(): void;
  onShow?(): void;
  onHide?(): void;
}
interface AppInstance extends Show {
  componentDidShow?(options?: Record<string, unknown>): void;
  mount?(component: React.ComponentClass | Component, id: string, cb: (...args: any[]) => void): void;
  mount?(component: React.ComponentClass | Component, id: string, getCtx: (...args: any[]) => void, cb: (...args: any[]) => void): void;
  onError?(error: string): void;
  onLaunch?(options?: Record<string, unknown>): void;
  onPageNotFound?(res: any): void;
  onUnhandledRejection?(error: any): void;
  onShow?(options?: Record<string, unknown>): void;
  onHide?(options?: Record<string, unknown>): void;
  unmount?(id: string, cb?: () => void): void;
  taroGlobalData?: Record<any, any>;
  config?: Record<any, any>;
}
//#endregion
export { AppInstance, Instance, PageInstance, PageLifeCycle, PageProps, ReactAppInstance, ReactPageComponent, ReactPageInstance };
//# sourceMappingURL=instance.d.ts.map