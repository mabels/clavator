const fs = require('fs');
const node_modules = fs.readdirSync('node_modules').filter(x => x !== '.bin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const WebpackShellPlugin = require('webpack-shell-plugin');


//const globby = require('globby');


//fs.writeFileSync('test/all.ts',
//  globby.sync(['test/**/*-test.ts', 'test/**/*-test.tsx'])
//    .map(file => file.replace('test/', '').replace(/\.tsx?$/, ''))
//   .map(file => `import './${file}';`)
//   .join('\n'));

module.exports = [{
  target: 'web',
  entry: './src/ui/client.js',
  output: {
    path: __dirname + '/dist',
    filename: 'client.js'
  },
  module: {
    rules: [
      // {
      //   test: /\.tsx?$/,
      //   loader: 'ts-loader'
      // },
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
        loaders: [ 'url-loader?limit=10000', 'img-loader?minimize' ],
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
    extensions: [/* '.tsx', '.ts', */ '.webpack.js', '.web.js', '.js']
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      template: './src/ui/index.ejs'
    })
  ]
}];
