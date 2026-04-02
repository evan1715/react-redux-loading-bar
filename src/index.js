import ConnectedLoadingBar, { LoadingBar } from './loading_bar.js';
import loadingBarMiddleware from './loading_bar_middleware.js';
import {
    DEFAULT_SCOPE,
    HIDE,
    hideLoading,
    loadingBarReducer,
    RESET,
    resetLoading,
    SHOW,
    showLoading,
} from './loading_bar_ducks.js';
import ImmutableLoadingBar from './immutable.js';

export {
    DEFAULT_SCOPE,
    HIDE,
    hideLoading,
    ImmutableLoadingBar,
    LoadingBar,
    loadingBarMiddleware,
    loadingBarReducer,
    RESET,
    resetLoading,
    SHOW,
    showLoading,
};
export default ConnectedLoadingBar;
