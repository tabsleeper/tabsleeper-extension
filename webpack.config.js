const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    popup:     './src/popup',
    background: './src/background'
  },

  output: {
    filename: './build/[name].js',
  },

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(['build'])
  ]
}
