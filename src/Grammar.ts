import { Rules } from "./Rules";

class Grammar {
    private readonly _rules: Rules;
    private _terminals: {[key: string]: boolean} = {};
    private _nonterminals: {[key: string]: boolean} = {};

    private updateAlphabet (word: string): void {
        for (const letter of word) {
            if (!isNaN(+letter)) throw new TypeError('Numbers doesn\'t allowed');
            if (letter === letter.toUpperCase()) {
                this._nonterminals[letter] = false;
            }
            if (letter === letter.toLowerCase()) {
                this._terminals[letter] = false;
            }
        }
    }

    private checkIsKv() {
        for (const rule in this._rules) {
            if (rule.length > 1) throw new TypeError('Grammar is not KV');
        }
    }

    constructor(rules: Rules) {
        this._rules = {...rules};
        for (const leftWord in rules) {
            this.updateAlphabet(leftWord);
            for (const rightWord of rules[leftWord]) {
                this.updateAlphabet(rightWord);
            }
        }
    }

    getEmptyNonTerminals(): Array<string> {
        this.checkIsKv();

        const result: Set<string> = new Set();
        for (const nonterminal in this._nonterminals) {
            for (const output of this._rules[nonterminal]) {
                if (output === '') result.add(nonterminal);
            }
        }

        let previousLength = 0;

        while (previousLength !== result.size) {
            previousLength = result.size;
            for (const input in this._rules) {
                for (const output of this._rules[input]) {
                    if (output.split('').filter(letter => !result.has(letter)).length === 0) {
                        result.add(input);
                    }
                }
            }
        }

        return Array.from(result);
    }

    private canDevireToEmptyWord (word: string, eNonTerminals?: Array<string>): boolean {
        eNonTerminals = eNonTerminals || this.getEmptyNonTerminals();
        return word.split('').filter(letter => !eNonTerminals?.includes(letter)).length === 0;
    }

    leftRecTest(): Array<string> {
        const result: Array<string> = [];
        this.checkIsKv();
        const eNonTerminals = this.getEmptyNonTerminals();

        for (const nonterminal in this._nonterminals) {
            for (const outPut of this._rules[nonterminal]) {
                if (outPut.indexOf(nonterminal) === 0
                    || (outPut.includes(nonterminal)
                    && this.canDevireToEmptyWord(outPut.slice(0, outPut.indexOf(nonterminal)), eNonTerminals)))
                    result.push(nonterminal);
            }
        }

        return result;
    }
}

export default Grammar;
