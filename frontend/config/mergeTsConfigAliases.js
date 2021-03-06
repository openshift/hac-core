const { resolve } = require('path');
const tsConfig = require('../tsconfig.json');

let paths = {};
try {
  paths = tsConfig.compilerOptions.paths;
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Failed to parse tsConfig', e);
}

/** @param string { string } */
const dropTrailingAsterisk = (string) => (string[string.length - 1] === '*' ? string.substr(0, string.length - 2) : string);

const tsConfigAliases = Object.keys(paths).reduce((acc, packageKey) => {
  const packagePath = paths[packageKey][0];
  return {
    ...acc,
    [dropTrailingAsterisk(packageKey)]: resolve(__dirname, `../${dropTrailingAsterisk(packagePath)}`),
  };
}, {});

// eslint-disable-next-line no-console
console.debug('TS Config generated Aliases', tsConfigAliases);

const mergeTsConfigAliases = (webpackConfig) => ({
  ...webpackConfig,
  resolve: {
    ...(webpackConfig.resolve || {}),
    alias: {
      ...(webpackConfig.resolve.alias || {}),
      ...tsConfigAliases,
    },
  },
});

module.exports = mergeTsConfigAliases;
