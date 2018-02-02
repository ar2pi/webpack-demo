const fs            = require('fs');
const path          = require('path');
const util          = require('util');
const chalk         = require('chalk');
const moment        = require('moment');

const isDirectory = source => {
    return fs.lstatSync(source).isDirectory();
};
const isFile = source => {
    return fs.lstatSync(source).isFile();
};
const getDirectories = source => {
    return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
};
const getFiles = source => {
    return fs.readdirSync(source).map(name => path.join(source, name)).filter(isFile);
};
const log = stuff => {
    let fstuff;
    switch (typeof stuff) {
        case 'undefined':
        case 'boolean':
            fstuff = stuff;
            break;
        case 'string':
            fstuff = util.format('%s', stuff);
            break;
        case 'number':
            fstuff = util.format('%d', stuff);
            break;
        case 'object':
            let type = stuff instanceof Date ? 'Date' : stuff instanceof Array ? 'Array' : 'Object';
            fstuff = (stuff === null) ? fstuff : `[${type}]\n${util.format('%O', stuff)}\n`;
            break;
        case 'function':
            fstuff = `[Function]\n${util.format('%o', stuff)}\n`;
            break;
    }
    console.log(`[${chalk.gray(moment().format('HH[:]mm[:]ss'))}] ${fstuff}`);
};

module.exports = {
    isDirectory,
    isFile,
    getDirectories,
    getFiles,
    log
};