const webpack = require('webpack');
const path = require('path');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
	module: {
		rules: [
			{
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',

				options: {
					plugins: ['syntax-dynamic-import'],

					presets: [
						[
							'@babel/env',
							{
								modules: false
							}
						]
					]
				},

				test: /\.js$/
			}
		]
	},

	resolve: {
		alias: {
			Shared:  path.resolve(__dirname, './src/shared')
		}
	},

	entry: {
		controller: './src/controller.js',
		messages: './src/messages.js',
		interaction: './src/interaction.js',
		start: './src/start.js',
		pageAction: './src/page-action.js'
	},

	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json'
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	},

	plugins: [
		new CopyWebpackPlugin([
			{
				from: './src/manifest.json',
				to: 'manifest.json',
				toType: 'file'
			},
			{
				from: './src/messages.css',
				to: 'messages.css',
				toType: 'file'
			},
			{
				from: './src/img',
				to: 'img',
				toType: 'dir'
			},
			{
				from: './src/index.html',
				to: 'index.html',
				toType: 'file'
			}
		], {}),
		new ZipPlugin({
			filename: 'ext.zip'
		})
	]
};
