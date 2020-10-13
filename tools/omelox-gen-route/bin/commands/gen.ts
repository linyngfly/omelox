require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
import { genHTTPRouteFile, genWSLocalRouteFile, genWSMapRouteFile, genWSRouteFile } from '../../lib/utils';

export default function (programs: program.CommanderStatic) {
    programs.command('gen')
        .description('gen proto protocol')
        .option('-w, --wsroute <wsroute define directory>', 'Gen ws route define file', 'shared/protocols/ws,shared/protocols/ws.push.routes.ts')
        .option('-l, --wslocalroute <wslocalroute define directory>', 'Gen ws local route define file', 'shared/protocols/ws,shared/protocols/ws.local.routes.ts')
        .option('-m, --wsroutemap <wsroutemap define directory>', 'Gen ws route map define file', 'shared/protocols/ws,shared/protocols/ws.map.routes.ts')
        .option('-h, --httproute <httproute define directory>', 'Gen http route define file', 'shared/protocols/http,shared/protocols/http.routes.ts')
        .action(function (opts) {
            gen(opts);
        });
}

function abort(str: string) {
    console.error(str);
    process.exit(1);
}

const WS_ROUTE_PARAM_INVALID = ('WS route param invalid,\nplease check specified by option `--wsroute`.\n' as any).red;
const WS_LOCAL_ROUTE_PARAM_INVALID = ('WS local route param invalid,\nplease check specified by option `--wslocalroute`.\n' as any).red;
const WS_MAP_ROUTE_PARAM_INVALID = ('WS route map param invalid,\nplease check specified by option `--wsroutemap`.\n' as any).red;
const HTTP_ROUTE_PARAM_INVALID = ('HTTP route param invalid,\nplease check specified by option `--httproute`.\n' as any).red;


function gen(opts: any) {
    if (opts.wsroute) {
        // 生成ws路由定义文件
        let arr = opts.wsroute.split(',');
        if (arr.length !== 2) {
            abort(WS_ROUTE_PARAM_INVALID);
        }
        let srcDir = arr[0];
        let targetFile = arr[1];
        if (!fs.existsSync(srcDir)) {
            abort(WS_ROUTE_PARAM_INVALID);
        }
        genWSRouteFile(srcDir, targetFile);
    }

    if (opts.wslocalroute) {
        // 生成ws路由定义文件
        let arr = opts.wslocalroute.split(',');
        if (arr.length !== 2) {
            abort(WS_LOCAL_ROUTE_PARAM_INVALID);
        }
        let srcDir = arr[0];
        let targetFile = arr[1];
        if (!fs.existsSync(srcDir)) {
            abort(WS_LOCAL_ROUTE_PARAM_INVALID);
        }
        genWSLocalRouteFile(srcDir, targetFile);
    }

    if (opts.wsroutemap) {
        // 生成ws路由定义文件
        let arr = opts.wsroutemap.split(',');
        if (arr.length !== 2) {
            abort(WS_MAP_ROUTE_PARAM_INVALID);
        }
        let srcDir = arr[0];
        let targetFile = arr[1];
        if (!fs.existsSync(srcDir)) {
            abort(WS_MAP_ROUTE_PARAM_INVALID);
        }
        genWSMapRouteFile(srcDir, targetFile);
    }

    if (opts.httproute) {
        // 生成http路由定义文件
        let arr = opts.httproute.split(',');
        if (arr.length !== 2) {
            abort(WS_ROUTE_PARAM_INVALID);
        }
        let srcDir = arr[0];
        let targetFile = arr[1];
        if (!fs.existsSync(srcDir)) {
            abort(HTTP_ROUTE_PARAM_INVALID);
        }
        genHTTPRouteFile(srcDir, targetFile);
    }

}