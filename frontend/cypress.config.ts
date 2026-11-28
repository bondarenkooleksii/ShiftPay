import { defineConfig } from 'cypress';
import { mergeConfig } from 'vite';
import codeCoverageTask from '@cypress/code-coverage/task';
import viteConfig from './vite.config';
import { istanbulCoverage } from './cypress/coverage';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: mergeConfig(viteConfig, {
        define: {
          'import.meta.env.VITE_API_URL': JSON.stringify(''),
        },
        plugins: [istanbulCoverage()],
      }),
    },
    specPattern: 'cypress/component/**/*.cy.tsx',
    supportFile: 'cypress/support/component.tsx',
    indexHtmlFile: 'cypress/support/component-index.html',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
});
