'use strict';
// generated on 2014-06-19 using generator-gulp-webapp 0.1.0

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    fs = require('fs');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.sass({
            outputStyle: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('.tmp/*.html')
        .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.rev())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        // TODO: can't enable imagemin right now it would break retina support
        // .pipe($.cache($.imagemin({
        //     optimizationLevel: 3,
        //     progressive: true,
        //     interlaced: true
        // })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('favicons', function () {
    return gulp.src([
            'app/favicon*.{png,ico}',
        ])
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*.{eot,svg,ttf,woff}')
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'favicons', 'images', 'fonts', 'extras']);
gulp.task('build:dev', function(cb) {
    // TODO: runSequence is a hack waiting for Gulp 4.0 to be out
    runSequence(
        'templates:render:dev',
        'build',
        cb);
});
gulp.task('build:prod', function(cb) {
    // TODO: runSequence is a hack waiting for Gulp 4.0 to be out
    runSequence(
        'templates:render:prod',
        'build',
        cb);
});

gulp.task('templates:extend', function () {
    return gulp.src([
            'app/*.html',
            '!app/_master.html',
        ])
        .pipe($.htmlExtend({
            annotations: true,
            verbose: true
        }))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('templates:render:dev', ['templates:extend'], function() {
    var content = fs.readFileSync('./envs/dev.json'),
        data = JSON.parse(content);

    return gulp.src('.tmp/*.html')
        .pipe($.data(function () {
            return data;
        }))
        .pipe($.template())
        .pipe(gulp.dest('.tmp'));
});
gulp.task('templates:render:prod', ['templates:extend'], function() {
    var content = fs.readFileSync('./envs/prod.json'),
        data = JSON.parse(content);

    return gulp.src('.tmp/*.html')
        .pipe($.data(function () {
            return data;
        }))
        .pipe($.template())
        .pipe(gulp.dest('.tmp'));
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('.tmp'))
        .use(connect.static('app'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect', 'styles', 'templates:render:dev'], function () {
    require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        '.tmp/*.html',
        // 'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('envs/dev.json', ['templates:render:dev']);
    gulp.watch('app/*.html', ['templates:render:dev']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('set-env', function (cb) {
    $.env({
        file: ".env.json"
    });

    cb();
});

// AWS
gulp.task('aws:publish', ['set-env'], function() {
    var publisher = $.awspublish.create({
            bucket: process.env.AWS_S3_BUCKET,
            key: process.env.AWS_S3_KEY,
            secret: process.env.AWS_S3_SECRET,
            region: 'eu-west-1',
            endpoint: 's3-eu-west-1.amazonaws.com'

            // TODO: move the s3 to the Frankfürt region
            //       but knox do not support the HMAC-SHA-256 auth yet
            // region: 'eu-central-1',
            // endpoint: 's3.eu-central-1.amazonaws.com'
        });

    return gulp.src('./dist/**/*')
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe($.awspublish.reporter());
});

gulp.task('aws:sync', function(cb) {
    // TODO: runSequence is a hack waiting for Gulp 4.0 to be out
    runSequence(
        'clean',
        'build:prod',
        'aws:publish',
        function() {
            $.notify({ message: "Site published to the S3" });

            // inform the sequence has been completed
            cb();
        });
});
