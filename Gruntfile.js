module.exports = function(grunt){

	var testFiles	= 'test/**/*.js';
	var sourceFiles	= 'src/**/*.js';

	grunt.initConfig({

		jshint:{
			all: [sourceFiles, testFiles]
		},


		mochaTest:{
			src:[testFiles],
			options: { clearRequireCache: true }
		},

		watch:{
			files: [sourceFiles, testFiles],
			tasks: 'prebuild',
			options: {
				spawn: false,
				debounceDelay: 250
			},
		}
	});


	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-force-task');


	grunt.event.on('watch', function(action, filepath) {
		grunt.config('jshint.all.src', filepath);
	});


	grunt.registerTask('prebuild', ['jshint', 'mochaTest']);
	grunt.registerTask('default', ['force:prebuild', 'watch']);
};