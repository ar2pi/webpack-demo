const gulp          = require('gulp');
const fs            = require('fs');
const path          = require('path');
const argv          = require('yargs').argv;
const chalk         = require('chalk');
const chokidar      = require('chokidar');

const concat        = require('gulp-concat');
const rename        = require('gulp-rename');
const postcss       = require('gulp-postcss');
const sourcemaps    = require('gulp-sourcemaps');

const mdcss         = require('mdcss');
const autoprefixer  = require('autoprefixer');
const uncomment     = require('postcss-discard-comments');
const cachebuster   = require('postcss-cachebuster');
const sass          = require('postcss-node-sass');
const csso          = require('postcss-csso');

const _util         = require('./scripts/_util.js');

let aliasMap = _util.getDirectories(path.join('.', 'web', 'assets')).reduce((acc, cur, i) => {
    let folder = cur.match(/[\/\\](\w*)_assets$/);
    if (folder !== null) {
        acc[folder[1]] =  path.join('web', 'assets', `${folder[1]}_assets`, 'css');
    }
    return acc;
}, {});
let aliasEntries = entry => (entry.length) ? [aliasMap[entry]] : Object.values(aliasMap);

let assets_folder = (argv.d) ? argv.d : (argv.folder) ? argv.folder : '';
let assets_folder_paths = aliasEntries(assets_folder);

const sassChain = src => {
    let dest = path.resolve(path.dirname(src), '../');
    let plugins = [
        sass(),
        autoprefixer()
    ];
    return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(postcss(plugins))
        .pipe(rename({
            dirname: dest,
            basename: 'main', 
            extname: '.css'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest));
};

const postSassChain = src => {
    const cssFiles = _util.getFiles(src).filter(file => /\.css$/.test(file));
    let mainCss = cssFiles.filter(file => /^main$/.test(path.basename(file, '.css')));
    let customCss = cssFiles.filter(file => !/^(?:main)|(?:main.min)$/.test(path.basename(file, '.css')));
    let dest = path.resolve(src);
    let plugins = [
        uncomment({
            removeAll: true
        }),
        cachebuster({
            imagesPath: '/web',
            cssPath: `/${src.replace(/\\/g, '/')}`
        }),
        csso()
    ];
    return gulp.src([...mainCss, ...customCss])
        .pipe(concat('main.min.css'))
        .pipe(postcss(plugins))
        .pipe(rename({
            dirname: dest
        }))
        .pipe(gulp.dest(dest));
};

const docChain = src => {
    let mainCss = _util.getFiles(src).filter(file => /main.css$/.test(file));
    let dest = path.resolve(src);
    let plugins = [
        mdcss({
            destination: `/${src.replace(/\\/g, '/')}/styleguide`,
            index: 'index.html'
        })
    ];
    return gulp.src(mainCss)
        .pipe(postcss(plugins))
        .pipe(rename({
            dirname: dest
        }))
        .pipe(gulp.dest(dest));
};

const taskRunner = (tasks, done) => {
    for (folder of assets_folder_paths) {
        let assetsFolder = /[\/\\].*_assets[\/\\]/.test(folder) ? folder.replace(/.*[\/\\](.*_assets)[\/\\].*/, '$1') : folder;
        let tasksGroup = tasks.map(t => chalk.bold.rgb(0,128,128)(t));
        _util.log(`Starting [${tasksGroup.join(', ')}'] in ${assetsFolder}`);
        for (let i = 0; i < tasks.length; i++) {
            switch(tasks[i]) {
                case 'sass':
                    _util.log(`- Writing ${chalk.bold('main.css')}`);
                    sassChain(path.join(folder, 'scss', 'main.scss'));
                    break;
                case 'postSass':
                    _util.log(`- Writing ${chalk.bold('main.min.css')}`);
                    postSassChain(folder);
                    break;
                case 'doc':
                    _util.log(`- Generating doc in ./styleguide`);
                    docChain(folder);
                    break;
            }
            _util.log(`- Done with '${tasksGroup[i]}'`);
        }
        _util.log(`Finished [${tasksGroup.join(', ')}] in ${assetsFolder}`);
    }
    return done();
};

gulp.task('watch', () => {
    let watched = [
        'web/assets/*_assets/css/scss/*.scss',
        'web/assets/*_assets/css/*.css',
    ];
    let cwd = new RegExp(`^web[\\/\\\\]assets[\\/\\\\]${assets_folder || '.*'}_assets[\\/\\\\]`);
    let ignored = [
        new RegExp(`[\\/\\\\]css[\\/\\\\]main(?:\\.min)?\\.css$`)
    ];
    chokidar.watch(watched).on('change', (fpath, stats) => {
        if (cwd.test(fpath)) {
            for (let ignore of ignored) {
                if (ignore.test(fpath))
                    return;
            }
            _util.log(`${chalk.bold(fpath)} changed`);
            gulp.parallel('css')();
        }
    }).on('error', error => {
        _util.log(`Watcher error: ${error}`);
    });
});


gulp.task('css', (done) => {
    return taskRunner(['sass', 'postSass'], done);
});

gulp.task('sassOnly', (done) => {
    return taskRunner(['sass'], done);
});

gulp.task('postSassOnly', (done) => {
    return taskRunner(['postSass'], done);
});

gulp.task('doc', (done) => {
    return taskRunner(['doc'], done);
});

gulp.task('default', gulp.series('css'));
gulp.task('main', gulp.series('css'));
