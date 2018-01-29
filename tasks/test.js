const path = require('path');
const fs = require('fs');

var argv = require('yargs').argv;
var isProduction = (argv.production === undefined) ? false : true;
console.log(argv);

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

let aliasMap = getDirectories('../web/assets').reduce(function (acc, cur, i) {
    const folder = cur.match(/\/(\w*_assets)$/)[1];
    acc[folder] = folder + '/css';
    return acc;
}, {});
console.log(aliasMap);