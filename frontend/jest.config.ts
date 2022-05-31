import type { Config } from '@jest/types';
import { resolve } from 'path';
require('ts-node/register');

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/js-with-ts',
  verbose: true,
  collectCoverage: true,
  clearMocks: true,
  coverageDirectory: '../coverage/',
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  roots: ['<rootDir>/src/'],
  collectCoverageFrom: ['!**/node_modules/**', '!**/dist/**', '!**/*.test.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['./config/setupTests.ts'],
  testRegex: '.*\\.test\\.(ts|tsx|js|jsx)$',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  transformIgnorePatterns: ['/node_modules/(?!@redhat-cloud-services)', '/node_modules/(?!@patternfly)'],
  globals: {
    'ts-jest': {
      tsconfig: resolve(__dirname, './tsconfig.json'),
    },
  },
};

export default config;
