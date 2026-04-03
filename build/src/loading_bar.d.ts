import type { CSSProperties, ReactElement } from 'react';
export declare const UPDATE_TIME = 400;
export declare const MAX_PROGRESS = 99;
export declare const PROGRESS_INCREASE = 20;
export declare const ANIMATION_DURATION: number;
export declare const TERMINATING_ANIMATION_DURATION: number;
export interface LoadingBarProps {
    loading?: number;
    scope?: string;
    className?: string;
    direction?: 'ltr' | 'rtl';
    maxProgress?: number;
    progressIncrease?: number;
    showFastActions?: boolean;
    style?: CSSProperties;
    updateTime?: number;
}
export type LoadingBarContainerProps = Omit<LoadingBarProps, 'loading'>;
export declare function LoadingBar({ loading, scope, className, direction, maxProgress, progressIncrease, showFastActions, style: customStyle, updateTime, }: LoadingBarProps): ReactElement | null;
export declare function ConnectedLoadingBar({ scope, ...props }: LoadingBarContainerProps): ReactElement | null;
export default ConnectedLoadingBar;
//# sourceMappingURL=loading_bar.d.ts.map