
var plugins = [];

module.exports = {
    devtool: 'source-map',
    resolve: {
        alias: {}
    },
    output: {
        //publicPath is required and needs to be a url
        publicPath: 'http://localhost:8080/',
    },
    plugins: plugins,
    module: {
        loaders: [
            {test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
