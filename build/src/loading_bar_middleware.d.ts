import type { Middleware } from 'redux';
export interface MiddlewareConfig {
    promiseTypeSuffixes?: string[];
    scope?: string;
}
export default function loadingBarMiddleware(config?: MiddlewareConfig): Middleware;
//# sourceMappingURL=loading_bar_middleware.d.ts.map