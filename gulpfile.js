var gulp = require('gulp');
var streamqueue = require('streamqueue');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');

var proxyUrl = 'dev4.nvisionsolutions.ca/personal';

var files = {
	styles: ['css/*.scss'],
	js: {
		scripts: [
			'js/src/*.js'
		],
		vendor: []
	}
};

var dirs = {
	root: '',
	js: {
		src: 'js/src',
		dist: 'js/dist'
	}
};

gulp.task('styles:dev', function() {
    return gulp.src(files.styles)
        .pipe(sass({
        	outputStyle: 'nested'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 9']
        }))
        .pipe(gulp.dest(dirs.root))
        .pipe(browserSync.reload({ stream:true }))
});

gulp.task('styles:production', function() {
    return gulp.src(files.styles)
        .pipe(sass({
        	outputStyle: 'compressed',
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 9']
        }))
        .pipe(gulp.dest(dirs.root));
});

function scripts() {
    var stream = streamqueue({ objectMode: true });

	var scripts = gulp.src(files.js.scripts)
		.pipe(jshint('.jshintrc'))
    	.pipe(jshint.reporter('jshint-stylish'));

	var vendor = gulp.src(files.js.vendor);

    stream.queue(vendor);
    stream.queue(scripts);

	return stream.done();
}

gulp.task('scripts:dev', function() {
	return scripts()
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest(dirs.js.dist))
		.pipe(browserSync.reload({ stream:true }));
});

gulp.task('scripts:production', function() {
	return scripts()
		.pipe(uglify())
		.pipe(concat('scripts.min.js'))
		.pipe(gulp.dest(dirs.js.dist));
});

gulp.task('browser-sync', function() {
    browserSync({
        proxy: proxyUrl,
        ghostMode: {
            scroll: true,
            links: true,
            forms: true
        }
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['browser-sync'], function () {
    gulp.watch(files.styles, ['styles:dev']);
    gulp.watch(files.js.scripts, ['scripts:dev']);
    gulp.watch('**/*.php', ['bs-reload']);
});

gulp.task('dev', ['styles:dev','scripts:dev'], function() {
    gulp.watch(files.styles, ['styles:dev']);
    gulp.watch(files.js.scripts, ['scripts:dev']);
});

gulp.task('production', ['styles:production','scripts:production'], function() {

});
