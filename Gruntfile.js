const {
  compiledDirectory,
  compiledScripts,
  bundleOutput,
  styleInput,
  styleOutput
} = require('./scripts/frontend-build-config');

/**
 * Gruntfile
 *  - keeps the frontend asset manifest for tests.
 *
 * @param {*} grunt
 */
module.exports = grunt => {
  // Project configuration.
  grunt.initConfig({
    // Concat all compiled files to single files.
    //    All files in the src are not working.
    //    The files should be listed in the src option in sequence.
    //    Otherwise, it may not see undefined.
    concat: {
      options: {},
      dist: {
        src: compiledScripts,
        dest: bundleOutput
      }
    },
    cssmin: {
      target: {
        files: {
          [styleOutput]: [styleInput]
        }
      }
    },
    clean: [compiledDirectory]
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'cssmin', 'clean']);
};
