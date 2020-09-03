
import * as fs from 'fs';
import { parseToOmeloxProtobuf } from './main';

export function parseAndWrite(sourcePath: string, clientPath: string, serverPath: string) {
    const result = parseToOmeloxProtobuf(sourcePath);
    fs.writeFileSync(clientPath, JSON.stringify(result.client, null, 4));
    fs.writeFileSync(serverPath, JSON.stringify(result.server, null, 4));
}
