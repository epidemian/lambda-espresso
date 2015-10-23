(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
module.exports = [
  {
    name: 'Basics',
    code: '; This example is not intend to be a tutorial nor an introduction to λ Calculus.\n; You should check http://en.wikipedia.org/wiki/Lambda_calculus for that :)\n; As you can see, these are comments. You can run this example clicking the Run\n; button below or pressing Ctrl+Enter.\n; So, the three basic types of λ expressions are variables:\nx\n; Applications:\nx y\n; And abstractions (also known as functions):\nλx.x\n; If the left side of an application is an abstraction, then a reduction takes place:\n(λx.x) y\n; That little abstraction at the left is the identity, a very simple function that\n; just reduces to whatever you apply to it. We can give it a name (in ALLCAPS) like so:\nID = λx.x\n; And then just refer it by that name:\nID a\n; You can apply any kind of λ expression to an abstraction, like another function:\nID λb.c\n; Or an application:\nID (x y)\n; Or even the identity function itself:\nID ID\n; That means you can apply identity to itself as many times as you want and it\'ll still\n; be identity:\nID ID ID ID ID\n; Notice that applications are left-associative, so the line above is equivalent to:\n((((ID ID) ID) ID) ID)\n\n; TODO: explain applicative and normal order...'
  }, {
    name: 'Booleans',
    code: '; Church booleans\n\n; The booleans and their operations can be encoded as the following λ-terms:\nTRUE = λt.λf.t\nFALSE = λt.λf.f\nNOT = λp.p FALSE TRUE\nAND = λp.λq.p q p\nOR = λp.λq.p p q\nIF = λp.p\n\n; Print truth tables for NOT, AND and OR:\nNOT TRUE\nNOT FALSE\nAND FALSE FALSE\nAND FALSE TRUE\nAND TRUE FALSE\nAND TRUE TRUE\nOR FALSE FALSE\nOR FALSE TRUE\nOR TRUE FALSE\nOR TRUE TRUE\n\n; Terms can be nested as much as we want:\nIF (NOT NOT FALSE) (OR FALSE (IF TRUE TRUE FALSE)) FALSE\n\n; There\'s nothing special about "operators", we can treat them as any other value:\n(IF FALSE OR AND) TRUE FALSE'
  }, {
    name: 'Numbers',
    code: '; Church numerals\n\n; The first few numbers are:\nZERO = λs.λz.z\nONE = λs.λz.s z\nTWO = λs.λz.s (s z)\nTHREE = λs.λz.s (s (s z))\n; In general, any natural number n can be encoded as:\n; N = λs.λz.s (s (s ... (s (s z)) ... ))\n; with s applied n times.\n\n; When we get tired of writing numbers like that, we can define a successor function:\nSUCC = λn.λs.λz.s (n s z)\nSUCC THREE\n\n; We can think of Church numerals as functions that apply a given function s to a\n; given value z a number of times. Zero will apply it 0 times (i.e. it\'ll give\n; us z back untouched) and three will call it 3 times.\n; So, we can represent the addition of numbers m and n as first applying n times s to z,\n; and then applying m times s to that:\nADD = λm.λn.λs.λz.m s (n s z)\nADD TWO THREE\n; ...or, more succinctly, as applying n times the successor function on m (or vice versa):\nADD\' = λm.λn.n SUCC m\nADD\' TWO THREE\n; Conversely, we could define the successor function as adding one:\nSUCC\' = ADD ONE\nSUCC\' THREE\n\n; Multiplication of m by n is applying m times a function that applies s n times:\nMULT = λm.λn.λs.m (n s)\nMULT THREE THREE\n; ...or applying m times the addition of n to zero:\nMULT\' = λm.λn.m (ADD n) ZERO\nMULT\' THREE THREE\n\n; Exponentiation n^m has a simple encoding: applying the base m to the exponent n,\n; which can be understood as applying m successively n times:\nEXP = λm.λn.n m\nEXP TWO THREE\n; ...or, alternatively, applying m times the multiplication by n to one:\nEXP\' = λm.λn.m (MULT n) ONE\nEXP\' TWO THREE\n\n; The encoding for the predecessor function is quite complex.\n; The Wikipedia article on Church encoding has a good explanation for this term ;-)\nPRED = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)\nPRED THREE\n\n; But given the predecessor function is then easy to define the subtraction:\nSUB = λm.λn.n PRED m\nSUB THREE TWO\n\n; To build some predicate functions, we\'ll use some known boolean terms:\nTRUE = λt.λf.t\nFALSE = λt.λf.f\nAND = λp.λq.p q p\n\n; To know if a number n is zero we can pass true as the base value and a function\n; that always returns false:\nISZERO = λn.n (λx.FALSE) TRUE\nISZERO ZERO\nISZERO TWO\n\n; Given the "= 0" predicate, numeric equality between m and n can be defined as\n; m - n = 0 and n - m = 0\nEQ = λm.λn.AND (ISZERO (SUB m n)) (ISZERO (SUB n m))\n\n; Throw everyting into the mix:\nEQ (EXP TWO THREE) (PRED (EXP THREE TWO))'
  }, {
    name: 'Factorial',
    code: '; Recursion\n\n; Borrow some terms from previous examples:\nTRUE = λt.λf.t\nFALSE = λt.λf.f\nIF = λp.p\n\nZERO = λs.λz.z\nONE = λs.λz.s z\nTWO = λs.λz.s (s z)\nTHREE = λs.λz.s (s (s z))\nFOUR = λs.λz.s (s (s (s z)))\n\nPRED = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)\nMULT = λm.λn.λs.m (n s)\nISZERO = λn.n (λx.FALSE) TRUE\n\n; We\'d like to be able to define a factorial function as:\n; FACT = λn.IF (ISZERO n) ONE (MULT n (FACT (PRED n)))\n; But we can\'t use a term in its own definition.\n; To achieve recursion, we can instead define a function that will receive itself\n; as a parameter r, and then recur by calling r with itself and n - 1:\nFACT_REC = λr.λn.IF (ISZERO n) ONE (MULT n (r r (PRED n)))\n; The real factorial function would then be:\nFACT = FACT_REC FACT_REC\nFACT FOUR\n\n; Another way to recur is to use a general purpose fixed-point combinator.\n; The almighty Y Combinator:\nY = λf.(λx.f (x x)) (λx.f (x x))\n\n; And then there\'s no need to define a separate function:\nFACT\' = Y λr.λn.IF (ISZERO n) ONE (MULT n (r (PRED n)))\nFACT\' FOUR'
  }
];


},{}],4:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[5,7],$V1=[1,6],$V2=[1,8],$V3=[1,9],$V4=[1,10],$V5=[2,11],$V6=[5,7,11,14,15,16,17];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"program":4,"EOF":5,"line":6,"SEPARATOR":7,"term":8,"macro":9,"=":10,"LAMBDA":11,"var":12,".":13,"(":14,")":15,"MACRO":16,"VAR":17,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"SEPARATOR",10:"=",11:"LAMBDA",13:".",14:"(",15:")",16:"MACRO",17:"VAR"},
productions_: [0,[3,2],[4,0],[4,1],[4,2],[4,3],[6,1],[6,3],[8,4],[8,2],[8,1],[8,1],[8,3],[9,1],[12,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return yy.getProgram(); 
break;
case 6:
 this.$ = yy.parseTermEvaluation($$[$0]); 
break;
case 7:
 this.$ = yy.parseMacroDefinition($$[$0-2], $$[$0]); 
break;
case 8:
 this.$ = yy.parseAbstraction($$[$0-2], $$[$0]); 
break;
case 9:
 this.$ = yy.parseApplication($$[$0-1], $$[$0]); 
break;
case 10:
 this.$ = yy.parseVariable($$[$0]); 
break;
case 11:
 this.$ = yy.parseMacroUsage($$[$0]); 
break;
case 12:
 this.$ = $$[$0-1]; 
break;
case 13: case 14:
 this.$ = yytext; 
break;
}
},
table: [o($V0,[2,2],{3:1,4:2,6:3,8:4,9:5,12:7,11:$V1,14:$V2,16:$V3,17:$V4}),{1:[3]},{5:[1,11],7:[1,12]},o($V0,[2,3]),o($V0,[2,6],{12:7,8:13,9:14,11:$V1,14:$V2,16:$V3,17:$V4}),o([5,7,11,14,16,17],$V5,{10:[1,15]}),{12:16,17:$V4},o($V6,[2,10]),{8:17,9:14,11:$V1,12:7,14:$V2,16:$V3,17:$V4},o([5,7,10,11,14,15,16,17],[2,13]),o([5,7,11,13,14,15,16,17],[2,14]),{1:[2,1]},o($V0,[2,4],{8:4,9:5,12:7,6:18,11:$V1,14:$V2,16:$V3,17:$V4}),o($V6,[2,9],{12:7,8:13,9:14}),o($V6,$V5),{8:19,9:14,11:$V1,12:7,14:$V2,16:$V3,17:$V4},{13:[1,20]},{8:13,9:14,11:$V1,12:7,14:$V2,15:[1,21],16:$V3,17:$V4},o($V0,[2,5]),o($V0,[2,7],{12:7,8:13,9:14,11:$V1,14:$V2,16:$V3,17:$V4}),{8:22,9:14,11:$V1,12:7,14:$V2,16:$V3,17:$V4},o($V6,[2,12]),o([5,7,15],[2,8],{12:7,8:13,9:14,11:$V1,14:$V2,16:$V3,17:$V4})],
defaultActions: {11:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
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
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
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
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
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
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
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
},
rules: [/^(?:\()/,/^(?:\))/,/^(?:\\|λ)/,/^(?:\.)/,/^(?:=)/,/^(?:[a-z][a-z0-9-_]*)/,/^(?:[A-Z][A-Z0-9-_]*'*)/,/^(?:[\n])/,/^(?:[ \t]+)/,/^(?:;.*)/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))

},{"_process":2,"fs":1,"path":1}],5:[function(require,module,exports){
var slice = [].slice;

exports.repeatStr = function(str, n) {
  var res;
  res = '';
  while (n--) {
    res += str;
  }
  return res;
};

exports.extend = function() {
  var i, k, len, obj, src, srcs, v;
  obj = arguments[0], srcs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  for (i = 0, len = srcs.length; i < len; i++) {
    src = srcs[i];
    for (k in src) {
      v = src[k];
      obj[k] = v;
    }
  }
  return obj;
};

exports.timed = function(name, fn) {
  return function() {
    var args, res;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    console.time(name);
    res = fn.apply(null, args);
    console.timeEnd(name);
    return res;
  };
};

exports.compose = function(f, g) {
  return function(x) {
    return f(g(x));
  };
};

exports.identity = function(x) {
  return x;
};


},{}],6:[function(require,module,exports){
var $error, $errorContainer, $examplesMenu, $input, $output, $outputContainer, example, examples, getOptions, hash, i, j, lambda, len, renderArrow, renderArrowByType, renderCollapsedReduction, renderCollapsedReductionForm, renderExpandedReductionForm, renderReductions, renderStepOptions, renderSynonyms, renderTerm, run, timed, updateInputFromHash;

lambda = require('./lambda');

examples = require('./examples');

timed = require('./helpers').timed;

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

renderTerm = function(term, className) {
  if (className == null) {
    className = '';
  }
  return "<span class='term " + className + "'>" + term + "</span>";
};

renderArrow = function(symbol, label) {
  return "<span class=arrow>" + symbol + "<small>" + label + "</small></span>";
};

renderArrowByType = function(type) {
  var label, symbol;
  symbol = type === 'macro' ? '≡' : '→';
  label = (function() {
    switch (type) {
      case 'alpha':
        return 'α';
      case 'beta':
        return 'β';
      default:
        return '';
    }
  })();
  return renderArrow(symbol, label);
};

renderSynonyms = function(synonyms) {
  if (synonyms.length) {
    return "(" + (synonyms.join(', ')) + ")";
  } else {
    return '';
  }
};

getOptions = function() {
  var maxSteps, strategy;
  maxSteps = parseInt(($('input[name=max-steps]')).val() || 0);
  strategy = ($('input:radio[name=strategy]:checked')).val();
  return {
    maxSteps: maxSteps,
    strategy: strategy
  };
};

run = function() {
  var err, error, program, reductions;
  program = $input.val();
  try {
    reductions = lambda.reduceProgram(program, getOptions());
    renderReductions(reductions);
  } catch (error) {
    err = error;
    $error.text(err.message);
  }
  $outputContainer.toggle(err == null);
  return $errorContainer.toggle(err != null);
};

renderReductions = timed('render html', function(reductions) {
  var html;
  html = (reductions.map(renderCollapsedReduction)).join('');
  $output.empty().html(html);
  $output.off();
  $output.on('click', '.reduction', function() {
    var $reduction, reduction;
    $reduction = $(this);
    reduction = reductions[$reduction.index()];
    if (reduction.totalSteps === 0) {
      return;
    }
    if (($reduction.children('.expanded'))[0]) {
      return ($('.collapsed, .expanded', $reduction)).toggle();
    } else {
      $reduction.append(renderExpandedReductionForm(reduction));
      return ($('.collapsed', $reduction)).hide();
    }
  });
  $output.on('mouseenter', '.expanded .step', function() {
    var $step;
    $step = $(this);
    $step.addClass('highlight');
    return $step.prevAll('.step:eq(0)').find('.after').hide();
  });
  return $output.on('mouseleave', '.expanded .step', function() {
    var $step;
    $step = $(this);
    $step.removeClass('highlight');
    return $step.prevAll('.step:eq(0)').find('.after').show();
  });
});

renderCollapsedReduction = function(reduction) {
  return "<div class=reduction>" + (renderCollapsedReductionForm(reduction)) + "</div>";
};

renderCollapsedReductionForm = function(reduction) {
  var arrow, arrowAndFinal, final, initial, synonyms;
  initial = renderTerm(reduction.initial);
  arrowAndFinal = reduction.totalSteps > 0 ? (arrow = renderArrow('→', "(" + reduction.totalSteps + ")"), final = renderTerm(reduction.final), arrow + " " + final) : '';
  synonyms = renderSynonyms(reduction.finalSynonyms);
  return "<div class=collapsed>" + initial + " " + arrowAndFinal + " " + synonyms + "</div>";
};

renderExpandedReductionForm = function(reduction) {
  var after, arrow, before, i, lastStep, step, steps, synonyms;
  steps = (function() {
    var j, ref, results;
    results = [];
    for (i = j = 0, ref = reduction.totalSteps; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      step = reduction.renderStep(i, renderStepOptions);
      before = renderTerm(step.before, 'before');
      after = renderTerm(step.after, 'after');
      arrow = renderArrowByType(step.type);
      lastStep = i === reduction.totalSteps - 1;
      synonyms = lastStep ? renderSynonyms(reduction.finalSynonyms) : '';
      results.push("<span class=step>" + before + "<br>" + arrow + " " + after + " " + synonyms + "</span>");
    }
    return results;
  })();
  return "<div class=expanded>" + (steps.join('')) + "</div>";
};

renderStepOptions = {
  highlightStep: function(str) {
    return "<span class=match>" + str + "</span>";
  },
  highlightFormerTerm: function(str) {
    return "<span class=former-term>" + str + "</span>";
  },
  highlightSubstitutionTerm: function(str) {
    return "<span class=subst-term>" + str + "</span>";
  }
};

$input.val("; Write some λ-expressions here. Use \"\\\" to enter \"λ\" ;)\n(λx.λy.λz.z y x) a b c");

$input.focus();

$examplesMenu = $('.examples.dropdown-menu');

for (i = j = 0, len = examples.length; j < len; i = ++j) {
  example = examples[i];
  hash = (">" + example.code).replace(/\n/g, '%0A');
  $examplesMenu.append("<li><a href='#" + hash + "'>" + i + " - " + example.name + "</a></li>");
}

$examplesMenu.on('click', 'li', function(e) {
  e.preventDefault();
  return $input.val(examples[($(this)).index()].code);
});

($('button.link')).click(function() {
  var code;
  code = $input.val();
  return location.hash = ">" + code;
});

updateInputFromHash = function() {
  var code, codeStart;
  hash = decodeURI(location.hash);
  codeStart = hash.indexOf('>');
  if (codeStart !== -1) {
    code = hash.slice(codeStart + 1);
    return $input.val(code);
  }
};

($(window)).on('hashchange', updateInputFromHash);

updateInputFromHash();


},{"./examples":3,"./helpers":5,"./lambda":7}],7:[function(require,module,exports){
var Abstraction, Application, Macro, Variable, alphaEq, apply, applySubstitution, compose, composeAbs, composeAppL, composeAppR, defaultOptions, expandStep, extend, find, findSynonyms, freeIn, highlight, highlightAbstractionVar, identity, markStep, parse, parseTerm, reduceApplicative, reduceCallByName, reduceCallByValue, reduceFunctions, reduceNormal, reduceTerm, ref, renameForSubstitution, renameVar, repeatStr, replace, substitute, termStr, termTreeStr, timed, varRenameCollides,
  slice = [].slice;

ref = require('./helpers'), repeatStr = ref.repeatStr, extend = ref.extend, timed = ref.timed, compose = ref.compose, identity = ref.identity;

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

parse = timed('parse', function(str) {
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
        throw Error(name + " already defined");
      }
      return macros[name] = Macro(name, term);
    },
    parseMacroUsage: function(name) {
      if (!macros[name]) {
        throw Error(name + " not defined");
      }
      return macros[name];
    },
    parseTermEvaluation: function(term) {
      return terms.push(term);
    },
    getProgram: function() {
      return {
        macros: macros,
        terms: terms
      };
    }
  };
  return parser.parse(str);
});

termStr = function(t, appParens, absParens) {
  var lambda, str;
  if (appParens == null) {
    appParens = false;
  }
  if (absParens == null) {
    absParens = false;
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
        str = lambda + "." + (termStr(t.body));
        if (absParens) {
          return "(" + str + ")";
        } else {
          return str;
        }
        break;
      case Application:
        str = (termStr(t.left, false, true)) + " " + (termStr(t.right, true, absParens));
        if (appParens) {
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

termTreeStr = (function() {
  var indentLines, makeLines;
  makeLines = function(t) {
    switch (t.type) {
      case Variable:
      case Macro:
        return [t.name];
      case Abstraction:
        return ["λ" + t.varName].concat(slice.call(indentLines(makeLines(t.body), '╰─', '  ')));
      case Application:
        return ["@"].concat(slice.call(indentLines(makeLines(t.left), '├─', '│ ')), slice.call(indentLines(makeLines(t.right), '╰─', '  ')));
    }
  };
  indentLines = function(lines, first, next) {
    var j, len, line, n, results;
    results = [];
    for (n = j = 0, len = lines.length; j < len; n = ++j) {
      line = lines[n];
      results.push("" + (n === 0 ? first : next) + line);
    }
    return results;
  };
  return function(t) {
    return (makeLines(t)).join('\n');
  };
})();

highlight = function(t, fn) {
  if (t.highlight) {
    fn = compose(fn, t.highlight);
  }
  return extend({}, t, {
    highlight: fn
  });
};

highlightAbstractionVar = function(t, x, fn) {
  var ht, hx;
  hx = highlight(Variable(x), fn);
  ht = substitute(t, x, hx);
  return extend(Abstraction(x, ht), {
    highlightVar: fn
  });
};

composeAbs = function(fn, x) {
  return function(b) {
    return fn(Abstraction(x, b));
  };
};

composeAppL = function(fn, l) {
  return function(r) {
    return fn(Application(l, r));
  };
};

composeAppR = function(fn, r) {
  return function(l) {
    return fn(Application(l, r));
  };
};

reduceCallByName = function(t, cb) {
  var l;
  switch (t.type) {
    case Variable:
    case Abstraction:
      return t;
    case Application:
      l = reduceCallByName(t.left, composeAppR(cb, t.right));
      if (l.type === Abstraction) {
        return reduceCallByName(apply(l, t.right, cb), cb);
      } else {
        return Application(l, t.right);
      }
      break;
    case Macro:
      cb(markStep('macro', t, t.term));
      return reduceCallByName(t.term, cb);
  }
};

reduceNormal = function(t, cb) {
  var l, r;
  switch (t.type) {
    case Variable:
      return t;
    case Abstraction:
      return Abstraction(t.varName, reduceNormal(t.body, composeAbs(cb, t.varName)));
    case Application:
      l = reduceCallByName(t.left, composeAppR(cb, t.right));
      if (l.type === Abstraction) {
        return reduceNormal(apply(l, t.right, cb), cb);
      } else {
        l = reduceNormal(l, composeAppR(cb, t.right));
        r = reduceNormal(t.right, composeAppL(cb, l));
        return Application(l, r);
      }
      break;
    case Macro:
      cb(markStep('macro', t, t.term));
      return reduceNormal(t.term, cb);
  }
};

reduceCallByValue = function(t, cb) {
  var l, r;
  switch (t.type) {
    case Variable:
    case Abstraction:
      return t;
    case Application:
      l = reduceCallByValue(t.left, composeAppR(cb, t.right));
      r = reduceCallByValue(t.right, composeAppL(cb, l));
      if (l.type === Abstraction) {
        return reduceCallByValue(apply(l, r, cb), cb);
      } else {
        return Application(l, r);
      }
      break;
    case Macro:
      cb(markStep('macro', t, t.term));
      return reduceCallByName(t.term, cb);
  }
};

reduceApplicative = function(t, cb) {
  var l, r;
  switch (t.type) {
    case Variable:
      return t;
    case Abstraction:
      return Abstraction(t.varName, reduceApplicative(t.body, composeAbs(cb, t.varName)));
    case Application:
      l = reduceCallByValue(t.left, composeAppR(cb, t.right));
      if (l.type === Abstraction) {
        r = reduceCallByValue(t.right, composeAppL(cb, l));
        return reduceApplicative(apply(l, r, cb), cb);
      } else {
        l = reduceApplicative(l, composeAppR(cb, t.right));
        r = reduceApplicative(t.right, composeAppL(cb, l));
        return Application(l, r);
      }
      break;
    case Macro:
      cb(markStep('macro', t, t.term));
      return reduceApplicative(t.term, cb);
  }
};

apply = function(abs, subst, cb) {
  var applied, renameCb, renamed, renamedBody;
  renameCb = composeAbs(composeAppR(cb, subst), abs.varName);
  renamedBody = renameForSubstitution(abs.body, abs.varName, subst, renameCb);
  renamed = Application(Abstraction(abs.varName, renamedBody), subst);
  applied = applySubstitution(renamedBody, abs.varName, subst);
  cb(markStep('beta', renamed, applied));
  return applied;
};

substitute = function(t, x, s) {
  var newVarName, renamedBody;
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
      if ((freeIn(t.varName, s)) && (freeIn(x, t.body))) {
        newVarName = renameVar(t.varName, t.body, s);
        renamedBody = applySubstitution(t.body, t.varName, Variable(newVarName));
        return Abstraction(newVarName, substitute(renamedBody, x, s));
      } else {
        return Abstraction(t.varName, substitute(t.body, x, s));
      }
      break;
    case Application:
      return Application(substitute(t.left, x, s), substitute(t.right, x, s));
    case Macro:
      if (freeIn(x, t.term)) {
        throw Error(("Logical error: " + x + " is free in " + t.name + ".") + "Macros cannot have free variables");
      }
      return t;
  }
};

renameForSubstitution = function(t, x, s, cb) {
  var l, newVarName, r, renamedBody;
  switch (t.type) {
    case Variable:
    case Macro:
      return t;
    case Abstraction:
      if (t.varName === x) {
        return t;
      }
      if ((freeIn(t.varName, s)) && (freeIn(x, t.body))) {
        newVarName = renameVar(t.varName, t.body, s);
        renamedBody = applySubstitution(t.body, t.varName, Variable(newVarName));
        cb(markStep('alpha', t, (t = Abstraction(newVarName, renamedBody))));
      }
      return Abstraction(t.varName, renameForSubstitution(t.body, x, s, composeAbs(cb, t.varName)));
    case Application:
      l = renameForSubstitution(t.left, x, s, composeAppR(cb, t.right));
      r = renameForSubstitution(t.right, x, s, composeAppL(cb, l));
      return Application(l, r);
  }
};

applySubstitution = function(t, x, s) {
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
      } else {
        return Abstraction(t.varName, applySubstitution(t.body, x, s));
      }
      break;
    case Application:
      return Application(applySubstitution(t.left, x, s), applySubstitution(t.right, x, s));
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

markStep = function(type, before, after) {
  return extend({}, after, {
    step: {
      type: type,
      before: before
    }
  });
};

find = function(t, fn) {
  if (fn(t)) {
    return t;
  }
  switch (t.type) {
    case Variable:
    case Macro:
      return null;
    case Abstraction:
      return find(t.body, fn);
    case Application:
      return (find(t.left, fn)) || (find(t.right, fn));
  }
};

replace = function(t, from, to) {
  var body, l, r;
  if (t === from) {
    return to;
  }
  switch (t.type) {
    case Variable:
    case Macro:
      return t;
    case Abstraction:
      body = replace(t.body, from, to);
      if (t.body === body) {
        return t;
      } else {
        return Abstraction(t.varName, body);
      }
      break;
    case Application:
      l = replace(t.left, from, to);
      if (t.left === l) {
        r = replace(t.right, from, to);
        if (t.right === r) {
          return t;
        } else {
          return Application(l, r);
        }
      } else {
        return Application(l, t.right);
      }
  }
};

expandStep = function(t, options) {
  var after, before, ha, highlightFormer, highlightStep, highlightSubst, hs, stepTerm, type;
  if (options == null) {
    options = {};
  }
  stepTerm = find(t, function(subT) {
    return subT.step;
  });
  type = stepTerm.step.type;
  before = stepTerm.step.before;
  after = stepTerm;
  highlightFormer = options.highlightFormerTerm || identity;
  highlightSubst = options.highlightSubstitutionTerm || identity;
  highlightStep = options.highlightStep || identity;
  switch (type) {
    case 'alpha':
      before = highlightAbstractionVar(before.body, before.varName, highlightFormer);
      after = highlightAbstractionVar(after.body, after.varName, highlightSubst);
      break;
    case 'beta':
      hs = highlight(before.right, highlightSubst);
      ha = highlightAbstractionVar(before.left.body, before.left.varName, highlightFormer);
      before = Application(ha, hs);
      after = substitute(before.left.body, before.left.varName, hs);
      break;
    case 'macro':
      before = highlight(before, highlightFormer);
      after = highlight(after, highlightSubst);
  }
  before = highlight(before, highlightStep);
  after = highlight(after, highlightStep);
  before = termStr(replace(t, stepTerm, before));
  after = termStr(replace(t, stepTerm, after));
  return {
    type: type,
    before: before,
    after: after
  };
};

alphaEq = function(t1, t2) {
  if (t1.type === Macro) {
    return alphaEq(t1.term, t2);
  }
  if (t2.type === Macro) {
    return alphaEq(t1, t2.term);
  }
  if (t1.type !== t2.type) {
    return false;
  }
  switch (t1.type) {
    case Variable:
      return t1.name === t2.name;
    case Abstraction:
      if (t1.varName === t2.varName) {
        return alphaEq(t1.body, t2.body);
      } else {
        return alphaEq(t1.body, substitute(t2.body, t2.varName, Variable(t1.varName)));
      }
      break;
    case Application:
      return (alphaEq(t1.left, t2.left)) && (alphaEq(t1.right, t2.right));
  }
};

findSynonyms = function(term, macros) {
  var macro, name, results;
  results = [];
  for (name in macros) {
    macro = macros[name];
    if (alphaEq(term, macro)) {
      results.push(name);
    }
  }
  return results;
};

defaultOptions = {
  maxSteps: 100,
  strategy: 'normal'
};

reduceFunctions = {
  normal: reduceNormal,
  applicative: reduceApplicative,
  cbn: reduceCallByName,
  cbv: reduceCallByValue
};

reduceTerm = timed('reduce', function(term, macros, options) {
  var e, enough, error, final, finalSynonyms, initial, maxSteps, reduce, ref1, renderStep, steps, strategy, terminates, totalSteps;
  ref1 = extend({}, defaultOptions, options), maxSteps = ref1.maxSteps, strategy = ref1.strategy;
  reduce = reduceFunctions[strategy];
  enough = {};
  steps = [];
  try {
    reduce(term, function(t) {
      if (steps.length >= maxSteps) {
        throw enough;
      }
      return steps.push(t);
    });
    terminates = true;
  } catch (error) {
    e = error;
    if (e !== enough) {
      throw e;
    }
    terminates = false;
  }
  initial = term;
  final = steps[steps.length - 1] || term;
  finalSynonyms = findSynonyms(final, macros);
  initial = termStr(initial);
  final = termStr(final);
  totalSteps = steps.length;
  renderStep = function(i, options) {
    return expandStep(steps[i], options);
  };
  return {
    initial: initial,
    final: final,
    finalSynonyms: finalSynonyms,
    terminates: terminates,
    totalSteps: totalSteps,
    renderStep: renderStep
  };
});

parseTerm = function(str) {
  var terms;
  terms = parse(str).terms;
  if (terms.length !== 1) {
    throw Error("program has " + terms.length + " terms");
  }
  return terms[0];
};

exports.termTreeStr = function(str) {
  return termTreeStr(parseTerm(str));
};

exports.parseTerm = function(str) {
  return termStr(parseTerm(str));
};

exports.reduceTerm = function(str, options) {
  if (options == null) {
    options = {};
  }
  return reduceTerm(parseTerm(str), {}, options);
};

exports.reduceProgram = function(expr, options) {
  var j, len, macros, ref1, results, term, terms;
  if (options == null) {
    options = {};
  }
  ref1 = parse(expr), terms = ref1.terms, macros = ref1.macros;
  results = [];
  for (j = 0, len = terms.length; j < len; j++) {
    term = terms[j];
    results.push(reduceTerm(term, macros, options));
  }
  return results;
};


},{"./grammar":4,"./helpers":5}]},{},[6])
//# sourceMappingURL=index.js.map
