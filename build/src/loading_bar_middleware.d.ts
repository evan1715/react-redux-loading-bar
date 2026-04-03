import type { Dispatch } from 'redux';
export interface MiddlewareConfig {
    promiseTypeSuffixes?: string[];
    scope?: string;
}
export default function loadingBarMiddleware(config?: MiddlewareConfig): ({ dispatch }: {
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: unknown) => unknown;
//# sourceMappingURL=loading_bar_middleware.d.ts.map