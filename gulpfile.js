const gulp = require('gulp')
const concat = require('gulp-concat')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const useref = require('gulp-useref')

gulp.task('libCss', (done) => {
  gulp.src([
    './node_modules/angular-material/angular-material.min.css'
  ]).pipe(concat('lib.min.css'))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done)
})

gulp.task('libJs', (done) => {
  gulp.src([
    './node_modules/angular/angular.min.js',
    './node_modules/angular-animate/angular-animate.min.js',
    './node_modules/angular-aria/angular-aria.min.js',
    './node_modules/angular-messages/angular-messages.min.js',
    './node_modules/angular-material/angular-material.min.js'
  ]).pipe(concat('lib.min.js'))
    .pipe(gulp.dest('./www/js/'))
    .on('end', done)
})

gulp.task('js', (done) => {
  gulp.src('./src/**/*.js')
    .pipe(babel({
      'presets': [
        ['es2015']
      ]
    })).pipe(concat('script.js'))
    .pipe(gulp.dest('./www/js/'))
    .on('end', done)
})

gulp.task('css', (done) => {
  gulp.src('./src/scss/style.scss')
    .pipe(sass())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done)
})

gulp.task('index-dev', (done) => {
  gulp.src('./src/index.html')
    .pipe(gulp.dest('./www/'))
    .on('end', done)
})

gulp.task('index-prod', (done) => {
  gulp.src('./src/index.html')
    .pipe(useref())
    .pipe(gulp.dest('./www/'))
    .on('end', done)
})

gulp.task('img', (done) => {
  gulp.src('./src/img/**/*')
    .pipe(gulp.dest('./www/img/'))
    .on('end', done)
})

gulp.task('watch', () => {
  const electron = require('electron-connect').server.create()
  electron.start()
  gulp.watch('./src/js/**/*', ['js', electron.reload])
  gulp.watch('./src/index.html', ['index', electron.reload])
  gulp.watch('./src/scss/**/*.scss', ['css', electron.reload])
})

gulp.task('build', ['js', 'libCss', 'libJs', 'css', 'index-prod', 'img'])

gulp.task('serve', ['js', 'libCss', 'libJs', 'css', 'index-dev', 'img', 'watch'])

gulp.task('default', ['build'])
