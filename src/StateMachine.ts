type StateTable = Array<{[key: string]: number}>;

class StateMachine {
    private _currentState = 0;
    constructor(private _stateTable: StateTable, private _finalStates: Array<number>) {
    }
    match(word: string): boolean {
        for (const letter of word) {
            if (this._stateTable[this._currentState].hasOwnProperty(letter)) {
                this._currentState = this._stateTable[this._currentState][letter];
            } else {
                this._currentState = 0;
                return false;
            }
        }
        return this._finalStates.includes(this._currentState);
    }

    private minimize() {
        this.removeUntouchableStates();
        this.removeDeadEndStates();
        this.removeEqualStates();
    }

    private removeUntouchableStates() {
        const newStateTable: StateTable = [];
        const usufullStates: Set<number> = new Set([0]);

        let previousSize = -1;
        while (previousSize !== usufullStates.size) {
            previousSize = usufullStates.size;
            for (const state of usufullStates) {
                Object.values(this._stateTable[state]).forEach(el => usufullStates.add(el));
            }
        }

        for (const state of usufullStates) {
            newStateTable[state] = {...this._stateTable[state]};
        }

        this._stateTable = [...newStateTable];
    }
    private removeDeadEndStates() {
        const newStateTable: StateTable = [];
        const usufullStates: Set<number> = new Set([0]);

        for (const finalState of this._finalStates) {
            // TODO
            console.log(finalState, newStateTable, usufullStates);
        }
    }
    private removeEqualStates() {}
}

export default StateMachine;
