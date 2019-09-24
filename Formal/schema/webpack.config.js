const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './viewer/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
            'style-loader',
            'css-loader',
            'less-loader',
        ],
      },
      {
        test: /\.schema.json$/,
        use: [
          'ref-loader',
        ],
      },
    ],
  },
  resolveLoader: {
    alias: {
      'ref-loader': path.join(__dirname, "webpack/ref-loader.js"),
    },
  },
  plugins: [
      new HtmlWebpackPlugin(),
  ],
  devServer: {
    hot: true,
  },
};
