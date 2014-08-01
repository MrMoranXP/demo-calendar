module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    'libs/jquery/dist/jquery.js',
                    'libs/underscore/underscore.js',
                    'libs/backbone/backbone.js',
                    'libs/bootstrap/dist/js/bootstrap.js',
                    'js/dist/*.js'                 
                ],
                dest: 'js/build/app.js',
            }
        },
        uglify: {
		    build: {
		        src: 'js/build/app.js',
		        dest: 'js/app.min.js'
		    }
		},
		autoprefixer: {
			options: {
			    browsers: ['last 2 version']
		  	},
		  	multiple_files: {
			    expand: true,
			    flatten: true,
			    src: 'css/build/*.css',
			    dest: 'css/build/prefixed/'
		  	}
		},
		cssmin: {
			combine: {
			    files: {
			      'css/style.min.css': ['css/build/prefixed/style.css']
			    }
		  	}
		},
		concat_css: {
		    options: {},
		    all: {
	      		src: [
	      			'libs/bootstrap/dist/css/bootstrap.css',
	      			'libs/bootstrap/dist/css/bootstrap-theme.css',
	      			'css/dist/*.css'
      			],
		      	dest: 'css/build/style.css'
		    },
	  	},
		sass: {
			dist: {
			    options: {
			      style: 'expanded'
			    },
			    files: {
			      'css/dist/style.css': 'css/sass/style.scss'
			    }
			  }
		},
		watch: {
		    scripts: {
		        files: ['js/dist/*.js'],
		        tasks: ['concat', 'uglify'],
		        options: {
		            spawn: false,
		        },
		    },
		    css: {
			    files: ['css/sass/*.scss'],
			    tasks: ['sass', 'concat_css', 'autoprefixer', 'cssmin'],
			    options: {
			        spawn: false,
			    }
			}
		}

    });  
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['concat', 'uglify', 'sass', 'concat_css', 'autoprefixer', 'cssmin']);
    grunt.registerTask('dev', ['watch']);

};