/*
 *
 * Определяем переменные
 *
 */

var gulp = require('gulp'), // Сообственно Gulp JS
    uglify = require('gulp-uglify'), // Минификация JS
    concat = require('gulp-concat'), // Склейка файлов
    csso = require('gulp-csso'); // Минификация CSS


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
         './public/components/jquery.scrollTo/jquery.scrollTo.min.js',
        './public/components/angular-contenteditable/angular-contenteditable.js',

     './public/apps/core/core.js',
     './public/apps/core/cacheService.js',
     './public/apps/core/chat/chatFactory.js',
     './public/apps/core/chat/chatService.js',
     './public/apps/core/post/postFactory.js',
     './public/apps/core/post/postService.js',
     './public/apps/core/user/userFactory.js',
     './public/apps/core/user/userService.js',
     './public/apps/core/config/configFactory.js',
     './public/apps/chatApp/chatApp.js',
     './public/apps/chatApp/mainController.js',
     './public/apps/chatApp/left/leftController.js',
     './public/apps/chatApp/signIn/signInController.js',
     './public/apps/chatApp/chat/chatController.js',
     './public/apps/chatApp/directives/post/post.js',
     './public/apps/chatApp/directives/scrollLoadMessages/scrollLoadMessages.js',
     './public/apps/chatApp/directives/topMenu/topMenu.js',
     './public/apps/chatApp/users/userListController.js',
     './public/apps/chatApp/users/userFormController.js',
     './public/apps/chatApp/config/configController.js',
     //'./public/apps/directives/upload/upload.js',
     './public/apps/chatApp/directives/controlHeight/controlHeight.js',
     './public/apps/chatApp/directives/controlCaret/controlCaret.js',
     ])
     .pipe(concat('app.js'))
     .pipe(uglify())
     .pipe(gulp.dest('./public/apps/build/'))
});


