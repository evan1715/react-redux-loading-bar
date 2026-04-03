import type { Dispatch, UnknownAction } from 'redux';

import { DEFAULT_SCOPE, hideLoading, showLoading } from './loading_bar_ducks.ts';

const defaultTypeSuffixes = ['PENDING', 'FULFILLED', 'REJECTED'];

export interface MiddlewareConfig {
    promiseTypeSuffixes?: string[];
    scope?: string;
}

interface MiddlewareAction extends UnknownAction {
    type: string;
    meta?: { scope?: string };
    scope?: string;
}

export default function loadingBarMiddleware(config: MiddlewareConfig = {}) {
    const promiseTypeSuffixes = config.promiseTypeSuffixes ?? defaultTypeSuffixes;
    const scope = config.scope ?? DEFAULT_SCOPE;

    return ({ dispatch }: { dispatch: Dispatch }) =>
        (next: Dispatch) =>
        (action: unknown): unknown => {
            const typedAction = action as MiddlewareAction;
            if (typedAction.type) {
                const [PENDING, FULFILLED, REJECTED] = promiseTypeSuffixes;

                const isPending = new RegExp(`${PENDING}$`, 'g');
                const isFulfilled = new RegExp(`${FULFILLED}$`, 'g');
                const isRejected = new RegExp(`${REJECTED}$`, 'g');

                const actionScope =
                    typedAction.meta?.scope ?? typedAction.scope ?? scope;

                if (isPending.test(typedAction.type)) {
                    dispatch(showLoading(actionScope));
                } else if (isFulfilled.test(typedAction.type) || isRejected.test(typedAction.type)) {
                    dispatch(hideLoading(actionScope));
                }
            }

            return next(action as UnknownAction);
        };
}
