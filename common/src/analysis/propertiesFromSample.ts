import * as ss from 'simple-statistics';
import { readFileSync } from 'fs';

const file = readFileSync('./movesInGame.json', { encoding: 'utf-8' });
const data = JSON.parse(file);

console.log('Average: ', ss.average(data));
console.log('Mode: ', ss.mode(data));
console.log('Standard deviation: ', ss.standardDeviation(data));
