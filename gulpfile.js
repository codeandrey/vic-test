'use strict';
var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		spritesmith = require('gulp.spritesmith'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		pug         = require('gulp-pug'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		ftp            = require('vinyl-ftp'),
		notify         = require("gulp-notify"),
		plumber = require('gulp-plumber'),
		svgstore = require('gulp-svgstore'),
		svgmin = require('gulp-svgmin'),
		inject = require('gulp-inject'),
		path = require('path'),
		gcmq = require('gulp-group-css-media-queries'),
		tinypng = require('gulp-tinypng-compress');
 


var pathsrc='vic';
/* ________     Smart-Grid             _______*/

var smartgrid = require('smart-grid');
/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'sass', /* less || scss || sass || styl */
    filename: '_smart-grid',
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
            fields: '30px' /* side fields */
        },
        md: {
            width: '960px',
            fields: '15px'
        },
        sm: {
            width: '780px',
            fields: '15px'
        },
        xs: {
            width: '560px',
            fields: '15px'
        }
        /* 
        We can create any quantity of break points.
        some_name: {
            some_width: 'Npx',
            some_offset: 'N(px|%)'
        }
        */
    }
};
 
gulp.task('smartgrid', function() {
	smartgrid('src/sass', settings);
});

/*_________     Pug Build Html Files (Jade)      ________*/

gulp.task('pages', function() {
        gulp.src(pathsrc+'/src/**/*.pug')
            .pipe(plumber()) 
            .pipe(pug({pretty: true}))
            .pipe(gulp.dest(pathsrc+'/app'));

});

/*__________        Build CSS Files              _________*/


gulp.task('sass', function() {
	gulp.src(pathsrc+'/src/sass/*.sass')
              .pipe(plumber()) 
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest(pathsrc+'/app/css'))
	.pipe(browserSync.reload({stream: true}));
});

/*________        Concatenate Js Files            __________*/

gulp.task('scripts', function() {
     return gulp.src(pathsrc+'/src/js/*.js')
          .pipe(plumber()) 
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest(pathsrc+'/app/js'))
	.pipe(browserSync.reload({stream: true}));
});

/*________     Build Sprite File        _______*/

gulp.task('sprite', function() {
   var spriteData = gulp.src(pathsrc+'/src/images_sprite/*.png') // путь, откуда берем картинки для спрайта
          .pipe(spritesmith({
                algorithm: 'top-down',        //алгоритм створення спрайта top-down left-right  diagonal    alt-diagonal    binary-tree
                padding: 10,                        //отступ між картинками в спрайті
                imgName: 'sprite.png',
                cssName: 'sprite.css',
          }));
          
    spriteData.img.pipe(gulp.dest(pathsrc+'/src/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest(pathsrc+'/app/css/')); // путь, куда сохраняем стили  
});

/*________      Minimized images            __________*/

gulp.task('imagemin', function() {
      return gulp.src(pathsrc+'/src/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest(pathsrc+'/app/img')); 
});
gulp.task('tinypng', function () {
    gulp.src(pathsrc+'/src/img/**/*.{png,jpg,jpeg}')
        .pipe(tinypng({
            key: 'YW6k3YLThDdv0_Bo1NYBb3hycQ0N2JB4',
            sigFile: 'images/.tinypng-sigs',
            log: true
        }))
        .pipe(gulp.dest(pathsrc+'/app/img'));
});
/*_________     Build SVG Sprite File         _________*/

gulp.task('svgstore', function () {
      return gulp
          .src(pathsrc+'/src/svg/*.svg')
          .pipe(svgmin(function (file) {
          		var prefix = path.basename(file.relative, path.extname(file.relative));
	          return {
	                plugins: [{
	                    cleanupIDs: {
	                        prefix: prefix + '-',
	                        minify: true
	                    }
	                }]
	          }
        	}))
        .pipe(svgstore())
        .pipe(gulp.dest(pathsrc+'/app/svg'));
});

/*________     Static Copy Files to app folders     ____________*/

gulp.task('fonts', function() {
    gulp.src(pathsrc+'/src/fonts/*')
        .pipe(gulp.dest(pathsrc+'/app/fonts/'))
});

gulp.task('css', function() {
    gulp.src(pathsrc+'/src/css/*')
        .pipe(gulp.dest(pathsrc+'/app/css/'))
});

gulp.task('libs', function() {
    gulp.src(pathsrc+'/src/libs/*')
        .pipe(gulp.dest(pathsrc+'/app/libs/'))
});

gulp.task('picxel', function() {
    gulp.src(pathsrc+'/src/picxel_layout/*')
        .pipe(gulp.dest(pathsrc+'/app/picxel_layout/'))
});

/*________    Starting  Browser Sync Server        _______*/

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: pathsrc+'/app'
		},
		notify: false
	});
});

/*__________         Watcher Files         __________*/


gulp.task('watch', function() {
	gulp.watch([pathsrc+'/src/sass/*.sass'], function(event, cb) {
        		gulp.start('sass', browserSync.reload);
    	});
	gulp.watch([pathsrc+'/src/js/*.js'],  function(event, cb) {
		gulp.start('scripts');
	});
	gulp.watch([pathsrc+'/src/**/*.pug',pathsrc+'/src/index.pug' ], function(event, cb) {
		gulp.start('pages');
	});
	//watch('app/*.html').on('change', browserSync.reload);
});

/*_______    Production  Project Build      ________*/

gulp.task('build', ['deletedist', 'imagemin', 'sass', 'scripts' ], function() {

	var buildFiles = gulp.src([
		pathsrc+'/app/*.html',
		pathsrc+'/app/.htaccess'
	]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		pathsrc+'/app/css/*',
	]).pipe(gulp.dest(pathsrc+'/dist/css'));

	var buildJs = gulp.src([
		pathsrc+'/app/js/scripts.min.js'
	]).pipe(gulp.dest(pathsrc+'/dist/js'));

	var buildFonts = gulp.src([
		pathsrc+'/app/fonts/**/*'
	]).pipe(gulp.dest(pathsrc+'/dist/fonts'));
	
	var buildFonts = gulp.src([
		pathsrc+'/app/libs/**/*'
	]).pipe(gulp.dest(pathsrc+'/dist/libs'));
	
	var buildImage = gulp.src([
		pathsrc+'/app/img/**/*'
	]).pipe(gulp.dest(pathsrc+'/dist/img'));

});

/*____________Load Project to FTP_________*/

gulp.task('toftp', function() {
	var conn = ftp.create({
		host:      '88.88.88.88',
		user:      '*******',
		password:  '********',
	//	port: '21', 
		parallel:  3,
		log: gutil.log
	});
	var globs = [
		pathsrc+'/dist/**',
		pathsrc+'/dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/public_html/folders/'));

});

/*___________       Delete all foldres app, dist          ________*/

gulp.task('deleteall', function() { return del.sync(pathsrc+'/app', pathsrc+'/dist'); });

/*___________       Delete all foldre  dist          ________*/

gulp.task('deletedist', function() { return del.sync(pathsrc+'/dist'); });

/*___________       Clear Cache files          ________*/

gulp.task('clearcache', function () { return cache.clearAll(); });


/*__________    Default Task Gulp     ___________*/

gulp.task('default', [ 'smartgrid', 'pages', 'sass', 'scripts', 'imagemin', 'libs', 'picxel', 'css', 'fonts', 'watch', 'browser-sync']);
