const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function(env, argv) {
  const applyTransformation = (content, transformation) => {
    const parsedContent = JSON.parse(content)

    const transformedContent = transformation(parsedContent, argv.mode);

    return JSON.stringify(transformedContent, null, 2);
  }

  return {
    mode: argv.mode,

    entry: {
      'dist/popup':     './src/popup.tsx',
      'dist/manage-data': './src/manage-data.tsx',
      'dist/background': './src/background.ts'
    },

    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js',
    },

    devtool: (argv.mode === 'development') ? 'inline-source-map' : false,

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: ['node_modules'],
      alias: {
        "@root": path.resolve(__dirname, 'src'),
        "@actions": path.resolve(__dirname, 'src/actions'),
        "@components": path.resolve(__dirname, 'src/components'),
        "@hooks": path.resolve(__dirname, 'src/hooks'),
        "@icons": path.resolve(__dirname, 'src/icons'),
        "@models": path.resolve(__dirname, 'src/models'),
        "@services": path.resolve(__dirname, 'src/services'),
      }
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)/,
          loader: 'ts-loader'
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
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
        ]
      })
    ]
  }
}
