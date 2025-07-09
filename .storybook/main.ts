import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config) => {
    // Add alias support
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, '../src'),
        '@/components': require('path').resolve(__dirname, '../src/components'),
        '@/hooks': require('path').resolve(__dirname, '../src/hooks'),
        '@/services': require('path').resolve(__dirname, '../src/services'),
        '@/types': require('path').resolve(__dirname, '../src/types'),
        '@/styles': require('path').resolve(__dirname, '../src/styles'),
        '@/constants': require('path').resolve(__dirname, '../src/constants'),
      };
    }
    return config;
  },
};

export default config; 