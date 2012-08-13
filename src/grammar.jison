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
  : LAMBDA var_list '.' expr { $$ = yy.parseAbstraction($var_list, $expr); }
  | expr SEP expr            { $$ = yy.parseApplication($expr1, $expr2); }
  | var                      { $$ = yy.parseVariable(yytext); }
  | '(' expr ')'             { $$ = $expr; }
  ;

var_list
  : var_list SEP var { $$ = $var_list.concat($var); }
  | var              { $$ = [$var]; }
  ;

var
  : VAR { $$ = yytext; }
  ;
