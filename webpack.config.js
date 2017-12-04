const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals')
module.exports = {
    externals: [nodeExternals()],
    entry: slsw.lib.entries,
    target: 'node',
    module: {
        rules: [
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              include: __dirname,
              use: {
                loader: 'babel-loader',
              }
            }
        ]
    }
  };