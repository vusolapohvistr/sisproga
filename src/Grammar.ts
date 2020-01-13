import { Rules } from "./Rules";

class Grammar {
    private readonly _rules: Rules;
    private _terminals: {[key: string]: boolean} = {};
    private readonly _nonterminals: {[key: string]: boolean} = {};

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
        return word.length === 0 || word.split('').filter(letter => !eNonTerminals?.includes(letter)).length === 0;
    }

    private getNonTerminalsCanBeLeft(nonterminal: string, eNonTerminals?: Array<string>): Set<string> {
        const state: Set<string> = new Set();
        for (const outPut of this._rules[nonterminal]) {
            const endOfNonTerminalSubWord = outPut.search(/[a-z]/);
            if (endOfNonTerminalSubWord !== 0) {
                let subWord = endOfNonTerminalSubWord === -1 ? outPut : outPut.slice(0, endOfNonTerminalSubWord);
                while (subWord.length > 0) {
                    const beforeLastNonTerminal = subWord.slice(0, -1);
                    // console.log(beforeLastNonTerminal);
                    if (this.canDevireToEmptyWord(beforeLastNonTerminal, eNonTerminals)) {
                        state.add(subWord[subWord.length - 1]);
                    }
                    subWord = beforeLastNonTerminal;
                }
            }
        }
        return state;
    }

    leftRecTest(): Array<string> {
        const result: Array<string> = [];
        this.checkIsKv();
        const eNonTerminals = this.getEmptyNonTerminals();

        for (const nonterminal in this._nonterminals) {
            const state: Set<string> = this.getNonTerminalsCanBeLeft(nonterminal);
            // console.log('first non terminals that can be left for', nonterminal, '//', state);
            let previousStateSize = -1;

            while (state.size !== previousStateSize) {
                previousStateSize = state.size;
                for (const stateNonTerminal of state) {
                    this.getNonTerminalsCanBeLeft(stateNonTerminal, eNonTerminals).forEach(el => state.add(el));
                }
                // console.log('next non terminals', state);
            }

            if (state.has(nonterminal)) {
                result.push(nonterminal);
                // console.log('adding ', nonterminal);
            }
        }

        return result;
    }

    private getNonTerminalsCanBeRight(nonterminal: string, eNonTerminals?: Array<string>): Set<string> {
        const state: Set<string> = new Set();
        for (const outPut of this._rules[nonterminal]) {
            const startOfLastNonTerminalSubWord = outPut.search(/[A-Z]+$/);
            if (startOfLastNonTerminalSubWord !== -1) {
                let subWord = outPut.slice(startOfLastNonTerminalSubWord);
                while (subWord.length > 0) {
                    const afterLastNonTerminal = subWord.slice(1);
                    // console.log(afterLastNonTerminal);
                    if (this.canDevireToEmptyWord(afterLastNonTerminal, eNonTerminals)) {
                        state.add(subWord[0]);
                    }
                    subWord = afterLastNonTerminal;
                }
            }
        }
        return state;
    }

    rightRecTest(): Array<string> {
        const result: Array<string> = [];
        this.checkIsKv();
        const eNonTerminals = this.getEmptyNonTerminals();
        console.log(eNonTerminals);

        for (const nonterminal in this._nonterminals) {
            const state: Set<string> = this.getNonTerminalsCanBeRight(nonterminal);
            // console.log('first non terminals that can be right for', nonterminal, '//', state);
            let previousStateSize = -1;

            while (state.size !== previousStateSize) {
                previousStateSize = state.size;
                for (const stateNonTerminal of state) {
                    this.getNonTerminalsCanBeRight(stateNonTerminal, eNonTerminals).forEach(el => state.add(el));
                }
                // console.log('next non terminals', state);
            }

            if (state.has(nonterminal)) {
                result.push(nonterminal);
                // console.log('adding ', nonterminal);
            }
        }

        return result;
    }
}

export default Grammar;
