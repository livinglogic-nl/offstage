import fs from 'fs';
import { generate } from './index.mjs';

const sourceFolder = process.cwd() + '/src';

await import(`${sourceFolder}/offstage/mock.mjs`);
const api = generate();
fs.writeFileSync(`${sourceFolder}/offstage/index.ts`, api);
