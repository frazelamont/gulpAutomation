const { series, parallel } = require('gulp');

// modules
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    pipeline = require('readable-stream').pipeline,
    del = require('del'),
    image = require('gulp-image'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject');

// files - name of function
var config = require('./config');

// This function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function copyStyles()
{'use strict';
  return gulp
    .src(config.temporary.allStyles)
    .pipe(gulp.dest(config.destination.styles));
}

// This function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function copyImages()
{'use strict';
  return gulp
    .src(config.temporary.allImages)
    .pipe(gulp.dest(config.destination.images));
}

// copy only minified js files from tmp folder into destination folder
function copyScripts()
{'use strict';
  return gulp
    .src(config.temporary.allScripts)
    .pipe(gulp.dest(config.destination.scripts));
}

// deploy to main project
function deployDistribution()
{'use strict';
  return gulp
    .src(config.destination.built)
    .pipe(gulp.dest(config.destination.deploy));
}

// copy sass files from node modules into sass folder
function sourceMdbSCSS()
{'use strict';
   //del([config.source.rogueMdbCss],{force:true});
   return gulp
    .src(config.source.mdbSass)
    .pipe(gulp.dest(config.folder.mdbSass));
}

// minify all js files from source location into tmp folder
async function sourceMdbJS()
{'use strict';
    del([config.folder.mdbJs],{force:true});
    //del([config.source.rogueMdbJs],{force:true});
    await pipeline(
      gulp.src(config.source.mdbJs),
      gulp.dest(config.folder.mdbJs)
    );
}

function sourceMdbImg()
{'use strict';
  return pipeline(
      gulp.src(config.source.mdbImg),
      gulp.dest(config.folder.mdbImg)
    );
}

// copy sass files from node modules into sass folder
function sourceGdsSCSS()
{'use strict';
  return gulp
    .src(config.source.gdsSass)
    .pipe(gulp.dest(config.folder.gdsSass));
}

// minify all js files from source location into tmp folder
async function sourceGdsJS()
{'use strict';
    del([config.folder.gdsJs],{force:true});
    await pipeline(
      gulp.src(config.source.gdsJs),
      gulp.dest(config.folder.gdsJs)
    );
}

// compile scss into css in temp folder
function compileMdbScss()
{'use strict';
  return pipeline(
    gulp.src(config.processing.mdbSass),
    sass(),
    sourcemaps.init(),
    sourcemaps.write(),
    gulp.dest(config.folder.mdbCss)
  );
}

// compile scss into css in temp folder
function compileGdsScss()
{'use strict';
    return pipeline(
        gulp.src(config.processing.gdsSass),
        sass(),
        sourcemaps.init(),
        sourcemaps.write(),
        gulp.dest(config.folder.gdsCss)
      );
}

async function sourceJQuery()
{'use strict';
  del([config.folder.jquery],{force:true});
  await pipeline(
      gulp.src(config.source.jquery),
      gulp.dest(config.folder.jquery)
    );
}

// clean folders
function cleanFolders()
{'use strict';
  // Use the `delete` module directly, instead of using gulp-rimraf
  return del(
      [config.folder.dist, config.folder.tmp, config.folder.styles, config.destination.deploy], 
      {force:true});
}

// end of run, remove temp folders
function housekeeping()
{'use strict';
    // Use the `delete` module directly, instead of using gulp-rimraf
    return del([config.folder.tmp, config.folder.styles]);
}

// optimise scripts
function optimiseScripts()
{'use strict';
  return pipeline(
      gulp.src(config.processing.scripts),
      uglify(),
      //concat('scripts.js'),
      gulp.dest(config.temporary.scriptFolder)
    );
}

// optimise images
function optimiseImages()
{'use strict';
  return pipeline(
      gulp.src(config.processing.images),
      image(),
      gulp.dest(config.temporary.imageFolder)
    );
}

// optimise styles
function optimiseStyles()
{'use strict';
  return pipeline(
      gulp.src(config.processing.mdbCss),
      //concat('mdbBootstrap.css'),
      cleanCSS(),
      gulp.dest(config.temporary.mdbStylesFolder),

      gulp.src(config.processing.gdsCss),
      //concat('gdsFrontend.css'),
      cleanCSS(),
      gulp.dest(config.temporary.gdsStylesFolder)
    );
}

// inject into html
function injectHtml()
{'use strict';
  return pipeline(
    gulp.src(config.build.index),
    inject(gulp.src(config.build.allScripts, {read: false}), {relative: true}),
    inject(gulp.src(config.build.allStyles, {read: false}), {relative: true}),
    gulp.dest(config.build.root)
  );
}

// default function to run
exports.default = series(
    parallel(
        series(cleanFolders)
    ),
    parallel(
        series(/*sourceMdbSCSS, sourceMdbJS, sourceMdbImg,*/ sourceGdsSCSS, /*sourceGdsJS,*/ sourceJQuery)
    ),
    parallel(
      series(compileMdbScss, compileGdsScss)
    ),
    parallel(
        series(optimiseScripts, optimiseImages, optimiseStyles)
    ),
    parallel(
        series(copyStyles, copyImages, copyScripts)
    ),
    parallel(
        series(housekeeping, deployDistribution, injectHtml)
    )
  );
