const gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    concat = require('gulp-concat'),
    minjs = require('gulp-minify'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    del = require('del');


gulp.task('scripts', function () {
    return gulp.src([
        "scripts/vendor/cos.js",
        
        // Global settings
        "scripts/settings.js",
        
        // Module text for all languages
        "scripts/languages/*.js",
        
        // Vendors
        "scripts/vendor/dialReqs.js",
        "scripts/vendor/jquery.min.js",
        "scripts/vendor/jquery-ui.min.js",
        "scripts/vendor/jquery.ui.touch-punch.min.js",
        "scripts/vendor/scorm_api_min.js",

        // All data for i18n, pagination and reporting.
        "scripts/data/*.js",

        // Controllers
        "scripts/controllers/*.js",

        // Components
        "scripts/components/*.js",

        // Utlity
        "scripts/utility/*.js",

        // Content, this runs as an initialiser.
        "scripts/content.js"

    ], { base: 'src' })        
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("www/assets/"));
});

gulp.task('minify-js', function () {
    return gulp.src('www/assets/scripts.js')
        .pipe(minjs())
        .pipe(gulp.dest('www/assets/'));
});

gulp.task('minify-css', () => {
    return gulp.src('www/assets/main.css')
        .pipe(cleanCSS())
        .pipe(rename('main.css'))
        .pipe(gulp.dest('www/assets/'));
});

gulp.task('sass', function () {
    return gulp.src('sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/assets/'));
});

gulp.task('watch:sass', function () {
    gulp.watch('sass/**/*.scss', gulp.series('clean', 'scripts', 'sass'));
});
gulp.task('watch:scripts', function () {
    gulp.watch('scripts/**/*.js', gulp.series('clean', 'scripts', 'sass'));
});

//Delete compiled script and css
gulp.task('clean', function () {
    return del(['www/assets/*.css', 'www/assets/*.js', 'www/assets/*.map']);
});

gulp.task('dev', gulp.series('clean', 'scripts', 'sass'));
gulp.task('dist', gulp.series('dev', 'minify-js', 'minify-css'));
