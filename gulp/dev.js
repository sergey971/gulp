const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");

// clean:dev: Эта задача очищает папку ./build/, если она существует.
gulp.task("clean:dev", function (done) {
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean({ force: true }));
  }
  done();
});

const fileIncludeSetting = {
  prefix: "@@",
  basepath: "@file",
};

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};
/*
html:dev: Задача для сборки HTML. Она включает в себя:
Фильтрацию измененных файлов с использованием changed.
Обработку ошибок с использованием plumber и оповещение с помощью notify.
*/
gulp.task("html:dev", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./build/", { hasChanged: changed.compareContents }))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSetting))
    .pipe(gulp.dest("./build/"));
});
/*
sass:dev: Задача для компиляции Sass в CSS. Она включает в себя:

Фильтрацию измененных файлов с использованием changed.
Обработку ошибок с использованием plumber и оповещение с помощью notify.
Использование gulp-sass-glob для поддержки глобальных масок в Sass.
Генерацию sourcemaps с использованием gulp-sourcemaps.
Сохранение результатов в ./build/css/.

*/
gulp.task("sass:dev", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(changed("./build/css/"))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./build/css/"));
});
/*
images:dev: Задача для копирования изображений. Она включает в себя:

Фильтрацию измененных файлов с использованием changed.
Оптимизацию изображений с использованием imagemin (вы закомментировали эту строку).
*/
gulp.task("images:dev", function () {
  return (
    gulp
      .src("./src/img/**/*")
      .pipe(changed("./build/img/"))
      // .pipe(imagemin({ verbose: true }))
      .pipe(gulp.dest("./build/img/"))
  );
});

/*
fonts:dev: Задача для копирования шрифтов. Она включает в себя:

Фильтрацию измененных файлов с использованием changed.
*/
gulp.task("fonts:dev", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/fonts/"));
});
/*
files:dev: Задача для копирования других файлов. Она включает в себя:

Фильтрацию измененных файлов с использованием changed.
*/
gulp.task("files:dev", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./build/files/"))
    .pipe(gulp.dest("./build/files/"));
});
/*
js:dev: Задача для обработки JavaScript. Она включает в себя:

Фильтрацию измененных файлов с использованием changed.
Обработку ошибок с использованием plumber и оповещение с помощью notify.
Транспиляцию JavaScript с использованием babel (вы закомментировали эту строку).
Сборку JavaScript с использованием webpack.
Сохранение результатов в ./build/js/.
*/
gulp.task("js:dev", function () {
  return (
    gulp
      .src("./src/js/*.js")
      .pipe(changed("./build/js/"))
      .pipe(plumber(plumberNotify("JS")))
      // .pipe(babel())
      .pipe(webpack(require("./../webpack.config.js")))
      .pipe(gulp.dest("./build/js/"))
  );
});

const serverOptions = {
  livereload: true,
  open: true,
};

/*
server:dev: Задача для запуска локального сервера разработки с использованием gulp-server-livereload.
*/
gulp.task("server:dev", function () {
  return gulp.src("./build/").pipe(server(serverOptions));
});
/*
watch:dev: Задача для отслеживания изменений в файлах и запуска соответствующих задач при изменении.
*/
gulp.task("watch:dev", function () {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass:dev"));
  gulp.watch("./src/html/**/*.html", gulp.parallel("html:dev"));
  gulp.watch("./src/img/**/*", gulp.parallel("images:dev"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:dev"));
  gulp.watch("./src/files/**/*", gulp.parallel("files:dev"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js:dev"));
});
