var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DEFAULT_SCOPE: () => DEFAULT_SCOPE,
  HIDE: () => HIDE,
  ImmutableLoadingBar: () => ImmutableLoadingBar,
  LoadingBar: () => LoadingBar,
  RESET: () => RESET,
  SHOW: () => SHOW,
  default: () => index_default,
  hideLoading: () => hideLoading,
  loadingBarMiddleware: () => loadingBarMiddleware,
  loadingBarReducer: () => loadingBarReducer,
  resetLoading: () => resetLoading,
  showLoading: () => showLoading
});
module.exports = __toCommonJS(index_exports);

// src/loading_bar.js
var import_react = require("react");
var import_react_redux = require("react-redux");

// src/loading_bar_ducks.js
var SHOW = "loading-bar/SHOW";
var HIDE = "loading-bar/HIDE";
var RESET = "loading-bar/RESET";
var DEFAULT_SCOPE = "default";
function showLoading(scope = DEFAULT_SCOPE) {
  return {
    type: SHOW,
    payload: { scope }
  };
}
function hideLoading(scope = DEFAULT_SCOPE) {
  return {
    type: HIDE,
    payload: { scope }
  };
}
function resetLoading(scope = DEFAULT_SCOPE) {
  return {
    type: RESET,
    payload: { scope }
  };
}
function loadingBarReducer(state = {}, action = {}) {
  const { scope = DEFAULT_SCOPE } = action.payload || {};
  switch (action.type) {
    case SHOW:
      return {
        ...state,
        [scope]: (state[scope] || 0) + 1
      };
    case HIDE:
      return {
        ...state,
        [scope]: Math.max(0, (state[scope] || 1) - 1)
      };
    case RESET:
      return {
        ...state,
        [scope]: 0
      };
    default:
      return state;
  }
}

// src/loading_bar.js
var import_jsx_runtime = require("react/jsx-runtime");
var UPDATE_TIME = 400;
var MAX_PROGRESS = 99;
var PROGRESS_INCREASE = 20;
var ANIMATION_DURATION = UPDATE_TIME * 2;
var TERMINATING_ANIMATION_DURATION = UPDATE_TIME / 2;
function newPercent(percent, progressIncrease) {
  const smoothedProgressIncrease = progressIncrease * Math.cos(percent * (Math.PI / 2 / 100));
  return percent + smoothedProgressIncrease;
}
function LoadingBar({
  loading = 0,
  scope = DEFAULT_SCOPE,
  className = "",
  direction = "ltr",
  maxProgress = MAX_PROGRESS,
  progressIncrease = PROGRESS_INCREASE,
  showFastActions = false,
  style: customStyle = {},
  updateTime = UPDATE_TIME
}) {
  const [percent, setPercent] = (0, import_react.useState)(0);
  const [status, setStatus] = (0, import_react.useState)("hidden");
  const progressIntervalId = (0, import_react.useRef)(null);
  const terminatingAnimationTimeoutId = (0, import_react.useRef)(null);
  const prevLoadingRef = (0, import_react.useRef)(loading);
  const statusRef = (0, import_react.useRef)(status);
  const percentRef = (0, import_react.useRef)(percent);
  statusRef.current = status;
  percentRef.current = percent;
  const reset = (0, import_react.useCallback)(() => {
    terminatingAnimationTimeoutId.current = null;
    setPercent(0);
    setStatus("hidden");
  }, []);
  const stop = (0, import_react.useCallback)(() => {
    clearInterval(progressIntervalId.current);
    progressIntervalId.current = null;
    const currentPercent = percentRef.current;
    const isShown = currentPercent > 0 && currentPercent <= 100;
    const terminatingDuration = isShown || showFastActions ? TERMINATING_ANIMATION_DURATION : 0;
    terminatingAnimationTimeoutId.current = setTimeout(reset, terminatingDuration);
    setPercent(100);
    setStatus("stopping");
  }, [showFastActions, reset]);
  const start = (0, import_react.useCallback)(() => {
    if (terminatingAnimationTimeoutId.current) {
      clearTimeout(terminatingAnimationTimeoutId.current);
      terminatingAnimationTimeoutId.current = null;
      setPercent(0);
      setStatus("hidden");
    }
    progressIntervalId.current = setInterval(() => {
      setPercent((prev) => {
        const next = newPercent(prev, progressIncrease);
        return next <= maxProgress ? next : prev;
      });
    }, updateTime);
    setStatus("running");
  }, [updateTime, progressIncrease, maxProgress]);
  (0, import_react.useEffect)(() => {
    const prevLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;
    const currentStatus = statusRef.current;
    if (loading > 0 && (currentStatus === "hidden" || currentStatus === "stopping")) {
      if (terminatingAnimationTimeoutId.current) {
        clearTimeout(terminatingAnimationTimeoutId.current);
        terminatingAnimationTimeoutId.current = null;
        setPercent(0);
        setStatus("hidden");
      }
      start();
    } else if (loading === 0 && prevLoading > 0 && (currentStatus === "running" || currentStatus === "starting")) {
      stop();
    }
  }, [loading, start, stop]);
  (0, import_react.useEffect)(() => {
    return () => {
      clearInterval(progressIntervalId.current);
      clearTimeout(terminatingAnimationTimeoutId.current);
    };
  }, []);
  if (status === "hidden") {
    return null;
  }
  const animationDuration = status === "stopping" ? TERMINATING_ANIMATION_DURATION : ANIMATION_DURATION;
  const barStyle = {
    width: `${percent}%`,
    transition: `width ${animationDuration}ms linear`,
    willChange: "width, opacity"
  };
  if (!className) {
    barStyle.height = "3px";
    barStyle.backgroundColor = "red";
    barStyle.position = "absolute";
  }
  barStyle.opacity = percent > 0 && percent <= 100 ? "1" : "0";
  const finalStyle = { ...barStyle, ...customStyle };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { direction }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: finalStyle, className }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "table", clear: "both" } })
  ] });
}
function ConnectedLoadingBar({ scope = DEFAULT_SCOPE, ...props }) {
  const loading = (0, import_react_redux.useSelector)((state) => state.loadingBar[scope]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBar, { ...props, scope, loading: loading || 0 });
}
var loading_bar_default = ConnectedLoadingBar;

// src/loading_bar_middleware.js
var defaultTypeSuffixes = ["PENDING", "FULFILLED", "REJECTED"];
function loadingBarMiddleware(config = {}) {
  const promiseTypeSuffixes = config.promiseTypeSuffixes || defaultTypeSuffixes;
  const scope = config.scope || DEFAULT_SCOPE;
  return ({ dispatch }) => (next) => (action) => {
    if (action.type) {
      const [PENDING, FULFILLED, REJECTED] = promiseTypeSuffixes;
      const isPending = new RegExp(`${PENDING}$`, "g");
      const isFulfilled = new RegExp(`${FULFILLED}$`, "g");
      const isRejected = new RegExp(`${REJECTED}$`, "g");
      const actionScope = action.meta && action.meta.scope || action.scope || scope;
      if (action.type.match(isPending)) {
        dispatch(showLoading(actionScope));
      } else if (action.type.match(isFulfilled) || action.type.match(isRejected)) {
        dispatch(hideLoading(actionScope));
      }
    }
    return next(action);
  };
}

// src/immutable.js
var import_react_redux2 = require("react-redux");
var import_jsx_runtime2 = require("react/jsx-runtime");
function ImmutableLoadingBar({ scope = DEFAULT_SCOPE, ...props }) {
  const loading = (0, import_react_redux2.useSelector)((state) => state.get("loadingBar")[scope]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LoadingBar, { ...props, scope, loading: loading || 0 });
}

// src/index.js
var index_default = loading_bar_default;
