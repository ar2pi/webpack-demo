const path = require('path');
const fs = require('fs');

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

let alias = getDirectories('../src/Aviatur').reduce(function (acc, cur, i) {
    let bundle = cur.match(/\/(\w*Bundle)$/)[1];
    acc[bundle] = bundle + '/Resources/public/js';
    return acc;
}, {});
console.log(alias);