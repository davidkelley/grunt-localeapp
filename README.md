# grunt-localeapp

[![NPM](https://nodei.co/npm/grunt-localeapp.png)](https://nodei.co/npm/grunt-localeapp/)

Grunt task for http://www.localeapp.com service. Localeapp is a cloud service which provide a managment 
interface for translation files. 

They have developped a [ruby gem](https://rubygems.org/gems/localeapp) to interact with their service. 
This grunt task only wraps this gem, allowing you to use it within a non-ruby project.

The gem comes with some CLI command listed below :

Command | Gem | grunt task | description
------- | --- | ---------- | ------------
Add     |  ✔  |            |
Command |  ✔  |            |
Daemon  |  ✔  |            |
Install |  ✔  |     ✔      | Set up the API key which belongs to a specific project
Pull    |  ✔  |     ✔      | Fetch translations in all defined locales from a specific project
Push    |  ✔  |            |
Remove  |  ✔  |            |
Rename  |  ✔  |            |
Update  |  ✔  |            |

The documentation of the gem is available at http://rubydoc.info/gems/localeapp/0.8.0/frames.

## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
gem install localeapp
npm install grunt-localeapp --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-localeapp');
```

> You can also use `load-grunt-tasks` to avoid these kind of inclusions.

## The "localeapp" task

### Overview
In your project's Gruntfile, add a section named `localeapp` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({

  ...

  localeapp: {
    pull: {
      key: "tAbgRC2RemnJye2tLqwc1Y8xoyTUIVqZExlyFM0BlFo0YvCsgB",
      format: "json",
      dest: '<%= yeoman.app %>/locales/'
    }
  },

  ...

});
```

### Options

#### pull

All arguments are required

`key` : This identifier is provided by _localeapp.com_ in the Settings section of a project. It is a
project-specific information that will allow you to authenticate through their service and specify 
the project you are looking for.

`format` : Basicly, _localeapp.com_ only exports to yaml format. This options indicates the desired
output format. Available format are listed below :

format | translation tool                               | comment
------ | ---------------------------------------------- | ----------------------------------------------------
yml    | _native_                                       |
json   | [yamljs](https://www.npmjs.org/package/yamljs) |
js     | [yamljs](https://www.npmjs.org/package/yamljs) | output in a variable: `var translate_en_US = {...};`

`dest` : Destination folder where the locale files will be pulled (must end with a '/').

> Output example :
 ```
 03:27:12 {tp-i18n} ~/projets/saas$ grunt i18n-update
 Running "localeapp:pull" (localeapp) task
 ✔ localeapp gem installed (v0.8.0)
 ✔ Key tAbgRC2RemnJye2tLqwc1Y8xoyTUIVqZExlyFM0BlFo0YvCsgB valid
 ✔ 2 file(s) pulled from localeapp.com : (en-US.yml [16], fr-FR.yml [16])
 ✔ 2 file(s) copied into app/locales/  : (en_US.json, fr_FR.json)
 ```

## Contributing

It is my very first grunt task, so please be indulgent and feel free to send me back any constructive comment.

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

**0.1.3** _(2014-10-06)_

- Add new supported output format: **js**

**0.1.2** _(2014-07-16)_

- Pull files from localeapp
- Supported output formats: **yml**, **json**
