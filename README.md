# React Redux Loading Bar

A React component that provides a Loading Bar (aka Progress Bar) for long running tasks.

Consists of:

-   React component — displays a loading bar and simulates progress
-   Redux reducer — manages loading bar state in the store
-   (optional) Redux middleware — automatically shows and hides the Loading Bar for actions with promises

## Installation

```bash
npm install react-redux-loading-bar
```

### Peer Dependencies

-   React 18 or 19
-   Redux 5
-   react-redux 9

## Usage

Mount the `LoadingBar` component anywhere in your application:

```jsx
import LoadingBar from 'react-redux-loading-bar';

export default function Header() {
    return (
        <header>
            <LoadingBar />
        </header>
    );
}
```

It doesn't include any positioning — you can attach it to the top of any block or the whole page.

Install the reducer to the store:

```js
import { combineReducers } from 'redux';
import { loadingBarReducer } from 'react-redux-loading-bar';

const reducer = combineReducers({
    // app reducers
    loadingBar: loadingBarReducer,
});
```

## Multiple Loading Bars

You can include multiple loading bars on the same page. Provide a `scope` to render and control them independently.

```jsx
import LoadingBar from 'react-redux-loading-bar';

export default function Layout() {
    return (
        <>
            <header>
                <LoadingBar />
            </header>
            <section>
                <LoadingBar scope="sectionBar" />
            </section>
        </>
    );
}
```

## Usage with Promise Middleware

Apply middleware to automatically show and hide the loading bar on actions with promises:

```js
import { createStore, applyMiddleware } from 'redux';
import { loadingBarMiddleware } from 'react-redux-loading-bar';
import rootReducer from './reducers';

const store = createStore(rootReducer, applyMiddleware(loadingBarMiddleware()));
```

### Custom Promise Type Suffixes

```js
applyMiddleware(
    loadingBarMiddleware({
        promiseTypeSuffixes: ['REQUEST', 'SUCCESS', 'FAILURE'],
    })
);
```

### Custom Scope for Middleware

```js
applyMiddleware(
    loadingBarMiddleware({
        scope: 'sectionBar',
    })
);
```

## Manual Dispatch

You can dispatch `SHOW`/`HIDE` actions directly:

```js
import { showLoading, hideLoading } from 'react-redux-loading-bar';

dispatch(showLoading());
// do long running stuff
dispatch(hideLoading());
```

You need to dispatch `HIDE` as many times as `SHOW` was dispatched to make the bar disappear. In other words, the loading bar is shown until all long running tasks complete.

### With Scope

```js
import { showLoading, hideLoading } from 'react-redux-loading-bar';

dispatch(showLoading('sectionBar'));
// do long running stuff
dispatch(hideLoading('sectionBar'));
```

## Reset Progress

Dispatch `resetLoading` to immediately hide the Loading Bar regardless of how many tasks are in progress:

```js
import { resetLoading } from 'react-redux-loading-bar';

dispatch(resetLoading());
```

## RTL (Right-To-Left) Layout

```jsx
<LoadingBar direction="rtl" />
```

## Styling

Apply custom styling directly on the component:

```jsx
<LoadingBar style={{ backgroundColor: 'blue', height: '5px' }} />
```

Or specify a CSS class (this disables the default styling of `background-color: red; height: 3px; position: absolute`):

```jsx
<LoadingBar className="loading" />
```

## Configure Progress Simulation

```jsx
<LoadingBar updateTime={100} maxProgress={95} progressIncrease={10} />
```

By default, the Loading Bar only displays if the action took longer than `updateTime` to finish. Pass `showFastActions` to always show it:

```jsx
<LoadingBar showFastActions />
```

## Immutable.js Support

If your top-level Redux store is immutable:

```jsx
import { ImmutableLoadingBar as LoadingBar } from 'react-redux-loading-bar';
```

## Tests

```bash
npm test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
