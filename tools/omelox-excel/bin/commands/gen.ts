require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
import ExportTS from '../../lib/exportTS';

export default function (programs: program.CommanderStatic) {
    programs.command('gen')
        .description('gen excels to json config')
        .option('-c, --channel <publish channel>', 'the used publish channel', 'default')
        .option('-i, --inputdir <input directory>', 'excel input dir')
        .option('-o, --outdir <out directory>', 'the gen directory')
        .option('-t, --type <server(1) or client(2) type>', 'gen config type server or client', 1)
        .action(function (opts) {
            gen(opts);
        });
}

function abort(str: string) {
    console.error(str);
    process.exit(1);
}

const EXCEL_DIR_NOT_FOUND = ('Fail to find excel input directory,\nplease check the current work directory or the directory specified by option `--inputdir`.\n' as any).red;
const OUT_DIR_NOT_FOUND = ('Fail to find config output directry,\nplease check the current work directory or the directory specified by option `--outdir`.\n' as any).red;

function gen(opts: any) {
    if (!fs.existsSync(opts.inputdir)) {
        abort(EXCEL_DIR_NOT_FOUND);
    }

    if (!fs.existsSync(opts.outdir)) {
        abort(OUT_DIR_NOT_FOUND);
    }

    let exportTS = new ExportTS(opts);
    exportTS.genConfig();
}