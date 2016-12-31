var concatRegexp = require('concat-regexp'),
    pug          = require('pug'),
    markdown     = require( "markdown" ).markdown;
    highlightPug = require('./highlight-pug');

var COMMENT_REGEX = /\/\*\*[\s\S]*?\*\*\//g;



function findBlock(block, rule) {
  var re = concatRegexp(/\[/, block, /\]\s+([\s\S]*?)\s+(\[Section\]|\[Name\]|\[Description\]|\[Statuses\]|\[Example\]|\*\*\/)/, RegExp('', 'g'));
  var match = re.exec(rule);

  if (match) {
    return match[1];
  } else {
    return null;
  }
}

function highlight(code) {
  html = highlightPug(code);
  return html;
}


module.exports.parse = function(source) {
  var documentation = new Array();
  var cssComment = source.match(COMMENT_REGEX); // Make array with comment

  cssComment.forEach(function (rule) {
    section     = findBlock('Section',rule);
    name        = findBlock('Name',rule);
    description = findBlock('Description',rule);
    statuses    = findBlock('Statuses',rule);
    example     = findBlock('Example',rule);
    exampleHTML = pug.render(example);
    exampleCode = highlight(example);

    if (section || name) {
      component = new Object();

      component.section = (section) ? section : name;
      if(name) component.name = name;
      if(description) component.description = markdown.toHTML(description);
      if(statuses) component.statuses = statuses;
      if(example) component.example = example;
      if(exampleHTML) component.exampleHTML = exampleHTML;
      if(exampleCode) component.exampleCode = exampleCode;

      documentation.push(component);
    }
  })

  return documentation;
};
