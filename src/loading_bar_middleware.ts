import type { Middleware } from 'redux';

import { DEFAULT_SCOPE, hideLoading, showLoading } from './loading_bar_ducks.ts';

const defaultTypeSuffixes = ['PENDING', 'FULFILLED', 'REJECTED'];

export interface MiddlewareConfig {
    promiseTypeSuffixes?: string[];
    scope?: string;
}

interface ActionWithType {
    type: string;
    meta?: { scope?: string };
    scope?: string;
}

function isActionWithType(action: unknown): action is ActionWithType {
    return typeof action === 'object' && action !== null && 'type' in action && typeof action.type === 'string';
}

export default function loadingBarMiddleware(config: MiddlewareConfig = {}): Middleware {
    const promiseTypeSuffixes = config.promiseTypeSuffixes ?? defaultTypeSuffixes;
    const scope = config.scope ?? DEFAULT_SCOPE;

    return ({ dispatch }) =>
        (next) =>
        (action) => {
            if (isActionWithType(action)) {
                const [PENDING, FULFILLED, REJECTED] = promiseTypeSuffixes;

                const isPending = new RegExp(`${PENDING}$`, 'g');
                const isFulfilled = new RegExp(`${FULFILLED}$`, 'g');
                const isRejected = new RegExp(`${REJECTED}$`, 'g');

                const actionScope =
                    action.meta?.scope ?? action.scope ?? scope;

                if (isPending.test(action.type)) {
                    dispatch(showLoading(actionScope));
                } else if (isFulfilled.test(action.type) || isRejected.test(action.type)) {
                    dispatch(hideLoading(actionScope));
                }
            }

            return next(action);
        };
}
