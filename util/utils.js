const path = require('path');
const YAML = require('yamljs');
const xml = require('xml-js');
const fs = require('fs-extra')

const getExtension = filename => {
    const ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}

const outputFile = (outputPath, data) => {
    const ext = getExtension(outputPath).toLowerCase();
    if (ext === 'yaml' || ext === 'yml') {
        data = YAML.stringify(data, 4);
    } else if (ext === 'xml') {
        data = xml.json2xml(JSON.stringify(data), {
            compact: true,
            ignoreComment: true,
            spaces: 4,
        });
    } else {
        data = JSON.stringify(data);
    }
    fs.outputFileSync(outputPath, data);
}

// For xml feature
function nativeType(value) {
    var nValue = Number(value);
    if (!isNaN(nValue)) {
        return nValue;
    }
    var bValue = value.toLowerCase();
    if (bValue === 'true') {
        return true;
    } else if (bValue === 'false') {
        return false;
    }
    return value;
}


const getDataFromFile = filePath => {
    try {
        const ext = getExtension(filePath).toLowerCase();
        const fileContent = fs.readFileSync(filePath, 'utf8')
        if (ext === 'yaml' || ext === 'yml') {
            return YAML.parse(fileContent);
        } else if (ext === 'xml') {
            const removeJsonTextAttribute = function (value, parentElement) {
                try {
                    const keyNo = Object.keys(parentElement._parent).length;
                    const keyName = Object.keys(parentElement._parent)[keyNo - 1];
                    parentElement._parent[keyName] = nativeType(value);
                } catch (e) { }
            }
            return JSON.parse(xml.xml2json(
                fileContent, {
                compact: true,
                trim: true,
                nativeType: true,
                ignoreDeclaration: true,
                ignoreInstruction: true,
                ignoreAttributes: true,
                ignoreComment: true,
                ignoreCdata: true,
                ignoreDoctype: true,
                textFn: removeJsonTextAttribute
            }
            ))["root"];
        } else {
            return JSON.parse(fileContent);
        }
    } catch (err) {
        throw new Error(`Invalid input error: ${err}`);
    }
}

exports.getDataFromFile = getDataFromFile;
exports.outputFile = outputFile;