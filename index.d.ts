import { CSSProperties, FunctionComponent } from 'react';
import { Action, Middleware, Reducer } from 'redux';

export const DEFAULT_SCOPE: string;
export const HIDE: string;
export const SHOW: string;
export const RESET: string;

export interface LoadingBarContainerProps {
    className?: string;
    direction?: string;
    maxProgress?: number;
    progressIncrease?: number;
    scope?: string;
    showFastActions?: boolean;
    style?: CSSProperties;
    updateTime?: number;
}

export interface LoadingBarProps extends LoadingBarContainerProps {
    loading?: number;
}

export const LoadingBar: FunctionComponent<LoadingBarProps>;
declare const ConnectedLoadingBar: FunctionComponent<LoadingBarContainerProps>;
export default ConnectedLoadingBar;

export const ImmutableLoadingBar: FunctionComponent<LoadingBarContainerProps>;

export interface MiddlewareConfig {
    scope?: string;
    promiseTypeSuffixes?: string[];
}
export function loadingBarMiddleware(config?: MiddlewareConfig): Middleware;

export const loadingBarReducer: Reducer<any>;
export function showLoading(scope?: string): Action;
export function hideLoading(scope?: string): Action;
export function resetLoading(scope?: string): Action;
