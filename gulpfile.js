var gulp          = require('gulp');
var rename        = require('gulp-rename');
var sass          = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var cleanCSS      = require('gulp-csso');
var sourcemaps    = require('gulp-sourcemaps');

var argv          = require('yargs').argv;
var isProduction  = (argv.production === undefined) ? false : true;

gulp.task('watch', function () {
    gulp.watch([
        'web/assets/*_assets/css/scss/*.scss', 
        'web/assets/*_assets/css/*.css', 
        '!web/assets/*_assets/css/main.css'
    ], ['postcss']);
});

gulp.task('sass', function () {
    return gulp.src('web/assets/*_assets/css/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'));
});

gulp.task('postcss', ['sass'], function () {
    return gulp.src('css/main.css')
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(rename({basename: 'style', extname: '.min.css'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['postcss']);
