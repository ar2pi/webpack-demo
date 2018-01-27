const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        main: [
            // 'webpack/hot/only-dev-server',
            './src/index.js'
        ]
    },
    // output: {
    //     filename: "[name].bundle.js",
    //     chunkFilename: "[id].chunk.js",
    //     path: path.resolve(__dirname, 'dist')
    // },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        host: '0.0.0.0',
        port: 9000,
        stats: {
            colors: true
        }
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [{
            test: /.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }]
    },
    // plugins: [
    //     // new webpack.HotModuleReplacementPlugin(),
    //     // new webpack.optimize.CommonsChunkPlugin({
    //     //     filename: "commons.js",
    //     //     name: "commons"
    //     // })
    // ]
};