var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    folder = require('gulp-folders'),
    destination_folder = 'min';

gulp.task('scripts', function(){
    return gulp.src('src/*.js')
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(destination_folder))
            .pipe(notify({
                message: 'Scripts task complete'
            }));
});