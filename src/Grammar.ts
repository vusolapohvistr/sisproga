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

    getE_NonTerminals(word: string): Array<string> {
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
            for (const rule in this._rules) {
                for (const output of this._rules[rule]) {
                    if (rule.split('').filter(letter => output.includes(letter)).length === 0) {}
                }
            }
        }

        return Array.from(result);
    }

    canDevireToE (): boolean {

    }

    leftRecTest(): Array<string> {
        const result: Array<string> = [];
        this.checkIsKv();

        for (const nonterminal in this._nonterminals) {

        }

        return result;
    }
}
