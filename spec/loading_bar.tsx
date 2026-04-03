import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { ReactElement } from 'react';
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import { JSDOM } from 'jsdom';

import {
    ANIMATION_DURATION,
    LoadingBar,
    MAX_PROGRESS,
    PROGRESS_INCREASE,
    TERMINATING_ANIMATION_DURATION,
    UPDATE_TIME,
} from '../src/loading_bar.tsx';
import type { LoadingBarProps } from '../src/loading_bar.tsx';

// Setup jsdom BEFORE importing React
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
// @ts-expect-error jsdom's Window type does not fully match the global Window type
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

declare global {
    // eslint-disable-next-line no-var
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const { act } = React;

// Helper to create a controllable wrapper around LoadingBar
function createTestHarness(initialProps: LoadingBarProps = {}) {
    let updateProps: (newProps: Partial<LoadingBarProps>) => void;

    function TestWrapper(): ReactElement {
        const [props, setProps] = React.useState<LoadingBarProps>(initialProps);
        updateProps = (newProps: Partial<LoadingBarProps>) => setProps((prev) => ({ ...prev, ...newProps }));
        return React.createElement(LoadingBar, props);
    }

    return {
        TestWrapper,
        setProps: (newProps: Partial<LoadingBarProps>) => updateProps(newProps),
    };
}

describe('LoadingBar', () => {
    let container: HTMLDivElement;
    let root: ReactDOMClient.Root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = ReactDOMClient.createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    function getBarDiv(): HTMLElement | null {
        const outer = container.firstChild;
        if (!(outer instanceof HTMLElement)) return null;
        const bar = outer.children[0];
        if (!(bar instanceof HTMLElement)) return null;
        return bar;
    }

    function requireBarDiv(): HTMLElement {
        const bar = getBarDiv();
        assert.ok(bar, 'bar div should exist');
        return bar;
    }

    function getOuterDiv(): HTMLElement | null {
        const outer = container.firstChild;
        if (!(outer instanceof HTMLElement)) return null;
        return outer;
    }

    function requireOuterDiv(): HTMLElement {
        const outer = getOuterDiv();
        assert.ok(outer, 'outer div should exist');
        return outer;
    }

    describe('render', () => {
        it('renders nothing when loading is not passed', () => {
            act(() => {
                root.render(React.createElement(LoadingBar));
            });
            assert.strictEqual(container.innerHTML, '');
        });

        it('renders not hidden 3px height red element', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME + 1);
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.opacity, '1');
            assert.strictEqual(bar.style.backgroundColor, 'red');
            assert.strictEqual(bar.style.height, '3px');
            assert.strictEqual(bar.style.position, 'absolute');
        });

        it('renders an element with passed color and height', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({
                loading: 1,
                style: { backgroundColor: 'blue', height: '5px' },
            });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME + 1);
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.backgroundColor, 'blue');
            assert.strictEqual(bar.style.height, '5px');
        });

        it('does not apply default styling if CSS class is specified', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({
                loading: 1,
                className: 'custom',
            });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME + 1);
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.backgroundColor, '');
            assert.strictEqual(bar.style.height, '');
            assert.strictEqual(bar.style.position, '');
            assert.strictEqual(bar.className, 'custom');
        });
    });

    describe('progress simulation', () => {
        it('simulates progress on UPDATE_TIME interval', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness();
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME + 1);
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.width, `${PROGRESS_INCREASE}%`);
        });

        it('does not fire progress before UPDATE_TIME', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness();
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME - 1);
            });

            const bar = getBarDiv();
            if (bar) {
                assert.strictEqual(bar.style.width, '0%');
            }
        });

        it('increases percent after two UPDATE_TIME ticks', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });

            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });
            const firstWidth = parseFloat(requireBarDiv().style.width);

            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });
            const secondWidth = parseFloat(requireBarDiv().style.width);

            assert.ok(secondWidth > firstWidth, `${secondWidth} should be > ${firstWidth}`);
        });

        it('does not exceed MAX_PROGRESS', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME * 100);
            });

            const percent = parseFloat(requireBarDiv().style.width);
            assert.ok(percent < MAX_PROGRESS, `Expected ${percent} < ${MAX_PROGRESS}`);
        });

        it('does not set second interval if loading bar is already shown', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness();
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const firstPercent = parseFloat(requireBarDiv().style.width);
            assert.ok(firstPercent > 0);

            // Increase loading count - should not restart
            act(() => {
                setProps({ loading: 2 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const secondPercent = parseFloat(requireBarDiv().style.width);
            assert.ok(secondPercent > firstPercent);
        });
    });

    describe('stopping', () => {
        it('sets percent to 100 when loading becomes 0', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            assert.ok(parseFloat(requireBarDiv().style.width) > 0);

            act(() => {
                setProps({ loading: 0 });
            });

            assert.strictEqual(requireBarDiv().style.width, '100%');
        });

        it('resets to hidden after terminating animation', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            act(() => {
                setProps({ loading: 0 });
            });
            assert.strictEqual(requireBarDiv().style.width, '100%');

            act(() => {
                t.mock.timers.tick(TERMINATING_ANIMATION_DURATION + 1);
            });

            assert.strictEqual(container.innerHTML, '');
        });

        it('clears interval when loading becomes 0', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            act(() => {
                setProps({ loading: 0 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });
            act(() => {
                t.mock.timers.tick(TERMINATING_ANIMATION_DURATION + UPDATE_TIME);
            });

            assert.strictEqual(container.innerHTML, '');
        });
    });

    describe('restart during termination', () => {
        it('resets progress when loading restarts during termination', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const progressBefore = parseFloat(requireBarDiv().style.width);
            assert.ok(progressBefore > 0 && progressBefore < 100);

            act(() => {
                setProps({ loading: 0 });
            });
            assert.strictEqual(requireBarDiv().style.width, '100%');

            act(() => {
                setProps({ loading: 1 });
            });

            const percentAfterRestart = parseFloat(requireBarDiv().style.width);
            assert.ok(percentAfterRestart < 100, 'Should not be at 100% after restart');
        });

        it('does not hang when restarting during terminating animation', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            act(() => {
                setProps({ loading: 0 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const bar = requireBarDiv();
            const percent = parseFloat(bar.style.width);
            assert.ok(percent > 0 && percent < 100);

            act(() => {
                setProps({ loading: 0 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME * 1000);
            });

            assert.strictEqual(container.innerHTML, '');
        });

        it('resets position when show is called right after hide', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            act(() => {
                setProps({ loading: 0 });
            });
            assert.strictEqual(requireBarDiv().style.width, '100%');

            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            act(() => {
                setProps({ loading: 1 });
            });

            const percent = parseFloat(requireBarDiv().style.width);
            assert.notStrictEqual(percent, 100);

            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const bar = requireBarDiv();
            assert.ok(parseFloat(bar.style.width) > 0);
        });
    });

    describe('showFastActions', () => {
        it('does not show loading bar on quickly finished actions by default', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness();
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME - 1);
            });
            act(() => {
                setProps({ loading: 0 });
            });
            act(() => {
                t.mock.timers.tick(1);
            });

            assert.strictEqual(container.innerHTML, '');
        });

        it('shows loading bar on quickly finished actions when set', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ showFastActions: true });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME - 1);
            });
            act(() => {
                setProps({ loading: 0 });
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.width, '100%');
        });
    });

    describe('updateTime prop', () => {
        it('can be changed', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const customUpdateTime = 100;
            const { TestWrapper } = createTestHarness({
                loading: 1,
                updateTime: customUpdateTime,
            });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(customUpdateTime);
            });

            const bar = requireBarDiv();
            assert.ok(parseFloat(bar.style.width) > 0, 'Should have made progress');
        });
    });

    describe('maxProgress prop', () => {
        it('can be changed', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const maxProgress = 50;
            const { TestWrapper } = createTestHarness({ loading: 1, maxProgress });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME * 100);
            });

            const bar = requireBarDiv();
            const percent = parseFloat(bar.style.width);
            assert.ok(percent < maxProgress, `Expected ${percent} < ${maxProgress}`);
        });
    });

    describe('progressIncrease prop', () => {
        it('can be changed', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const progressIncrease = 5;
            const { TestWrapper } = createTestHarness({ loading: 1, progressIncrease });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.width, `${progressIncrease}%`);
        });
    });

    describe('direction prop', () => {
        it('simulates progress from left to right by default', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const outer = requireOuterDiv();
            assert.strictEqual(outer.style.direction, 'ltr');
            assert.strictEqual(requireBarDiv().style.width, '20%');
        });

        it('can simulate progress from right to left', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({ loading: 1, direction: 'rtl' });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const outer = requireOuterDiv();
            assert.strictEqual(outer.style.direction, 'rtl');
            assert.strictEqual(requireBarDiv().style.width, '20%');
        });
    });

    describe('unmount safety', () => {
        it('does not throw errors after unmount during loading', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });
            act(() => {
                root.unmount();
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME * 5);
            });
        });

        it('does not throw errors after unmount during stopping', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness({ loading: 1 });
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });
            act(() => {
                setProps({ loading: 0 });
            });
            act(() => {
                root.unmount();
            });
            act(() => {
                t.mock.timers.tick(ANIMATION_DURATION * 2);
            });
        });
    });

    describe('multiple loading bars', () => {
        it('renders multiple instances independently', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            function MultiWrapper(): ReactElement {
                return React.createElement(
                    'section',
                    null,
                    React.createElement(LoadingBar, { loading: 1 }),
                    React.createElement(LoadingBar, { loading: 1, scope: 'someScope', className: 'custom' })
                );
            }

            act(() => {
                root.render(React.createElement(MultiWrapper));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const section = container.querySelector('section');
            assert.ok(section);

            const firstOuter = section.children[0];
            assert.ok(firstOuter instanceof HTMLElement);
            const firstBar = firstOuter.children[0];
            assert.ok(firstBar instanceof HTMLElement);
            assert.strictEqual(firstBar.className, '');
            assert.strictEqual(firstBar.style.backgroundColor, 'red');
            assert.strictEqual(firstBar.style.height, '3px');

            const secondOuter = section.children[1];
            assert.ok(secondOuter instanceof HTMLElement);
            const secondBar = secondOuter.children[0];
            assert.ok(secondBar instanceof HTMLElement);
            assert.strictEqual(secondBar.className, 'custom');
            assert.strictEqual(secondBar.style.backgroundColor, '');
            assert.strictEqual(secondBar.style.height, '');
        });
    });

    describe('start on mount with loading > 0', () => {
        it('starts on component mount if loading count is > 0', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            act(() => {
                root.render(React.createElement(LoadingBar, { loading: 1 }));
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const bar = requireBarDiv();
            assert.ok(parseFloat(bar.style.width) > 0);
        });

        it('starts only once if loading count is increased to 2', (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });

            const { TestWrapper, setProps } = createTestHarness();
            act(() => {
                root.render(React.createElement(TestWrapper));
            });
            act(() => {
                setProps({ loading: 1 });
            });
            act(() => {
                setProps({ loading: 2 });
            });
            act(() => {
                t.mock.timers.tick(UPDATE_TIME);
            });

            const bar = requireBarDiv();
            assert.strictEqual(bar.style.width, `${PROGRESS_INCREASE}%`);
        });
    });
});
