
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

function walkDir(dir, handler, filters = []) {
    fs.readdirSync(dir).forEach(function (filename) {
        if (filters.indexOf(filename) !== -1) {
            return;
        }
        // console.log('walkDir=', filename)
        const _path = dir + '/' + filename;
        const stat = fs.statSync(_path);
        if (stat && stat.isDirectory()) {
            walkDir(_path, handler, filters);
        }
        else {
            if (handler) {
                handler(_path);
            }
        }
    });
}

export function genWSRouteFile(routeSrcDir: string, routeFilePath: string) {
    const tsFileNames: string[] = [];

    walkDir(routeSrcDir, (val: string) => {
        if (!val.endsWith('.ts')) {
            return;
        }
        tsFileNames.push(path.parse(val).name);
    }, ['impl']);

    let dicObj: any = {};
    for (let item of tsFileNames) {
        let arr = item.split('.');
        if (arr.length !== 3) {
            continue;
        }

        let serverTag = arr[0];
        let moduleTag = arr[1];
        if (moduleTag.endsWith('Handler')) {
            moduleTag = moduleTag.substr(0, moduleTag.search('Handler'));
        }
        let nameTag = arr[2];
        let typeTag = '';
        if (nameTag.startsWith('c_')) {
            typeTag = 'request'
        } else if (nameTag.startsWith('s_')) {
            typeTag = 'push'
        } else if (nameTag.startsWith('n_')) {
            typeTag = 'notify'
        } else {
            continue;
        }

        if (!dicObj[serverTag]) {
            dicObj[serverTag] = {};
        }

        if (!dicObj[serverTag][moduleTag]) {
            dicObj[serverTag][moduleTag] = {};
        }

        if (!dicObj[serverTag][moduleTag][typeTag]) {
            dicObj[serverTag][moduleTag][typeTag] = {};
        }

        dicObj[serverTag][moduleTag][typeTag][nameTag] = item;
    }

    let data = `export const wsRoutes = ${util.inspect(dicObj, { depth: 10 })}`;
    fs.writeFileSync(routeFilePath, data);
}

export function genWSLocalRouteFile(routeSrcDir: string, routeFilePath: string) {
    const tsFileNames: string[] = [];

    walkDir(routeSrcDir, (val: string) => {
        if (!val.endsWith('.ts')) {
            return;
        }
        tsFileNames.push(path.parse(val).name);
    }, ['impl']);

    let dicObj: any = {};
    for (let item of tsFileNames) {
        let arr = item.split('.');
        if (arr.length !== 3) {
            continue;
        }

        let serverTag = arr[0];
        let moduleTag = arr[1];
        if (moduleTag.endsWith('Handler')) {
            moduleTag = moduleTag.substr(0, moduleTag.search('Handler'));
        }
        let nameTag = arr[2];
        let typeTag = '';
        if (nameTag.startsWith('c_')) {
            typeTag = 'request'
        } else if (nameTag.startsWith('s_')) {
            typeTag = 'push'
        } else if (nameTag.startsWith('n_')) {
            typeTag = 'notify'
        } else {
            continue;
        }

        if (!dicObj[serverTag]) {
            dicObj[serverTag] = {};
        }

        if (!dicObj[serverTag][moduleTag]) {
            dicObj[serverTag][moduleTag] = {};
        }

        if (!dicObj[serverTag][moduleTag][typeTag]) {
            dicObj[serverTag][moduleTag][typeTag] = {};
        }

        dicObj[serverTag][moduleTag][typeTag][nameTag] = nameTag;
    }

    let data = `export const wsRoutes = ${util.inspect(dicObj, { depth: 10 })}`;
    fs.writeFileSync(routeFilePath, data);
}

export function genHTTPRouteFile(routeSrcDir: string, routeFilePath: string) {
    const tsFileNames: string[] = [];

    walkDir(routeSrcDir, (val: string) => {
        if (!val.endsWith('.ts')) {
            return;
        }
        tsFileNames.push(path.parse(val).name);
    }, ['impl']);

    let dicObj: any = {};
    for (let item of tsFileNames) {
        let arr = item.split('.');
        if (arr.length !== 3) {
            continue;
        }

        let serverTag = arr[0];
        let moduleTag = arr[1];
        if (moduleTag.endsWith('Handler')) {
            moduleTag = moduleTag.substr(0, moduleTag.search('Handler'));
        }
        let nameTag = arr[2];

        if (!dicObj[serverTag]) {
            dicObj[serverTag] = {};
        }

        if (!dicObj[serverTag][moduleTag]) {
            dicObj[serverTag][moduleTag] = {};
        }
        dicObj[serverTag][moduleTag][nameTag] = `/${item.replace(/\./g, '/')}`;
    }

    let data = `export const httpRoutes = ${util.inspect(dicObj, { depth: 10 })}`;
    fs.writeFileSync(routeFilePath, data);
}
