'use strict';

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import swPrecache from 'sw-precache';
import pkg from './package.json';

const $glp = gulpLoadPlugins();

gulp.task('prepare-critical-style', () => {
    return gulp.src([
        './styles/critical.css',
    ]).pipe($glp.concat('project-critical.css')).pipe($glp.size({title: 'critical-style'})).pipe(gulp.dest('styles'));
});

gulp.task('prepare-base-style', ['prepare-critical-style'], () => {
    return gulp.src([
        './styles/reset.css',
        './styles/main-responsive.css',
        './styles/edit-responsive.css',
        './styles/lang_cz.css',
    ]).pipe($glp.concat('project-base.css')).pipe($glp.size({title: 'base-style'})).pipe(gulp.dest('styles'));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', ['prepare-base-style'], () => {
    const AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10',
    ];

    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
        './styles/*.scss',
        './styles/*.css',
    ]).
        pipe($glp.newer('temp/gulp/styles')).
        pipe($glp.sourcemaps.init()).
        pipe($glp.sass({
            precision: 10,
        }).on('error', $glp.sass.logError)).
        pipe($glp.autoprefixer(AUTOPREFIXER_BROWSERS)).
        pipe(gulp.dest('temp/gulp/styles'))
        // Concatenate and minify styles
        .pipe($glp.if('*.css', $glp.cssnano({zindex: false}))).
        pipe($glp.size({title: 'styles'})).
        pipe($glp.sourcemaps.write('./')).
        pipe($glp.if('*.css', $glp.rev())).
        pipe(gulp.dest('dist/styles')).
        pipe($glp.rev.manifest({
            path: './rev-manifest.json',
            base: './',
            merge: true,
        })).
        pipe(gulp.dest('./'));
});

// Concatenate and minify JavaScript placed into <head>. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts-head', () =>
    gulp.src([
        // Note: Since we are not using useref in the scripts build pipeline,
        //       you need to explicitly list your scripts here in the right order
        //       to be correctly concatenated
        './js/lang.js',
        './node_modules/jquery/dist/jquery.js',
        './node_modules/jquery-number/jquery.number.js',
        './js/jquery-no-conflict.js',
        // './_data/_js/skript_utf.js'
    ]).
        pipe($glp.newer('temp/gulp/scripts')).
        pipe($glp.sourcemaps.init()).
        pipe($glp.babel()).
        pipe($glp.sourcemaps.write()).
        pipe(gulp.dest('temp/gulp/scripts')).
        pipe($glp.concat('head.min.js')).
        pipe($glp.uglify().on('error', function(e) {
            console.log(e);
        }))
        // Output files
        .pipe($glp.size({title: 'scripts'})).
        pipe($glp.sourcemaps.write('.')).
        pipe($glp.if('*.js', $glp.rev())).
        pipe(gulp.dest('dist/scripts')).
        pipe(gulp.dest('temp/gulp/scripts')).
        pipe($glp.rev.manifest({
            path: './rev-manifest.json',
            base: './',
            merge: true,
        })).
        pipe(gulp.dest('./')),
);

// Concatenate and minify JavaScript placed before </body>. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts-footer', () =>
    gulp.src([
        // Note: Since we are not using useref in the scripts build pipeline,
        //       you need to explicitly list your scripts here in the right order
        //       to be correctly concatenated
        './js/modernizr-custom.min.js',
        './js/footer.js',
        './js/gaEvents.js',
        './js/main.js',
    ]).
        pipe($glp.newer('temp/gulp/scripts')).
        pipe($glp.sourcemaps.init()).
        pipe($glp.babel()).
        pipe($glp.sourcemaps.write()).
        pipe(gulp.dest('temp/gulp/scripts')).
        pipe($glp.concat('footer.min.js')).
        pipe($glp.uglify().on('error', function(e) {
            console.log(e);
        }))
        // Output files
        .pipe($glp.size({title: 'scripts'})).
        pipe($glp.sourcemaps.write('.')).
        pipe($glp.if('*.js', $glp.rev())).
        pipe(gulp.dest('dist/scripts')).
        pipe(gulp.dest('temp/gulp/scripts')).
        pipe($glp.rev.manifest({
            path: './rev-manifest.json',
            base: './',
            merge: true,
        })).
        pipe(gulp.dest('./')),
);

gulp.task('other-scripts', () =>
    gulp.src([
        './js/smartadserver_hp.js',
        './js/smartadserver_others.js',
    ]).
        pipe($glp.newer('temp/gulp/scripts')).
        pipe($glp.sourcemaps.init()).
        pipe($glp.babel()).
        pipe($glp.sourcemaps.write()).
        pipe(gulp.dest('temp/gulp/scripts')).
        pipe($glp.uglify().on('error', function(e) {
            console.log(e);
        }))
        // Output files
        .pipe($glp.size({title: 'other-scripts'})).
        pipe($glp.sourcemaps.write('.')).
        pipe($glp.if('*.js', $glp.rev())).
        pipe(gulp.dest('dist/scripts')).
        pipe(gulp.dest('temp/gulp/scripts')).
        pipe($glp.rev.manifest({
            path: './rev-manifest.json',
            base: './',
            merge: true,
        })).
        pipe(gulp.dest('./')),
);

gulp.task('move-critical-css-map', () =>
    gulp.src('dist/styles/project-critical.css.map').pipe(gulp.dest('./')),
);

// Optimize images
gulp.task('images', () =>
    gulp.src('images/**/*').pipe($glp.newer('dist/images')).pipe($glp.cache($glp.imagemin({
        progressive: true,
        interlaced: true,
    }))).pipe(gulp.dest('dist/images')).pipe($glp.size({title: 'images'})),
);

// Clean output directory
gulp.task('clean', () => del(['temp/gulp', 'dist/styles/*', 'dist/scripts/*', '!dist/.git'], {dot: true}));

// Clear /tmp/gulp-cache directory
gulp.task('clear-gulp-cache', () => $glp.cache.clearAll());

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
    runSequence(
        'styles',
        'scripts-head',
        'scripts-footer',
        'other-scripts',
        'move-critical-css-map',
        'images',
        'generate-service-worker',
        'clear-gulp-cache',
        cb,
    ),
);

// Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
gulp.task('copy-sw-scripts', () => {
    return gulp.src(['node_modules/sw-toolbox/sw-toolbox.js', 'js/sw/runtime-caching.js']).
        pipe(gulp.dest('dist/js/sw'));
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task('generate-service-worker', ['copy-sw-scripts'], () => {
    const rootDir = 'dist';
    const filepath = path.join(rootDir, 'service-worker.js');
    return swPrecache.write(filepath, {
        // Used to avoid cache conflicts when serving on localhost.
        cacheId: pkg.name || 'project',
        // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
        importScripts: [
            'js/sw/sw-toolbox.js',
            'js/sw/runtime-caching.js',
        ],
        staticFileGlobs: [
            // Add/remove glob patterns to match your directory setup.
            `${rootDir}/images/**/*`,
            // `${rootDir}/scripts/**/*.js`,
            `${rootDir}/styles/**/*.css`,
            `${rootDir}/*.{html,json}`,
            `../`,
        ],
        // Translates a static file path to the relative URL that it's served from.
        // This is '/' rather than path.sep because the paths returned from
        // glob always use '/'.
        stripPrefix: rootDir + '/',
    });
});