const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const CleanWebpackPlugin = require('clean-webpack-plugin');

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

let aliasMap = getDirectories('./src/Aviatur').reduce(function (acc, cur, i) {
    const bundle = cur.match(/\/(\w*Bundle)$/)[1];
    acc[bundle] = bundle + '/Resources/public/js';
    return acc;
}, {});

let entries = [
        'FlightBundle//flight-availability.js',
        'HotelBundle//hotel-availability.js',
        'GeneralBundle//general-detail.js',
    ],
    hmrMods = [
        'webpack-dev-server/client?http://localhost:9000',
        'webpack/hot/only-dev-server',
        '../../tasks/serve-assets.js',
    ],
    entryMap = {};
for (let entry of entries) {
    const partials = entry.split('//');
    entryMap[partials[1].replace(/\..*$/, '')] = hmrMods.concat([
        './' + partials.join('/Resources/public/js/')
    ]);
}
entryMap['common'] = hmrMods.concat([
    '../../web/assets/common_assets/js/common.js'
]);

module.exports = {
    entry: entryMap,
    context: path.resolve(__dirname, '../src/Aviatur'),
    resolve: {
        extensions: ['*', '.js', '.json'],
        alias: aliasMap
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'web'),
        host: '0.0.0.0',
        port: 9000,
        hot: true,
        stats: {
            colors: true
        }
    },
    module: {
        rules: [{
            test: /.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }, {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "sass-loader"
            }]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['*.js'], {
            root: path.resolve(__dirname, '../web/js')
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['boilerplate', 'common'],
            minChunks: 2
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        filename: './[name]-bundle.js',
        path: path.resolve(__dirname, '../web/js')
    }
};