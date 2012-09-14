exports.all = [
  name: 'Booleans'
  code: '''
    ; Example showcasing Church booleans.
    TRUE = λt.λf.t
    FALSE = λt.λf.f
    AND = λp.λq.p q p
    OR = λp.λq.p p q
          
    ; Print truth tables for AND and OR.
    AND FALSE FALSE
    AND FALSE TRUE
    AND TRUE FALSE
    AND TRUE TRUE
    OR FALSE FALSE
    OR FALSE TRUE
    OR TRUE FALSE
    OR TRUE TRUE
  '''
,
  name: 'Other example'
  code: '''
    ; Code here...
  '''
]
