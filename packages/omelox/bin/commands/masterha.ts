import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import * as constants from '../../lib/util/constants';
import { abort, runServer } from '../utils/utils';
import { DEFAULT_GAME_SERVER_DIR, MASTER_HA_NOT_FOUND } from '../utils/constants';

export default function (program: Command) {
    program.command('masterha')
    .description('start all the slaves of the master')
    .option('-d, --directory <directory>', 'the code directory', DEFAULT_GAME_SERVER_DIR)
    .action(function (opts) {
        startMasterha(opts);
    });
}

/**
 * Start master slaves.
 *
 * @param {String} option for `startMasterha` operation
 */
function startMasterha(opts: any) {
    let configFile = path.join(opts.directory, constants.FILEPATH.MASTER_HA);
    if (!fs.existsSync(configFile)) {
        abort(MASTER_HA_NOT_FOUND);
    }
    let masterha = require(configFile).masterha;
    for (let i = 0; i < masterha.length; i++) {
        let server = masterha[i];
        server.mode = constants.RESERVED.STAND_ALONE;
        server.masterha = 'true';
        server.home = opts.directory;
        runServer(server);
    }
}