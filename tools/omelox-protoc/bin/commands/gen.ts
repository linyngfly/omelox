require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseAndWrite } from '../../lib/utils';

export default function (programs: program.CommanderStatic) {
    programs.command('gen')
        .description('gen proto protocol')
        .option('-i, --interfacedir <interface define directory>', 'The interface define directory')
        .option('-s, --serverfile <server proto filename>', 'Gen server proto filename ./path/serverProtos.json', 'serverProtos.json')
        .option('-c, --clientfile <client proto filename>', 'Gen client proto filename ./path/clientProtos.json', 'clientProtos.json')
        .option('-d, --dictionaryfile <dictionary filename>', 'Gen dictionary filename ./path/dictionary.json', 'dictionary.json')
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
const DICTIONARY_FILE_NOT_FOUND = ('dictionary filename invalid,\nplease check the current work directory or the directory specified by option `--dictionaryfile`.\n' as any).red;

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

    let dicdir = path.parse(opts.dictionaryfile).dir;
    let dicname = path.parse(opts.dictionaryfile).name;
    let dicext = path.parse(opts.dictionaryfile).ext;
    console.log(22, dicdir, dicname);
    if (!dicext || !dicname || dicdir !== '' && !fs.existsSync(dicdir)) {
        abort(DICTIONARY_FILE_NOT_FOUND);
    }

    parseAndWrite(opts.interfacedir, opts.clientfile, opts.serverfile, opts.dictionaryfile);
}