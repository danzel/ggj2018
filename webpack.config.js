var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

// http://stackoverflow.com/a/38733864
function isExternal(module) {
	var userRequest = module.userRequest;

	if (typeof userRequest !== 'string') {
		return false;
	}

	return userRequest.indexOf('bower_components') >= 0 ||
		userRequest.indexOf('node_modules') >= 0 ||
		userRequest.indexOf('libraries') >= 0;
}

module.exports = {
	context: __dirname + path.sep + 'src',
	entry: './index.ts',
	devtool: 'inline-source-map',
	devServer: { inline: true },
	output: {
		path: __dirname + path.sep + 'dist',
		filename: "[name].bundle.js",
		chunkFilename: "[id].bundle.js"
	},
	module: {
		loaders: [
			// Some hacks to make loading phaser work
			{ test: /pixi\.js/, loader: 'expose-loader?PIXI' },
			{ test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
			{ test: /p2\.js/, loader: 'expose-loader?p2' },

			{ test: /\.tsx?$/, loader: 'ts-loader' },
			{ test: /\.css$/, loader: ExtractTextPlugin.extract("css-loader") },
			{ test: /\.png$/, loader: 'file-loader?name=[hash].[ext]' },
			{ test: /\.svg$/, loader: 'file-loader?name=[hash].[ext]' },
			{ test: /\.m4a$/, loader: 'file-loader?name=[hash].[ext]' },
			{ test: /\.opus$/, loader: 'file-loader?name=[hash].[ext]' },
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendors',
			minChunks: function (module) {
				return isExternal(module)
			}
		}),
		new ExtractTextPlugin("[name].bundle.css"),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './index.template.html',
			hash: true,
			inject: true
		})
	],
	resolve: {
		alias: {
			'phaser-ce': phaser,
			'pixi': pixi,
			'p2': p2
		},
		extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
	},
	node: {
		fs: 'empty'
	}
};