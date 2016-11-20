module.exports = {
  entry: "./src/main.js",
  output: {
      filename: "./dist/main.js"
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  devServer: { inline: true }
};
