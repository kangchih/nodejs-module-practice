const httpTransform = require('./util/httpTransform');

// httpTransform.handleRule(s'input/t.json', 'output/result.json');
// httpTransform;

// exports.httpTransform = httpTransform.handleReqWithRules('input/request.json', 'output/result.json', 'rules.json');
exports.httpTransform = httpTransform;