/*
 * grunt-localeapp
 * https://github.com/PredicSis/grunt-localeapp
 *
 * Copyright (c) 2014 Sylvain RAGOT
 * Licensed under the MIT license.
 */

'use strict';

var command = require('execSync').exec;
var chalk = require('chalk');
var yaml = require('yamljs');
var fs = require('fs');

module.exports = function(grunt) {

  var version;

  /**
   * Runs _localeapp -v_ cli command to check if the gem is installed.
   *
   *  This command return something like _localeapp version 0.8.0 _. Note that this returned string
   *  ends with a newline.
   *
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _checkLocaleappGem() {
    grunt.verbose.writeln('Looking for localeapp gem');

    // localeapp version 0.8.0<br/>
    version = command('localeapp -v').stdout.slice(0, -1);

    if (version === undefined) {
      grunt.fail.fatal('No localeapp gem installed');
    } else {
      grunt.log.writeln(chalk.green('✔ ') + 'localeapp gem installed (' + chalk.gray('v' + version.split(' ')[2]) + ')');
    }

    grunt.verbose.writeln('----------------------------------');
  }

  /**
   * Add the project key to be able to interact with it.
   *
   *  A key identifies a user on localeapp service and a project. So, there is a key by project.
   *
   * @param {String} key
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _setupProject(key) {
    grunt.verbose.writeln('Verifying api key');

    var log = command('localeapp install ' + key).stdout;
    grunt.verbose.writeln(chalk.gray(chalk.italic(log)));

    if (log.slice(0,5) === 'error') {
      grunt.fail.fatal('Your API key seems to be invalid');
    } else {
      grunt.log.writeln(chalk.green('✔ ') + 'Key ' + chalk.gray(key) + ' valid');
    }

    grunt.verbose.writeln('----------------------------------');
  }

  /**
   * Really fetch locales files
   *
   *  Runs _localeapp pull_ cli command which ask remote servers to download files into yml format.
   *  Downloaded filenames look like : en-US.yml
   *  It also creates a log file with `polledAt` and `updatedAt` values.
   *
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _getLocales() {
    grunt.verbose.writeln('Retreiving locale files');

    grunt.verbose.write(' | creating temp "config/locales" output folder ... ');
    fs.mkdir('config/locales');
    grunt.verbose.writeln(chalk.green('OK'));

    grunt.verbose.write(' | creating temp "log" folder ... ');
    fs.mkdir('log');
    grunt.verbose.writeln(chalk.green('OK'));

    grunt.verbose.write(' | creating temp "log/localeapp.yml" log file ... ');
    fs.openSync('log/localeapp.yml', 'w');
    grunt.verbose.writeln(chalk.green('OK'));

    // download files
    grunt.verbose.write(' | fetching locales from localeapp.com ... ');
    var log = command('localeapp pull').stdout;
    var files = fs.readdirSync('config/locales');
    grunt.verbose.writeln(chalk.green(files.length + ' file(s) pulled'));
    grunt.verbose.writeln(chalk.gray(chalk.italic(log)));

    var locales = "";
    for (var i in files) {
      locales += chalk.blue(files[i]);
      locales += chalk.italic(' [' + _countEntries(files[i]) + ']');
      if (i < files.length - 1) {
        locales += ', ';
      }
    }
    grunt.log.writeln(chalk.green('✔ ') + files.length + ' locale(s) pulled from localeapp.com : (' + locales + ')');

    grunt.verbose.writeln('----------------------------------');

    log = yaml.load('log/localeapp.yml');
    return {
      polledAt: log.polled_at,
      updatedAt: log.updated_at,
      files: files
    };
  }

  /**
   * Counts number of i18n keys
   *
   *  Note: The iterate function comes from http://stackoverflow.com/a/15690816/1230946
   *
   * @param {String} locale name like "en-US.yml"
   * @returns {Number}
   * @author Sylvain {03/07/2014}
   */
  function _countEntries(locale) {
    var properties = [];
    var iterate = function iterate(obj, stack) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == "object") {
            iterate(obj[property], stack + '.' + property);
          } else {
            properties.push(stack + '.' + property);
          }
        }
      }
    };

    iterate(grunt.file.readYAML('config/locales/' + locale), '');
    return properties.length;
  }

  /**
   * Create a JSON object from YML downloaded locales.
   *
   *  In addition, it :
   *  - renames files to follow locale spec : en-US.yml => en_US.json
   *  - adds some metadata like gem version, dates, ...
   *
   * @param {Object}  files       Returned object from _getLocales() function
   * @param {Boolean} withLocale  Keep or remove the first yml key containaing the locale name (fr-FR: USER : ...)
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _formatJSON(files, toJS) {
    toJS = toJS || false;
    var locales = files.files;

    for(var i in locales) {
      var locale = locales[i].split('.yml')[0];   // en_US.yml => en_US
      var file = 'config/locales/' + locale;
      var json = yaml.load(file + '.yml')[locale];
      var content, filename;
      if (toJS === true) {
        content = 'var translate_' + locale.replace('-', '_') + ' = ' + JSON.stringify(json, null, 2) + ';';
        filename = file.replace('-', '_') + '.js';
      } else {
        content = JSON.stringify(json, null, 2);
        filename = file.replace('-', '_') + '.json';
      }

      fs.rename(file + '.yml', filename, function(err) {
        if ( err ) console.log('ERROR: ' + err);
      });


      // add metadata the output
      json._meta = {};
      json._meta.polledAt = new Date(files.polledAt * 1000).toString();
      json._meta.updatedAt = new Date(files.updatedAt * 1000).toString();
      json._meta.gem = version;
      grunt.file.write(filename, content);
    }
  }

  /**
   * Format locales into YML files.
   *
   *  Only renames downloaded files from en-US.yml to en_US.yml
   *
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _formatYML(files) {
    var locales = files.files;

    for (var i in locales) {
      var locale = locales[i].split('.yml')[0];   // en-US.yml => en-US
      var file = 'config/locales/' + locale;
      fs.rename(file + '.yml', file.replace('-', '_') + '.yml')
    }
  }

  function _clean(folders) {
    for (var i in folders) {
      if (grunt.file.isDir(folders[i])) {
        grunt.file.delete(folders[i]);
      }
    }
  }


  grunt.registerMultiTask('localeapp', 'Grunt task for localeapp.com service.', function() {
    _clean(['config', 'log']);

    // check requested output format
    var availableFormats = ['yml', 'yaml', 'json', 'js'];
    if (availableFormats.indexOf(this.data.format) === -1) {
      grunt.fail.fatal('There is no support for ' + this.data.format + ' yet. Please use one of the following : ' + availableFormats.join(', ') + '.');
    }

    // retreive locales
    _checkLocaleappGem();
    _setupProject(this.data.key);
    var files = _getLocales();

    // format output
    switch (this.data.format) {
      case 'js':
        grunt.verbose.writeln('Formatting files to Javascript');
        _formatJSON(files, true);
        break;
      case 'json':
        grunt.verbose.writeln('Formatting files to JSON');
        _formatJSON(files, false);
        break;
      case 'yml':
      case 'yaml':
      default:
        grunt.verbose.writeln('Formatting files to YML');
        _formatYML(files);
        break;
    }

    grunt.verbose.writeln('----------------------------------');

    // copy files to destination folder
    var locales = fs.readdirSync('config/locales');
    for (var i in locales) {
      grunt.file.copy(
        'config/locales/' + locales[i],
        this.data.dest + locales[i],
        { encoding: 'utf8' }
      );
    }
    var destFiles = fs.readdirSync(this.data.dest);
    grunt.log.writeln(chalk.green('✔ ') + destFiles.length + ' locale(s) copied into ' + chalk.blue(this.data.dest) + '  : (' + chalk.blue(destFiles.join(', ')) + ')');
    grunt.verbose.writeln('----------------------------------');

    // remove temporary files
    _clean(['config', 'log']);
  });
};
