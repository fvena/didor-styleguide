var fs        = require('fs'),
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
    template: __dirname + '/templates/index.pug'
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
    var data = {
      docs: docs
    }

    return pug.renderFile(__dirname + '/templates/nav.pug', data);
  },

  render: function(options, callback) {
    options = this.options = _.defaults(options || {}, StyleGuide.defaults);

    var css = sass2css.compile(this.sources, path.dirname(this.file));
    var source = parseCSS.parse(css);
    var docs= this.groupSort(source);
    var menu = this.renderMenu(docs);

    // Create files to sections
    for (section in docs) {
      var outputFile = options.outputFolder + '/' + section + '.html';
      var data = {
        components: docs[section],
        menu: menu
      };

      var html = pug.renderFile(options.template, data);
      mkdirp.sync(path.dirname(outputFile));
      fs.writeFileSync(outputFile, html, {encoding:'utf8'});
    }
  }
}

module.exports = StyleGuide;
