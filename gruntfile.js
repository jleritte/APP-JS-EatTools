module.exports = function(grunt) {
	var path = './lib/';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['./build/resources','./build/index.html'],
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				"-W083": true, // remove this
				eqnull: true,
				browser: true,
				debug: true
			},
			files: {
				src: [path+'**/*.js']
			}
			},
		csslint: {
			strict: {
				options: {
					//'important': 2,
					'zero-units': 2,
					//'duplicate-properties': 2, uncomment this
					'regex-selectors': false,
					'box-model': false,
					'fallback-colors': false,
					'compatible-vendor-prefixes': false,
					'outline-none': false, // remove this
					'overqualified-elements': false, // remove this
					'ids': false, // remove this
					'adjoining-classes': false, // remove this
					'box-sizing': false, // remove this
					'vendor-prefix': false, // remove this
					'font-sizes': false, // remove this
					'unqualified-attributes': false, // remove this
				},
				src: [path+'**/*.css']
			},
			},
		browserify: {
			options: {
				alias: {
					'x-tag': './node_modules/x-tag/dist/x-tag-core.min.js'
				},
				browserifyOptions: {
					paths: [
						path+'js',
						path+'js/components'
					]
				}
			},
			'build/resources/js/app.js': [path+'js/main.js']
			},
		connect: {
			local: {
				options: {
					port: 8081,
					hostname: '127.0.0.1',
					base: 'build/',
					livereload: 8082
				}
			}
			},
		uglify: {
			buildapp: {
				src: 'build/resources/js/app.js',
				dest: 'build/resources/js/app.min.js'
			}
			},
		watch: {
			js: {
				files: [path+'js/**/*.js'],
				tasks: ['jshint','browserify','uglify','versioning']
			},
			css: {
				files: [
					path+'css/*.css',
					path+'js/components/**/*.css'
				],
				tasks: ['csslint','cssmin','versioning']
			},
			html: {
				files: [path+'home.html'],
				tasks: ['copy','versioning']
				},
			livereload: {
				files: ['build/resources/**/*'],
				options: {
					livereload: 8082
				}
			}
			},
		cssmin: {
			options: {
				shorthandCompacting: true,
			},
			target: {
				files: {
					'build/resources/css/styles.min.css': [path+'/**/*.css']
				}
			}
			},
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: path,
					dest: 'build/',
					src: [
						'home.html'
					],
					rename: function(dest, src) {
						return dest + src.replace('home','index');
					}
				}]
			}
			},
		imagemin: {
			target: {
				files: [{
					expand: true,
					cwd: path + 'imgs/',
					src: [ '*.{png,jpg,gif,svg,ico}' ],
					dest: 'build/resources/imgs/'
				}]
			}
		},
		versioning: {
			options: {
				grepFiles: [
					'build/index.html'
				]
			},
			js: {
				src: [
					'build/resources/js/app.min.js',
				]
			},
			css: {
				src: [
					'build/resources/css/styles.min.css',
				]
			},
			}
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-csslint");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-imagemin");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-version-assets");

	grunt.registerTask('default', ['clean','copy','imagemin','jshint','csslint','cssmin','browserify','uglify','versioning']);
	grunt.registerTask('dev',['default','connect','watch']);
};
