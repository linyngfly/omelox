require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
import ExportServerTS from '../../lib/exportServerTS';
import ExportClientTS from '../../lib/ExportClientTS';

export default function (programs: program.CommanderStatic) {
    programs.command('gen')
        .description('gen excels to json config')
        .option('-c, --channel <publish channel>', 'the used publish channel', 'default')
        .option('-i, --inputdir <input directory>', 'excel input dir')
        .option('-o, --outdir <out root directory>', 'the gen root directory')
        .option('-t, --type <server(1) or client(2) type>', 'gen config type server or client', 1)
        .option('-h, --getterdir <excel config data getter directory>', 'excel config data getter directory', '')
        .option('-s, --subdir <sub config path tag>', 'sub config path tag', '')
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

    if (Number(opts.type) === 2) {
        let exportTS = new ExportClientTS(opts);
        exportTS.genConfig();
    } else {
        let exportTS = new ExportServerTS(opts);
        exportTS.genConfig();
    }
}