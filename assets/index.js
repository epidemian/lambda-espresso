// Generated by CoffeeScript
// Sources are here: https://github.com/epidemian/lambda-espresso
(function() {
  function require(path){ return require[path]; }
  require['./helpers'] = new function() {
  var exports = this;
  // Generated by CoffeeScript 1.3.3
(function() {

  exports.repeatStr = function(str, n) {
    var res;
    res = '';
    while (n--) {
      res += str;
    }
    return res;
  };

  exports.extend = function(obj, src) {
    var k, v;
    for (k in src) {
      v = src[k];
      obj[k] = v;
    }
    return obj;
  };

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
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
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
  var Abstraction, Application, BetaReductionStep, Macro, Step, Variable, applyStep, extend, freeIn, highlightStepMatch, highlightSubstitutionTerm, highlightSubstitutionVariable, logTerm, parse, parseTerm, reduceStep, reduceTerm, renameStep, renameVar, repeatStr, substitute, termStr, varRenameCollides, wrapStep, _ref;

  _ref = require('./helpers'), repeatStr = _ref.repeatStr, extend = _ref.extend;

  Variable = function(name) {
    return {
      type: Variable,
      name: name
    };
  };

  Abstraction = function(varName, body) {
    return {
      type: Abstraction,
      varName: varName,
      body: body
    };
  };

  Application = function(left, right) {
    return {
      type: Application,
      left: left,
      right: right
    };
  };

  Macro = function(name, term) {
    return {
      type: Macro,
      name: name,
      term: term
    };
  };

  parse = function(str) {
    var macros, parser, terms;
    parser = new (require('./grammar')).Parser;
    macros = {};
    terms = [];
    parser.yy = {
      parseAbstraction: Abstraction,
      parseApplication: Application,
      parseVariable: Variable,
      parseMacroDefinition: function(name, term) {
        if (macros[name]) {
          throw Error("" + name + " already defined");
        }
        return macros[name] = Macro(name, term);
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

  termStr = function(t, l, r) {
    var lambda, str;
    if (l == null) {
      l = 0;
    }
    if (r == null) {
      r = 0;
    }
    str = (function() {
      switch (t.type) {
        case Variable:
        case Macro:
          return t.name;
        case Abstraction:
          lambda = "λ" + t.varName;
          if (t.highlightVar) {
            lambda = t.highlightVar(lambda);
          }
          str = "" + lambda + "." + (termStr(t.body));
          if (r > 0) {
            return "(" + str + ")";
          } else {
            return str;
          }
          break;
        case Application:
          str = "" + (termStr(t.left, 0, 1)) + " " + (termStr(t.right, 1, r));
          if (l > 0) {
            return "(" + str + ")";
          } else {
            return str;
          }
      }
    })();
    if (t.highlight) {
      str = t.highlight(str);
    }
    return str;
  };

  logTerm = function(t, ind) {
    var log;
    if (ind == null) {
      ind = 0;
    }
    log = function(msg) {
      return console.log((repeatStr('| ', ind)) + msg);
    };
    switch (t.type) {
      case Variable:
      case Macro:
        return log(t.name);
      case Abstraction:
        log("λ" + t.varName);
        return logTerm(t.body, ind + 1);
      case Application:
        log("@");
        logTerm(t.left, ind + 1);
        return logTerm(t.right, ind + 1);
    }
  };

  highlightStepMatch = function(str) {
    return "<span class=\"match\">" + str + "</span>";
  };

  highlightSubstitutionVariable = function(str) {
    return "<span class=\"subst-var\">" + str + "</span>";
  };

  highlightSubstitutionTerm = function(str) {
    return "<span class=\"subst-term\">" + str + "</span>";
  };

  Step = function(type, before, after, term) {
    return {
      type: type,
      before: extend({
        highlight: highlightStepMatch
      }, before),
      after: extend({
        highlight: highlightStepMatch
      }, after),
      term: term || after
    };
  };

  BetaReductionStep = function(t, x, s) {
    var after, before, highlightedAbst, highlightedAbstBody, highlightedSubst, highlightedVar, term;
    highlightedSubst = extend({
      highlight: highlightSubstitutionTerm
    }, s);
    highlightedVar = extend({
      highlight: highlightSubstitutionVariable
    }, Variable(x));
    highlightedAbstBody = substitute(t, x, highlightedVar);
    highlightedAbst = extend({
      highlightVar: highlightSubstitutionVariable
    }, Abstraction(x, highlightedAbstBody));
    before = Application(highlightedAbst, highlightedSubst);
    after = substitute(t, x, highlightedSubst);
    term = substitute(t, x, s);
    return Step('beta', before, after, term);
  };

  wrapStep = function(step, fn) {
    if (step) {
      step.term = fn(step.term);
      step.before = fn(step.before);
      step.after = fn(step.after);
    }
    return step;
  };

  reduceStep = function(t) {
    var applied, leftStep;
    switch (t.type) {
      case Variable:
        return null;
      case Abstraction:
        return wrapStep(reduceStep(t.body), function(body) {
          return Abstraction(t.varName, body);
        });
      case Application:
        if (applied = applyStep(t.left, t.right)) {
          return applied;
        }
        if (leftStep = reduceStep(t.left)) {
          return wrapStep(leftStep, function(left) {
            return Application(left, t.right);
          });
        }
        return wrapStep(reduceStep(t.right), function(right) {
          return Application(t.left, right);
        });
      case Macro:
        return (reduceStep(t.term)) && Step('macro', t, t.term);
    }
  };

  applyStep = function(t, s) {
    var body, renameBodyStep, varName;
    switch (t.type) {
      case Variable:
      case Application:
        return null;
      case Abstraction:
        varName = t.varName, body = t.body;
        if (renameBodyStep = renameStep(body, varName, s)) {
          return wrapStep(renameBodyStep, function(body) {
            return Application(Abstraction(varName, body), s);
          });
        }
        return BetaReductionStep(body, varName, s);
      case Macro:
        if (applyStep(t.term, s)) {
          return wrapStep(Step('macro', t, t.term), function(macro) {
            return Application(macro, s);
          });
        }
    }
  };

  renameStep = function(t, x, s) {
    var leftStep, newBody, newVarName, rightStep;
    switch (t.type) {
      case Variable:
      case Macro:
        return null;
      case Abstraction:
        if (t.varName === x) {
          return null;
        }
        if ((freeIn(t.varName, s)) && (freeIn(x, t.body))) {
          newVarName = renameVar(t.varName, t.body, s);
          newBody = substitute(t.body, t.varName, Variable(newVarName));
          return Step('alpha', t, Abstraction(newVarName, newBody));
        } else {
          return wrapStep(renameStep(t.body, x, s), function(body) {
            return Abstraction(t.varName, body);
          });
        }
        break;
      case Application:
        if (leftStep = renameStep(t.left, x, s)) {
          return wrapStep(leftStep, function(left) {
            return Application(left, t.right);
          });
        }
        if (rightStep = renameStep(t.right, x, s)) {
          return wrapStep(rightStep, function(right) {
            return Application(t.left, right);
          });
        }
    }
  };

  substitute = function(t, x, s) {
    switch (t.type) {
      case Variable:
        if (t.name === x) {
          return s;
        } else {
          return t;
        }
        break;
      case Abstraction:
        if (t.varName === x) {
          return t;
        }
        return Abstraction(t.varName, substitute(t.body, x, s));
      case Application:
        return Application(substitute(t.left, x, s), substitute(t.right, x, s));
      case Macro:
        if (freeIn(x, t.term)) {
          throw Error(("Logical error: " + x + " is free in " + t.name + ".") + "Macros cannot have free variables");
        }
        return t;
    }
  };

  renameVar = function(oldName, t, s) {
    var base, isValid, m, n, newName;
    base = oldName.replace(/\d+$/, '');
    n = (m = oldName.match(/\d+$/)) ? parseInt(m[0]) : 0;
    while (true) {
      newName = base + ++n;
      isValid = !(freeIn(newName, s)) && !(freeIn(newName, t)) && !(varRenameCollides(t, oldName, newName));
      if (isValid) {
        return newName;
      }
    }
  };

  freeIn = function(x, t) {
    switch (t.type) {
      case Variable:
        return t.name === x;
      case Abstraction:
        return t.varName !== x && freeIn(x, t.body);
      case Application:
        return (freeIn(x, t.left)) || (freeIn(x, t.right));
      case Macro:
        return freeIn(x, t.term);
    }
  };

  varRenameCollides = function(t, oldName, newName) {
    var collisionHere;
    switch (t.type) {
      case Variable:
        return false;
      case Abstraction:
        collisionHere = t.varName === newName && (freeIn(oldName, t));
        return collisionHere || varRenameCollides(t.body, oldName, newName);
      case Application:
        return (varRenameCollides(t.left, oldName, newName)) || (varRenameCollides(t.right, oldName, newName));
      case Macro:
        return varRenameCollides(t.term, oldName, newName);
    }
  };

  reduceTerm = function(term) {
    var final, initial, maxSteps, step, steps, terminates;
    initial = termStr(term);
    steps = [];
    maxSteps = 100;
    while ((step = reduceStep(term)) && (steps.length < maxSteps)) {
      term = step.term;
      steps.push({
        type: step.type,
        before: termStr(step.before),
        after: termStr(step.after)
      });
    }
    final = termStr(term);
    terminates = steps.length !== maxSteps || !step;
    return {
      initial: initial,
      final: final,
      terminates: terminates,
      steps: steps
    };
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
    return termStr(parseTerm(str));
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
  var $error, $errorContainer, $examplesMenu, $input, $output, $outputContainer, arrowHtml, arrowHtmlByType, arrowLabel, arrowSymbol, examples, lambda, options, preserveScrollPosition, run, termHtml, updateInputFromHash, updateOutputExpansions;

  lambda = require('./lambda');

  examples = (require('./examples')).all;

  $input = $('.input');

  $output = $('.output');

  $outputContainer = $('.output-container');

  $error = $('.error');

  $errorContainer = $('.error-container');

  preserveScrollPosition = function(fn) {
    var top;
    top = document.body.scrollTop;
    fn();
    return document.body.scrollTop = top;
  };

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

  termHtml = function(term, className) {
    if (className == null) {
      className = '';
    }
    return "<span class=\"term " + className + "\">" + term + "</span>";
  };

  arrowHtml = function(symbol, label) {
    return "<span class=\"arrow\">" + symbol + "<small>" + label + "</small></span>";
  };

  arrowSymbol = function(type) {
    if (type === 'macro') {
      return '≡';
    } else {
      return '→';
    }
  };

  arrowLabel = function(type) {
    switch (type) {
      case 'alpha':
        return 'α';
      case 'beta':
        return 'β';
      default:
        return '';
    }
  };

  arrowHtmlByType = function(type) {
    return arrowHtml(arrowSymbol(type), arrowLabel(type));
  };

  run = function() {
    var after, before, collapsed, final, initial, program, reductions, result, steps, type, _i, _j, _len, _len1, _ref, _ref1;
    program = $input.val();
    try {
      reductions = lambda.reduceProgram(program);
      result = '';
      for (_i = 0, _len = reductions.length; _i < _len; _i++) {
        _ref = reductions[_i], initial = _ref.initial, final = _ref.final, steps = _ref.steps;
        result += '<div class="reduction">';
        collapsed = !steps.length ? termHtml(initial) : (termHtml(initial)) + ' ' + (arrowHtml('→', "(" + steps.length + ")")) + ' ' + (termHtml(final));
        result += "<div class=\"collapsed\">" + collapsed + "</div>";
        result += '<div class="expanded">';
        if (!steps.length) {
          result += termHtml(initial);
        } else {
          for (_j = 0, _len1 = steps.length; _j < _len1; _j++) {
            _ref1 = steps[_j], type = _ref1.type, before = _ref1.before, after = _ref1.after;
            result += '<span class="step">' + (termHtml(before, 'before')) + '<br>' + (arrowHtmlByType(type)) + (termHtml(after, 'after')) + '</span>';
          }
        }
        result += '</div>';
        result += '</div>';
      }
      $output.empty().html(result);
      updateOutputExpansions();
      ($('.reduction', $output)).click(function() {
        var _this = this;
        return preserveScrollPosition(function() {
          return ($('.collapsed, .expanded', _this)).toggle();
        });
      });
      ($('.expanded .step', $output)).hover(function() {
        var $step;
        $step = $(this);
        $step.addClass('highlight');
        return $step.prevAll('.step:eq(0)').find('.after').hide();
      }, function() {
        var $step;
        $step = $(this);
        $step.removeClass('highlight');
        return $step.prevAll('.step:eq(0)').find('.after').show();
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
    $li.click(function(e) {
      e.preventDefault();
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

  options = {
    expandOutput: false
  };

  updateOutputExpansions = function() {
    return preserveScrollPosition(function() {
      var expand;
      expand = options.expandOutput;
      ($('.expand-all, .reduction .collapsed')).toggle(!expand);
      return ($('.collapse-all, .reduction .expanded')).toggle(expand);
    });
  };

  ($('.expand-all, .collapse-all')).click(function() {
    options.expandOutput = !options.expandOutput;
    return updateOutputExpansions();
  });

}).call(this);

};
}());