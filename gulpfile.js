// gulp.js config
// 
var // setup modules
	gulp = require('gulp'),
	newer = require('gulp-newer'); // checks for newer files in the output folder
	imagemin = require('gulp-imagemin'), // optimise images
	htmlclean = require('gulp-htmlclean'), // minifies HTML
	concat = require('gulp-concat'), // compiles js into a single file
	deporder = require('gulp-deporder'), // analyses comments at the top of each script to ensure correct ordering 
	stripdebug = require('gulp-strip-debug'), // removes all console and debug statements
	uglify = require('gulp-uglify'), // minifies js

	// dev mode?
	devBuild = (process.env.NODE_ENV !== 'production'),

	// folders
	folder = {
		src: 'src/',
		build: 'build/'
	}
;

// gulp.task – defines a new task with a name, optional array of dependencies and a function.
// gulp.src – sets the folder where source files are located.
// gulp.dest – sets the destination folder where build files will be placed.
 
/******* Set up tasks start *********/

// This is the barebones structure of a gulp task
// gulp.task('task-name', function(){
// 		var out = folder.build + 'output-folder, ex images/'; // define output folder
// 		return gulp.src(folder.src + 'input-folder, ex images/') // specify src folder
// 			.pipe() // choose plugin for this action, ex newer, imagemin
// 			.pipe() // chain more actions in another plugin
// 			.pipe(gulp.dest(out)); // always end final pipe into gulp.dest(out) // out is the var out set earlier			
// });

/* Optimise images task */
gulp.task('images', function() {
	var out = folder.build + 'images/';
	return gulp.src(folder.src + 'images/**/*' ) // /**/* includes nested folders 
	.pipe(newer(out)) // newer checks if there is a newer file in the build folder - if there is a newer file, this task will not run
	.pipe(imagemin({optimizationLevel: 5}))
	.pipe(gulp.dest(out));
});

/* Minifies HTML */
gulp.task('html', ['images'], function() { // the ['images'] tells gulp to run 'images' task first
	var out = folder.build + 'html/';
	var page = gulp.src(folder.src + 'html/**/*').pipe(newer(out));
	// check if is production, add pipe to minimise production html
	if (!devBuild) {
		page = page.pipe(htmlclean(out));
	}
	return page.pipe(gulp.dest(out));
});

/* JS task */
gulp.task('js', function(){
	var out = folder.build + 'js/';
	var jsbuild = gulp.src(folder.src + 'js/**/*')
	.pipe(deporder())
	.pipe(concat('script.js')); // combine all js files into one single file, named 'script.js'
	if(!devBuild) {
		jsbuild = jsbuild.pipe(stripdebug()).pipe(uglify());
	}
	return jsbuild.pipe(gulp.dest(out));
});

/******* Set up tasks end ***********/