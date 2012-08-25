%lex
%%

"("            { return '('; }
")"            { return ')'; }
"\\"|"λ"       { return 'LAMBDA'; }
"."            { return '.'; }
[a-z][a-z0-9]* { return 'VAR'; }
[\n]           { return 'SEPARATOR'; }
[ \t]+         { /* ignore whitespace */ }
<<EOF>>        { return 'EOF'; }
/lex


%right LAMBDA
%left VAR
%left '('
%left APPLY

%%

root
  : program EOF { return $program; }
  ;

program
  :                        { $$ = []; }
  | line                   { $$ = [$line]; }
  | program SEPARATOR      { $$ = $program; }
  | program SEPARATOR line { ($$ = $program).push($line); }
  ;

line
  : term { $$ = $term; }
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
