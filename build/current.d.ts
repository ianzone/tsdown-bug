import { AppInstance, PageInstance } from "./instance-530729bd.js";
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
export { Router, Current, getCurrentInstance };
