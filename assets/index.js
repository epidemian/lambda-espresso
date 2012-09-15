// Generated by CoffeeScript
// Sources are here: https://github.com/epidemian/lambda-espresso
(function() {
  function require(path){ return require[path]; }
  require['./helpers'] = new function() {
  var exports = this;
  // Generated by CoffeeScript 1.3.3
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  Function.prototype.trace = (function() {
    var indent, log, makeTracing, traceEnabled;
    traceEnabled = true;
    indent = 0;
    log = function(msg) {
      var i, ind, _i;
      ind = '';
      for (i = _i = 0; 0 <= indent ? _i < indent : _i > indent; i = 0 <= indent ? ++_i : --_i) {
        ind += '| ';
      }
      return console.log("" + ind + msg);
    };
    makeTracing = function(name, fn) {
      return function() {
        var args, res;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        log("(" + this + ")." + name + "(" + (args.join(', ')) + ")");
        indent++;
        res = fn.apply(this, args);
        indent--;
        log("-> " + res);
        return res;
      };
    };
    return function(arg) {
      var fn, name, _results;
      _results = [];
      for (name in arg) {
        if (!__hasProp.call(arg, name)) continue;
        fn = arg[name];
        _results.push(this.prototype[name] = traceEnabled ? makeTracing(name, fn) : fn);
      }
      return _results;
    };
  })();

}).call(this);

};
require['./grammar'] = new function() {
  var exports = this;
  /* Jison generated parser */
var grammar = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"program":4,"EOF":5,"line":6,"SEPARATOR":7,"term":8,"macro":9,"=":10,"LAMBDA":11,"var":12,".":13,"(":14,")":15,"MACRO":16,"VAR":17,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"SEPARATOR",10:"=",11:"LAMBDA",13:".",14:"(",15:")",16:"MACRO",17:"VAR"},
productions_: [0,[3,2],[4,0],[4,1],[4,2],[4,3],[6,1],[6,3],[8,4],[8,2],[8,1],[8,1],[8,3],[9,1],[12,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return yy.getProgram(); 
break;
case 6: this.$ = yy.parseTermEvaluation($$[$0]); 
break;
case 7: this.$ = yy.parseMacroDefinition($$[$0-2], $$[$0]); 
break;
case 8: this.$ = yy.parseAbstraction($$[$0-2], $$[$0]); 
break;
case 9: this.$ = yy.parseApplication($$[$0-1], $$[$0]); 
break;
case 10: this.$ = yy.parseVariable($$[$0]); 
break;
case 11: this.$ = yy.parseMacroUsage($$[$0]); 
break;
case 12: this.$ = $$[$0-1]; 
break;
case 13: this.$ = yytext; 
break;
case 14: this.$ = yytext; 
break;
}
},
table: [{3:1,4:2,5:[2,2],6:3,7:[2,2],8:4,9:5,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{1:[3]},{5:[1,11],7:[1,12]},{5:[2,3],7:[2,3]},{5:[2,6],7:[2,6],8:13,9:14,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{5:[2,11],7:[2,11],10:[1,15],11:[2,11],14:[2,11],16:[2,11],17:[2,11]},{12:16,17:[1,10]},{5:[2,10],7:[2,10],11:[2,10],14:[2,10],15:[2,10],16:[2,10],17:[2,10]},{8:17,9:14,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{5:[2,13],7:[2,13],10:[2,13],11:[2,13],14:[2,13],15:[2,13],16:[2,13],17:[2,13]},{5:[2,14],7:[2,14],11:[2,14],13:[2,14],14:[2,14],15:[2,14],16:[2,14],17:[2,14]},{1:[2,1]},{5:[2,4],6:18,7:[2,4],8:4,9:5,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{5:[2,9],7:[2,9],8:13,9:14,11:[2,9],12:7,14:[2,9],15:[2,9],16:[2,9],17:[2,9]},{5:[2,11],7:[2,11],11:[2,11],14:[2,11],15:[2,11],16:[2,11],17:[2,11]},{8:19,9:14,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{13:[1,20]},{8:13,9:14,11:[1,6],12:7,14:[1,8],15:[1,21],16:[1,9],17:[1,10]},{5:[2,5],7:[2,5]},{5:[2,7],7:[2,7],8:13,9:14,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{8:22,9:14,11:[1,6],12:7,14:[1,8],16:[1,9],17:[1,10]},{5:[2,12],7:[2,12],11:[2,12],14:[2,12],15:[2,12],16:[2,12],17:[2,12]},{5:[2,8],7:[2,8],8:13,9:14,11:[1,6],12:7,14:[1,8],15:[2,8],16:[1,9],17:[1,10]}],
defaultActions: {11:[2,1]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0: return 14; 
break;
case 1: return 15; 
break;
case 2: return 11; 
break;
case 3: return 13; 
break;
case 4: return 10; 
break;
case 5: return 17; 
break;
case 6: return 16; 
break;
case 7: return 7; 
break;
case 8: /* ignore whitespace */ 
break;
case 9: /* ignore line comments */ 
break;
case 10: return 5; 
break;
}
};
lexer.rules = [/^(?:\()/,/^(?:\))/,/^(?:\\|λ)/,/^(?:\.)/,/^(?:=)/,/^(?:[a-z][a-z0-9-_]*)/,/^(?:[A-Z][A-Z0-9-_]*)/,/^(?:[\n])/,/^(?:[ \t]+)/,/^(?:;.*)/,/^(?:$)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = grammar;
exports.Parser = grammar.Parser;
exports.parse = function () { return grammar.parse.apply(grammar, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    var source, cwd;
    if (typeof process !== 'undefined') {
        source = require('fs').readFileSync(require('path').resolve(args[1]), "utf8");
    } else {
        source = require("file").path(require("file").cwd()).join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
};
require['./lambda'] = new function() {
  var exports = this;
  // Generated by CoffeeScript 1.3.3
(function() {
  var Abstraction, Application, Macro, Term, Variable, parse, parseTerm, reduceTerm,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  parse = function(str) {
    var macros, parser, terms;
    parser = new (require('./grammar')).Parser;
    macros = {};
    terms = [];
    parser.yy = {
      parseAbstraction: function(varName, body) {
        return new Abstraction(varName, body);
      },
      parseApplication: function(left, right) {
        return new Application(left, right);
      },
      parseVariable: function(name) {
        return new Variable(name);
      },
      parseMacroDefinition: function(name, term) {
        if (macros[name]) {
          throw Error("" + name + " already defined");
        }
        return macros[name] = new Macro(name, term);
      },
      parseMacroUsage: function(name) {
        if (!macros[name]) {
          throw Error("" + name + " not defined");
        }
        return macros[name];
      },
      parseTermEvaluation: function(term) {
        return terms.push(term);
      },
      getProgram: function() {
        return terms;
      }
    };
    return parser.parse(str);
  };

  Term = (function() {

    function Term() {}

    Term.prototype.leftApplyString = function() {
      return '' + this;
    };

    Term.prototype.rightApplyString = function() {
      return '' + this;
    };

    Term.prototype.toJSON = function() {
      var k, v;
      return [this.constructor.name].concat((function() {
        var _results;
        _results = [];
        for (k in this) {
          if (!__hasProp.call(this, k)) continue;
          v = this[k];
          _results.push(v);
        }
        return _results;
      }).call(this));
    };

    return Term;

  })();

  Variable = (function(_super) {

    __extends(Variable, _super);

    function Variable(name) {
      this.name = name;
    }

    Variable.prototype.toString = function() {
      return this.name;
    };

    Variable.prototype.reduceStep = function() {
      return null;
    };

    Variable.prototype.applyStep = function() {
      return null;
    };

    Variable.prototype.replace = function(varName, term) {
      if (varName === this.name) {
        return term;
      } else {
        return this;
      }
    };

    Variable.prototype.hasFree = function(varName) {
      return this.name === varName;
    };

    Variable.prototype.varRenameCollides = function() {
      return false;
    };

    return Variable;

  })(Term);

  Abstraction = (function(_super) {

    __extends(Abstraction, _super);

    function Abstraction(varName, body) {
      this.varName = varName;
      this.body = body;
    }

    Abstraction.prototype.toString = function() {
      return "λ" + this.varName + "." + this.body;
    };

    Abstraction.prototype.leftApplyString = function() {
      return "(" + this + ")";
    };

    Abstraction.prototype.reduceStep = function() {
      var reducedBody;
      reducedBody = this.body.reduceStep();
      return reducedBody && new Abstraction(this.varName, reducedBody);
    };

    Abstraction.prototype.applyStep = function(term) {
      return this.body.replace(this.varName, term);
    };

    Abstraction.prototype.replace = function(varName, term) {
      if (varName === this.varName) {
        return this;
      }
      if ((term.hasFree(this.varName)) && (this.body.hasFree(varName))) {
        return (this.renameVar(term)).replace(varName, term);
      } else {
        return new Abstraction(this.varName, this.body.replace(varName, term));
      }
    };

    Abstraction.prototype.renameVar = function(substitutionTerm) {
      var base, m, n, name, validName;
      base = this.varName.replace(/\d+$/, '');
      n = (m = this.varName.match(/\d+$/)) ? parseInt(m[0]) : 0;
      while (!(name && validName)) {
        name = base + ++n;
        validName = !(substitutionTerm.hasFree(name)) && !(this.body.hasFree(name)) && !(this.body.varRenameCollides(this.varName, name));
      }
      return new Abstraction(name, this.body.replace(this.varName, new Variable(name)));
    };

    Abstraction.prototype.hasFree = function(varName) {
      return varName !== this.varName && this.body.hasFree(varName);
    };

    Abstraction.prototype.varRenameCollides = function(from, to) {
      return ((this.hasFree(from)) && this.varName === to) || (this.body.varRenameCollides(from, to));
    };

    return Abstraction;

  })(Term);

  Application = (function(_super) {

    __extends(Application, _super);

    function Application(left, right) {
      this.left = left;
      this.right = right;
    }

    Application.prototype.toString = function() {
      return "" + (this.left.leftApplyString()) + " " + (this.right.rightApplyString());
    };

    Application.prototype.rightApplyString = function() {
      return "(" + this + ")";
    };

    Application.prototype.reduceStep = function() {
      var applied, reducedLeft, reducedRight;
      applied = this.left.applyStep(this.right);
      if (applied) {
        return applied;
      }
      reducedLeft = this.left.reduceStep();
      if (reducedLeft) {
        return new Application(reducedLeft, this.right);
      }
      reducedRight = this.right.reduceStep();
      return reducedRight && new Application(this.left, reducedRight);
    };

    Application.prototype.applyStep = function() {
      return null;
    };

    Application.prototype.replace = function(varName, term) {
      return new Application(this.left.replace(varName, term), this.right.replace(varName, term));
    };

    Application.prototype.hasFree = function(varName) {
      return (this.left.hasFree(varName)) || (this.right.hasFree(varName));
    };

    Application.prototype.varRenameCollides = function(from, to) {
      return (this.left.varRenameCollides(from, to)) || (this.right.varRenameCollides(from, to));
    };

    return Application;

  })(Term);

  Macro = (function(_super) {

    __extends(Macro, _super);

    function Macro(name, term) {
      this.name = name;
      this.term = term;
    }

    Macro.prototype.toString = function() {
      return this.name;
    };

    Macro.prototype.reduceStep = function() {
      return this.term.reduceStep() && this.term;
    };

    Macro.prototype.applyStep = function(term) {
      return (this.term.applyStep(term)) && new Application(this.term, term);
    };

    Macro.prototype.replace = function(varName, term) {
      if (this.hasFree(varName)) {
        throw Error(("Logical error: " + varName + " is free in " + this.name + ".") + "Macros cannot have free variables");
      }
      return this;
    };

    Macro.prototype.hasFree = function(varName) {
      return this.term.hasFree(varName);
    };

    Macro.prototype.varRenameCollides = function(from, to) {
      return this.term.varRenameCollides(from, to);
    };

    return Macro;

  })(Term);

  reduceTerm = function(term) {
    var maxSteps, steps;
    steps = [term.toString()];
    maxSteps = 100;
    while (term = term.reduceStep()) {
      steps.push(term.toString());
      if (steps.length > maxSteps) {
        throw Error('Too many reduction steps');
      }
    }
    return steps;
  };

  parseTerm = function(str) {
    var terms;
    terms = parse(str);
    if (terms.length !== 1) {
      throw Error("program has " + terms.length + " terms");
    }
    return terms[0];
  };

  exports.parseTerm = function(str) {
    return (parseTerm(str)).toString();
  };

  exports.reduceTerm = function(str) {
    return reduceTerm(parseTerm(str));
  };

  exports.reduceProgram = function(expr) {
    var term, terms, _i, _len, _results;
    terms = parse(expr);
    _results = [];
    for (_i = 0, _len = terms.length; _i < _len; _i++) {
      term = terms[_i];
      _results.push(reduceTerm(term));
    }
    return _results;
  };

}).call(this);

};
require['./examples'] = new function() {
  var exports = this;
  // Generated by CoffeeScript 1.3.3
(function() {

  exports.all = [
    {
      name: 'Basics',
      code: '; This example is not intend to be a tutorial nor an introduction to λ Calculus.\n; You should probably read http://en.wikipedia.org/wiki/Lambda_calculus for that :)\n; As you can see, these are comments. You can run this example clicking the Run button below or pressing Ctrl+Enter.\n; So... the three basic types of λ expressions are variables:\nx\n; Applications:\nx y\n; And abstractions (also known as functions):\nλx.x\n; If the left side of an application is an abstraction, then a reduction takes place:\n(λx.x) y\n; That little abstraction at the left is the identity, a very simple function that just reduces to whatever you apply to it.\n; We can give it a name like so:\nID = λx.x\n; And then just refer it by that name:\nID a\n; You can apply any kind of λ expression to an abstraction, like another function:\nID λb.c\n; Or an application:\nID (x y)\n; Or even the identity function itself:\nID ID\n; That means you can apply identity to itself as many times as you want and it\'ll still be identity:\nID ID ID ID ID\n; Notice that applications are left-associative, so the line above is equivalent to:\n((((ID ID) ID) ID) ID)\n\n; TODO: explain applicative and normal order...'
    }, {
      name: 'Booleans',
      code: '; Example showcasing Church booleans.\nTRUE = λt.λf.t\nFALSE = λt.λf.f\nAND = λp.λq.p q p\nOR = λp.λq.p p q\n      \n; Print truth tables for AND and OR.\nAND FALSE FALSE\nAND FALSE TRUE\nAND TRUE FALSE\nAND TRUE TRUE\nOR FALSE FALSE\nOR FALSE TRUE\nOR TRUE FALSE\nOR TRUE TRUE'
    }
  ];

}).call(this);

};
require['./index'] = new function() {
  var exports = this;
  // Generated by CoffeeScript 1.3.3
(function() {
  var $error, $errorContainer, $examplesMenu, $input, $output, $outputContainer, examples, lambda, run, updateInputFromHash;

  lambda = require('./lambda');

  examples = (require('./examples')).all;

  $input = $('.input');

  $output = $('.output');

  $outputContainer = $('.output-container');

  $error = $('.error');

  $errorContainer = $('.error-container');

  ($(document)).keyup(function(e) {
    if (e.keyCode === 13 && e.ctrlKey) {
      return run();
    }
  });

  $input.keyup(function(e) {
    var code, end, start;
    code = $input.val();
    code = code.replace(/\\/g, 'λ');
    start = $input[0].selectionStart;
    end = $input[0].selectionEnd;
    $input.val(code);
    $input[0].selectionStart = start;
    return $input[0].selectionEnd = end;
  });

  ($('.run')).click(function() {
    return run();
  });

  run = function() {
    var first, i, last, program, reductions, result, step, steps, _i, _j, _len, _len1;
    program = $input.val();
    try {
      reductions = lambda.reduceProgram(program);
      result = '';
      for (_i = 0, _len = reductions.length; _i < _len; _i++) {
        steps = reductions[_i];
        result += '<div class="reduction">';
        first = steps[0];
        last = steps[steps.length - 1];
        result += "<div class=\"collapsed\">" + first + " → <b>" + last + "</b></div>";
        result += '<div class="expanded">';
        result += "<b>" + first + "</b><br>";
        for (i = _j = 0, _len1 = steps.length; _j < _len1; i = ++_j) {
          step = steps[i];
          if (i === 0 && steps.length > 1) {
            continue;
          }
          if (i === steps.length - 1) {
            step = "<b>" + step + "</b>";
          }
          result += " → " + step + "<br>";
        }
        result += '</div>';
        result += '</div>';
      }
      $output.empty().html(result);
      ($('.expanded', $output)).hide();
      ($('.reduction', $output)).click(function() {
        return ($('.collapsed, .expanded', this)).toggle();
      });
    } catch (e) {
      $error.text(e.message);
    }
    $outputContainer.toggle(result != null);
    return $errorContainer.toggle(!(result != null));
  };

  $input.val("; Write some λ-expressions here. Use \"\\\" to enter \"λ\" ;)\n(λx.λy.λz.z y x) a b c");

  $input.focus();

  $examplesMenu = $('.examples.dropdown-menu');

  examples.forEach(function(example) {
    var $li, hash;
    hash = (">" + example.code).replace(/\n/g, '%0A');
    $li = $("<li><a href=\"#" + hash + "\">" + example.name + "</a></li>");
    $li.click(function() {
      return $input.val(example.code);
    });
    return $examplesMenu.append($li);
  });

  ($('button.link')).click(function() {
    var code;
    code = $input.val();
    return location.hash = ">" + code;
  });

  updateInputFromHash = function() {
    var code, codeStart, hash;
    hash = decodeURI(location.hash);
    codeStart = hash.indexOf('>');
    if (codeStart !== -1) {
      code = hash.slice(codeStart + 1);
      return $input.val(code);
    }
  };

  ($(window)).on('hashchange', updateInputFromHash);

  updateInputFromHash();

}).call(this);

};
}());