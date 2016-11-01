/*
 *
 * Определяем переменные
 *
 */

var gulp = require('gulp'), // Сообственно Gulp JS
    uglify = require('gulp-uglify'), // Минификация JS
    concat = require('gulp-concat'), // Склейка файлов
    csso = require('gulp-csso'); // Минификация CSS

/*
 *
 * Создаем задачи (таски)
 *
 */


// Задача "js". Запускается командой "gulp js"
gulp.task('default', function () {
    gulp.src([
        './public/components/jquery/dist/jquery.min.js',
        './public/components/bootstrap/dist/js/bootstrap.min.js',
        './public/components/angular/angular.js',
        './public/components/angular-ui-router/release/angular-ui-router.min.js',
        './public/components/moment/min/moment-with-locales.min.js',
        './public/components/angular-cookies/angular-cookies.min.js',
        './public/components/satellizer/dist/satellizer.min.js',
        './public/components/angular-sanitize/angular-sanitize.min.js',
        './public/components/socket.io-client/socket.io.js',
        './public/components/angular-socket-io/socket.min.js',
        './public/components/angular-audio/app/angular.audio.js',
        './public/components/angular-base64-upload/src/angular-base64-upload.js',
        './public/components/alertify.js/lib/alertify.min.js',
        './public/components/rangy/rangy-core.min.js',
        './public/components/rangy/rangy-selectionsaverestore.min.js',
        './public/components/ckeditor/ckeditor.js',
        './public/components/angular-ckeditor/angular-ckeditor.min.js',
        './public/components/jquery.scrollTo/jquery.scrollTo.min.js',
        './public/components/angular-contenteditable/angular-contenteditable.js',

    ]) // файлы, которые обрабатываем
        .pipe(concat('index.js')) // склеиваем все JS
        .pipe(uglify()) // получившуюся "портянку" минифицируем
        .pipe(gulp.dest('./public/apps/')) // результат пишем по указанному адресу
});


