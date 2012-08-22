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
  : term EOF { return $term; }
  ;

term
  : LAMBDA var '.' term   { $$ = yy.parseAbstraction($var, $term); }
  | term term %prec APPLY { $$ = yy.parseApplication($term1, $term2); }
  | var                   { $$ = yy.parseVariable($var); }
  | "(" term ")"          { $$ = $term; }
  ;

var
  : VAR { $$ = yytext; }
  ;
