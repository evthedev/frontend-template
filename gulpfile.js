// gulp.js config
// 
var // setup modules
	gulp = require('gulp'),
	newer = require('gulp-newer'); // checks for newer files in the output folder
	imagemin = require('gulp-imagemin'), // optimise images
	htmlclean = require('gulp-htmlclean'), // minifies HTML

	// gulp plugins for js
	concat = require('gulp-concat'), // compiles js into a single file
	deporder = require('gulp-deporder'), // analyses comments at the top of each script to ensure correct ordering 
	stripdebug = require('gulp-strip-debug'), // removes all console and debug statements
	uglify = require('gulp-uglify'), // minifies js

	// gulp plugins for css
	sass = require('gulp-sass'), // compiles scss files into a single css file
	postcss = require('gulp-postcss'), // postcss treatments
		// postcss plugins
		assets = require('postcss-assets'), // manages assets by resolving file paths
		autoprefixer = require('autoprefixer'), // automatically adds vendor prefixes
		mqpacker = require('css-mqpacker'), // pack multiple media queries into a single rule
		cssnano = require('cssnano'), // minify CSS code (in production)
	 
	// browsersync
	browserSync = require('browser-sync').create(),

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

/* Minifies HTML task */
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

/* CSS task */

var css_libraries = [
      'node_modules/normalize.css/normalize.css',
      folder.src + 'scss/style.scss'
];

gulp.task('css', ['images'], function(){
	var out = folder.build + 'css/';
	var postCssOpts = [
		assets({ loadPaths: ['images/'] }),
		autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
		mqpacker
	];

	if (!devBuild) {
		postCssOpts.push(cssnano);
	}	
	return gulp.src(css_libraries)
	.pipe(sass({
		outputStyle: 'nested',
		imagePath: 'images/',
		precision: 3,
		errLogToConsole: true
	}))
	.pipe(postcss(postCssOpts))
	.pipe(concat('style.css'))
	.pipe(gulp.dest(out))
	.pipe(browserSync.reload({stream: true}));
});

/* browsersync task */
gulp.task('serve', function(){
	browserSync.init({
		server: {
			baseDir: [
				"./build/html",
				"./build/css"
			]
		}
	});
	gulp.watch('./scss/**/*', ['css']);
	gulp.watch('../build/html/**/*').on('change', browserSync.reload);
});

/* The run task */
gulp.task('run', ['html', 'css', 'js']);

/* Watch task */
gulp.task('watch', function(){
	gulp.watch(folder.src + '/images/**/*', ['images']); // image changes
	gulp.watch(folder.src + '/html/**/*', ['html']); // html changes
	gulp.watch(folder.src + '/js/**/*', ['js']); // js changes
	gulp.watch(folder.src + '/scss/**/*', ['css']); // scss changes
});

/******* Set up tasks end ***********/

/******* Create default gulp task ***/

gulp.task('default', ['run', 'watch', 'serve']);

