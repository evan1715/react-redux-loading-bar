import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_SCOPE,
    HIDE,
    RESET,
    SHOW,
    hideLoading,
    loadingBarReducer,
    resetLoading,
    showLoading,
} from '../src/loading_bar_ducks.js';

describe('loadingBarReducer', () => {
    it('returns the initial state', () => {
        assert.deepStrictEqual(loadingBarReducer(undefined, {}), {});
    });

    it('handles SHOW', () => {
        assert.deepStrictEqual(loadingBarReducer(undefined, { type: SHOW }), { [DEFAULT_SCOPE]: 1 });

        assert.deepStrictEqual(loadingBarReducer({ [DEFAULT_SCOPE]: 0 }, { type: SHOW }), {
            [DEFAULT_SCOPE]: 1,
        });

        assert.deepStrictEqual(loadingBarReducer({ [DEFAULT_SCOPE]: 1 }, { type: SHOW }), {
            [DEFAULT_SCOPE]: 2,
        });
    });

    it('handles HIDE', () => {
        assert.deepStrictEqual(loadingBarReducer({ [DEFAULT_SCOPE]: 1 }, { type: HIDE }), {
            [DEFAULT_SCOPE]: 0,
        });

        assert.deepStrictEqual(loadingBarReducer(undefined, { type: HIDE }), { [DEFAULT_SCOPE]: 0 });

        assert.deepStrictEqual(loadingBarReducer({ [DEFAULT_SCOPE]: 0 }, { type: HIDE }), {
            [DEFAULT_SCOPE]: 0,
        });
    });

    it('handles RESET', () => {
        assert.deepStrictEqual(loadingBarReducer({ [DEFAULT_SCOPE]: 1 }, { type: RESET }), {
            [DEFAULT_SCOPE]: 0,
        });

        assert.deepStrictEqual(loadingBarReducer(undefined, { type: RESET }), { [DEFAULT_SCOPE]: 0 });

        assert.deepStrictEqual(loadingBarReducer({ [DEFAULT_SCOPE]: 10 }, { type: RESET }), {
            [DEFAULT_SCOPE]: 0,
        });
    });
});

describe('actions', () => {
    it('creates an action to show loading bar', () => {
        assert.deepStrictEqual(showLoading(), { type: SHOW, payload: { scope: DEFAULT_SCOPE } });
    });

    it('creates an action to show a custom loading bar', () => {
        assert.deepStrictEqual(showLoading('someScope'), { type: SHOW, payload: { scope: 'someScope' } });
    });

    it('creates an action to hide loading bar', () => {
        assert.deepStrictEqual(hideLoading(), { type: HIDE, payload: { scope: DEFAULT_SCOPE } });
    });

    it('creates an action to hide a custom loading bar', () => {
        assert.deepStrictEqual(hideLoading('someScope'), { type: HIDE, payload: { scope: 'someScope' } });
    });

    it('creates an action to reset loading bar', () => {
        assert.deepStrictEqual(resetLoading(), { type: RESET, payload: { scope: DEFAULT_SCOPE } });
    });

    it('creates an action to reset a custom loading bar', () => {
        assert.deepStrictEqual(resetLoading('someScope'), {
            type: RESET,
            payload: { scope: 'someScope' },
        });
    });
});
