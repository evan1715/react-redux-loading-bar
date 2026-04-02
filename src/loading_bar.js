import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { DEFAULT_SCOPE } from './loading_bar_ducks.js';

export const UPDATE_TIME = 400;
export const MAX_PROGRESS = 99;
export const PROGRESS_INCREASE = 20;
export const ANIMATION_DURATION = UPDATE_TIME * 2;
export const TERMINATING_ANIMATION_DURATION = UPDATE_TIME / 2;

function newPercent(percent, progressIncrease) {
    // Use cosine as a smoothing function
    // It could be any function to slow down progress near the ending 100%
    const smoothedProgressIncrease = progressIncrease * Math.cos(percent * (Math.PI / 2 / 100));
    return percent + smoothedProgressIncrease;
}

export function LoadingBar({
    loading = 0,
    scope = DEFAULT_SCOPE,
    className = '',
    direction = 'ltr',
    maxProgress = MAX_PROGRESS,
    progressIncrease = PROGRESS_INCREASE,
    showFastActions = false,
    style: customStyle = {},
    updateTime = UPDATE_TIME,
}) {
    const [percent, setPercent] = useState(0);
    const [status, setStatus] = useState('hidden');

    const progressIntervalId = useRef(null);
    const terminatingAnimationTimeoutId = useRef(null);
    const prevLoadingRef = useRef(loading);
    const statusRef = useRef(status);
    const percentRef = useRef(percent);

    // Keep refs in sync
    statusRef.current = status;
    percentRef.current = percent;

    const reset = useCallback(() => {
        terminatingAnimationTimeoutId.current = null;
        setPercent(0);
        setStatus('hidden');
    }, []);

    const stop = useCallback(() => {
        clearInterval(progressIntervalId.current);
        progressIntervalId.current = null;

        const currentPercent = percentRef.current;
        const isShown = currentPercent > 0 && currentPercent <= 100;

        const terminatingDuration = isShown || showFastActions ? TERMINATING_ANIMATION_DURATION : 0;

        terminatingAnimationTimeoutId.current = setTimeout(reset, terminatingDuration);

        setPercent(100);
        setStatus('stopping');
    }, [showFastActions, reset]);

    const start = useCallback(() => {
        // Cancel any previous termination animation
        if (terminatingAnimationTimeoutId.current) {
            clearTimeout(terminatingAnimationTimeoutId.current);
            terminatingAnimationTimeoutId.current = null;
            setPercent(0);
            setStatus('hidden');
        }

        progressIntervalId.current = setInterval(() => {
            setPercent((prev) => {
                const next = newPercent(prev, progressIncrease);
                return next <= maxProgress ? next : prev;
            });
        }, updateTime);

        setStatus('running');
    }, [updateTime, progressIncrease, maxProgress]);

    // Handle loading prop changes
    useEffect(() => {
        const prevLoading = prevLoadingRef.current;
        prevLoadingRef.current = loading;

        const currentStatus = statusRef.current;

        if (loading > 0 && (currentStatus === 'hidden' || currentStatus === 'stopping')) {
            // If we were stopping, cancel the termination first
            if (terminatingAnimationTimeoutId.current) {
                clearTimeout(terminatingAnimationTimeoutId.current);
                terminatingAnimationTimeoutId.current = null;
                setPercent(0);
                setStatus('hidden');
            }
            start();
        } else if (
            loading === 0 &&
            prevLoading > 0 &&
            (currentStatus === 'running' || currentStatus === 'starting')
        ) {
            stop();
        }
    }, [loading, start, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(progressIntervalId.current);
            clearTimeout(terminatingAnimationTimeoutId.current);
        };
    }, []);

    if (status === 'hidden') {
        return null;
    }

    const animationDuration = status === 'stopping' ? TERMINATING_ANIMATION_DURATION : ANIMATION_DURATION;

    const barStyle = {
        width: `${percent}%`,
        transition: `width ${animationDuration}ms linear`,
        willChange: 'width, opacity',
    };

    // Use default styling if there's no CSS class applied
    if (!className) {
        barStyle.height = '3px';
        barStyle.backgroundColor = 'red';
        barStyle.position = 'absolute';
    }

    barStyle.opacity = percent > 0 && percent <= 100 ? '1' : '0';

    const finalStyle = { ...barStyle, ...customStyle };

    return (
        <div style={{ direction }}>
            <div style={finalStyle} className={className} />
            <div style={{ display: 'table', clear: 'both' }} />
        </div>
    );
}

// Connected version using react-redux hooks
export function ConnectedLoadingBar({ scope = DEFAULT_SCOPE, ...props }) {
    const loading = useSelector((state) => state.loadingBar[scope]);
    return <LoadingBar {...props} scope={scope} loading={loading || 0} />;
}

export default ConnectedLoadingBar;
