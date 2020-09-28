
import * as fs from 'fs';
import { parseToOmeloxProtobuf } from './main';

export function parseAndWrite(sourcePath: string, clientPath: string, serverPath: string, dictionaryPath: string) {
    const result = parseToOmeloxProtobuf(sourcePath);
    fs.writeFileSync(clientPath, JSON.stringify(result.client, null, 4));
    fs.writeFileSync(serverPath, JSON.stringify(result.server, null, 4));
    fs.writeFileSync(dictionaryPath, JSON.stringify(result.dictionary, null, 4));
}
