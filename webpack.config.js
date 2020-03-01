const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env, argv) {
  const applyTransformation = (content, transformation) => {
    const parsedContent = JSON.parse(content)

    const transformedContent = transformation(parsedContent, argv.mode);

    return JSON.stringify(transformedContent, null, 2);
  }

  return {
    entry: {
      'dist/popup':     './src/popup',
      'dist/manage-data': './src/manage-data',
      'dist/background': './src/background'
    },

    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js',
    },

    devtool: (argv.mode === "development") ? 'inline-source-map' : false,

    resolve: {
      modules: [
        // Include a resolver configuration so we don't have to use relative
        // paths for importing our own source code
        path.resolve(__dirname, 'src'),
        'node_modules'
      ]
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader'
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([
        {
          from: 'platform/manifest.common.json',
          to: 'platform/chrome/manifest.json',
          transform: (content, path) => {
            const transform = require('./platform/chrome/manifest.transform');

            return applyTransformation(content, transform);
          }
        },
        {
          from: 'platform/manifest.common.json',
          to: 'platform/firefox/manifest.json',
          transform: (content, path) => {
            const transform = require('./platform/firefox/manifest.transform');

            return applyTransformation(content, transform);
          }
        }
      ])
    ]
  }
}
