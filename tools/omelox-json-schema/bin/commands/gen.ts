require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseAndWrite } from '../../lib/utils';

export default function (programs: program.CommanderStatic) {
    programs.command('gen')
        .description('gen json schema protocol')
        .option('-i, --interfacedir <interface define directory>', 'The interface define directory')
        .option('-s, --serverfile <server proto filename>', 'Gen server json schema filename ./path/serverSchemas.json', 'serverSchemas.json')
        .option('-c, --clientfile <client proto filename>', 'Gen client json schema filename ./path/clientSchemas.json', 'clientSchemas.json')
        .action(function (opts) {
            gen(opts);
        });
}

function abort(str: string) {
    console.error(str);
    process.exit(1);
}

const INTERFACE_DIR_NOT_FOUND = ('Fail to find interface define directory,\nplease check the current work directory or the directory specified by option `--interfacedir`.\n' as any).red;
const SERVER_PROTO_FILE_NOT_FOUND = ('server proto filename invalid,\nplease check the current work directory or the directory specified by option `--serverfile`.\n' as any).red;
const CLIENT_PROTO_FILE_NOT_FOUND = ('client proto filename invalid,\nplease check the current work directory or the directory specified by option `--clientfile`.\n' as any).red;

function gen(opts: any) {
    if (!fs.existsSync(opts.interfacedir)) {
        abort(INTERFACE_DIR_NOT_FOUND);
    }

    let sdir = path.parse(opts.serverfile).dir;
    let sname = path.parse(opts.serverfile).name;
    let sext = path.parse(opts.serverfile).ext;
    console.log(11, sdir, sname);
    if (!sext || !sname || sdir !== '' && !fs.existsSync(sdir)) {
        abort(SERVER_PROTO_FILE_NOT_FOUND);
    }

    let cdir = path.parse(opts.clientfile).dir;
    let cname = path.parse(opts.clientfile).name;
    let cext = path.parse(opts.clientfile).ext;
    console.log(22, cdir, cname);
    if (!cext || !cname || cdir !== '' && !fs.existsSync(cdir)) {
        abort(CLIENT_PROTO_FILE_NOT_FOUND);
    }

    parseAndWrite(opts.interfacedir, opts.clientfile, opts.serverfile);
}