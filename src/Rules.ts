export interface Rules {
    [key: string]: Array<string>
}

function makeRules(lines: Array<string>): Rules {
    const result: Rules = {};
    const validator = new RegExp(/^([A-Z]|[a-z])+->(([A-Z]|[a-z])\|)*([A-Z]|[a-z])/);

    for (const line of lines) {
        const rule = createRule(line, validator);
        if (result.hasOwnProperty(Object.keys(rule)[0])) {
            result[Object.keys(rule)[0]].push(...Object.values(rule)[0]);
        } else {
            result[Object.keys(rule)[0]] = Object.values(rule)[0];
        }
    }

    return result;
}

function createRule(line: string, validator?: RegExp): Rules {
    validator = validator || new RegExp(/^([A-Z]|[a-z])+->(([A-Z]|[a-z])\|)*([A-Z]|[a-z])/);

    if (!validator.test(line)) {
        throw new TypeError('Invalid input in rule ' + line);
    }

    return {
        [line.split('->')[0]]: line.split('->')[1].split('|'),
    }
}

export {makeRules, createRule};
