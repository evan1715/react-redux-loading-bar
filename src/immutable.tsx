import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';

import { LoadingBar } from './loading_bar.tsx';
import type { LoadingBarContainerProps, LoadingBarProps } from './loading_bar.tsx';
import { DEFAULT_SCOPE } from './loading_bar_ducks.ts';
import type { LoadingBarState } from './loading_bar_ducks.ts';

interface ImmutableRootState {
    get(key: 'loadingBar'): LoadingBarState;
}

export default function ImmutableLoadingBar({ scope = DEFAULT_SCOPE, ...props }: LoadingBarContainerProps): ReactElement | null {
    const loading = useSelector((state: ImmutableRootState) => state.get('loadingBar')[scope]);
    return <LoadingBar {...(props as LoadingBarProps)} scope={scope} loading={loading ?? 0} />;
}
