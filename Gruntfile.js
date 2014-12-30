module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      f_target: {
        files: {
          'build/F.min.js': ['lib/F.js', 'lib/P.js']
        }
      }
    },

    buster: {
      main: {
        test: {
          config: 'test/node/buster.js'
        }
      }
    },

    clean: {
      // Clean any pre-commit hooks in .git/hooks directory
      hooks: ['.git/hooks/pre-commit']
    },

    // Run shell commands
    shell: {
      hooks: {
        // Copy the project's pre-commit hook into .git/hooks
        command: 'cp git-hooks/pre-commit .git/hooks/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-buster');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');

  // Tasks
  grunt.registerTask('test', ['buster']);
  grunt.registerTask('default', ['uglify', 'test']);
  grunt.registerTask('hookmeup', ['clean:hooks', 'shell:hooks']);

};