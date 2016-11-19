const fs = require('fs');
const node_modules = fs.readdirSync('node_modules').filter(x => x !== '.bin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const globby = require('globby');

fs.writeFileSync('test/all.ts',
  globby.sync(['test/**/*-test.ts', 'test/**/*-test.tsx'])
    .map(file => file.replace('test/', '').replace(/\.tsx?$/, ''))
    .map(file => `import './${file}';`)
    .join('\n'));

module.exports = [{
  target: 'web',
  entry: './src/client',
  output: {
    path: __dirname + '/dist',
    filename: 'client.js'
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript?useBabel=true'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!less?sourceMap')
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!less?sourceMap')
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.tsx', '.ts', '.webpack.js', '.web.js', '.js']
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      template: './src/index.ejs'
    })
  ]
},{
  target: 'node',
  entry: './src/server',
  output: {
    path: __dirname + '/dist',
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript?useBabel=true'
      }
    ]
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  }
},{
  target: 'node',
  entry: './test/all',
  output: {
    path: __dirname + '/dist',
    filename: 'test.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript?useBabel=true'
      },
      {
        test: /\.css$/,
        loader: 'style!css!less'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less'
      }
    ]
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.tsx', '.ts', '.webpack.js', '.web.js', '.js']
  }
}];
