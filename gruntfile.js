/// <binding ProjectOpened='watch' />
module.exports = function (grunt) {
    'use strict';

    const sass = require('node-sass');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Sass
        sass: {
            options: {
                implementation: sass,
                sourceMap: true // Create source map
                //outputStyle: 'compressed' // Minify output
            },
            dist: {
                files: [
                    {
                        expand: true, // Recursive
                        cwd: "Website/wwwroot/css", // The startup directory
                        src: ["**/*.scss"], // Source files
                        dest: "Website/wwwroot/css", // Destination
                        ext: ".css" // File extension
                    }
                ]
            }
        }, 

        watch: {
            css: {
                files: ['Website/wwwroot/css/**/*.scss'],
                tasks: ['sass']
            }
        }
    });

    // Load the plugin
    grunt.loadNpmTasks('grunt-sass');

    grunt.loadNpmTasks('grunt-contrib-watch');
};