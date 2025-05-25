import _ from 'lodash';
import { defineConfig } from 'rollup';
import externals from 'rollup-plugin-node-externals';
import ts from 'rollup-plugin-ts';

import type { RollupOptions } from 'rollup';

const baseConfig = {
  input: 'src/index.ts',
  output: {
    sourcemap: true,
    exports: 'named',
  },
  plugins: [externals(), ts()],
};

const variesConfig: RollupOptions[] = [
  {
    output: {
      dir: 'build',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  },
  {
    output: {
      file: 'build/index.cjs.js',
      format: 'cjs',
    },
  },
  {
    output: {
      file: 'build/runtime.esm.js',
      format: 'es',
    },
  },
];

export default defineConfig(
  variesConfig.map((v) => {
    const customizer = (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
      if (typeof objValue === 'object') {
        return _.mergeWith({}, objValue, srcValue, customizer);
      }
    };
    return _.mergeWith({}, baseConfig, v, customizer);
  }),
);
