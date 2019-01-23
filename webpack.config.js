const fs = require('fs');
const node_modules = fs.readdirSync('node_modules').filter(x => x !== '.bin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
// const WebpackShellPlugin = require('webpack-shell-plugin');


//const globby = require('globby');


//fs.writeFileSync('test/all.ts',
//  globby.sync(['test/**/*-test.ts', 'test/**/*-test.tsx'])
//    .map(file => file.replace('test/', '').replace(/\.tsx?$/, ''))
//   .map(file => `import './${file}';`)
//   .join('\n'));

module.exports = [{
  mode: 'development',
  target: 'web',
  entry: './src/ui/client.tsx',
  output: {
    path: __dirname + '/dist',
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css-loader?sourceMap!less-loader?sourceMap')
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('css-loader?sourceMap!less-loader?sourceMap')
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: [ 'url-loader?limit=10000', 'img-loader?minimize' ],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.webpack.js', '.web.js', '.js']
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      template: './src/ui/index.ejs'
    }),
    new webpack.EnvironmentPlugin({ PACKED: 'true' })
  ]
}, {
  mode: 'development',
  target: 'node',
  entry: './src/server/server',
  output: {
    path: __dirname + '/dist',
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.webpack.js', '.web.js', '.js']
  },
  plugins: [
    new webpack.EnvironmentPlugin({ PACKED: 'true' })
  ]
}, {
  mode: 'development',
  target: 'node',
  entry: './src/gpg-mock/index',
  output: {
    path: __dirname + '/dist',
    filename: 'gpg-mock.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  node: {
    __filename: false,
    __dirname: false
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.webpack.js', '.web.js', '.js']
  },
  plugins: [
    new webpack.EnvironmentPlugin({ PACKED: 'true' })
  ]
}

];
