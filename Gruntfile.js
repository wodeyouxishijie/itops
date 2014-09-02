module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            lib :{
				src:['src/lib/sea-debug.js', 'src/lib/jquery-1.10.2.js', 'src/lib/net.js', 'src/lib/util.js', 'src/lib/event.js'],
				dest:'public/dest/lib.js'
			},
            main: {
                src: ['src/widget/**/*.js', 'src/main/*.js', 'src/config/*.js', 'src/app/**/*.js','src/app/**/**/*.js', 'src/app/*.js','src/editor/ve.js'],
                dest: 'public/dest/main.js'
            },
            'login': {
                src: ['src/app/login/login.js'],
                dest: 'public/dest/login.js'
            }
        },
        moduleNameFormat: function (str) {
            return str.replace(/^src\//, '');
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': []
                }
            }
        },
        qunit: {
            files: []
        },
        jshint: {
            files: ['src/**/*.js', 'src/**/*.tpl'],
            options: {
                //这里是覆盖JSHint默认配置的选项
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['src/**/*.js', 'src/**/*.tpl', 'src/**/**/*.js','src/**/**/*.tpl','src/**/**/**/*.js','src/**/**/**/*.tpl'],
            tasks: ['concat']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-qc-concat');

    grunt.registerTask('merge',['concat']);
    grunt.registerTask('m',['concat']);
    grunt.registerTask('w',['concat', 'watch']);
    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
};