module.exports = {
  context: __dirname + '/src',
  entry: {
    newtab:     './newtab',
    background: './background'
  },

  output: {
    path: __dirname + '/build',
    filename: '[name].js'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          cacheDirectory: true
        }
      }
    ]
  }
}
