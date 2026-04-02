import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { transformSync } from 'esbuild';

export async function load(url, context, nextLoad) {
    if (url.startsWith('file://') && (url.endsWith('.js') || url.endsWith('.jsx'))) {
        const filePath = fileURLToPath(url);

        // Skip node_modules
        if (filePath.includes('node_modules')) {
            return nextLoad(url, context);
        }

        const source = readFileSync(filePath, 'utf8');

        // Only transform if it contains JSX-like syntax
        if (source.includes('/>') || source.includes('</')) {
            const { code } = transformSync(source, {
                loader: 'jsx',
                jsx: 'automatic',
                format: 'esm',
                target: 'es2022',
                sourcefile: filePath,
            });
            return {
                format: 'module',
                source: code,
                shortCircuit: true,
            };
        }
    }

    return nextLoad(url, context);
}
