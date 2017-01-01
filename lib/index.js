var fs        = require('fs'),
    fse       = require('fs-extra'),
    path      = require('path'),
    _         = require('lodash'),
    pug       = require('pug'),
    mkdirp    = require('mkdirp'),
    parseCSS  = require('./parseCSS.js'),
    sass2css  = require('./sass2css.js');


function StyleGuide() {
  this.sources = '';
  this.file = '';
}

StyleGuide.defaults = {
    groupBy: 'section',
    sortBy: ['section', 'name'],
    outputFolder: 'docs',
    template: __dirname + '/templates/component.pug',
    logo: '',
    css: './.tmp/styles/main.css'
};

StyleGuide.prototype = {
  addFile: function(file) {
    this.file = file;
    this.sources = fs.readFileSync(file, {encoding:'utf8'});
  },

  groupSort: function(docs) {
    docs = _.sortBy(docs, this.options.sortBy);
    return _.groupBy(docs, this.options.groupBy);
  },

  renderMenu: function(docs) {
    var menu = []
    for (section in docs) {
      menu.push(section);
    }
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

  renderDocs: function(outputFolder) {
    var outputFile = outputFolder + '/index.html';
    var html = pug.renderFile(__dirname + '/base/index.pug');
    mkdirp.sync(path.dirname(outputFile));
    fs.writeFileSync(outputFile, html, {encoding:'utf8'});
  },

  render: function(options) {
    options = this.options = _.defaults(options || {}, StyleGuide.defaults);

    var css = sass2css.compile(this.sources, path.dirname(this.file));
    var source = parseCSS.parse(css);
    var docs= this.groupSort(source);
    var menu = this.renderMenu(docs);

    this.copyFiles(options.outputFolder);
    this.renderDocs(options.outputFolder);

    // Create files to sections
    for (section in docs) {
      var outputFile = options.outputFolder + '/' + section + '.html';
      var data = {
        components: docs[section],
        menu: menu,
        logo: options.logo
      };

      var html = pug.renderFile(options.template, data);
      mkdirp.sync(path.dirname(outputFile));
      fs.writeFileSync(outputFile, html, {encoding:'utf8'});
    }
  }
}

module.exports = StyleGuide;
