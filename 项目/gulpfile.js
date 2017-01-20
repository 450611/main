var gulp          =    require('gulp'),
    uglify        =    require('gulp-uglify'),
    minifyCSS     =    require('gulp-minify-css'),
    imagemin      =    require('gulp-imagemin'),
    htmlmin       =    require('gulp-htmlmin'),
    concat        =    require("gulp-concat"),
    htmlReplace   =    require("gulp-html-replace"),
    copy          =    require('copy'),
    del           =    require('del'),
    plumber       =    require("gulp-plumber"),
    autoprefixer  =    require('gulp-autoprefixer'),  //http://www.ydcss.com/archives/94
    babel         =    require('gulp-load-plugins')(),//http://www.cnblogs.com/webARM/p/5305644.html
    rev           =    require("gulp-rev"),
    rename        =    require("gulp-rename"),
    revCollector  =    require("gulp-rev-collector");

gulp.task('clean', function(cb){
    del(['./bin/*', './rev/*']);//清除bin文件夹下面的所有东西
    cb();
});
  
gulp.task('copy', function(cb){
    copy('favicon.ico', './bin/');//复制根目录下面的fa.ico 到 bin下面去
    cb();
});

gulp.task('uglifyjs', function(){
   return gulp.src(['./test/**/*.js', '!./test/ts/**/*.js']) //选择./js下面的所有的js
        .pipe(plumber())   //防止在gulp watch的时候 代码错误而退出watch
        .pipe(babel.babel({  //将es6转es5（按需求）
            presets: ['es2015']
        }))
        .pipe(uglify({  //压缩js文件  过滤'require' ,'exports' ,'module' ,'$'等字段
            mangle: {except: ['require' ,'exports' ,'module' ,'$']}
        }))
        .pipe(rev())//经过优化和版本控制
        .pipe(concat("all.js")) // 合并 (暂时不需要， 看需求)
        .pipe( gulp.dest('./bin/') ) //输出代码目录
        .pipe( rev.manifest() )
        .pipe( gulp.dest('./rev/js/'));
        //起始路径支持('./js/*/*js')代码./js下面所有的文件夹下面的所有js
        //输出路径直接(./bin)它会自动帮你归类的
});

gulp.task('cssmin', function(){
   return gulp.src(['./test/*/*.css', './test/*/css/*.css'])
        .pipe(plumber())  
        .pipe(autoprefixer({
            browsers : ['last 4 version', '> 50%'], //字段添加前缀 具体配置见上面链接
            cascade: false,
            remove:true 
        }))
        .pipe(minifyCSS())  //压缩css
        .pipe(rev())//经过优化和版本控制
        .pipe(gulp.dest('./bin/'))
        .pipe( rev.manifest() )
        .pipe( gulp.dest('./rev/css/'));
});

gulp.task('imagemin', function () {
   return gulp.src('./*.{png,jpg,jpeg,gif,webp,svg}')//压缩图片
        .pipe( imagemin({
            progressive: true
        }) )
        .pipe(gulp.dest('./bin/'));
});

gulp.task("rev", function(){
    var options = {
        collapseWhitespace: true,//压缩HTML
        //省略布尔属性的值 <input checked="true"/> ==> <input />
        collapseBooleanAttributes: false,
        //删除所有空格作属性值 <input id="" /> ==> <input />
        removeEmptyAttributes: true,
        //删除<script>的type="text/javascript"
        removeScriptTypeAttributes: true,
        //删除<style>和<link>的type="text/css"
        removeStyleLinkTypeAttributes: true,
        minifyJS: false,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(["./rev/*/*.json",'./test/*.html'] )
        .pipe(revCollector())
        .pipe( htmlmin(options) )
        .pipe( gulp.dest('./bin/') );
});
gulp.task('default', ['clean','copy', 'uglifyjs', 'cssmin', 'imagemin'], function(){  //默认任务 在命令行直接gulp 可以执行以下任务
    gulp.start('rev');
});


gulp.task("watch",  ["uglifyjs"],function(){ //watch任务  gulp watch 可以监听js文件下面的js内容， 如果改变了 就会执行uglifyjs任务（es6转es5、压缩）
    gulp.watch("js/*.js", ["uglifyjs"]);
});