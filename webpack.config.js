const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: ['babel-polyfill', './src/index.js'],
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env', 'flow']
					}
				}
			}
		]
	},
 	output: {
		filename: 'informo.js',
		path: path.resolve(__dirname, 'dist')
	},
	plugins: [
		// new UglifyJSPlugin(),
		new HtmlWebpackPlugin({
			template: './src/index.html'
		})
	]
};

