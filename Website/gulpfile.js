/// <binding Clean='rebuild' AfterBuild='test' ProjectOpened='watch'/>
//BeforeBuild='build'
"use strict";

const gulp = require("gulp"),
    autoprefixer = require('gulp-autoprefixer'),// Auto-prefix CSS (https://www.npmjs.com/package/gulp-autoprefixer)
    concat = require('gulp-concat'),            // Concatenate files (https://www.npmjs.com/package/gulp-concat/)
    csslint = require('gulp-csslint'),          // CSS linter (https://www.npmjs.com/package/gulp-csslint/)
    cssnano = require("gulp-cssnano"),
    gulpif = require('gulp-if'),                // If statement (https://www.npmjs.com/package/gulp-if/)
    imagemin = require('gulp-imagemin'),        // Optimizes images (https://www.npmjs.com/package/gulp-imagemin/)
    sourcemaps = require('gulp-sourcemaps'),    // Creates source map files (https://www.npmjs.com/package/gulp-sourcemaps/)
    rimraf = require('rimraf'),                 // Deletes files and folders (https://www.npmjs.com/package/rimraf/)
    sass = require('gulp-sass'),                // Compile SCSS to CSS (https://www.npmjs.com/package/gulp-sass/)
    plumber = require('gulp-plumber'),          // Handles Gulp errors (https://www.npmjs.com/package/gulp-plumber)
    log = require('fancy-log'),
    merge = require('merge-stream'),            // Merges one or more gulp streams into one (https://www.npmjs.com/package/merge-stream/)
    sasslint = require('gulp-sass-lint');       // SASS linter (https://www.npmjs.com/package/gulp-sass-lint/)

const src = 'wwwroot/src';
const dest = 'wwwroot';

// Initialize directory paths.
const paths = {
    // Source Directory Paths
    nodeModules: '../node_modules/',
    scripts: './' + src + '/js/',
    styles: './' + src + '/css/',
    tests: './' + src + '/test/',

    // Destination Directory Paths
    wwwroot: './' + dest + '/',
    css: './' + dest + '/css/',
    fonts: './' + dest + '/fonts/',
    img: './' + dest + '/img/',
    js: './' + dest + '/js/'
};

var files = {
    css: paths.styles + '**/*.css',
    scss: paths.styles + '**/*.scss',
    js: paths.scripts + '**/*.js',
    ts: paths.scripts + '**/*.ts'
};

var sources = {
    css: [
        {
            name: 'cystem.css',
            paths: [
                paths.styles + 'cystem.scss'
            ]
        },
        {
            name: 'website.css',
            paths: [
                paths.styles + 'website.scss'
            ]
        }
    ],
    js: []
};

const Task = Object.freeze({
    Clean: 'clean',
    CleanCss: 'clean-css',
    CleanJs: 'clean-js',
    Lint: 'lint',
    LintCss: 'lint-css',
    Build: 'build',
    BuildCss: 'build-css',
    Rebuild: 'rebuild',
    Test: 'test',
    Watch: 'watch',
    WatchCss: 'watch-css',
    OptimizeImages: 'optimize-images',
    Default: 'default'
});

gulp.task(Task.CleanCss, done => rimraf(paths.css, done));
gulp.task(Task.CleanJs, done => rimraf(paths.js, done));

/*
 * Report warnings and errors in your CSS and SCSS files (lint them) under the Styles folder.
 */
gulp.task(Task.LintCss, function () {
    return merge([                              // Combine multiple streams to one and return it so the task can be chained.
        gulp.src(files.css)               // Start with the source .css files.
            .pipe(plumber())                    // Handle any errors.
            .pipe(csslint())                    // Get any CSS linting errors.
            .pipe(csslint.formatter()),         // Report any CSS linting errors to the console.
        gulp.src(files.scss)              // Start with the source .scss files.
            .pipe(plumber())                    // Handle any errors.
            .pipe(sasslint())                   // Run SCSS linting.
            .pipe(sasslint.format())            // Report any SCSS linting errors to the console.
            .pipe(sasslint.failOnError())       // Fail the task if an error is found.
    ]);
});

/*
 * Builds the CSS for the site.
 */
gulp.task(Task.BuildCss, () => {
    var tasks = sources.css.map(function (source) { // For each set of source files in the sources.
        if (source.copy) {                          // If we are only copying files.
            return gulp
                .src(source.paths)                  // Start with the source paths.
                .pipe(rename({                      // Rename the file to the source name.
                    basename: source.name,
                    extname: ''
                }))
                .pipe(gulp.dest(paths.css));        // Saves the CSS file to the specified destination path.
        }
        else {
            return gulp                             // Return the stream.
                .src(source.paths)                  // Start with the source paths.
                .pipe(plumber())                    // Handle any errors.
                .pipe(sourcemaps.init())             // Set up the generation of .map source files for the CSS.
                //.pipe(gulpif(
                //    environment.isDevelopment(),    // If running in the development environment.
                //    sourcemaps.init()))             // Set up the generation of .map source files for the CSS.
                .pipe(gulpif('**/*.scss', sass()))  // If the file is a SASS (.scss) file, compile it to CSS (.css).
                .pipe(autoprefixer({                // Auto-prefix CSS with vendor specific prefixes.
                    browsers: [
                        '> 1%',                     // Support browsers with more than 1% market share.
                        'last 2 versions'           // Support the last two versions of browsers.
                    ]
                }))
                .pipe(concat(source.name))          // Concatenate CSS files into a single CSS file with the specified name.
                //.pipe(gulpif(
                //    !environment.isDevelopment(),   // If running in the staging or production environment.
                //    cssnano()))                     // Minifies the CSS.
                .pipe(cssnano({
                    discardComments: { removeAll: true }
                }))
                //.pipe(gulpif(
                //    environment.isDevelopment(),    // If running in the development environment.
                //    sourcemaps.write('.')))         // Generates source .map files for the CSS.
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(paths.css));        // Saves the CSS file to the specified destination path.
        }
    });
    return merge(tasks);                            // Combine multiple streams to one and return it so the task can be chained.
});

/*
 * Optimizes and compresses the GIF, JPG, PNG and SVG images for the site.
 */
gulp.task(Task.OptimizeImages, function () {
    return gulp
        .src(sources.img)                   // Start with the source paths.
        .pipe(plumber())                    // Handle any errors.
        //        .pipe(sizeBefore())                 // Write the size of the file to the console before minification.
        .pipe(imagemin({                    // Optimize the images.
            multipass: true,                // Optimize SVG multiple times until it's fully optimized.
            optimizationLevel: 7            // The level of optimization (0 to 7) to make, the higher the slower it is.
        }))
        .pipe(gulp.dest(paths.img));       // Saves the image files to the specified destination path.
//        .pipe(sizeAfter());                 // Write the size of the file to the console after minification.
});

/*
 * Watch the styles folder for changes to .css, or .scss files. Build the CSS if something changes.
 */
gulp.task(Task.WatchCss, () => {
    return gulp
        .watch(
            paths.styles + '**/*.{css,scss}',
            gulp.series([/*Task.LintCss, */Task.BuildCss]))
        .on('change', (path, stats) => {
            log.info('File ' + path + ' was changed, build-css task started.');
        });
});

gulp.task(Task.Clean, gulp.parallel([Task.CleanJs, Task.CleanCss]));

gulp.task(Task.Lint, gulp.series([Task.LintCss]));

gulp.task(Task.Build, gulp.series([Task.BuildCss]));

gulp.task(Task.Rebuild, gulp.series([Task.Clean, Task.Build]));

//gulp.task(Task.Test, gulp.series());

gulp.task(Task.Watch, gulp.parallel([Task.WatchCss]));

gulp.task(Task.Default, gulp.series([Task.Clean, /*Task.Build,*/ Task.Watch]));