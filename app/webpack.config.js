const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        { from: "./src/index.html", to: "index.html" }
      ]
    ),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
    }),
     new MiniCssExtractPlugin({
         filename: "[name].css",
         chunkFilename: "[id].css"
     })
  ],
  module: {
    rules:[
        {
          test: /\.css$/i,
          use: [
              MiniCssExtractPlugin.loader,  // replace ExtractTextPlugin.extract({..})
              { loader: 'css-loader', options: { url: false, sourceMap: true } }
          ]
        }
    ]
  },
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
