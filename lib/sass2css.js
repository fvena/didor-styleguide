var sass = require('node-sass');

module.exports.compile = function (source, path) {
  var result = sass.renderSync({
    data: source,
    includePaths: [ path ]
  });

  return result.css.toString();
};
