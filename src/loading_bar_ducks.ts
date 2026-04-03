import type { UnknownAction } from 'redux';

export const SHOW = 'loading-bar/SHOW' as const;
export const HIDE = 'loading-bar/HIDE' as const;
export const RESET = 'loading-bar/RESET' as const;

export const DEFAULT_SCOPE = 'default';

export interface LoadingBarAction extends UnknownAction {
    type: typeof SHOW | typeof HIDE | typeof RESET;
    payload: { scope: string };
}

export interface LoadingBarState {
    [scope: string]: number;
}

export function showLoading(scope: string = DEFAULT_SCOPE): LoadingBarAction {
    return {
        type: SHOW,
        payload: { scope },
    };
}

export function hideLoading(scope: string = DEFAULT_SCOPE): LoadingBarAction {
    return {
        type: HIDE,
        payload: { scope },
    };
}

export function resetLoading(scope: string = DEFAULT_SCOPE): LoadingBarAction {
    return {
        type: RESET,
        payload: { scope },
    };
}

interface ReducerAction {
    type?: string;
    payload?: { scope?: string };
}

export function loadingBarReducer(
    state: LoadingBarState = {},
    action: ReducerAction = {},
): LoadingBarState {
    const { scope = DEFAULT_SCOPE } = action.payload ?? {};

    switch (action.type) {
        case SHOW:
            return {
                ...state,
                [scope]: (state[scope] ?? 0) + 1,
            };
        case HIDE:
            return {
                ...state,
                [scope]: Math.max(0, (state[scope] ?? 1) - 1),
            };
        case RESET:
            return {
                ...state,
                [scope]: 0,
            };
        default:
            return state;
    }
}
