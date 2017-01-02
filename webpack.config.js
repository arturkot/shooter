module.exports = {
  entry: "./src/main.ts",
  output: {
      filename: "./dist/main.js"
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  devServer: {
    inline: true
  }
};
