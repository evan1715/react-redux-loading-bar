import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { Dispatch, UnknownAction } from 'redux';

import loadingBarMiddleware from '../src/loading_bar_middleware.ts';
import { hideLoading, showLoading } from '../src/loading_bar_ducks.ts';

interface MockStoreAPI {
    getState(): void;
    dispatch: (action: unknown) => unknown;
}

function createMockStore(
    middlewares: ReturnType<typeof loadingBarMiddleware>[],
    mockDispatch: (action: unknown) => unknown,
): MockStoreAPI {
    const store = {
        getState() {},
        dispatch: mockDispatch,
    };

    let next: (action: unknown) => unknown = mockDispatch;
    const chain = middlewares.map((mw) => mw(store));
    for (let i = chain.length - 1; i >= 0; i--) {
        const middleware = chain[i];
        assert.ok(middleware, `middleware at index ${i} should exist`);
        next = middleware(next);
    }

    return { ...store, dispatch: next };
}

describe('loadingBarMiddleware', () => {
    const mockStore = (mockDispatch: (action: unknown) => unknown): MockStoreAPI =>
        createMockStore([loadingBarMiddleware()], mockDispatch);

    it('returns a function to handle next', () => {
        const noopDispatch: Dispatch = <T extends UnknownAction>(action: T): T => action;
        const storeAPI = { getState() {}, dispatch: noopDispatch };
        const nextHandler = loadingBarMiddleware()(storeAPI);
        assert.strictEqual(typeof nextHandler, 'function');
    });

    describe('with an action containing "_PENDING" in type', () => {
        it('dispatches SHOW action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_PENDING' };
            const expectedActions: UnknownAction[] = [showLoading(), originalAction];

            const store = mockStore((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an action containing "_FULFILLED" in type', () => {
        it('dispatches HIDE action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_FULFILLED' };
            const expectedActions: UnknownAction[] = [hideLoading(), originalAction];

            const store = mockStore((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an action containing "_REJECTED" in type', () => {
        it('dispatches HIDE action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_REJECTED' };
            const expectedActions: UnknownAction[] = [hideLoading(), originalAction];

            const store = mockStore((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an action not containing promise suffixes in type', () => {
        it('does not dispatch SHOW and HIDE actions', () => {
            const originalAction: UnknownAction = { type: 'something/RANDOM' };
            const expectedActions: UnknownAction[] = [originalAction];

            const store = mockStore((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an async action', () => {
        it('does not dispatch SHOW and HIDE actions', () => {
            const originalAction: UnknownAction = Object.assign(() => {}, { type: '@@thunk' });
            const expectedActions: unknown[] = [originalAction];

            const store = mockStore((action) => {
                const expectedAction = expectedActions.shift();
                assert.strictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with custom promiseTypeSuffixes', () => {
        const mockStoreWithSuffixes = (mockDispatch: (action: unknown) => unknown): MockStoreAPI =>
            createMockStore(
                [loadingBarMiddleware({ promiseTypeSuffixes: ['LOAD', 'SUCCESS', 'FAIL'] })],
                mockDispatch
            );

        it('does not dispatch SHOW and HIDE actions on _FULFILLED action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_PENDING' };
            const expectedActions: UnknownAction[] = [originalAction];

            const store = mockStoreWithSuffixes((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('dispatches SHOW action on _LOAD action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_LOAD' };
            const expectedActions: UnknownAction[] = [showLoading(), originalAction];

            const store = mockStoreWithSuffixes((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('dispatches HIDE action on _SUCCESS action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_SUCCESS' };
            const expectedActions: UnknownAction[] = [hideLoading(), originalAction];

            const store = mockStoreWithSuffixes((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('dispatches HIDE action on _FAIL action', () => {
            const originalAction: UnknownAction = { type: 'something/FETCH_FAIL' };
            const expectedActions: UnknownAction[] = [hideLoading(), originalAction];

            const store = mockStoreWithSuffixes((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('does not dispatch SHOW action on FOO_LOADED action', () => {
            const originalAction: UnknownAction = { type: 'something/FOO_LOADED' };
            const expectedActions: UnknownAction[] = [originalAction];

            const store = mockStoreWithSuffixes((action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            });

            store.dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with custom scope', () => {
        const CUSTOM_SCOPE = 'someScope';
        const mockStoreWithCustomScope = (mockDispatch: (action: unknown) => unknown): MockStoreAPI =>
            createMockStore([loadingBarMiddleware({ scope: CUSTOM_SCOPE })], mockDispatch);

        describe('with an action containing "_PENDING" in type', () => {
            it('dispatches SHOW action', () => {
                const originalAction: UnknownAction = { type: 'something/FETCH_PENDING' };
                const expectedActions: UnknownAction[] = [showLoading(CUSTOM_SCOPE), originalAction];

                const store = mockStoreWithCustomScope((action) => {
                    const expectedAction = expectedActions.shift();
                    assert.deepStrictEqual(action, expectedAction);
                    return action;
                });

                store.dispatch(originalAction);
                assert.strictEqual(expectedActions.length, 0);
            });
        });

        describe('with an action containing "_FULFILLED" in type', () => {
            it('dispatches HIDE action', () => {
                const originalAction: UnknownAction = { type: 'something/FETCH_FULFILLED' };
                const expectedActions: UnknownAction[] = [hideLoading(CUSTOM_SCOPE), originalAction];

                const store = mockStoreWithCustomScope((action) => {
                    const expectedAction = expectedActions.shift();
                    assert.deepStrictEqual(action, expectedAction);
                    return action;
                });

                store.dispatch(originalAction);
                assert.strictEqual(expectedActions.length, 0);
            });
        });

        describe('with an action containing "_REJECTED" in type', () => {
            it('dispatches HIDE action', () => {
                const originalAction: UnknownAction = { type: 'something/FETCH_REJECTED' };
                const expectedActions: UnknownAction[] = [hideLoading(CUSTOM_SCOPE), originalAction];

                const store = mockStoreWithCustomScope((action) => {
                    const expectedAction = expectedActions.shift();
                    assert.deepStrictEqual(action, expectedAction);
                    return action;
                });

                store.dispatch(originalAction);
                assert.strictEqual(expectedActions.length, 0);
            });
        });
    });
});
