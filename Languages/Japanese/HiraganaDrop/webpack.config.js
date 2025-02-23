const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'bundle.js',
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'public',
          to: './',
          noErrorOnMissing: true  // Won't error if public folder doesn't exist yet
        }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
      publicPath: '/'
    },
    compress: true,
    port: 3000,
    hot: true
  },
  devtool: 'source-map'
};