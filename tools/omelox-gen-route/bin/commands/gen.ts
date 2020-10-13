require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
import { genHTTPRouteFile, genWSRouteFile } from '../../lib/utils';

export default function (programs: program.CommanderStatic) {
    programs.command('gen')
        .description('gen proto protocol')
        .option('-w, --wsroute <wsroute define directory>', 'Gen ws route define file', 'shared/protocols/ws,shared/protocols/ws.routes.ts')
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