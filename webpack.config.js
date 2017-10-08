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

  resolve: {
    modules: [
      // Include a resolver configuration so we don't have to use relative
      // paths for importing our own source code
      path.resolve(__dirname, 'src'),
      'node_modules'
    ]
  },

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
