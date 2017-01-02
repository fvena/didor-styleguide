var pug       = require('pug'),
    markdown  = require('markdown').markdown;

var COMMENT_BLOCK = /^\*\*[\s\S]*\*\*$/;

/**
 * Generate html
 * @param example
 * @returns {*}
 */
function iframeSrc(example) {
  var html = '';

  html += '<html>';
  html += '<head>';
  html += '<link rel="stylesheet" type="text/css" href="styles/main.css">';
  html += '</head>';
  html += '<body>';
  html += example;
  html += '</body>';
  html += '</html>';

  return html;
}


/**
 * Parse Pug to HTML
 * @param docs
 * @returns {Array}
 */
module.exports.parse = function (source) {
  var components = source;
  var description = '';
  var example = '';

  for (element in components) {
    description = components[element].description;
    example = pug.render(components[element].example);

    components[element].description = markdown.toHTML(description);
    components[element].exampleIframe = iframeSrc(example);
  };

  return components;
};
