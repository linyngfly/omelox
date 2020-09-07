import * as path from 'path';
import { resolve } from 'path';
import * as TJS from 'typescript-json-schema';
import * as Ajv from 'ajv';
import { Definition, JsonSchemaGenerator } from 'typescript-json-schema';
import * as fs from 'fs';
import * as util from 'util';

const ajv = new Ajv();

function log(...args) {
    console.log(...args);
}

function error(msg, ...args) {
    const str = util.format(msg, ...args);
    console.error(str);
    throw new Error(str);
}

let responseStr = '_Res';
let requestStr = '_Req';
let MergeMessage = false

/**
 * 校验数据
 * @param schema json schema 结构
 * @param data 校验数据
 */
export function jsonSchemaValidate(schema: any, data: any): string {
    let res = ajv.validate(schema, data);
    if (!res) {
        return JSON.stringify(ajv.errors);
    }
}

/**
 * @param baseDir
 * @param reqStr
 * @param resStr
 * @param mergeMessage message 结构放到顶层 (默认的客户端不支持,需要修改客户端)
 */
export function parseToJsonSchem(baseDir: string, reqStr = '_Req', resStr = '_Res', mergeMessage = false): { client: object, server: object } {
    responseStr = resStr;
    requestStr = reqStr;
    MergeMessage = mergeMessage
    let retObj = { client: {}, server: {} };
    const files = fs.readdirSync(baseDir);
    const tsFilePaths: string[] = [];
    files.forEach(val => {
        if (!val.endsWith('.ts')) {
            return;
        }
        tsFilePaths.push(resolve(baseDir + '/' + val));
    });

    // optionally pass argument to schema generator
    const settings: TJS.PartialArgs = {
        required: true
    };

    // optionally pass ts compiler options
    const compilerOptions: TJS.CompilerOptions = {
        strictNullChecks: true
    };
    const program = TJS.getProgramFromFiles(tsFilePaths, compilerOptions, baseDir);
    const generator = TJS.buildGenerator(program, settings);
    // all symbols

    const symbols = generator.getMainFileSymbols(program);
    let clientMessages = {}
    let serverMessages = {}
    files.forEach(val => {
        if (!val.endsWith('.ts')) {
            return;
        }
        if (!mergeMessage) {
            clientMessages = {}
            serverMessages = {}
        }
        const obj = parseFile(baseDir, val, program, generator, symbols, clientMessages, serverMessages);
        const tmp = path.parse(val);
        let name = tmp.name.replace(/\./g, '/');
        retObj.client[name] = obj.client;
        retObj.server[name] = obj.server;
    });
    retObj.client = sortMsg(retObj.client)
    retObj.server = sortMsg(retObj.server)
    return retObj;
}

function sortMsg(obj) {
    let arr: { k: string, v: object }[] = []
    for (let k in obj) {
        arr.push({ k: k, v: obj[k] })
    }
    arr.sort((a, b) => {
        if (a.k.includes('.')) {
            if (b.k.includes('.')) {
                return a.k > b.k ? 1 : -1
            }
            return -1
        }
        if (b.k.includes('.')) {
            return 1
        }
        return a.k > b.k ? 1 : -1
    })
    let newObj = {}
    for (let v of arr) {
        newObj[v.k] = v.v
    }
    return newObj
}

function parseFile(baseDir: string, filename: string, program: TJS.Program, generator: JsonSchemaGenerator, symbols: string[], clientMessages, serverMessages) {
    if (!symbols || !symbols.length) {
        return;
    }
    const filePath = path.parse(filename);
    filename = filePath.name.replace(/\./g, '_');

    let symbolClient;
    if (symbols.includes(filename + requestStr)) {
        symbolClient = generator.getSchemaForSymbol(filename + requestStr);
    }
    let client;
    let server;
    if (symbolClient) {
        client = symbolClient;
        let symbolServer;
        if (symbols.includes(filename + responseStr)) {
            if (!client) {
                console.warn('WARNING:', filename, `has ${responseStr} without ${requestStr}`);
            }
            symbolServer = generator.getSchemaForSymbol(filename + responseStr);
        }
        if (!symbolServer) {
            if (client) {
                //   console.warn('WARNING:',filename,`has ${requestStr} without ${responseStr}`);
            }
            if (symbols.includes(filename)) {
                symbolServer = generator.getSchemaForSymbol(filename);
            }
        }
        if (!symbolServer) {
            return { client: client };
        }
        server = symbolServer;
        return { client: client, server: server };
    }
}