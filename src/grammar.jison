%lex
%%

"("                 { return '('; }
")"                 { return ')'; }
"\\"|"λ"            { return 'LAMBDA'; }
"."                 { return '.'; }
"="                 { return '='; }
[a-z][a-z0-9-_]*    { return 'VAR'; }
[A-Z][A-Z0-9-_]*\'* { return 'DEF'; }
[\n]                { return 'SEPARATOR'; }
[ \t]+              { /* ignore whitespace */ }
";".*               { /* ignore line comments */ }
<<EOF>>             { return 'EOF'; }
/lex


%right LAMBDA
%left DEF
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
  : term         { $$ = yy.parseTermEvaluation($term); }
  | def '=' term { $$ = yy.parseDefinition($def, $term); }
  ;

term
  : LAMBDA var '.' term   { $$ = yy.parseFunction($var, $term); }
  | term term %prec APPLY { $$ = yy.parseApplication($term1, $term2); }
  | var                   { $$ = yy.parseVariable($var); }
  | def                   { $$ = yy.parseDefinitionUse($def); }
  | "(" term ")"          { $$ = $term; }
  ;

def
  : DEF { $$ = yytext; }
  ;

var
  : VAR { $$ = yytext; }
  ;
