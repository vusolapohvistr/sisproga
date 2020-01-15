import fs, { ReadStream } from 'fs';
import readline from 'readline';
import { makeRules } from "./Rules";
import Grammar from "./Grammar";

async function getRulesLines(fileName: string) {
    const readStream: ReadStream = fs.createReadStream(fileName);

    const lines: Array<string> = [];

    const reader = readline.createInterface({input: readStream, crlfDelay: Infinity});

    for await (const line of reader) {
        lines.push(line);
    }

    return lines;
}

const fileName = process.argv[2];
console.log(fileName);

getRulesLines(fileName).then(lines => {
    const grammar = new Grammar(makeRules(lines));
    console.log(process.argv);
    if (process.argv.includes('first-1')) {
        console.log('first-1');
        console.log(grammar.constructFirstKTable(1));
    }
    if (process.argv.includes('first-2')) {
        console.log('first-2');
        console.log(grammar.constructFirstKTable(2));
    }
    if (process.argv.includes('follow-1')) {
        console.log('follow-1');
        console.log(grammar.constructFollowKTable(1));
    }
    if (process.argv.includes('follow-2')) {
        console.log('follow-2');
        console.log(grammar.constructFollowKTable(2));
    }
    if (process.argv.includes('empty')) {
        console.log('empty');
        console.log(grammar.getEmptyNonTerminals());
    }
    if (process.argv.includes('left-rec')) {
        console.log('left-rec');
        console.log(grammar.leftRecTest());
    }
    if (process.argv.includes('right-rec')) {
        console.log('right-rec');
        console.log(grammar.rightRecTest());
    }
    if (process.argv.includes('control-table')) {
        console.log('control-table');
        console.log(grammar.constructControlTable());
    }
});
