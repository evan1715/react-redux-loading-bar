import { useSelector } from 'react-redux';

import { LoadingBar } from './loading_bar.js';
import { DEFAULT_SCOPE } from './loading_bar_ducks.js';

export default function ImmutableLoadingBar({ scope = DEFAULT_SCOPE, ...props }) {
    const loading = useSelector((state) => state.get('loadingBar')[scope]);
    return <LoadingBar {...props} scope={scope} loading={loading || 0} />;
}
