const gulp          = require('gulp');
const path        = require('path');
const fs          = require('fs');
const argv = require('yargs').argv;

const postcss      = require('gulp-postcss');
const rename        = require('gulp-rename');
const sourcemaps    = require('gulp-sourcemaps');

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

let aliasMap = getDirectories('./web/assets').reduce(function (acc, cur, i) {
    const folder = cur.match(/\/(\w*)_assets$/)[1];
    acc[folder] = `web/assets/${folder}_assets/css`;
    return acc;
}, {});
console.log(aliasMap);

let assets_folder = '';
if (typeof argv.f !== 'undefined') {
    assets_folder = argv.f;
} else if (typeof argv.folder !== 'undefined') {
    assets_folder = argv.folder;
}
console.log(assets_folder);
process.exit();

const sassChain = function(assets) {
    return gulp.src(assets)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.resolve('../')));
};

const postcssChain = function (assets) {
    return gulp.src(assets)
        .pipe(cleanCSS({ compatibility: 'ie9' }))
        .pipe(rename({ basename: 'style', extname: '.min.css' }))
        .pipe(path.resolve('../'));
};

gulp.task('watch', function () {
    gulp.watch([
        'web/assets/*_assets/css/scss/*.scss',
        'web/assets/*_assets/css/*.css',
        '!web/assets/*_assets/css/main.css'
    ], ['postcss']);
});

gulp.task('sass', function () {
    let folders = (assets_folder.length) ? [aliasMap[f]] : Object.values(aliasMap);
    for (folder of folders) {
        sassChain(folder);
    }
    return 'ok';
});

gulp.task('postcss', ['sass'], function () {
    let folders = (assets_folder.length) ? [aliasMap[f]] : Object.values(aliasMap);
    for (folder of folders) {
        postcssChain(folder);
    }
    return 'ok';
});

gulp.task('default', ['postcss']);
gulp.task('main', ['postcss']);
