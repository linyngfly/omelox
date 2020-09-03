
import * as fs from 'fs';
import { parseToOmeloxProtobuf } from './main';

export function parseAndWrite(sourcePath: string, distPath: string) {
    const result = parseToOmeloxProtobuf(sourcePath);
    return fs.writeFileSync(distPath, JSON.stringify(result, null, 4));
}
