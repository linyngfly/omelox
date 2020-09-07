
import * as fs from 'fs';
import { parseToJsonSchem } from './main';

export function parseAndWrite(sourcePath: string, clientPath: string, serverPath: string) {
    const result = parseToJsonSchem(sourcePath);
    fs.writeFileSync(clientPath, JSON.stringify(result.client, null, 4));
    fs.writeFileSync(serverPath, JSON.stringify(result.server, null, 4));
}
