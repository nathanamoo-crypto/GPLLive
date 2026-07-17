const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tanstack Query v5 fix for Hermes (SDK 54 compatibility)
config.resolver.unstable_enablePackageExports = false;
const tanstackLegacyAliases = {
  '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query/build/legacy/index.js'),
  '@tanstack/query-core': path.resolve(__dirname, 'node_modules/@tanstack/query-core/build/legacy/index.js'),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (tanstackLegacyAliases[moduleName]) {
    return { filePath: tanstackLegacyAliases[moduleName], type: 'sourceFile' };
  }
  return defaultResolveRequest ? defaultResolveRequest(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });