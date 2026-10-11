const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
  resolver: {
    blockList: [/.*\/android\/.*/],
    // Support mp3, artwork assets
    assetExts: [
      'bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp',
      'mp3', 'm4a', 'aac', 'flac', 'wav', 'ogg',
      'ttf', 'otf', 'woff', 'woff2',
      'zip', 'gz',
    ],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
