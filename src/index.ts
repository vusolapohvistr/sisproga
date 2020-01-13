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
    console.log(grammar.rightRecTest());
});
