module.exports = function(config) {
  config.set({
    karmaTypescriptConfig: {
      include: ['src/**/*.spec.ts']
    },

    basePath: '',

    frameworks: ['jasmine', 'karma-typescript'],

    files: [
      {pattern: 'www/build/wcbs.js', included: true, watched: true},
      {pattern: 'www/build/wcbs/*.js', included: false, watched: true},
      {pattern: 'www/build/*.json', included: false, watched: true},

      // Tests
      {pattern: 'src/**/*.spec.ts'}
    ],

    proxies: {
      '/build/wcbs/': '/base/www/build/wcbs/'
    },

    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },

    reporters: ['dots', 'karma-typescript'],
    port: 9876,
    colors: true,
    //logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
}