module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      f_target: {
        files: {
          'dist/F.min.js': [
            'lib/promises.js', 'lib/F.js', 'lib/P.js', 'lib/F.stream.js', 'lib/exports.js'
          ]
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

    jshint: {
      all: ['lib/*.js'],
      options: {
        jshintrc: '.jshintrc',
      },
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
    },

    'saucelabs-custom': {
      all: {
        options: {
          urls: ['http://localhost:8000/'],
          testname: 'F.js',
          build: process.env.TRAVIS_JOB_ID,
          browsers: [
            ["XP", "firefox", 21],
            ["XP", "chrome", 31],
            ["Windows 7", "internet explorer", 9],
            ["Windows 7", "internet explorer", 10]
          ],
          sauceConfig: {
            'record-video': false,
            'capture-html': true
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-buster');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-saucelabs');

  // Tasks
  grunt.registerTask('test', ['buster', 'saucelabs-custom']);
  grunt.registerTask('default', ['jshint', 'uglify', 'test']);
  grunt.registerTask('hookmeup', ['clean:hooks', 'shell:hooks']);

};