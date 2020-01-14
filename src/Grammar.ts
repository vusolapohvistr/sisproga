import { Rules } from "./Rules";

interface KTable {
    [key: string]: Array<Set<string>>;
}

interface ControlTable {
    [key: string]: {
        [key: string]: number
    }
}

interface PureRule {
    [key: string]: string;
}

class Grammar {
    private readonly _rules: Rules;
    private _terminals: {[key: string]: boolean} = {};
    private readonly _nonterminals: {[key: string]: boolean} = {};

    private updateAlphabet (word: string): void {
        for (const letter of word) {
            if (!isNaN(+letter)) throw new TypeError('Numbers doesn\'t allowed');
            if (letter === letter.toUpperCase()) {
                this._nonterminals[letter] = true;
            }
            if (letter === letter.toLowerCase()) {
                this._terminals[letter] = true;
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
       // console.log(eNonTerminals);

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

    plusK(l1: Set<string>, l2: Set<string>, k: number): Set<string> {
        const result: Set<string> = new Set();
        if (l1.size === 0) {
            l2.forEach(y => result.add(y.slice(0, k)));
        } else {
            if (l2.size === 0) {
                l1.forEach(x => result.add(x.slice(0, k)));
            } else {
                for (const x of l1) {
                    for (const y of l2) {
                        result.add((x + y).slice(0, k));
                    }
                }
            }
        }
        return result;
    }

    constructFirstKTable(k: number): KTable {
        this.checkIsKv();

        const table: KTable = Object.keys(this._nonterminals)
            .reduce((acc: KTable, key) => acc = {...acc, [key]: []}, {});
        let changed = true;

        for (const nonterminal in this._nonterminals) {
            table[nonterminal][0] = new Set();
            for (const rule of this._rules[nonterminal]) {
                const first = rule.slice(0, k);
                if (first === first.toLowerCase()) {
                    table[nonterminal][0].add(first);
                }
            }
        }

        let currentIndex = 1;

        while (changed) {
            changed = false;
            for (const nonterminal in table) {
                table[nonterminal][currentIndex] = new Set(table[nonterminal][currentIndex - 1]);
                for (const rule of this._rules[nonterminal]) {
                    let tempResult: Set<string> = new Set();
                    let identified = true;
                    for (const letter of rule) {
                        if (this._terminals[letter]) {
                            tempResult = this.plusK(tempResult, new Set(letter), k);
                        } else {
                            if (table[letter][currentIndex - 1].size === 0) identified = false;
                            tempResult = this.plusK(tempResult, table[letter][currentIndex - 1], k);
                        }
                    }
                    identified && tempResult.forEach(el => table[nonterminal][currentIndex].add(el));
                }
                if (!changed) {
                    changed = table[nonterminal][currentIndex].size !== table[nonterminal][currentIndex - 1].size;
                }
            }
            currentIndex++;
        }

        return table;
    }

    getFirstKForWord(word: string, firstKTable: KTable, k: number) {
        let result: Set<string> = new Set();
        if (word === '') return new Set(['']);
        for (const letter of word) {
            if (letter.toLowerCase() === letter) {
                result = this.plusK(result, new Set([letter]), k);
            } else {
                result = this.plusK(result, firstKTable[letter][firstKTable[letter].length - 1], k);
            }
        }
        return result;
    }

    constructFollowKTable(k: number): KTable {
        this.checkIsKv();

        const table: KTable = Object.keys(this._nonterminals)
            .reduce((acc: KTable, key) => acc = {...acc, [key]: []}, {});
        const firstKTable: KTable = this.constructFirstKTable(k);

        for (const nonterminal in table) {
            table[nonterminal][0] = nonterminal === 'S' ? new Set(['']) : new Set();
        }

        for (const nonterminal in table) {
            table[nonterminal][1] = new Set(table[nonterminal][0]);
            for (const rule of this._rules['S']) {
                const indexOfNonTerminal = rule.length === 0 ? -1 : rule.indexOf(nonterminal);
                if (indexOfNonTerminal !== -1) {
                    const w2 = rule.slice(indexOfNonTerminal + 1);
                    table[nonterminal][1] = this.getFirstKForWord(w2, firstKTable, k);
                }
            }
        }

        let changed = true;
        let currentIndex = 2;

     //   console.log(table);

        while (changed) {
            changed = false;
            for (const nonterminal in table) {
                table[nonterminal][currentIndex] = new Set(table[nonterminal][currentIndex - 1]);
                for (const input in this._rules) {
                    for (const output of this._rules[input]) {
                        const indexOfNonTerminal = output.indexOf(nonterminal);
                        if (indexOfNonTerminal !== -1) {
                            const w2 = output.slice(indexOfNonTerminal + 1);
                            const firstK: Set<string> = new Set();
                                table[input][currentIndex - 1]
                                    .forEach(word => this.getFirstKForWord(w2 + word, firstKTable, k)
                                        .forEach(result => firstK.add(result)));
                            firstK.forEach(el => table[nonterminal][currentIndex].add(el));
                        }
                    }
                }
                if (!changed) {
                    changed = table[nonterminal][currentIndex].size !== table[nonterminal][currentIndex - 1].size;
                }
            }
            currentIndex++;
        }

        return table;
    }
    
    constructControlTable(): ControlTable {
        this.checkIsKv();

        const pureRules: Array<PureRule> = [];
        for (const input in this._rules) {
            for (const output of this._rules[input]) {
                pureRules.push({[input]: output});
            }
        }

        console.log(pureRules);

        const firstAndFollow: Array<Set<string>> = [];

        const firstKTable: KTable = this.constructFirstKTable(1);
        const followKTable: KTable = this.constructFollowKTable(1);

        for (const rule of pureRules) {
            const w = Object.values(rule)[0];
            const followValue: Set<string> = followKTable[Object.keys(rule)[0]][followKTable[Object.keys(rule)[0]].length - 1];
            firstAndFollow.push(this.plusK(this.getFirstKForWord(w, firstKTable, 1), followValue, 1));
        }

        console.log(firstAndFollow);

        const result: ControlTable = {};

        for (let i = 0; i < pureRules.length; i++) {
            const nonterminal = Object.keys(pureRules[i])[0];
            if (!result.hasOwnProperty(nonterminal)) {
                result[nonterminal] = {};
            }
            for (const terminal of firstAndFollow[i]) {
                result[nonterminal][terminal] = i + 1;
            }
        }

        return result;
    }
}

export default Grammar;
