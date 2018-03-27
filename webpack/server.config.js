var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ff = require('eslint-friendly-formatter');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  context: path.join(__dirname, '..'),
  entry: './api/api.js',
  target: 'node',
  output: {
    path: 'build',
    filename: 'backend.js'
  },
  debug: true,
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    preLoaders: [
      {test: /\.js$/, loaders: ["babel-loader"], exclude: /node_modules/}
    ]
  },
  externals: nodeModules,
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        except: ['require']
      }
    })
  ]
}