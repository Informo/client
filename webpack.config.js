const isDevServer = process.argv[1].indexOf('webpack-dev-server') !== -1;

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin({
    filename: (isDevServer ? 'dist/' : '') + 'style.css',
    // disable: process.env.NODE_ENV === "development"
});

module.exports = {
	entry: ['./app/index.js', './scss/main.scss'],
	devtool: 'source-map',
	resolve: {
		alias: {}
	},
	output: {
		//publicPath is required and needs to be a url
		publicPath: 'http://localhost:8080/',
		path: __dirname + '/dist'
	},
	plugins: [
		extractSass,
	],
	module: {
		loaders: [
			{test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['env']
				}
			}
		],

		rules: [
			{
	            test: /\.scss$/,
				use: extractSass.extract({
	                use: [{
	                    loader: "css-loader"
	                }, {
	                    loader: "sass-loader"
	                }],
	                // use style-loader in development
	                fallback: "style-loader"
	            })
	        }
		]
	}
};
