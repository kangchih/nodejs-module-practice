// import {
//     expect,
//   } from 'chai';

const expect = require('chai').expect;
const httpTransform = require('../util/httpTransform');
const utils = require('../util/utils');

const rule_path = num => `test/rules/test_rule_${num}.json`;
const input_err_path = num => `test/input/input_${num}_err.json`;
const input_path = num => `test/input/input_${num}.json`;
const test_output_path = num => `test/output/output_${num}.json`;
describe('Rule 0 Error - Check Request Methods', () => {
    it('Should return result: Error with message', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('0'), test_output_path('0'), (rule_path('0')));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_0 Error"}));
        done();
    });
});

describe('Rule 0 Ok - Check Request Methods', () => {
    it('Should return result: Ok with data', (done) => {
        res = httpTransform.handleReqWithRules(input_path('0'), test_output_path('0'), rule_path('0'));   
        const originData = utils.getDataFromFile(input_path('0'));
        const outputData = utils.getDataFromFile(test_output_path('0'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});

describe('Rule 1 Ok (json file)- Check Modified Path', () => {
    it('If this HTTP method is GET and path is ​/sb/resource​, please modify path to /sb/static/assets', (done) => {
        res = httpTransform.handleReqWithRules(input_path(1), test_output_path(1), rule_path(1));
        const outputData = utils.getDataFromFile(test_output_path('1'));
        expect(outputData['url']).to.be.equal("http://www.sb.com/sb/static/assets?q=1");
        done();
    });
});

describe('Rule 1 Ok (yaml file)- Check Modified Path', () => {
    it('If this HTTP method is GET and path is ​/sb/resource​, please modify path to /sb/static/assets', (done) => {
        res = httpTransform.handleReqWithRules('test/input/input_1.yaml', 'test/output/output_1.yaml', rule_path(1));
        const outputData = utils.getDataFromFile('test/output/output_1.yaml');
        expect(outputData['url']).to.be.equal("http://www.sb.com/sb/static/assets?q=1");
        done();
    });
});

describe('Rule 2 Throw Error - Check sbcookie Cookie exists in header', () => {
    it('If this HTTP method is GET and path is ​/sb/me​, please check if ​sbcookie Cookie​ exists in header. Throw an error if not existing.', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('2'), test_output_path('2'), rule_path('2'));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_2 Error"}));
        done();
    });
});

describe('Rule 2 OK - Check sbcookie Cookie exists in header', () => {
    it('If this HTTP method is GET and path is ​/sb/me​, please check if ​sbcookie Cookie​ exists in header. Throw an error if not existing.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('2'), test_output_path('2'), rule_path('2'));
        const originData = utils.getDataFromFile(input_path('2'));
        const outputData = utils.getDataFromFile(test_output_path('2'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});

describe('Rule 3 OK - Check Referer Header', () => {
    it('If this HTTP method is GET, please check if ​referer header​ is belong to www.sb.com​. Throw an error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('3'), test_output_path('3'), rule_path('3'));
        const originData = utils.getDataFromFile(input_path('3'));
        const outputData = utils.getDataFromFile(test_output_path('3'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});


describe('Rule 3 Error - Check Referer Header', () => {
    it('If this HTTP method is GET, please check if ​referer header​ is belong to www.sb.com​. Throw an error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('3'), test_output_path('3'), rule_path('3'));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_3 Error"}));
        done();
    });
});

describe('Rule 4 OK - Check Path and Add Header From', () => {
    it('If this HTTP method is GET and path is match​ /sb/api/*​, please add​ ​From​ in the header and the value is ​hello@sb.com​.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('0'), test_output_path('4'), rule_path('4'));
        const outputData = utils.getDataFromFile(test_output_path('4'));
        expect(outputData['headers']['From']).to.be.equal("hello@sb.com");
        done();
    });
});

describe('Rule 5 OK - Remove Query String', () => {
    it('If this HTTP method is POST/PUT, please remove all the​ ​url query string​.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('5'), test_output_path('5'), rule_path('5'));
        const outputData = utils.getDataFromFile(test_output_path('5'));
        expect(outputData['url']).to.be.equal("http://www.sb.com/sb/me");
        done();
    });
});

describe('Rule 6 Error - Check X-SB-AGENT​ exists in header', () => {
    it('If this HTTP method is POST/PUT, check if ​X-SB-AGENT​ exists in header. Throw an error if not existing.', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('6'), test_output_path('6'), rule_path('6'));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_6 Error"}));
        done();
    });
});

describe('Rule 6 OK - Check X-SB-AGENT​ exists in header', () => {
    it('If this HTTP method is POST/PUT, please remove all the​ ​url query string​.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('5'), test_output_path('6'), rule_path('6'));
        const originData = utils.getDataFromFile(input_path('5'));
        const outputData = utils.getDataFromFile(test_output_path('6'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});

describe('Rule 7 Error - Check Content-Type​', () => {
    it('If this HTTP method is POST/PUT, check if ​Content-Type​ exists in header and with value “application/json”. Throw error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('6'), test_output_path('7'), rule_path('7'));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_7 Error"}));
        done();
    });
});

describe('Rule 7 OK - Check Content-Type​ exists in header', () => {
    it('If this HTTP method is POST/PUT, please remove all the​ ​url query string​.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('5'), test_output_path('7'), rule_path('7'));
        const originData = utils.getDataFromFile(input_path('5'));
        const outputData = utils.getDataFromFile(test_output_path('7'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});

describe('Rule 8 Error - Check X-SB-AGENT​​', () => {
    it('If this HTTP method is DELETE, please check if ​X-SB-AGENT​ exists in header and the value should be “AGENT_1” only. Throw error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('8'), test_output_path('8'), rule_path('8'));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_8 Error"}));
        done();
    });
});

describe('Rule 8 OK - Check X-SB-AGENT​', () => {
    it('If this HTTP method is DELETE, please check if ​X-SB-AGENT​ exists in header and the value should be “AGENT_1” only. Throw error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('8'), test_output_path('8'), rule_path('8'));
        const originData = utils.getDataFromFile(input_path('8'));
        const outputData = utils.getDataFromFile(test_output_path('8'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});

describe('Rule 9 OK - Check X-SB-TIMESTAMP​', () => {
    it('This library should add ​X-SB-TIMESTAMP​ in the header for all HTTP requests, the value is current timestamp.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('8'), test_output_path('9'), rule_path('9'));
        const outputData = utils.getDataFromFile(test_output_path('9'));
        expect(outputData['headers']['X-SB-TIMESTAMP']).to.not.be.undefined;
        done();
    });
});

describe('Rule 10 Error - Check Domain', () => {
    it('This library only handles the domain from​ ​www.sb.com​. Throw an error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_err_path('10'), test_output_path('10'), rule_path('10'));
        expect(res).to.be.equal(JSON.stringify({result:"Error",message:"rule_10 Error"}));
        done();
    });
});

describe('Rule 10 OK - Check Domain​', () => {
    it('This library only handles the domain from​ ​www.sb.com​. Throw an error if it is invalid.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('8'), test_output_path('10'), rule_path('10'));
        const originData = utils.getDataFromFile(input_path('8'));
        const outputData = utils.getDataFromFile(test_output_path('10'));
        expect(JSON.stringify(originData)).to.be.equal(JSON.stringify(outputData));
        done();
    });
});

describe('Rule all OK - Check Requests with All Rules', () => {
    it('All Rules.', (done) => {
        res = httpTransform.handleReqWithRules(input_path('0'), test_output_path('all'), rule_path('all'));
        // const originData = utils.getDataFromFile(input_path('8'));
        const outputData = utils.getDataFromFile(test_output_path('all'));
        expect(outputData['headers']['X-SB-TIMESTAMP']).to.not.be.undefined;
        expect(outputData['headers']['From']).to.be.equal("hello@sb.com");

        done();
    });
});