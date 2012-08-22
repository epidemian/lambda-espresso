/* Lambda calculus grammar stolen from http://zaach.github.com/jison/try/
 * Original author: Zach Carter
 */

%lex
%%

\s*\n\s*       {/* ignore */}
"("            { return '('; }
")"            { return ')'; }
"\\"|"λ"       { return 'LAMBDA'; }
"."            { return '.'; }
[a-z][a-z0-9]* { return 'VAR'; }
\s+            { /* ignore */ }
<<EOF>>        { return 'EOF'; }
/lex


%right LAMBDA
%left VAR
%left '('
%left APPLY

%%

file
  : expr EOF { return $expr; }
  ;

expr
  : LAMBDA var '.' expr   { $$ = yy.parseAbstraction($var, $expr); }
  | expr expr %prec APPLY { $$ = yy.parseApplication($expr1, $expr2); }
  | var                   { $$ = yy.parseVariable($var); }
  | "(" expr ")"          { $$ = $expr; }
  ;

var
  : VAR { $$ = yytext; }
  ;
