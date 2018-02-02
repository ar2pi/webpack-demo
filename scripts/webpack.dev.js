const webpack               = require('webpack');
const path                  = require('path');
const fs                    = require('fs');
const argv                  = require('yargs').argv;

const ManifestPlugin        = require('webpack-manifest-plugin');
const CleanWebpackPlugin    = require('clean-webpack-plugin');
const MinifyPlugin          = require('babel-minify-webpack-plugin');

const _util                 = require('./_util.js');

const BUNDLES_DIR       = path.resolve(__dirname, '../src/Aviatur');
const PUBLIC_DIR        = path.resolve(__dirname, '../web');
const JS_DIR            = path.resolve(__dirname, '../web/js');
const ASSETS_DIR        = path.resolve(__dirname, '../web/assets');
const BUNDLE_JS_PATH    = '/Resources/public/js/';
const COMMON_JS_NAME    = 'common';

let assets_folder       = ((argv.d) ? argv.d : (argv.folder) ? argv.folder : 'aviatur') + '_assets';

let aliasMap = _util.getDirectories(BUNDLES_DIR).reduce(function (acc, cur, i) {
    const bundle = cur.match(/[\/\\]([A-Z]\w*Bundle)$/)[1];
    acc[bundle] = `${bundle + BUNDLE_JS_PATH}`;
    return acc;
}, {});
let entries = [];
let entryMap = {};
let outputMap = {};

for (let bundle in aliasMap) {
    let jsFiles = _util.getFiles(path.join(BUNDLES_DIR, aliasMap[bundle])).filter(e => path.extname(e) === '.js');
    for (let file of jsFiles) {
        entries.push(`${bundle}//${path.parse(file).base}`);
    }
}
for (let entry of entries) {
    const partials = entry.split('//');
    const slug = partials[0].replace(/Bundle$/, '').toLowerCase();
    const name = path.parse(partials[1]).name.replace(/\.min$/, '');
    entryMap[`${slug}_${name}`] = './' + partials.join(BUNDLE_JS_PATH);
    outputMap[`${slug}_${name}`] = entry;
}

let hmrMods = [
    // 'webpack-dev-server/client?http://localhost:9000',
    //'webpack/hot/dev-server',
    // 'webpack/hot/only-dev-server',
    path.join(ASSETS_DIR, assets_folder, 'css/scss/main.scss'),
];

entryMap[COMMON_JS_NAME] = [
    ...hmrMods,
    path.relative(BUNDLES_DIR, path.join(ASSETS_DIR, 'common_assets/js/common.js')),
];
outputMap[COMMON_JS_NAME] = COMMON_JS_NAME;

module.exports = {
    entry: entryMap,
    context: BUNDLES_DIR,
    resolve: {
        extensions: ['*', '.js', '.json'],
        alias: aliasMap
    },
    devtool: 'inline-source-map',

    // https://webpack.js.org/configuration/dev-server/
    devServer: {
        contentBase: path.resolve(__dirname, '../web'),
        publicPath: '/js/',
        host: 'localhost',
        port: 9000,
        hot: true,
        inline: true,
        open: true,
        // index: 'index.html',
        watchContentBase: true,
        overlay: {
            warnings: true,
            errors: true
        },
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
        // new CleanWebpackPlugin(['*.js'], {
        //     root: JS_DIR
        // }),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['boilerplate', COMMON_JS_NAME],
            minChunks: Infinity,
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],

    // https://webpack.js.org/configuration/output/
    output: {
        filename: './[name]-bundle.js',
        path: JS_DIR,
        // publicPath: 'http://localhost:9000/js/',
        publicPath: '/js/',
        crossOriginLoading: 'anonymous',
    }
};