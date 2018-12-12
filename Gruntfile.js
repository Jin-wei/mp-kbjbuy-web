module.exports = function (grunt) {
    var conf=grunt.file.readJSON('./conf.json');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        clean: ['.tmp','web/css/mp-g.*.css','web/js/mp-g.*.js'],

        replace: {
            dist:
                {
                    options: {
                        patterns: [
                            {
                                json: grunt.file.readJSON('conf.json')
                            }
                        ]
                    },
                    files: [
                        {src: ['web/config/L_System_Config.js'], dest: 'web/config/System_Config.js'},
                        {src: ['public/apidocs/json/index.json.template'], dest: 'public/apidocs/json/index.json'},
                        {src: ['config/L_SystemConfig.js'], dest: 'config/SystemConfig.js'},
                    ]
                }
        },

        useminPrepare: {
            html: ['web/index.html','web/index2.html','web/index-jjc.html'],
            options: {
                dest: 'web'
            }
        },

        pkg: grunt.file.readJSON('package.json'),


        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            js: {
                src: 'web/js/mp-g.*.js'
            },
            css:{
                src: 'web/css/mp-g.*.css'
            }
        },
        usemin:{
            html: ['web/index.html','web/index2.html','web/index-jjc.html']
        },
        copy: {
            // includes files within path
            main: {
                files: [
                    {cwd: '.tmp/concat/',expand: true, src: '**', dest: 'web/', filter: 'isFile'}
                ]
            },
            cust: {
                files: [
                    {src: 'web/index.html', dest: 'web/index.html'},
                    {src: 'web/index2.html', dest: 'web/index2.html'},
                    {src: 'web/index-jjc.html', dest: 'web/index-jjc.html'}
                ]
            },
            css: {
                files: [
                    {cwd: '.tmp/concat/css/',expand:true, src: '*.css', dest: '.tmp/concat/css.min'}
                ]
            },
            js: {
                files: [
                    {cwd: '.tmp/concat/js/',expand:true, src: '*.js', dest: 'web/js'}
                ]
            }
        },
        cssmin:{
            options:{aggressiveMerging:'false'}
        }
    });

    grunt.registerTask('default', [
        'clean',
        'replace',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
};