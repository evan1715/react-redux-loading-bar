import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

// Setup jsdom BEFORE importing React
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Must be dynamically imported after DOM setup
const React = await import('react')
const { act } = React
const ReactDOMClient = await import('react-dom/client')

const {
  LoadingBar,
  UPDATE_TIME,
  MAX_PROGRESS,
  PROGRESS_INCREASE,
  ANIMATION_DURATION,
  TERMINATING_ANIMATION_DURATION,
} = await import('../src/loading_bar.js')

// Helper to create a controllable wrapper around LoadingBar
function createTestHarness(initialProps = {}) {
  let updateProps

  function TestWrapper() {
    const [props, setProps] = React.useState(initialProps)
    updateProps = (newProps) => setProps((prev) => ({ ...prev, ...newProps }))
    return React.createElement(LoadingBar, props)
  }

  return {
    TestWrapper,
    setProps: (newProps) => updateProps(newProps),
  }
}

describe('LoadingBar', () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = ReactDOMClient.createRoot(container)
  })

  afterEach(() => {
    act(() => { root.unmount() })
    container.remove()
  })

  function getBarDiv() {
    const outer = container.firstChild
    if (!outer || !outer.children) return null
    return outer.children[0]
  }

  function getOuterDiv() {
    return container.firstChild
  }

  describe('render', () => {
    it('renders nothing when loading is not passed', () => {
      act(() => { root.render(React.createElement(LoadingBar)) })
      // hidden status → renders null
      assert.strictEqual(container.innerHTML, '')
    })

    it('renders not hidden 3px height red element', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })

      // Tick to fire interval and update percent
      act(() => { t.mock.timers.tick(UPDATE_TIME + 1) })

      const bar = getBarDiv()
      assert.ok(bar, 'bar div should exist')
      assert.strictEqual(bar.style.opacity, '1')
      assert.strictEqual(bar.style.backgroundColor, 'red')
      assert.strictEqual(bar.style.height, '3px')
      assert.strictEqual(bar.style.position, 'absolute')
    })

    it('renders an element with passed color and height', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({
        loading: 1,
        style: { backgroundColor: 'blue', height: '5px' },
      })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME + 1) })

      const bar = getBarDiv()
      assert.ok(bar)
      assert.strictEqual(bar.style.backgroundColor, 'blue')
      assert.strictEqual(bar.style.height, '5px')
    })

    it('does not apply default styling if CSS class is specified', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({
        loading: 1,
        className: 'custom',
      })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME + 1) })

      const bar = getBarDiv()
      assert.ok(bar)
      assert.strictEqual(bar.style.backgroundColor, '')
      assert.strictEqual(bar.style.height, '')
      assert.strictEqual(bar.style.position, '')
      assert.strictEqual(bar.className, 'custom')
    })
  })

  describe('progress simulation', () => {
    it('simulates progress on UPDATE_TIME interval', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness()
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { setProps({ loading: 1 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME + 1) })

      const bar = getBarDiv()
      assert.ok(bar)
      assert.strictEqual(bar.style.width, `${PROGRESS_INCREASE}%`)
    })

    it('does not fire progress before UPDATE_TIME', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness()
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { setProps({ loading: 1 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME - 1) })

      // The bar should be visible but percent still at 0 (no interval fire yet)
      const bar = getBarDiv()
      if (bar) {
        assert.strictEqual(bar.style.width, '0%')
      }
    })

    it('increases percent after two UPDATE_TIME ticks', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { t.mock.timers.tick(UPDATE_TIME) })
      const firstWidth = parseFloat(getBarDiv().style.width)

      act(() => { t.mock.timers.tick(UPDATE_TIME) })
      const secondWidth = parseFloat(getBarDiv().style.width)

      assert.ok(secondWidth > firstWidth, `${secondWidth} should be > ${firstWidth}`)
    })

    it('does not exceed MAX_PROGRESS', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { t.mock.timers.tick(UPDATE_TIME * 100) })

      const percent = parseFloat(getBarDiv().style.width)
      assert.ok(percent < MAX_PROGRESS, `Expected ${percent} < ${MAX_PROGRESS}`)
    })

    it('does not set second interval if loading bar is already shown', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness()
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { setProps({ loading: 1 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const firstPercent = parseFloat(getBarDiv().style.width)
      assert.ok(firstPercent > 0)

      // Increase loading count - should not restart
      act(() => { setProps({ loading: 2 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const secondPercent = parseFloat(getBarDiv().style.width)
      // Should continue from where it was, not restart at 0
      assert.ok(secondPercent > firstPercent)
    })
  })

  describe('stopping', () => {
    it('sets percent to 100 when loading becomes 0', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      assert.ok(parseFloat(getBarDiv().style.width) > 0)

      act(() => { setProps({ loading: 0 }) })

      assert.strictEqual(getBarDiv().style.width, '100%')
    })

    it('resets to hidden after terminating animation', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      act(() => { setProps({ loading: 0 }) })
      assert.strictEqual(getBarDiv().style.width, '100%')

      // Wait for terminating animation timeout
      act(() => { t.mock.timers.tick(TERMINATING_ANIMATION_DURATION + 1) })

      assert.strictEqual(container.innerHTML, '')
    })

    it('clears interval when loading becomes 0', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      act(() => { setProps({ loading: 0 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })
      act(() => { t.mock.timers.tick(TERMINATING_ANIMATION_DURATION + UPDATE_TIME) })

      assert.strictEqual(container.innerHTML, '')
    })
  })

  describe('restart during termination', () => {
    it('resets progress when loading restarts during termination', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const progressBefore = parseFloat(getBarDiv().style.width)
      assert.ok(progressBefore > 0 && progressBefore < 100)

      // Stop
      act(() => { setProps({ loading: 0 }) })
      assert.strictEqual(getBarDiv().style.width, '100%')

      // Restart immediately
      act(() => { setProps({ loading: 1 }) })

      // Should have reset
      const percentAfterRestart = parseFloat(getBarDiv().style.width)
      assert.ok(percentAfterRestart < 100, 'Should not be at 100% after restart')
    })

    it('does not hang when restarting during terminating animation', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      // Stop
      act(() => { setProps({ loading: 0 }) })

      // Wait a bit during animation
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      // Restart
      act(() => { setProps({ loading: 1 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      // Should be shown
      const bar = getBarDiv()
      assert.ok(bar)
      const percent = parseFloat(bar.style.width)
      assert.ok(percent > 0 && percent < 100)

      // Stop again and wait a long time
      act(() => { setProps({ loading: 0 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME * 1000) })

      assert.strictEqual(container.innerHTML, '')
    })

    it('resets position when show is called right after hide', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      // Hide
      act(() => { setProps({ loading: 0 }) })
      assert.strictEqual(getBarDiv().style.width, '100%')

      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      // Show again
      act(() => { setProps({ loading: 1 }) })

      const percent = parseFloat(getBarDiv().style.width)
      assert.notStrictEqual(percent, 100)

      // Wait one tick
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      // Progress should be running
      const bar = getBarDiv()
      assert.ok(bar)
      assert.ok(parseFloat(bar.style.width) > 0)
    })
  })

  describe('showFastActions', () => {
    it('does not show loading bar on quickly finished actions by default', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness()
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { setProps({ loading: 1 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME - 1) }) // less than first simulation

      act(() => { setProps({ loading: 0 }) })
      act(() => { t.mock.timers.tick(1) })

      // Should reset immediately (no terminating animation for fast actions)
      assert.strictEqual(container.innerHTML, '')
    })

    it('shows loading bar on quickly finished actions when set', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ showFastActions: true })
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { setProps({ loading: 1 }) })
      act(() => { t.mock.timers.tick(UPDATE_TIME - 1) })

      act(() => { setProps({ loading: 0 }) })
      // Should still be visible
      const bar = getBarDiv()
      assert.ok(bar, 'bar should be visible with showFastActions')
      assert.strictEqual(bar.style.width, '100%')
    })
  })

  describe('updateTime prop', () => {
    it('can be changed', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const customUpdateTime = 100
      const { TestWrapper } = createTestHarness({
        loading: 1,
        updateTime: customUpdateTime,
      })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(customUpdateTime) })

      const bar = getBarDiv()
      assert.ok(bar)
      assert.ok(parseFloat(bar.style.width) > 0, 'Should have made progress')
    })
  })

  describe('maxProgress prop', () => {
    it('can be changed', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const maxProgress = 50
      const { TestWrapper } = createTestHarness({ loading: 1, maxProgress })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME * 100) })

      const bar = getBarDiv()
      const percent = parseFloat(bar.style.width)
      assert.ok(percent < maxProgress, `Expected ${percent} < ${maxProgress}`)
    })
  })

  describe('progressIncrease prop', () => {
    it('can be changed', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const progressIncrease = 5
      const { TestWrapper } = createTestHarness({ loading: 1, progressIncrease })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const bar = getBarDiv()
      assert.strictEqual(bar.style.width, `${progressIncrease}%`)
    })
  })

  describe('direction prop', () => {
    it('simulates progress from left to right by default', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const outer = getOuterDiv()
      assert.strictEqual(outer.style.direction, 'ltr')
      assert.strictEqual(getBarDiv().style.width, '20%')
    })

    it('can simulate progress from right to left', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({ loading: 1, direction: 'rtl' })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const outer = getOuterDiv()
      assert.strictEqual(outer.style.direction, 'rtl')
      assert.strictEqual(getBarDiv().style.width, '20%')
    })
  })

  describe('unmount safety', () => {
    it('does not throw errors after unmount during loading', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      act(() => { root.unmount() })

      // Should not throw
      act(() => { t.mock.timers.tick(UPDATE_TIME * 5) })
    })

    it('does not throw errors after unmount during stopping', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness({ loading: 1 })
      act(() => { root.render(React.createElement(TestWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      act(() => { setProps({ loading: 0 }) })

      act(() => { root.unmount() })

      // Should not throw
      act(() => { t.mock.timers.tick(ANIMATION_DURATION * 2) })
    })
  })

  describe('multiple loading bars', () => {
    it('renders multiple instances independently', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      function MultiWrapper() {
        return React.createElement('section', null,
          React.createElement(LoadingBar, { loading: 1 }),
          React.createElement(LoadingBar, { loading: 1, scope: 'someScope', className: 'custom' }),
        )
      }

      act(() => { root.render(React.createElement(MultiWrapper)) })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const section = container.querySelector('section')
      assert.ok(section)

      // First loading bar - default styling
      const firstBar = section.children[0].children[0]
      assert.strictEqual(firstBar.className, '')
      assert.strictEqual(firstBar.style.backgroundColor, 'red')
      assert.strictEqual(firstBar.style.height, '3px')

      // Second loading bar - custom class, no default styling
      const secondBar = section.children[1].children[0]
      assert.strictEqual(secondBar.className, 'custom')
      assert.strictEqual(secondBar.style.backgroundColor, '')
      assert.strictEqual(secondBar.style.height, '')
    })
  })

  describe('start on mount with loading > 0', () => {
    it('starts on component mount if loading count is > 0', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      act(() => {
        root.render(React.createElement(LoadingBar, { loading: 1 }))
      })
      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const bar = getBarDiv()
      assert.ok(bar)
      assert.ok(parseFloat(bar.style.width) > 0)
    })

    it('starts only once if loading count is increased to 2', (t) => {
      t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })

      const { TestWrapper, setProps } = createTestHarness()
      act(() => { root.render(React.createElement(TestWrapper)) })

      act(() => { setProps({ loading: 1 }) })
      act(() => { setProps({ loading: 2 }) })

      act(() => { t.mock.timers.tick(UPDATE_TIME) })

      const bar = getBarDiv()
      assert.ok(bar)
      // Should only have progressed once (one interval tick)
      assert.strictEqual(bar.style.width, `${PROGRESS_INCREASE}%`)
    })
  })
})
