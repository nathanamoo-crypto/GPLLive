const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// @tanstack/react-query v5 "modern" builds use private class fields (#foo) which
// Hermes cannot parse. Disabling package exports forces the legacy entry points.
config.resolver.unstable_enablePackageExports = false;

const tanstackLegacyAliases = {
  '@tanstack/react-query': path.resolve(
    __dirname,
    'node_modules/@tanstack/react-query/build/legacy/index.js',
  ),
  '@tanstack/query-core': path.resolve(
    __dirname,
    'node_modules/@tanstack/query-core/build/legacy/index.js',
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (tanstackLegacyAliases[moduleName]) {
    return {
      filePath: tanstackLegacyAliases[moduleName],
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
