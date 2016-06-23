%lex
%%

"("              { openParens++; return '('; }
")"              { openParens--; return ')'; }
"\\"|"λ"         { return 'LAMBDA'; }
"."              { return '.'; }
"="              { return '='; }
\n               { /* ignore separators inside parens */
                   if (openParens <= 0) return 'SEPARATOR'
                 }
[^\S\n]+         { /* ignore whitespace */ }
";".*            { /* ignore line comments */ }
[^\s\(\)\\λ\.=]+ { return 'IDENT'; }
<<EOF>>          { return 'EOF'; }
/lex

%{ var openParens = 0; %}

%right LAMBDA
%left IDENT
%left '('
%left APPLY

%%

root
  : program EOF { /* do nothing; terms and definitions already collected */ }
  ;

program
  :
  | line
  | program SEPARATOR
  | program SEPARATOR line
  ;

line
  : term           { $$ = yy.parseTopLevelTerm($term); }
  | ident '=' term { $$ = yy.parseDefinition($ident, $term); }
  ;

term
  : LAMBDA ident '.' term { $$ = yy.parseFunction($ident, $term); }
  | term term %prec APPLY { $$ = yy.parseApplication($term1, $term2); }
  | ident                 { $$ = yy.parseIdentifier($ident); }
  | "(" term ")"          { $$ = $term; }
  ;

ident
  : IDENT { $$ = yytext; }
  ;
