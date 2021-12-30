const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', "index.ts"),
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].[hash].bundle.js',
    publicPath: '/',
  },

  resolve: {
    alias: {
      '~': path.resolve('./frontend/src'),
    },
    extensions: ['.js', '.ts', '.tsx', 'jsx'],
  },

  module: {
    rules: [
      {
        test: /\.ts|tsx|js|jsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },

  plugins: [
    new webpack.DefinePlugin({ "process.env.API_ENV_URL": JSON.stringify(process.env.API_ENV_URL) }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '..', 'public', "index.html"),
    }),
  ],
};
