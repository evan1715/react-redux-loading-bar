// src/loading_bar.js
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

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
import { jsx, jsxs } from "react/jsx-runtime";
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
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("hidden");
  const progressIntervalId = useRef(null);
  const terminatingAnimationTimeoutId = useRef(null);
  const prevLoadingRef = useRef(loading);
  const statusRef = useRef(status);
  const percentRef = useRef(percent);
  statusRef.current = status;
  percentRef.current = percent;
  const reset = useCallback(() => {
    terminatingAnimationTimeoutId.current = null;
    setPercent(0);
    setStatus("hidden");
  }, []);
  const stop = useCallback(() => {
    clearInterval(progressIntervalId.current);
    progressIntervalId.current = null;
    const currentPercent = percentRef.current;
    const isShown = currentPercent > 0 && currentPercent <= 100;
    const terminatingDuration = isShown || showFastActions ? TERMINATING_ANIMATION_DURATION : 0;
    terminatingAnimationTimeoutId.current = setTimeout(reset, terminatingDuration);
    setPercent(100);
    setStatus("stopping");
  }, [showFastActions, reset]);
  const start = useCallback(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { style: { direction }, children: [
    /* @__PURE__ */ jsx("div", { style: finalStyle, className }),
    /* @__PURE__ */ jsx("div", { style: { display: "table", clear: "both" } })
  ] });
}
function ConnectedLoadingBar({ scope = DEFAULT_SCOPE, ...props }) {
  const loading = useSelector((state) => state.loadingBar[scope]);
  return /* @__PURE__ */ jsx(LoadingBar, { ...props, scope, loading: loading || 0 });
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
import { useSelector as useSelector2 } from "react-redux";
import { jsx as jsx2 } from "react/jsx-runtime";
function ImmutableLoadingBar({ scope = DEFAULT_SCOPE, ...props }) {
  const loading = useSelector2((state) => state.get("loadingBar")[scope]);
  return /* @__PURE__ */ jsx2(LoadingBar, { ...props, scope, loading: loading || 0 });
}

// src/index.js
var index_default = loading_bar_default;
export {
  DEFAULT_SCOPE,
  HIDE,
  ImmutableLoadingBar,
  LoadingBar,
  RESET,
  SHOW,
  index_default as default,
  hideLoading,
  loadingBarMiddleware,
  loadingBarReducer,
  resetLoading,
  showLoading
};
