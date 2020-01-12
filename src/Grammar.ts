interface Rules {
    [key: string]: Array<string>
}

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

    private checkIsKv(): void {
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

    private canBeEmpty(word: string) {

    }

    leftRecTest(): Array<string> {
        const result: Array<string> = [];
        this.checkIsKv();

        for (const nonterminal in this._nonterminals) {

        }

        return result;
    }
}
