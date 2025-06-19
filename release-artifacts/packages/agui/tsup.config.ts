import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true, // Use standard DTS generation instead of experimental
  clean: true,
  treeshake: 'smallest',
});
