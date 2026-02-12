//@ts-check

'use strict';

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  entry: './src/extension.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    'rewrapper/rewrapper.mjs': 'commonjs rewrapper/rewrapper.mjs'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.js'],
    fallback: {}
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'node_modules/rewrapper/rewrapper.mjs',
          to: 'node_modules/rewrapper/rewrapper.mjs'
        },
        {
          from: 'target/wasm32-unknown-unknown/release/the_great_rewrapper.wasm',
          to: 'target/wasm32-unknown-unknown/release/the_great_rewrapper.wasm'
        }
      ]
    })
  ]
};

module.exports = config;
