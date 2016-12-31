module.exports = highlightPug;

function highlightPug(str) {
  var pug = new Highlight(str);
  return pug.getHighlight();
}

/**
 * Initialize `Highlight` with the given `str`.
 *
 * @param {String} str
 */

function Highlight(str) {
  //Strip any UTF-8 BOM off of the start of `str`, if it exists.
  str = str.replace(/^\uFEFF/, '');
  this.input = str.replace(/\r\n|\r/g, '\n');

  this.hightlight = '';
  this.pos = '0';
  this.ended = this.input.length;
};

/**
 * Lexer prototype.
 */

Highlight.prototype = {

  constructor: Highlight,

  /**
   * Scan for `type` with the given `regexp`.
   *
   * 'doctype (...)/n'
   * 'case (...)/n'
   * 'when (...)/n'
   * 'when (...):/n'    //Error
   * 'extends (...)/n'
   * 'prepend (...)/n'
   * 'append (...)/n'
   * 'block (append|prepend) (...)/n'
   * 'include (...)/n'
   * 'mixin (...)((...))/n'
   * '(if|unless|else if|else) (...)/n'
   *
   *
   * @param {RegExp} regexp
   * @param {Array} className
   * @return {String}
   * @api private
   */

  scanLine: function (regexp, className) {
    var captures;

    if (captures = regexp.exec(this.input)) {
      var length = captures[0].length;
      var newInput = this.input.substr(length);

      //Check end line
      if (/^[ \t]*(\n|$)/.test(newInput)) {
        var classLength = className.length;

        for (var i= 0; i < classLength; i++) {
          if (captures[i+1]) {
            this.hightlight += '<span class="pre-' + className[i] + '">' + captures[i+1] + ' </span>';
          }
        };

        this.input = newInput;
        return true;
      }
    }
  },

  /**
   * Scan for `type` with the given `regexp`.
   *
   * 'yield'
   * 'default'
   * 'default:'
   * '(div)'
   * '(#id)'
   * '(.class)'
   *
   * @param {RegExp} regexp
   * @param {String} type
   * @return {Boolean}
   * @api private
   */

  scanString: function (regexp, type) {
    var captures;

    if (captures = regexp.exec(this.input)) {
      var text = (captures[1] ? captures[1] : captures[0]);
      var length = text.length;

      this.hightlight += '<span class="pre-' + type + '">' + text + '</span>';
      this.input = this.input.substr(length);
      return true;
    }
  },


  /**
   * Yield.
   */

  'yield': function() {
    this.scanString(/^yield/, 'yield');
  },


  /**
   * Doctype
   */

  doctype: function() {
    this.scanLine(/^(doctype) *([^\n]*)/,['doctype','value']);
  },


  /**
   * Case
   */

  "case": function() {
    this.scanLine(/^(case) +([^\n]+)/,['keyword','value']);
  },


  /**
   * When.
   */

  when: function() {
    this.scanLine(/^(when) +([^:\n]+)/,['keyword','value']);
  },


  /**
   * Default.
   */

  "default": function() {
    this.scanString(/^default[:]*/, 'default');
  },

  /**
   * Extends.
   */

  "extends": function() {
    this.scanLine(/^(extends) +([^\n]+)/,['keyword','value']);
  },


  /**
   * Block prepend.
   */

  prepend: function() {
    this.scanLine(/^(prepend) +([^\n]+)/,['keyword','value']);
  },


  /**
   * Block append.
   */

  append: function() {
    this.scanLine(/^(append) +([^\n]+)/,['keyword','value']);
  },


  /**
   * Block.
   */

  block: function() {
    this.scanLine(/^(block) *(?:(prepend|append)\s)?([^\n]+)/,['keyword','keyword','value']);
  },


  /**
   * Include.
   */

  include: function() {
    this.scanLine(/^(include) +([^\n]+)/,['keyword','value']);
  },


  /**
   * Mixin.
   */

  mixin: function(){
    this.scanLine(/^(mixin) +([-\w]+)(?: *(\(.*\)))? */,['keyword','function','value']);
  },


  /**
   * Conditional.
   */

  conditional: function() {
    this.scanLine(/^(if|unless|else if|else) *([^\n]*)/,['keyword','value']);
  },

  /**
   * While.
   */

  "while": function() {
    this.scanLine(/^(while) +([^\n]+)/,['keyword','value']);
  },

  /**
   * Each.
   */

  each: function() {
    this.scanLine(/^(each|for) +([a-zA-Z_,\s]*) * (in) *([^\n]+)/,['keyword','var','keyword','value']);
  },


  /**
   * Tag.
   */

  tag: function() {
    this.scanString(/^(\w(?:[-:\w]*\w)?)/, 'tag');
  },


  /**
   * Filter.
   */

  filter: function(opts) {
    this.scanString(/^(\:[\w-]+)/, 'filter');
  },


  /**
   * Block code.
   */
  blockCode: function() {
    this.scanLine(/^(-)/,['blockcode']);
  },



  /**
   * Code.
   */

  code: function() {
    this.scanLine(/^(!?=|-)[ \t]*([^\n]+)/,['blockcode','code']);
  },


  /**
   * Id.
   */

  id: function() {
    this.scanString(/^(#[\w-]+)/, 'id');
  },


  /**
   * Class.
   */

  className: function() {
    //this.scanString(/^(\.+[\.\w-]+)/, 'class');
    var captures;

    if (captures = /^(\.\-?[_a-z][_a-z0-9\-]*)/i.exec(this.input)) {
      var length = captures[1].length;

      this.hightlight += '<span class="pre-class">' + captures[1] + '</span>';
      this.input = this.input.substr(length);
      return true;
    }
  },



  /**
   * Attributes.
   */

  attrs: function() {
    var captures;

    if (captures = /^\(([^\n\)]*)\)/.exec(this.input)) {
      var length = captures[0].length;
      var newInput = this.input.substr(length);
      var regexp = /(.*?)(=|!=)(\{[^\n]*\}|[^,\n]*)|([^\n]+)/g;

      this.hightlight += '(';

      while ((atribute = regexp.exec(captures[1])) != null) {
        if (atribute.index === regexp.lastIndex) {
          regexp.lastIndex++;
        }
        if (atribute[1]) { this.hightlight += '<span class="pre-attr">' + atribute[1] + '</span>'; }
        if (atribute[2]) { this.hightlight += atribute[2] }
        if (atribute[3]) { this.hightlight += '<span class="pre-value">' + atribute[3] + '</span>'; }
        if (atribute[4]) { this.hightlight += '<span class="pre-attr">' + atribute[4] + '</span>'; }
      }

      this.hightlight += ')';

      this.input = newInput;
      return true;
    }
  },


  /**
   * &attributes block
   */

  attributesBlock: function () {
    this.scanLine(/^(&attributes)(\(\{)(.*?)(\}\))/,['attr','symbol','value','symbol']);
  },


  /**
   * Text.
   */

  text: function() {
    this.scanLine(/^(\|[^\n]+)/,['text']);
    //this.scanLine(/^(?:\| ?| )([^\n]+)/,['text']);
  },


  /**
   * Indentation.
   */

  indentation: function() {
    var captures;

    if (captures = /^\(([^\n\)]*)\)/.exec(this.input)) {
      var length = captures[0].length;
      var newInput = this.input.substr(length);

      this.hightlight += captures[1];

      this.input = newInput;
      return true;
    }
  },


  /**
   * Comment.
   */

  comment: function() {
    this.scanLine(/^(\/\/)(-)?([^\n]*)/,['comment','comment','comment']);
    //pattern: /(^([\t ]*))\/\/.*((?:\r?\n|\r)\2[\t ]+.+)*/m,
    //this.scanLine(/(^([\t ]*))\/\/.*((?:\r?\n|\r)\2[\t ]+.+)*/m,['comment','comment','comment']);
  },


  /**
   * Next.
   */

  next: function () {
    this.hightlight += this.input.substr(this.pos,1);
    this.input = this.input.substring(1);
    return true;
  },


  /**
   * Move to the next token
   */

  advance: function() {
    return this.yield()
      || this.doctype()
      || this.case()
      || this.when()
      || this.default()
      || this.extends()
      || this.append()
      || this.prepend()
      || this.block()
      || this.include()
      || this.mixin()
      || this.conditional()
      || this.each()
      || this.while()
      || this.tag()
      || this.filter()
      || this.blockCode()
      || this.code()
      || this.id()
      || this.className()
      || this.attrs()
      || this.attributesBlock()
      || this.text()
      || this.indentation()
      || this.comment()
      || this.next();
  },


  /**
   * Return an hightlight jade string
   *
   * @returns {String}
   * @api public
   */
  getHighlight: function () {
    while (this.input.length) {
      this.advance();
    }

    return this.hightlight;
  }
}
