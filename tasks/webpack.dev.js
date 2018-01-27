const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

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
    entryMap[partials[1].replace(/\..*$/, '')] = partials.join('/Resources/public/js/')
}

module.exports = {
    entry: entryMap,
    output: {
        filename: './[name]-bundle.js',
        path: path.resolve(__dirname, '../web/js')
    },
    context: path.resolve(__dirname, '../src/Aviatur'),
    resolve: {
        extensions: ['*', '.js', '.json'],
        alias: aliasMap
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        host: '0.0.0.0',
        port: 9000,
        stats: {
            colors: true
        }
    },
    module: {
        rules: [{
            test: /.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};