
import * as fs from 'fs';
import { parseToJsonSchem } from './main';

const protoInts = ['uInt32', 'sInt32', 'int32'];
const protoFloats = ['double', 'float'];


function protoType2JsonSchemaType(schemaDefine: string) {
    protoInts.forEach((item) => {
        schemaDefine = schemaDefine.split(`"type": \"${item}\"`).join(`"type": "integer"`)
    })

    protoFloats.forEach((item) => {
        schemaDefine = schemaDefine.split(`"type": \"${item}\"`).join(`"type": "number"`)
    })

    return schemaDefine;
}

export function parseAndWrite(sourcePath: string, clientPath: string, serverPath: string) {
    const result = parseToJsonSchem(sourcePath);
    fs.writeFileSync(clientPath, protoType2JsonSchemaType(JSON.stringify(result.client, null, 4)));
    fs.writeFileSync(serverPath, protoType2JsonSchemaType(JSON.stringify(result.server, null, 4)));
}
