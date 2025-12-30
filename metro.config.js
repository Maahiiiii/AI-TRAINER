const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    '@mediapipe/pose': path.resolve(__dirname, 'mock-pose.js'),
    '@tensorflow-models/pose-detection': path.resolve(__dirname, 'mock-pose.js'),
    '@tensorflow/tfjs-backend-webgpu': path.resolve(__dirname, 'mock-pose.js'),
    '@tensorflow/tfjs-backend-wasm': path.resolve(__dirname, 'mock-pose.js'),
};

config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = config;
