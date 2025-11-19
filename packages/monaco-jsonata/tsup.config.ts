import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  external: ['monaco-editor', 'jsonata'],
  outDir: 'dist',
  platform: 'browser',
  target: 'es2020',
  tsconfig: './tsconfig.json',
});
