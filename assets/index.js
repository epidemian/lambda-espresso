// This is a generated file. Sources are here: https://github.com/epidemian/lambda-playground
(function() {
  function require(path){ return require[path]; }
  require['./grammar'] = new function() {
  var exports = this;
  /* Jison generated parser */
var grammar = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"file":3,"term":4,"EOF":5,"LAMBDA":6,"var":7,".":8,"(":9,")":10,"VAR":11,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"LAMBDA",8:".",9:"(",10:")",11:"VAR"},
productions_: [0,[3,2],[4,4],[4,2],[4,1],[4,3],[7,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2: this.$ = yy.parseAbstraction($$[$0-2], $$[$0]); 
break;
case 3: this.$ = yy.parseApplication($$[$0-1], $$[$0]); 
break;
case 4: this.$ = yy.parseVariable($$[$0]); 
break;
case 5: this.$ = $$[$0-1]; 
break;
case 6: this.$ = yytext; 
break;
}
},
table: [{3:1,4:2,6:[1,3],7:4,9:[1,5],11:[1,6]},{1:[3]},{4:8,5:[1,7],6:[1,3],7:4,9:[1,5],11:[1,6]},{7:9,11:[1,6]},{5:[2,4],6:[2,4],9:[2,4],10:[2,4],11:[2,4]},{4:10,6:[1,3],7:4,9:[1,5],11:[1,6]},{5:[2,6],6:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[2,6]},{1:[2,1]},{4:8,5:[2,3],6:[2,3],7:4,9:[2,3],10:[2,3],11:[2,3]},{8:[1,11]},{4:8,6:[1,3],7:4,9:[1,5],10:[1,12],11:[1,6]},{4:13,6:[1,3],7:4,9:[1,5],11:[1,6]},{5:[2,5],6:[2,5],9:[2,5],10:[2,5],11:[2,5]},{4:8,5:[2,2],6:[1,3],7:4,9:[1,5],10:[2,2],11:[1,6]}],
defaultActions: {7:[2,1]},
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
case 0:/* ignore */
break;
case 1: return 9; 
break;
case 2: return 10; 
break;
case 3: return 6; 
break;
case 4: return 8; 
break;
case 5: return 11; 
break;
case 6: /* ignore */ 
break;
case 7: return 5; 
break;
}
};
lexer.rules = [/^(?:\s*\n\s*)/,/^(?:\()/,/^(?:\))/,/^(?:\\|λ)/,/^(?:\.)/,/^(?:[a-z][a-z0-9]*)/,/^(?:\s+)/,/^(?:$)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7],"inclusive":true}};
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
  var Abstraction, Application, Term, Variable, parser, reductionSteps,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  parser = new (require('./grammar')).Parser;

  parser.yy = {
    parseAbstraction: function(varName, body) {
      return new Abstraction(varName, body);
    },
    parseApplication: function(left, right) {
      return new Application(left, right);
    },
    parseVariable: function(name) {
      return new Variable(name);
    }
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

  exports.parse = function(expr) {
    return (parser.parse(expr)).toString();
  };

  exports.reduce = function(expr) {
    return (reductionSteps(expr)).pop();
  };

  exports.reductionSteps = reductionSteps = function(expr) {
    var maxSteps, steps, term;
    term = parser.parse(expr);
    steps = [term];
    maxSteps = 100;
    while (term = term.reduceStep()) {
      steps.push(term.toString());
      if (steps.length > maxSteps) {
        throw 'Too many reduction steps';
      }
    }
    return steps;
  };

}).call(this);

};
require['./index'] = new function() {
  var exports = this;
  // Generated by CoffeeScript 1.3.3
(function() {
  var $error, $errorContainer, $input, $output, $outputContainer, lambda, run;

  lambda = require('./lambda');

  $input = $('.input');

  $output = $('.output');

  $outputContainer = $('.output-container');

  $error = $('.error');

  $errorContainer = $('.error-container');

  $input.keyup(function(e) {
    var code;
    if (e.keyCode === 13 && e.ctrlKey) {
      return run();
    }
    code = $input.val();
    code = code.replace(/\\/g, 'λ');
    return $input.val(code);
  });

  ($('.run')).click(function() {
    return run();
  });

  run = function() {
    var expr, i, result, step, steps, _i, _len;
    console.log('run!');
    expr = $input.val();
    try {
      steps = lambda.reductionSteps(expr);
      result = '';
      for (i = _i = 0, _len = steps.length; _i < _len; i = ++_i) {
        step = steps[i];
        if (i > 0) {
          result += '<br> → ';
        }
        result += i < steps.length - 1 ? step : "<b>" + step + "</b>";
      }
      $output.empty().html(result);
    } catch (e) {
      $error.text(e.message);
    }
    $outputContainer.toggle(result != null);
    return $errorContainer.toggle(!(result != null));
  };

  $input.focus();

}).call(this);

};
}());