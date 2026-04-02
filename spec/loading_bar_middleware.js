import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import loadingBarMiddleware from '../src/loading_bar_middleware.js';
import { hideLoading, showLoading } from '../src/loading_bar_ducks.js';

function createMockStore(middlewares, mockDispatch) {
    const store = {
        getState() {},
        dispatch: mockDispatch,
    };

    let dispatch = mockDispatch;
    const chain = middlewares.map((mw) => mw(store));
    for (let i = chain.length - 1; i >= 0; i--) {
        dispatch = chain[i](dispatch);
    }

    return { ...store, dispatch };
}

describe('loadingBarMiddleware', () => {
    const mockStore = (mockDispatch) => createMockStore([loadingBarMiddleware()], mockDispatch);

    it('returns a function to handle next', () => {
        const mockDispatch = () => {};
        const nextHandler = loadingBarMiddleware()(mockDispatch);
        assert.strictEqual(typeof nextHandler, 'function');
    });

    describe('with an action containing "_PENDING" in type', () => {
        it('dispatches SHOW action', () => {
            const originalAction = { type: 'something/FETCH_PENDING' };
            const expectedActions = [showLoading(), originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStore(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an action containing "_FULFILLED" in type', () => {
        it('dispatches HIDE action', () => {
            const originalAction = { type: 'something/FETCH_FULFILLED' };
            const expectedActions = [hideLoading(), originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStore(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an action containing "_REJECTED" in type', () => {
        it('dispatches HIDE action', () => {
            const originalAction = { type: 'something/FETCH_REJECTED' };
            const expectedActions = [hideLoading(), originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStore(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an action not containing promise suffixes in type', () => {
        it('does not dispatch SHOW and HIDE actions', () => {
            const originalAction = { type: 'something/RANDOM' };
            const expectedActions = [originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStore(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with an async action', () => {
        it('does not dispatch SHOW and HIDE actions', () => {
            const originalAction = () => {};
            const expectedActions = [originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.strictEqual(action, expectedAction);
                return action;
            };

            mockStore(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with custom promiseTypeSuffixes', () => {
        const mockStoreWithSuffixes = (mockDispatch) =>
            createMockStore(
                [loadingBarMiddleware({ promiseTypeSuffixes: ['LOAD', 'SUCCESS', 'FAIL'] })],
                mockDispatch
            );

        it('does not dispatch SHOW and HIDE actions on _FULFILLED action', () => {
            const originalAction = { type: 'something/FETCH_PENDING' };
            const expectedActions = [originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStoreWithSuffixes(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('dispatches SHOW action on _LOAD action', () => {
            const originalAction = { type: 'something/FETCH_LOAD' };
            const expectedActions = [showLoading(), originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStoreWithSuffixes(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('dispatches HIDE action on _SUCCESS action', () => {
            const originalAction = { type: 'something/FETCH_SUCCESS' };
            const expectedActions = [hideLoading(), originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStoreWithSuffixes(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('dispatches HIDE action on _FAIL action', () => {
            const originalAction = { type: 'something/FETCH_FAIL' };
            const expectedActions = [hideLoading(), originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStoreWithSuffixes(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });

        it('does not dispatch SHOW action on FOO_LOADED action', () => {
            const originalAction = { type: 'something/FOO_LOADED' };
            const expectedActions = [originalAction];

            const mockDispatch = (action) => {
                const expectedAction = expectedActions.shift();
                assert.deepStrictEqual(action, expectedAction);
                return action;
            };

            mockStoreWithSuffixes(mockDispatch).dispatch(originalAction);
            assert.strictEqual(expectedActions.length, 0);
        });
    });

    describe('with custom scope', () => {
        const CUSTOM_SCOPE = 'someScope';
        const mockStoreWithCustomScope = (mockDispatch) =>
            createMockStore([loadingBarMiddleware({ scope: CUSTOM_SCOPE })], mockDispatch);

        describe('with an action containing "_PENDING" in type', () => {
            it('dispatches SHOW action', () => {
                const originalAction = { type: 'something/FETCH_PENDING' };
                const expectedActions = [showLoading(CUSTOM_SCOPE), originalAction];

                const mockDispatch = (action) => {
                    const expectedAction = expectedActions.shift();
                    assert.deepStrictEqual(action, expectedAction);
                    return action;
                };

                mockStoreWithCustomScope(mockDispatch).dispatch(originalAction);
                assert.strictEqual(expectedActions.length, 0);
            });
        });

        describe('with an action containing "_FULFILLED" in type', () => {
            it('dispatches HIDE action', () => {
                const originalAction = { type: 'something/FETCH_FULFILLED' };
                const expectedActions = [hideLoading(CUSTOM_SCOPE), originalAction];

                const mockDispatch = (action) => {
                    const expectedAction = expectedActions.shift();
                    assert.deepStrictEqual(action, expectedAction);
                    return action;
                };

                mockStoreWithCustomScope(mockDispatch).dispatch(originalAction);
                assert.strictEqual(expectedActions.length, 0);
            });
        });

        describe('with an action containing "_REJECTED" in type', () => {
            it('dispatches HIDE action', () => {
                const originalAction = { type: 'something/FETCH_REJECTED' };
                const expectedActions = [hideLoading(CUSTOM_SCOPE), originalAction];

                const mockDispatch = (action) => {
                    const expectedAction = expectedActions.shift();
                    assert.deepStrictEqual(action, expectedAction);
                    return action;
                };

                mockStoreWithCustomScope(mockDispatch).dispatch(originalAction);
                assert.strictEqual(expectedActions.length, 0);
            });
        });
    });
});
