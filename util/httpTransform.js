const utils = require('./utils');
const URL = require('url');
const C = require('./constants');
const { HEADERS, ACT } = require('./constants');


const handleReqWithRules = (inputPath, outputPath, rulePath) => {
    try {
        let req = utils.getDataFromFile(inputPath);
        const rules = utils.getDataFromFile(rulePath);
        for (rule in rules) {
            ruleChecker(rules[rule]);
            const act = ruleMatch(req, rules[rule][C.CONDITIONS]);
            if (act) {
                req = handleReqWithActions(req, rules[rule][C.ACTIONS], rule);
            }
        }
        utils.outputFile(outputPath, req);
        return JSON.stringify({ result: "Ok", output: outputPath, data: req });
    } catch (err) {
        return JSON.stringify({ result: "Error", message: err.message });
    }
}

const handleReqWithActions = (req, actions, ruleId) => {
    for (act of actions) {
        switch (act[C.DO].toLowerCase()) {
            case ACT.UPDATE:
                req = updateRequest(req, act);
                break;
            case ACT.ADD:
                req = addRequest(req, act);
                break;
            case C.ERROR:
                throw new Error(`${ruleId} Error`);
            case ACT.REMOVE:
                req = doRemoveRequest(req, act);
                break;
            default:
                console.log("[handleReqWithActions] no action matched!");
        }
        return req;
    }
}

const updateRequest = (req, action) => {
    const field = action[C.FIELD];
    const oldVal = action[C.OLD_VALUE];
    const newVal = action[C.NEW_VALUE];
    if (field === C.URL.PATH) {
        req[C.URL.URL] = req[C.URL.URL].replace(oldVal, newVal);
    }
    return req;
}

const doRemoveRequest = (req, action) => {
    const field = action[C.FIELD];
    let { query } = parseUrl(req[C.URL.URL]);
    if (field === C.URL.QUERY && query) {
        req[C.URL.URL] = req[C.URL.URL].replace("?" + query, "");
    }
    return req;
}

const addRequest = (req, action) => {
    const field = action[C.FIELD];

    if (field.toLowerCase() === HEADERS.X_SB_TIMESTAMP.toLowerCase()) {
        req[HEADERS.HEADERS][HEADERS.X_SB_TIMESTAMP] = new Date().getTime();
    } else if (field.toLowerCase() === HEADERS.FROM.toLowerCase()) {
        const newVal = action[C.NEW_VALUE];
        req[HEADERS.HEADERS][HEADERS.FROM] = newVal;
    }
    return req;
}

const ruleMatch = (req, conditions) => {
    let conditionOk = true;
    for (obj of conditions) {
        if (conditionOk) {
            let valueOk = true;
            for (x of obj[C.VALUES]) {

                switch (obj[C.OPERATOR]) {
                    case ACT.EQUAL:
                        valueOk = ruleEqualRequest(obj, req, x.toLowerCase().trim());
                        break;
                    case ACT.NOT_EQUAL:
                        valueOk = !ruleEqualRequest(obj, req, x.toLowerCase().trim());
                        break;
                    case ACT.NOT_EXIST:
                        valueOk = !ruleExistRequest(obj, req, x.toLowerCase().trim());
                        break;
                    case ACT.MATCH:
                        valueOk = rulePathMatch(obj, req, x.toLowerCase().trim());
                        break;
                    default:
                        console.log("[ruleMatch] no matched");
                }
                if (valueOk) break;
            }
            conditionOk = valueOk;
        } else {
            return conditionOk;
        }
    }
    return conditionOk;
}

const ruleEqualRequest = (obj, req, val) => {
    let result = true;
    const field = obj[C.FIELD]
    try {
        if (field.toLowerCase() === C.URL.PATH) {
            let { path } = parseUrl(req[C.URL.URL]);
            result = (path.toLowerCase() === val);
        } else if (field.toLowerCase() === HEADERS.REFERER.toLowerCase()) {
            let { host } = parseUrl(req[HEADERS.HEADERS][HEADERS.REFERER]);
            result = (host.toLowerCase() === val);
        } else if (field.toLowerCase() === C.URL.DOMAIN.toLowerCase()) {
            let { host } = parseUrl(req[C.URL.URL]);
            result = (host.toLowerCase() === val);
        } else if (field.toLowerCase() === HEADERS.CONTENT_TYPE.toLowerCase() ||
            (field.toLowerCase() === HEADERS.X_SB_AGENT.toLowerCase())) {
            result = (req[HEADERS.HEADERS][field].toLowerCase() === val);
        } else {
            result = (req[field].toLowerCase() === val);
        }
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
}

const rulePathMatch = (obj, req, val) => {
    let result = true;
    if (obj[C.FIELD].toLowerCase() === C.URL.PATH) {
        let { path } = parseUrl(req[C.URL.URL]);
        const rex = new RegExp(val);
        searched = (path.toLowerCase().search(rex));
        result = (searched === -1) ? false : true;
    }
    return result;
}

const ruleExistRequest = (obj, req, val) => {
    let result = true;
    if (obj[C.FIELD].toLowerCase() === HEADERS.COOKIE.toLowerCase()) {

        result = (req[HEADERS.HEADERS][HEADERS.COOKIE].toLowerCase().includes(val + '='));
    } else if (obj[C.FIELD].toLowerCase() === HEADERS.X_SB_AGENT.toLowerCase()) {

        if (req[HEADERS.HEADERS].hasOwnProperty(HEADERS.X_SB_AGENT)) {
            if (val) {
                result = (req[HEADERS.HEADERS][HEADERS.X_SB_AGENT].toLowerCase() === val);
            } else {
                result = true;
            }
        } else result = false;
    }
    return result;
}

const ruleChecker = (rule) => {
    if (rule.hasOwnProperty(C.CONDITIONS) && rule.hasOwnProperty(C.ACTIONS)) {

        for (cond of rule[C.CONDITIONS]) {
            conditionChecker(cond);
        }

        for (act of rule[C.ACTIONS]) {
            actionChecker(act);
        }
    } else {
        throw new Error('Conditions setup error');
    }
}

const conditionChecker = (condition) => {
    if (condition.hasOwnProperty(C.FIELD)
        && condition.hasOwnProperty(C.OPERATOR)
        && condition.hasOwnProperty(C.VALUES)) {
        return true;
    }
    else {
        throw new Error('Conditions setup error');
    }
}

const actionChecker = (action) => {
    if (action.hasOwnProperty(C.DO)) {
        switch (action[C.DO]) {
            case C.ERROR:
                return true;

            case ACT.UPDATE:
                if (action.hasOwnProperty(C.OLD_VALUE) && action.hasOwnProperty(C.NEW_VALUE)) {
                    return true;
                } else {
                    throw new Error('Conditions setup error');
                }
            case ACT.ADD:
                if (action.hasOwnProperty(C.FIELD)) {
                    return true;
                } else {
                    throw new Error('Conditions setup error');
                }
            case ACT.REMOVE:
                if (action.hasOwnProperty(C.FIELD)) {
                    return true;
                } else {
                    throw new Error('Conditions setup error');
                }
            default:
                throw new Error('Conditions setup error');
        }
    } else {
        throw new Error('Conditions setup error');
    }
}

const parseUrl = url => {
    const host = URL.parse(url).host;
    const path = URL.parse(url).pathname;
    const query = URL.parse(url).query;
    return { host, path, query };
}

exports.handleReqWithRules = handleReqWithRules;
