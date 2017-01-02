var fs        = require('fs'),
    fse       = require('fs-extra'),
    path      = require('path'),
    _         = require('lodash'),
    pug       = require('pug'),
    mkdirp    = require('mkdirp'),
    css2Yaml  = require('./css2Yaml.js'),
    sass2css  = require('./sass2css.js'),
    pug2html  = require('./pug2html.js');


function StyleGuide() {
  this.sources = '';
  this.file = '';
}

StyleGuide.defaults = {
    groupBy: 'section',
    sortBy: ['section', 'name'],

    extraJs: [],
    extraCss: [],

    logo: '',
    outputFolder: 'docs',
    css: './.tmp/styles/main.css',

    template: __dirname + '/templates/component.pug',
    templateCss: __dirname + '/template/didor-styleguide.css',
    templateJs: __dirname + '/template/didor-styleguide.js'
};

StyleGuide.prototype = {
  addFile: function(file) {
    this.file = file;
    this.sources = fs.readFileSync(file, {encoding:'utf8'});
  },

  groupSort: function(source) {
    source = _.sortBy(source, this.options.sortBy);
    return _.groupBy(source, this.options.groupBy);
  },

  parseSource: function() {
    var css = sass2css.compile(this.sources, path.dirname(this.file));
    var components = css2Yaml.parse(css);
    return pug2html.parse(components);
  },

  menuItems: function(components) {
    var menu = [];
    for (section in components) {
      menu.push(section);
    };
    return menu;
  },

  copyFiles: function(outputFolder) {
    fse.copy(__dirname + '/base/scripts', outputFolder + '/scripts', function (err) {
      if (err) return console.error(err)
    })
    fse.copy(__dirname + '/base/styles', outputFolder + '/styles', function (err) {
      if (err) return console.error(err)
    })
  },

  /*renderDocs: function(outputFolder) {
    var outputFile = outputFolder + '/index.html';
    var html = pug.renderFile(__dirname + '/base/index.pug');
    mkdirp.sync(path.dirname(outputFile));
    fs.writeFileSync(outputFile, html, {encoding:'utf8'});
  },*/

  render: function(options) {
    options = this.options = _.defaults(options || {}, StyleGuide.defaults);

    var source = this.parseSource();
    var components = this.groupSort(source);
    var menu = this.menuItems(components);

    this.copyFiles(options.outputFolder);
    //this.renderDocs(options.outputFolder);

    // Create files to sections
    for (section in components) {
      // data to send to the template
      var data = {
        components: components[section],
        menu: menu,
        logo: options.logo
      };

      // Parse template
      var html = pug.renderFile(options.template, data);

      // Generate file
      var outputFile = options.outputFolder + '/' + section + '.html';
      mkdirp.sync(path.dirname(outputFile));
      fs.writeFileSync(outputFile, html, {encoding:'utf8'});
    }
  }
}

module.exports = StyleGuide;
