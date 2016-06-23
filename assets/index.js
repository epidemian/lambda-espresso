(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var Var=function(name){return{type:Var,name:name}};var Fun=function(param,body){return{type:Fun,param:param,body:body}};var App=function(left,right){return{type:App,left:left,right:right}};var Def=function(name,term){return{type:Def,name:name,term:term}};module.exports={Var:Var,Fun:Fun,App:App,Def:Def}},{}],2:[function(require,module,exports){var ref=require("./helpers");var dedent=ref.dedent;module.exports=[{name:"Basics",code:dedent("\n    ; This example is not intend to be a tutorial nor an introduction to λ Calculus.\n    ; You should check http://en.wikipedia.org/wiki/Lambda_calculus for that :)\n    ; As you can see, these are comments. You can run this example clicking the Run\n    ; button below or pressing Ctrl+Enter.\n    ; So, the three basic types of λ expressions are:\n    ; Variables:\n    x\n    ; Applications:\n    x y\n    ; And lambda abstractions (also known as functions):\n    λx.x\n    ; If the left-side of an application is an abstraction, then a reduction takes place:\n    (λx.x) y\n    ; That little abstraction at the left is the identity, a very simple function that\n    ; just reduces to whatever you apply to it. We can give it a name like so:\n    id = λx.x\n    ; And then just refer it by that name:\n    id a\n    ; You can apply any kind of λ expression to an abstraction, like another function:\n    id λb.c\n    ; Or an application:\n    id (x y)\n    ; Or even the identity function itself:\n    id id\n    ; That means you can apply identity to itself as many times as you want and it'll still\n    ; be identity:\n    id id id id id\n    ; Notice that applications are left-associative, so the line above is equivalent to:\n    ((((id id) id) id) id)\n\n    ; TODO: explain applicative and normal order...\n  ")},{name:"Booleans",code:dedent('\n    ; Church booleans\n\n    ; The booleans and their operations can be encoded as the following λ-terms:\n    true = λt.λf.t\n    false = λt.λf.f\n    not = λp.p false true\n    and = λp.λq.p q p\n    or = λp.λq.p p q\n    if = λp.p\n\n    ; Print truth tables for not, and and or:\n    not true\n    not false\n    and false false\n    and false true\n    and true false\n    and true true\n    or false false\n    or false true\n    or true false\n    or true true\n\n    ; Terms can be nested as much as we want:\n    if (not (not true)) (or false (if true true false)) false\n\n    ; There\'s nothing special about "operators", we can treat them as any other value:\n    (if false or and) true false\n  ')},{name:"Numbers",code:dedent("\n    ; Church numerals\n\n    ; The first few numbers are:\n    zero = λs.λz.z\n    one = λs.λz.s z\n    two = λs.λz.s (s z)\n    three = λs.λz.s (s (s z))\n    ; In general, any natural number n can be encoded as:\n    ; N = λs.λz.s (s (s ... (s (s z)) ... ))\n    ; with s applied n times.\n\n    ; When we get tired of writing numbers like that, we can define a successor function:\n    succ = λn.λs.λz.s (n s z)\n    succ three\n\n    ; We can think of Church numerals as functions that apply a given function s to a\n    ; given value z a number of times. Zero will apply it 0 times (i.e. it'll give\n    ; us z back untouched) and three will call it 3 times.\n    ; So, we can represent the addition of numbers m and n as first applying n times s to z,\n    ; and then applying m times s to that:\n    add = λm.λn.λs.λz.m s (n s z)\n    add two three\n    ; ...or, more succinctly, as applying n times the successor function on m (or vice versa):\n    add' = λm.λn.n succ m\n    add' two three\n    ; Conversely, we could define the successor function as adding one:\n    succ' = add one\n    succ' three\n\n    ; Multiplication of m by n is applying m times a function that applies s n times:\n    mult = λm.λn.λs.m (n s)\n    mult three three\n    ; ...or applying m times the addition of n to zero:\n    mult' = λm.λn.m (add n) zero\n    mult' three three\n\n    ; Exponentiation n^m has a simple encoding: applying the base m to the exponent n,\n    ; which can be understood as applying m successively n times:\n    exp = λm.λn.n m\n    exp two three\n    ; ...or, alternatively, applying m times the multiplication by n to one:\n    exp' = λm.λn.m (mult n) one\n    exp' two three\n\n    ; The encoding for the predecessor function is quite complex.\n    ; The Wikipedia article on Church encoding has a good explanation for this term ;-)\n    pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)\n    pred three\n\n    ; But given the predecessor function is then easy to define the subtraction:\n    sub = λm.λn.n pred m\n    sub three two\n\n    ; To build some predicate functions, we'll use some known boolean terms (see \n    ; Booleans example for more info):\n    true = λt.λf.t\n    false = λt.λf.f\n    and = λp.λq.p q p\n\n    ; To know if a number n is zero we can pass true as the base value and a function\n    ; that always returns false (note that the \"?\" is no special syntax; it's just \n    ; part of the name of the predicate):\n    zero? = λn.n (λx.false) true\n    zero? zero\n    zero? two\n\n    ; To know if a number is less or equal to another number, we can subtract them and\n    ; see if the result is zero:\n    leq = λm.λn.zero? (sub m n)\n\n    ; And given that predicate, numeric equality between m and n can be defined as:\n    eq = λm.λn.and (leq m n) (leq n m)\n\n    ; Throwing everything into the mix, we can prove that 2³ = 3² - 1:\n    eq (exp two three) (pred (exp three two))\n  ")},{name:"Factorial",code:dedent("\n    ; Factorial function and recursion\n\n    ; Note: for this example we'll use boolean and numeric terms from previous \n    ; examples (see below). \n    ; Also not that these factorial definitions won't work with applicative order ;)\n\n    ; We'd like to be able to define a factorial function as:\n    ; fact = λn.if (zero? n) one (mult n (fact (pred n)))\n    ; But we can't use a term in its own definition.\n    ; To achieve recursion, we can instead define a function that will receive itself\n    ; as a parameter r, and then recur by calling r with itself and n - 1:\n    fact-rec = λr.λn.if (zero? n) one (mult n (r r (pred n)))\n    ; The real factorial function would then be:\n    fact = fact-rec fact-rec\n    fact four\n\n    ; Another way to recur is to use a general purpose fixed-point combinator.\n    ; The almighty Y Combinator:\n    Y = λf.(λx.f (x x)) (λx.f (x x))\n    ; And then there's no need to define a separate function:\n    fact' = Y λr.λn.if (zero? n) one (mult n (r (pred n)))\n    fact' four\n\n    ; Borrow some terms from previous examples:\n    true = λt.λf.t\n    false = λt.λf.f\n    if = λp.p\n    zero = λs.λz.z\n    one = λs.λz.s z\n    two = λs.λz.s (s z)\n    three = λs.λz.s (s (s z))\n    four = λs.λz.s (s (s (s z)))\n    pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)\n    mult = λm.λn.λs.m (n s)\n    zero? = λn.n (λx.false) true\n  ")},{name:"Extras",code:dedent('\n    ; Syntactic Trivia and Miscellaneous\n  \n    ; Identifiers can contain basically any character (except the few ones reserved for \n    ; syntax: "λ", ".", "=", "(" and ")").\n    ; This means you can write some pretty code-looking lambda terms!\n    0 = λs.λz.z\n    1 = λs.λz.s z\n    2 = λs.λz.s (s z)\n    + = λm.λn.λs.λz.m s (n s z)\n    * = λm.λn.λs.m (n s)\n    (+ (* 2 1) 0)\n    ; Reinventing (a part of) Lisp is always fun...\n\n    ; You can even use emojis as identifiers! But make sure to use this power responsibly.\n    (λ🐴.❓) 🍎\n\n    ; Although line breaks usually act as separators between terms/definitions, \n    ; you can use parentheses to split a complex term into multiple lines:\n    fib = Y λf.λn.(\n      if (≤ n 1)\n         n\n         (+ (f (- n 1))\n            (f (- n 2))))\n    fib 0\n    fib 1\n    fib 2\n    fib 7\n\n    ; The rest of the definitions to make the above code work. Not much to see here...\n    Y = λf.(λx.f (x x)) (λx.f (x x))\n    - = λm.λn.n pred m\n    ≤ = λm.λn.zero? (- m n)\n    pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)\n    zero? = λn.n (λx.false) true\n    true = λt.λf.t\n    false = λt.λf.f\n    if = λp.p\n    7 = λs.λz.s (s (s (s (s (s (s z))))))\n    13 = λs.λz.s (s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))\n    ❓ = λ💩.💩 💩 💩\n  ')}]},{"./helpers":4}],3:[function(require,module,exports){var grammar=function(){var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[5,7],$V1=[1,6],$V2=[1,7],$V3=[1,8],$V4=[2,10],$V5=[5,7,11,13,14,15];var parser={trace:function trace(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,line:6,SEPARATOR:7,term:8,ident:9,"=":10,LAMBDA:11,".":12,"(":13,")":14,IDENT:15,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",7:"SEPARATOR",10:"=",11:"LAMBDA",12:".",13:"(",14:")",15:"IDENT"},productions_:[0,[3,2],[4,0],[4,1],[4,2],[4,3],[6,1],[6,3],[8,4],[8,2],[8,1],[8,3],[9,1]],performAction:function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$){var $0=$$.length-1;switch(yystate){case 1:break;case 6:this.$=yy.parseTopLevelTerm($$[$0]);break;case 7:this.$=yy.parseDefinition($$[$0-2],$$[$0]);break;case 8:this.$=yy.parseFunction($$[$0-2],$$[$0]);break;case 9:this.$=yy.parseApplication($$[$0-1],$$[$0]);break;case 10:this.$=yy.parseIdentifier($$[$0]);break;case 11:this.$=$$[$0-1];break;case 12:this.$=yytext;break}},table:[o($V0,[2,2],{3:1,4:2,6:3,8:4,9:5,11:$V1,13:$V2,15:$V3}),{1:[3]},{5:[1,9],7:[1,10]},o($V0,[2,3]),o($V0,[2,6],{8:11,9:12,11:$V1,13:$V2,15:$V3}),o([5,7,11,13,15],$V4,{10:[1,13]}),{9:14,15:$V3},{8:15,9:12,11:$V1,13:$V2,15:$V3},o([5,7,10,11,12,13,14,15],[2,12]),{1:[2,1]},o($V0,[2,4],{8:4,9:5,6:16,11:$V1,13:$V2,15:$V3}),o($V5,[2,9],{8:11,9:12}),o($V5,$V4),{8:17,9:12,11:$V1,13:$V2,15:$V3},{12:[1,18]},{8:11,9:12,11:$V1,13:$V2,14:[1,19],15:$V3},o($V0,[2,5]),o($V0,[2,7],{8:11,9:12,11:$V1,13:$V2,15:$V3}),{8:20,9:12,11:$V1,13:$V2,15:$V3},o($V5,[2,11]),o([5,7,14],[2,8],{8:11,9:12,11:$V1,13:$V2,15:$V3})],defaultActions:{9:[2,1]},parseError:function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{function _parseError(msg,hash){this.message=msg;this.hash=hash}_parseError.prototype=Error;throw new _parseError(str,hash)}},parse:function parse(input){var this$1=this;var self=this,stack=[0],tstack=[],vstack=[null],lstack=[],table=this.table,yytext="",yylineno=0,yyleng=0,recovering=0,TERROR=2,EOF=1;var args=lstack.slice.call(arguments,1);var lexer=Object.create(this.lexer);var sharedState={yy:{}};for(var k in this.yy){if(Object.prototype.hasOwnProperty.call(this$1.yy,k)){sharedState.yy[k]=this$1.yy[k]}}lexer.setInput(input,sharedState.yy);sharedState.yy.lexer=lexer;sharedState.yy.parser=this;if(typeof lexer.yylloc=="undefined"){lexer.yylloc={}}var yyloc=lexer.yylloc;lstack.push(yyloc);var ranges=lexer.options&&lexer.options.ranges;if(typeof sharedState.yy.parseError==="function"){this.parseError=sharedState.yy.parseError}else{this.parseError=Object.getPrototypeOf(this).parseError}function popStack(n){stack.length=stack.length-2*n;vstack.length=vstack.length-n;lstack.length=lstack.length-n}_token_stack:var lex=function(){var token;token=lexer.lex()||EOF;if(typeof token!=="number"){token=self.symbols_[token]||token}return token};var symbol,preErrorSymbol,state,action,a,r,yyval={},p,len,newState,expected;while(true){state=stack[stack.length-1];if(this$1.defaultActions[state]){action=this$1.defaultActions[state]}else{if(symbol===null||typeof symbol=="undefined"){symbol=lex()}action=table[state]&&table[state][symbol]}if(typeof action==="undefined"||!action.length||!action[0]){var errStr="";expected=[];for(p in table[state]){if(this$1.terminals_[p]&&p>TERROR){expected.push("'"+this$1.terminals_[p]+"'")}}if(lexer.showPosition){errStr="Parse error on line "+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(", ")+", got '"+(this$1.terminals_[symbol]||symbol)+"'"}else{errStr="Parse error on line "+(yylineno+1)+": Unexpected "+(symbol==EOF?"end of input":"'"+(this$1.terminals_[symbol]||symbol)+"'")}this$1.parseError(errStr,{text:lexer.match,token:this$1.terminals_[symbol]||symbol,line:lexer.yylineno,loc:yyloc,expected:expected})}if(action[0]instanceof Array&&action.length>1){throw new Error("Parse Error: multiple actions possible at state: "+state+", token: "+symbol)}switch(action[0]){case 1:stack.push(symbol);vstack.push(lexer.yytext);lstack.push(lexer.yylloc);stack.push(action[1]);symbol=null;if(!preErrorSymbol){yyleng=lexer.yyleng;yytext=lexer.yytext;yylineno=lexer.yylineno;yyloc=lexer.yylloc;if(recovering>0){recovering--}}else{symbol=preErrorSymbol;preErrorSymbol=null}break;case 2:len=this$1.productions_[action[1]][1];yyval.$=vstack[vstack.length-len];yyval._$={first_line:lstack[lstack.length-(len||1)].first_line,last_line:lstack[lstack.length-1].last_line,first_column:lstack[lstack.length-(len||1)].first_column,last_column:lstack[lstack.length-1].last_column};if(ranges){yyval._$.range=[lstack[lstack.length-(len||1)].range[0],lstack[lstack.length-1].range[1]]}r=this$1.performAction.apply(yyval,[yytext,yyleng,yylineno,sharedState.yy,action[1],vstack,lstack].concat(args));if(typeof r!=="undefined"){return r}if(len){stack=stack.slice(0,-1*len*2);vstack=vstack.slice(0,-1*len);lstack=lstack.slice(0,-1*len)}stack.push(this$1.productions_[action[1]][0]);vstack.push(yyval.$);lstack.push(yyval._$);newState=table[stack[stack.length-2]][stack[stack.length-1]];stack.push(newState);break;case 3:return true}}return true}};var openParens=0;var lexer=function(){var lexer={EOF:1,parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},setInput:function(input,yy){this.yy=yy||this.yy||{};this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},input:function(){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},unput:function(ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},more:function(){this._more=true;return this},reject:function(){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},less:function(n){this.unput(this.match.slice(n))},pastInput:function(){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},test_match:function(match,indexed_rule){var this$1=this;var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this$1[k]=backup[k]}return false}return false},next:function(){var this$1=this;if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this$1._input.match(this$1.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this$1.options.backtrack_lexer){token=this$1.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this$1._backtrack){match=false;continue}else{return false}}else if(!this$1.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},begin:function begin(condition){this.conditionStack.push(condition)},popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},_currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},pushState:function pushState(condition){this.begin(condition)},stateStackSize:function stateStackSize(){return this.conditionStack.length},options:{},performAction:function anonymous(yy,yy_,$avoiding_name_collisions,YY_START){var YYSTATE=YY_START;switch($avoiding_name_collisions){case 0:openParens++;return 13;break;case 1:openParens--;return 14;break;case 2:return 11;break;case 3:return 12;break;case 4:return 10;break;case 5:if(openParens<=0)return 7;break;case 6:break;case 7:break;case 8:return 15;break;case 9:return 5;break}},rules:[/^(?:\()/,/^(?:\))/,/^(?:\\|λ)/,/^(?:\.)/,/^(?:=)/,/^(?:\n)/,/^(?:[^\S\n]+)/,/^(?:;.*)/,/^(?:[^\s\(\)\\λ\.=]+)/,/^(?:$)/],conditions:{INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9],inclusive:true}}};return lexer}();parser.lexer=lexer;function Parser(){this.yy={}}Parser.prototype=parser;parser.Parser=Parser;return new Parser}();if(typeof require!=="undefined"&&typeof exports!=="undefined"){exports.parser=grammar;exports.Parser=grammar.Parser;exports.parse=function(){return grammar.parse.apply(grammar,arguments)};exports.main=function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};if(typeof module!=="undefined"&&require.main===module){exports.main(process.argv.slice(1))}}},{fs:undefined,path:undefined}],4:[function(require,module,exports){exports.extend=Object.assign||function(obj){var srcs=[],len=arguments.length-1;while(len-- >0)srcs[len]=arguments[len+1];srcs.forEach(function(src){for(var k in src)obj[k]=src[k]});return obj};var logTimings=false;exports.timed=function(name,fn){return function(){var args=[],len=arguments.length;while(len--)args[len]=arguments[len];logTimings&&console.time(name);var res=fn.apply(void 0,args);logTimings&&console.timeEnd(name);return res}};exports.enableLogTimings=function(){logTimings=true};exports.disableLogTimings=function(){logTimings=false};exports.compose=function(f,g){return function(x){return f(g(x))}};exports.identity=function(x){return x};exports.dedent=function(str){var match=str.match(/^[ \t]*(?=\S)/gm);if(!match)return str;var indent=Math.min.apply(Math,match.map(function(x){return x.length}));var re=new RegExp("^[ \\t]{"+indent+"}","gm");var unindented=indent>0?str.replace(re,""):str;return unindented.trim()};exports.collapseWhitespace=function(str){return str.replace(/\s+/gm," ")}},{}],5:[function(require,module,exports){var ref=require("./lambda");var reduceProgram=ref.reduceProgram;var examples=require("./examples");var ref$1=require("./helpers");var timed=ref$1.timed;var enableLogTimings=ref$1.enableLogTimings;var dedent=ref$1.dedent;enableLogTimings();var $=document.querySelector.bind(document);Node.prototype.on=Node.prototype.addEventListener;Node.prototype.delegate=function(eventType,selector,handler){this.on(eventType,function(event){var element=event.target;while(element!==this){if(element.matches(selector)){handler.call(element,event);break}element=element.parentNode}})};Node.prototype.once=function(eventType,handler){var onceListener=function(event){handler.call(this,event);this.removeEventListener(eventType,onceListener)};this.on(eventType,onceListener)};Node.prototype.index=function(){return Array.prototype.indexOf.call(this.parentNode.childNodes,this)};var input=$(".input");var output=$(".output");document.on("keyup",function(e){if(e.keyCode===13&&e.ctrlKey)run()});input.on("keyup",function(){var code=input.value;code=code.replace(/\\/g,"λ");var start=input.selectionStart;var end=input.selectionEnd;input.value=code;input.selectionStart=start;input.selectionEnd=end});$(".run").on("click",function(_){return run()});var renderTerm=function(term,className){if(className===void 0)className="";return'<span class="term '+className+'">'+term+"</span>"};var renderArrow=function(symbol,label){return"<span class=arrow>"+symbol+"<small>"+label+"</small></span>"};var renderArrowByType=function(type){var symbol=type==="def"?"≡":"→";var label=arrowSymbols[type]||"";return renderArrow(symbol,label)};var arrowSymbols={alpha:"α",beta:"β"};var renderSynonyms=function(synonyms){return synonyms.length?"<span class=synonyms>("+synonyms.join(", ")+")</span>":""};var getOptions=function(){var maxSteps=parseInt($("input[name=max-steps]").value||0);var strategy=$("input[name=strategy]:checked").value;return{maxSteps:maxSteps,strategy:strategy}};var reductions=null;var run=function(){var code=input.value;try{reductions=reduceProgram(code,getOptions());renderReductions()}catch(err){output.textContent=err.message;output.classList.add("error")}};var renderReductions=timed("render html",function(){var html=reductions.map(renderCollapsedReduction).join("");output.innerHTML=html;output.classList.remove("error")});output.delegate("click",".reduction",function(){var reduction=reductions[this.index()];if(reduction.totalSteps===0)return;var expanded=this.querySelector(".expanded");var collapsed=this.querySelector(".collapsed");if(expanded){expanded.classList.toggle("hidden");collapsed.classList.toggle("hidden")}else{collapsed.classList.add("hidden");this.innerHTML+=renderExpandedReductionForm(reduction)}});output.delegate("mouseover",".expanded .step",function(){this.classList.add("highlight");var prev=this.previousElementSibling;prev&&prev.querySelector(".after").classList.add("hidden")});output.delegate("mouseout",".expanded .step",function(){this.classList.remove("highlight");var prev=this.previousElementSibling;prev&&prev.querySelector(".after").classList.remove("hidden")});var renderCollapsedReduction=function(reduction){return"<div class=reduction>"+renderCollapsedReductionForm(reduction)+"</div>"};var renderCollapsedReductionForm=function(reduction){var initial=renderTerm(reduction.initial);var arrow="";var final="";if(reduction.totalSteps>0){arrow=renderArrow("→","("+reduction.totalSteps+")");final=renderTerm(reduction.final)}var synonyms=renderSynonyms(reduction.finalSynonyms);return"<div class=collapsed>"+initial+" "+arrow+" "+final+" "+synonyms+"</div>"};var renderExpandedReductionForm=function(reduction){var steps=[];for(var i=0;i<reduction.totalSteps;i++){var step=reduction.renderStep(i,renderStepOptions);var before=renderTerm(step.before,"before");var after=renderTerm(step.after,"after");var arrow=renderArrowByType(step.type);var lastStep=i===reduction.totalSteps-1;var synonyms=lastStep?renderSynonyms(reduction.finalSynonyms):"";steps.push("<span class=step>"+before+"<br>"+arrow+" "+after+" "+synonyms+"</span>")}return"<div class=expanded>"+steps.join("")+"</div>"};var renderStepOptions={highlightStep:function(str){return"<span class=match>"+str+"</span>"},highlightFormerTerm:function(str){return"<span class=former-term>"+str+"</span>"},highlightSubstitutionTerm:function(str){return"<span class=subst-term>"+str+"</span>"}};input.value=dedent('\n  ; Write some λ-expressions here and hit Run. Use "\\" to enter "λ" ;)\n  (λx.λy.λz.z y x) a b c\n');input.focus();var examplesMenu=$(".examples-menu");var examplesHtml=examples.map(function(example,i){var hash=(">"+example.code).replace(/\n/g,"%0A");return"<li><a href='//"+hash+"'>"+i+" - "+example.name+"</a></li>"});examplesMenu.innerHTML=examplesHtml.join("");examplesMenu.delegate("click","li",function(e){e.preventDefault();input.value=examples[this.index()].code;input.scrollTop=0});var examplesDropdown=$(".examples-dropdown");examplesDropdown.on("click",function(e){if(examplesDropdown.classList.contains("active"))return;e.stopPropagation();examplesDropdown.classList.add("active");document.once("click",function(){return examplesDropdown.classList.remove("active")})});$("button.link").on("click",function(){var code=input.value;location.hash=">"+code});var updateInputFromHash=function(){var hash=decodeURI(location.hash);var codeStart=hash.indexOf(">");if(codeStart>=0)input.value=hash.slice(codeStart+1)};window.addEventListener("hashchange",updateInputFromHash);updateInputFromHash()},{"./examples":2,"./helpers":4,"./lambda":6}],6:[function(require,module,exports){var ref=require("./helpers");var extend=ref.extend;var timed=ref.timed;var compose=ref.compose;var identity=ref.identity;var ref$1=require("./core");var Var=ref$1.Var;var Fun=ref$1.Fun;var App=ref$1.App;var Def=ref$1.Def;var ref$2=require("./parser");var parse=ref$2.parse;var termStr=function(t,appParens,funParens){if(appParens===void 0)appParens=false;if(funParens===void 0)funParens=false;var h=t.highlight||identity;switch(t.type){case Var:case Def:return h(t.name);case Fun:var lambda="λ"+t.param;if(t.highlightVar)lambda=t.highlightVar(lambda);var funStr=lambda+"."+termStr(t.body);return h(funParens?"("+funStr+")":funStr);case App:var lStr=termStr(t.left,false,true);var rStr=termStr(t.right,true,funParens);var appStr=lStr+" "+rStr;return h(appParens?"("+appStr+")":appStr)}};var highlight=function(t,fn){if(t.highlight)fn=compose(fn,t.highlight);return extend({},t,{highlight:fn})};var highlightFunctionVar=function(t,x,fn){var hx=highlight(Var(x),fn);var ht=substitute(t,x,hx);return extend(Fun(x,ht),{highlightVar:fn})};var composeFun=function(fn,x){return function(b){return fn(Fun(x,b))}};var composeAppL=function(fn,l){return function(r){return fn(App(l,r))}};var composeAppR=function(fn,r){return function(l){return fn(App(l,r))}};var reduceCallByName=function(t,cb){switch(t.type){case Var:case Fun:return t;case App:var l=reduceCallByName(t.left,composeAppR(cb,t.right));if(l.type===Fun)return reduceCallByName(apply(l,t.right,cb),cb);else return App(l,t.right);case Def:cb(markStep("def",t,t.term));return reduceCallByName(t.term,cb)}};var reduceNormal=function(t,cb){switch(t.type){case Var:return t;case Fun:return Fun(t.param,reduceNormal(t.body,composeFun(cb,t.param)));case App:var l=reduceCallByName(t.left,composeAppR(cb,t.right));if(l.type===Fun){return reduceNormal(apply(l,t.right,cb),cb)}else{l=reduceNormal(l,composeAppR(cb,t.right));var r=reduceNormal(t.right,composeAppL(cb,l));return App(l,r)}case Def:cb(markStep("def",t,t.term));return reduceNormal(t.term,cb)}};var reduceCallByValue=function(t,cb){switch(t.type){case Var:case Fun:return t;case App:var l=reduceCallByValue(t.left,composeAppR(cb,t.right));var r=reduceCallByValue(t.right,composeAppL(cb,l));if(l.type===Fun)return reduceCallByValue(apply(l,r,cb),cb);else return App(l,r);case Def:cb(markStep("def",t,t.term));return reduceCallByValue(t.term,cb)}};var reduceApplicative=function(t,cb){switch(t.type){case Var:return t;case Fun:return Fun(t.param,reduceApplicative(t.body,composeFun(cb,t.param)));case App:var l=reduceCallByValue(t.left,composeAppR(cb,t.right));if(l.type===Fun){var r=reduceCallByValue(t.right,composeAppL(cb,l));return reduceApplicative(apply(l,r,cb),cb)}else{l=reduceApplicative(l,composeAppR(cb,t.right));var r$1=reduceApplicative(t.right,composeAppL(cb,l));return App(l,r$1)}case Def:cb(markStep("def",t,t.term));return reduceApplicative(t.term,cb)}};var apply=function(fun,subst,cb){var renameCb=composeFun(composeAppR(cb,subst),fun.param);var renamedBody=renameForSubstitution(fun.body,fun.param,subst,renameCb);var renamed=App(Fun(fun.param,renamedBody),subst);var applied=applySubstitution(renamedBody,fun.param,subst);cb(markStep("beta",renamed,applied));return applied};var substitute=function(t,x,s){switch(t.type){case Var:return t.name===x?s:t;case Fun:if(t.param===x)return t;if(freeIn(t.param,s)&&freeIn(x,t.body)){var newVarName=renameVar(t.param,t.body,s);var renamedBody=applySubstitution(t.body,t.param,Var(newVarName));return Fun(newVarName,substitute(renamedBody,x,s))}else{return Fun(t.param,substitute(t.body,x,s))}case App:return App(substitute(t.left,x,s),substitute(t.right,x,s));case Def:return t}};var renameForSubstitution=function(t,x,s,cb){switch(t.type){case Var:case Def:return t;case Fun:if(t.param===x)return t;if(freeIn(t.param,s)&&freeIn(x,t.body)){var newVarName=renameVar(t.param,t.body,s);var renamedBody=applySubstitution(t.body,t.param,Var(newVarName));cb(markStep("alpha",t,t=Fun(newVarName,renamedBody)))}var body=renameForSubstitution(t.body,x,s,composeFun(cb,t.param));return Fun(t.param,body);case App:var l=renameForSubstitution(t.left,x,s,composeAppR(cb,t.right));var r=renameForSubstitution(t.right,x,s,composeAppL(cb,l));return App(l,r)}};var applySubstitution=function(t,x,s){switch(t.type){case Var:return t.name===x?s:t;case Fun:return t.param===x?t:Fun(t.param,applySubstitution(t.body,x,s));case App:var l=applySubstitution(t.left,x,s);var r=applySubstitution(t.right,x,s);return App(l,r);case Def:return t}};var renameVar=function(oldName,t,s){
var base=oldName.replace(/\d+$/,"");var match=oldName.match(/\d+$/);var n=match?parseInt(match[0]):0;while(true){n++;var newName=base+n;var isValid=!freeIn(newName,s)&&!freeIn(newName,t)&&!varRenameCollides(t,oldName,newName);if(isValid)return newName}};var freeIn=function(x,t){switch(t.type){case Var:return t.name===x;case Fun:return t.param!==x&&freeIn(x,t.body);case App:return freeIn(x,t.left)||freeIn(x,t.right);case Def:return false}};var varRenameCollides=function(t,oldName,newName){switch(t.type){case Var:case Def:return false;case Fun:return t.param===newName&&freeIn(oldName,t)||varRenameCollides(t.body,oldName,newName);case App:return varRenameCollides(t.left,oldName,newName)||varRenameCollides(t.right,oldName,newName)}};var markStep=function(type,before,after){return extend({},after,{step:{type:type,before:before}})};var find=function(t,fn){if(fn(t))return t;switch(t.type){case Var:case Def:return;case Fun:return find(t.body,fn);case App:return find(t.left,fn)||find(t.right,fn)}};var replace=function(t,from,to){if(t===from)return to;switch(t.type){case Var:case Def:return t;case Fun:var body=replace(t.body,from,to);return t.body===body?t:Fun(t.param,body);case App:var l=replace(t.left,from,to);if(t.left!==l)return App(l,t.right);var r=replace(t.right,from,to);return t.right===r?t:App(l,r)}};var expandStep=function(t,options){if(options===void 0)options={};var stepTerm=find(t,function(subT){return subT.step});var type=stepTerm.step.type;var before=stepTerm.step.before;var after=stepTerm;var highlightFormer=options.highlightFormerTerm||identity;var highlightSubst=options.highlightSubstitutionTerm||identity;var highlightStep=options.highlightStep||identity;switch(type){case"alpha":before=highlightFunctionVar(before.body,before.param,highlightFormer);after=highlightFunctionVar(after.body,after.param,highlightSubst);break;case"beta":var fun=before.left;var hs=highlight(before.right,highlightSubst);var ha=highlightFunctionVar(fun.body,fun.param,highlightFormer);before=App(ha,hs);after=substitute(fun.body,fun.param,hs);break;case"def":before=highlight(before,highlightFormer);after=highlight(after,highlightSubst)}before=highlight(before,highlightStep);after=highlight(after,highlightStep);before=termStr(replace(t,stepTerm,before));after=termStr(replace(t,stepTerm,after));return{type:type,before:before,after:after}};var alphaEq=function(t1,t2){if(t1.type===Def)return alphaEq(t1.term,t2);if(t2.type===Def)return alphaEq(t1,t2.term);if(t1.type!==t2.type)return false;switch(t1.type){case Var:return t1.name===t2.name;case Fun:if(t1.param===t2.param)return alphaEq(t1.body,t2.body);else return alphaEq(t1.body,substitute(t2.body,t2.param,Var(t1.param)));case App:return alphaEq(t1.left,t2.left)&&alphaEq(t1.right,t2.right)}};var findSynonyms=function(term,defs){var synonyms=[];for(var name in defs)if(alphaEq(term,defs[name]))synonyms.push(name);return synonyms};var reduceFunctions={normal:reduceNormal,applicative:reduceApplicative,cbn:reduceCallByName,cbv:reduceCallByValue};var reduceTerm=timed("reduce",function(term,defs,ref){if(ref===void 0)ref={};var maxSteps=ref.maxSteps;if(maxSteps===void 0)maxSteps=100;var strategy=ref.strategy;if(strategy===void 0)strategy="normal";var reduce=reduceFunctions[strategy];var enough={};var steps=[];var terminates=false;try{reduce(term,function(t){if(steps.length>=maxSteps)throw enough;steps.push(t)});terminates=true}catch(e){if(e!==enough)throw e;terminates=false}var last=steps[steps.length-1]||term;var finalSynonyms=findSynonyms(last,defs);var initial=termStr(term);var final=termStr(last);var totalSteps=steps.length;var renderStep=function(i,options){return expandStep(steps[i],options)};return{initial:initial,"final":final,finalSynonyms:finalSynonyms,terminates:terminates,totalSteps:totalSteps,renderStep:renderStep}});var reduceProgram=function(program,options){if(options===void 0)options={};var ref=parse(program);var terms=ref.terms;var defs=ref.defs;return terms.map(function(term){return reduceTerm(term,defs,options)})};module.exports={Var:Var,Fun:Fun,App:App,Def:Def,parse:parse,termStr:termStr,reduceProgram:reduceProgram}},{"./core":1,"./helpers":4,"./parser":7}],7:[function(require,module,exports){var ref=require("./core");var Var=ref.Var;var Fun=ref.Fun;var App=ref.App;var Def=ref.Def;var ref$1=require("./helpers");var timed=ref$1.timed;var collapseWhitespace=ref$1.collapseWhitespace;var ref$2=require("./grammar");var Parser=ref$2.Parser;exports.parse=timed("parse",function(str){var parser=new Parser;var defs={};var terms=[];parser.yy={parseFunction:Fun,parseApplication:App,parseDefinition:function(name,term){if(defs[name])throw Error(name+" already defined");defs[name]=term},parseTopLevelTerm:function(term){terms.push(term)},parseIdentifier:Ref};parser.parse(str);terms.forEach(function(t){return resolveTermRefs(t,defs)});var refNames={};for(var name in defs)resolveDefRefs(name,defs[name],defs,refNames);return{defs:defs,terms:terms}});var Ref=function(name){return{type:Ref,name:name}};var resolveTermRefs=function(t,defs,boundNames){if(boundNames===void 0)boundNames=[];switch(t.type){case Ref:var free=boundNames.indexOf(t.name)<0;if(t.name in defs&&free){t.type=Def;t.term=defs[t.name]}else{t.type=Var}break;case App:resolveTermRefs(t.left,defs,boundNames);resolveTermRefs(t.right,defs,boundNames);break;case Fun:resolveTermRefs(t.body,defs,boundNames.concat(t.param));break}};var resolveDefRefs=function(defName,t,defs,refNames,boundNames){if(boundNames===void 0)boundNames=[];switch(t.type){case Ref:var bound=boundNames.indexOf(t.name)>=0;if(bound){t.type=Var}else if(t.name in defs){refNames[defName]=refNames[defName]||[].concat([t.name]);checkForCircularRefs(defName,t.name,refNames);t.type=Def;t.term=defs[t.name]}else{throw Error(collapseWhitespace('Illegal free variable "'+t.name+'" in "'+defName+'". \n        Definitions cannot have free variables.'))}break;case App:resolveDefRefs(defName,t.left,defs,refNames,boundNames);resolveDefRefs(defName,t.right,defs,refNames,boundNames);break;case Fun:var boundOnBody=boundNames.concat(t.param);resolveDefRefs(defName,t.body,defs,refNames,boundOnBody);break}};var checkForCircularRefs=function(name,refName,refNames,path){if(path===void 0)path=[];if(name===refName){var circularNote=path.length?"In this case the definition does not reference itself directly, but \n        through other definitions: "+[name].concat(path,[name]).join(" → ")+".":"";throw Error(collapseWhitespace('Illegal recursive reference in "'+name+'". Definitions cannot\n      reference themselves; they are just simple find&replace mechanisms.\n      '+circularNote+'\n      If you want to write a recursive function, look for "Y combinator" ;)'))}var nextRefs=refNames[refName]||[];nextRefs.forEach(function(nextRef){return checkForCircularRefs(name,nextRef,refNames,path.concat([refName]))})}},{"./core":1,"./grammar":3,"./helpers":4}]},{},[5]);
//# sourceMappingURL=index.js.map
