import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import * as constants from '../../lib/util/constants';
import { abort } from '../utils/utils';
import { DEFAULT_ENV, DEFAULT_GAME_SERVER_DIR, SCRIPT_NOT_FOUND, DAEMON_INFO } from '../utils/constants';
import { spawn } from 'child_process';

export default function (program: Command) {
    program.command('start')
        .description('start the application')
        .option('-e, --env <env>', 'the used environment', DEFAULT_ENV)
        .option('-D, --daemon', 'enable the daemon start')
        .option('-d, --directory, <directory>', 'the code directory', DEFAULT_GAME_SERVER_DIR)
        .option('-t, --type <server-type>,', 'start server type')
        .option('-i, --id <server-id>', 'start server id')
        .option('-n, --net <net-index>', 'set net adapter name, default auto set first available')
        .option('-p, --pub <pub-env>', 'set publish env')
        .action(function (opts) {
            start(opts);
        });
}
/**
 * Start application.
 *
 * @param {Object} opts options for `start` operation
 */
function start(opts: any) {
    let absScript = path.resolve(opts.directory, 'app.js');
    if (!fs.existsSync(absScript)) {
        abort(SCRIPT_NOT_FOUND);
    }

    let logDir = path.resolve(opts.directory, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    let ls;
    let type = opts.type || constants.RESERVED.ALL;
    let params = [absScript, 'env=' + opts.env, 'type=' + type];
    if (!!opts.id) {
        params.push('startId=' + opts.id);
    }
    if (!!opts.net) {
        params.push('net=' + opts.net);
    }
    if (!!opts.pub) {
        params.push('pub=' + opts.pub);
    }
    if (opts.daemon) {
        ls = spawn(process.execPath, params, { detached: true, stdio: 'ignore' });
        ls.unref();
        console.log(DAEMON_INFO);
        process.exit(0);
    } else {
        ls = spawn(process.execPath, params);
        ls.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        ls.stderr.on('data', function (data) {
            console.log(data.toString());
        });
    }
}