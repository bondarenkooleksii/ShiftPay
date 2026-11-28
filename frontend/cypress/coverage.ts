import path from 'node:path';
import { createInstrumenter } from 'istanbul-lib-instrument';
import type { Plugin } from 'vite';

const SOURCE = /[\\/]src[\\/].+\.tsx?$/;
const EXCLUDED = /[\\/]src[\\/](mocks|types)[\\/]|[\\/]src[\\/]main\.tsx$|\.d\.ts$/;

export function istanbulCoverage(): Plugin {
  const instrumenter = createInstrumenter({
    esModules: true,
    produceSourceMap: true,
    coverageGlobalScope: 'globalThis',
    coverageGlobalScopeFunc: false,
    parserPlugins: ['jsx', 'typescript'],
  });

  return {
    name: 'shiftpay:istanbul',
    enforce: 'pre',
    apply: 'serve',
    transform(code, id) {
      const file = id.split('?')[0];
      if (!SOURCE.test(file) || EXCLUDED.test(file) || file.includes('node_modules')) return null;
      const filename = path.normalize(file);
      const instrumented = instrumenter.instrumentSync(code, filename);
      return { code: instrumented, map: instrumenter.lastSourceMap() as never };
    },
  };
}
