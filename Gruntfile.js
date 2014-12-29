module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      f_target: {
        files: {
          'build/F.min.js': ['lib/F.js', 'lib/P.js']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};