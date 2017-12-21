const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isDevServer = process.argv[1].indexOf('webpack-dev-server') !== -1;
const extractSass = new ExtractTextPlugin({
	filename: (isDevServer ? 'dist/' : '') + 'style.css',
});

module.exports = {
	entry: ['./app/index.js', './scss/main.scss'],
	devtool: 'source-map',
	output: {
		path: __dirname + '/dist',
		publicPath: isDevServer ? 'http://localhost:8080/' : './',
	},
	plugins: [
		extractSass,
	],
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: extractSass.extract({
					use: ['css-loader', 'resolve-url-loader', 'sass-loader?sourceMap'],
					// use style-loader in development
					fallback: "style-loader"
				})
			},
			{
				loader: 'file-loader',
				test: /\.(eot|ttf|woff2?)$/,
				// exclude: /node_modules/,
				// include: __dirname + "/node_modules/materialize-css/dist/",
				options: {
					name: 'fonts/[name].[ext]'
				}
			},
			{// TODO: copy all images in dist/
				loader: 'file-loader',
				test: /\.(png|jpg|gif|svg)$/,
				options: {
					name: 'img/[name].[ext]'
				}
			}
		]
	},
};
