# Nodejs Module Practice
A Javascript module to analysis and transform HTTP/1.1 request.
## Import Module
```
npm install ../nodejs-module-practice

in your package.json:
{
  ...
  ...
  "dependencies": {
    "nodejs-module-practice": "file:../nodejs-module-practice"
  }
}
```
### Usage
```
const nmp = require('nodejs-module-practice');
//nmp.httpTransform.handleReqWithRules(inputPath, outputPath, rulePath);

nmp.httpTransform.handleReqWithRules('request.json', 'result.json', 'rule.json');
```
### Input/Output type
```
About Input
- YAML file
- JSON file
- XML file
About Output
- YAML file
- JSON file
- XML file
Error with Error message:
EX:
{result:"Error",message:"rule_8 Error"}

```

### Edit Rules in Json
```
(in rules.json)
rule_id: Rule's id
description: Rule Description
conditions: Set-up conditions with condiction object
{
    "field": field you'd like to handle,
    "operator": "equal" | "not_equal" | "match"| "not_exist" | "exist",
    "values": Multiple values you'd like to work with operator 
}
actions: Set-up your actions if conditions all matched
{
                "field": field you'd like to handle, "path" | "query" | "From"
                "do": "add" | "update" | "error" " | "remove",
                "old_value": "The value you'd like to be replaced",
                "new_value": "new value you want"
}
EX:
{
    "rule_id":{
        "description":" Rule Description",
        "conditions": [
            {
                "field": "method",
                "operator": "equal",
                "values": ["GET"]
            },
            {
                "field": "Referer",
                "operator": "not_equal",
                "values": ["www.sb.com"]
            }
        ],
        "actions": [ 
            {
                "do": "error"
            }
        ]
    },
    "rule_4":{
        "description":"If this HTTP method is GET and path is match​ /sb/api/*​, please add​ ​From​ in the header and the value is ​hello@sb.com​.",
        "conditions": [
            {
                "field": "method",
                "operator": "equal",
                "values": ["GET"]
            },
            {
                "field": "path",
                "operator": "match",
                "values": ["/sb/api/*"]
            }
        ],
        "actions": [
            {
                "field": "From",
                "do": "add",
                "new_value": "hello@sb.com"
            }
        ]
    },
    "rule_5":{
        "description":"If this HTTP method is POST/PUT, please remove all the​ ​url query string​.",
        "conditions": [
            {
                "field": "method",
                "operator": "equal",
                "values": ["POST", "PUT"]
            }
        ],
        "actions": [
            {
                "field": "query",
                "do": "remove"
            }
        ]
    },
}
```

### Test
```shell
  npm test
```

### Run
```shell
node index.js
```