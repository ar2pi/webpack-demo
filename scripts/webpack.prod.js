const webpack               = require('webpack');
const path                  = require('path');
const fs                    = require('fs');

const ManifestPlugin        = require('webpack-manifest-plugin');
const CleanWebpackPlugin    = require('clean-webpack-plugin');
const MinifyPlugin          = require('babel-minify-webpack-plugin');

const _util                 = require('./_util.js');

const BUNDLES_DIR       = path.resolve(__dirname, '../src/Aviatur');
const JS_DIR            = path.resolve(__dirname, '../web/js');
const ASSETS_DIR        = path.resolve(__dirname, '../web/assets');
const BUNDLE_JS_PATH    = '/Resources/public/js/';
const COMMON_JS_NAME    = 'common';

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

entryMap[COMMON_JS_NAME] = [
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
    module: {
        rules: [{
            test: /.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: JS_DIR
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['boilerplate', COMMON_JS_NAME],
            minChunks: Infinity,
        }),
        new MinifyPlugin({}, {
            test: /\.(?:js|json)(?:$|\?)/i,
            comments: false
        }),
        new ManifestPlugin({
            basePath: '',
            map: obj => {
                obj.name = outputMap[obj.name.replace(/\.js$/, '')];
                obj.path = obj.path.replace(/^\.\//, 'js/');
                return obj;
            }
        })
    ],
    output: {
        filename: './dist/[name].[chunkhash:16].js',
        path: JS_DIR
    }
};