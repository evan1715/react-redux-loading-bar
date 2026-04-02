import { build } from 'esbuild';

const shared = {
    entryPoints: ['src/index.js'],
    bundle: true,
    external: ['react', 'react-dom', 'react-redux', 'redux'],
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    target: 'es2022',
    minify: false,
};

// ESM build
await build({
    ...shared,
    format: 'esm',
    outfile: 'build/index.js',
});

// CJS build
await build({
    ...shared,
    format: 'cjs',
    outfile: 'build/index.cjs',
});

console.log('Build complete');
