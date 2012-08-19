/* Lambda calculus grammar stolen from http://zaach.github.com/jison/try/
 * Original author: Zach Carter
 */

%lex
%%

\s*\n\s*  {/* ignore */}
"("       { return '('; }
")"       { return ')'; }
"\\"|"λ"  { return 'LAMBDA'; }
"."\s?    { return '.'; }
[a-zA-Z]+ { return 'VAR'; }
\s+       { return 'SEP'; }
<<EOF>>   { return 'EOF'; }
/lex


%right LAMBDA
%left SEP

%%

file
  : expr EOF { return $expr; }
  ;

expr
  : LAMBDA var '.' expr { $$ = yy.parseAbstraction($var, $expr); }
  | expr SEP expr       { $$ = yy.parseApplication($expr1, $expr2); }
  | var                 { $$ = yy.parseVariable(yytext); }
  | '(' expr ')'        { $$ = $expr; }
  ;

var
  : VAR { $$ = yytext; }
  ;
