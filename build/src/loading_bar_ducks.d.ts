import type { UnknownAction } from 'redux';
export declare const SHOW: "loading-bar/SHOW";
export declare const HIDE: "loading-bar/HIDE";
export declare const RESET: "loading-bar/RESET";
export declare const DEFAULT_SCOPE = "default";
export interface LoadingBarAction extends UnknownAction {
    type: typeof SHOW | typeof HIDE | typeof RESET;
    payload: {
        scope: string;
    };
}
export interface LoadingBarState {
    [scope: string]: number;
}
export declare function showLoading(scope?: string): LoadingBarAction;
export declare function hideLoading(scope?: string): LoadingBarAction;
export declare function resetLoading(scope?: string): LoadingBarAction;
interface ReducerAction {
    type?: string;
    payload?: {
        scope?: string;
    };
}
export declare function loadingBarReducer(state?: LoadingBarState, action?: ReducerAction): LoadingBarState;
export {};
//# sourceMappingURL=loading_bar_ducks.d.ts.map