const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const ManifestPlugin = require('webpack-manifest-plugin');
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
], entryMap = {};
for (let entry of entries) {
    const partials = entry.split('//');
    entryMap[partials[1].replace(/\..*$/, '')] = './' + partials.join('/Resources/public/js/')
}

module.exports = {
    entry: entryMap,
    output: {
        filename: './dist/[name].[chunkhash:16].js', // @todo: caching see https://webpack.js.org/guides/caching/
        path: path.resolve(__dirname, '../web/js')
    },
    context: path.resolve(__dirname, '../src/Aviatur'),
    resolve: {
        extensions: ['*', '.js', '.json'],
        alias: aliasMap
    },
    module: {
        rules: [{
            test: /.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }]
    },
    plugins: [
        new ManifestPlugin({
            basePath: 'js/',
            map: obj => {
                obj.path = obj.path.replace('./', '');
                return obj;
            }
        }),
        new CleanWebpackPlugin(['dist'], { 
            root: path.resolve(__dirname, '../web/js')
        })
    ]
};