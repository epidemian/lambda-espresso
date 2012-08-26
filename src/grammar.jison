%lex
%%

"("              { return '('; }
")"              { return ')'; }
"\\"|"λ"         { return 'LAMBDA'; }
"."              { return '.'; }
"="              { return '='; }
[a-z][a-z0-9-_]* { return 'VAR'; }
[A-Z][A-Z0-9-_]* { return 'MACRO'; }
[\n]             { return 'SEPARATOR'; }
[ \t]+           { /* ignore whitespace */ }
";".*            { /* ignore line comments */ }
<<EOF>>          { return 'EOF'; }
/lex


%right LAMBDA
%left MACRO
%left VAR
%left '('
%left APPLY

%%

root
  : program EOF { return yy.getProgram(); }
  ;

program
  :
  | line
  | program SEPARATOR
  | program SEPARATOR line
  ;

line
  : term           { $$ = yy.parseTermEvaluation($term); }
  | macro '=' term { $$ = yy.parseMacroDefinition($macro, $term); }
  ;

term
  : LAMBDA var '.' term   { $$ = yy.parseAbstraction($var, $term); }
  | term term %prec APPLY { $$ = yy.parseApplication($term1, $term2); }
  | var                   { $$ = yy.parseVariable($var); }
  | macro                 { $$ = yy.parseMacroUsage($macro); }
  | "(" term ")"          { $$ = $term; }
  ;

macro
  : MACRO { $$ = yytext; }
  ;

var
  : VAR { $$ = yytext; }
  ;
