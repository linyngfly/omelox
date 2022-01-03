import { Command } from 'commander';
import { terminal } from '../utils/utils';
import { DEFAULT_USERNAME, DEFAULT_PWD, DEFAULT_MASTER_HOST, DEFAULT_MASTER_PORT } from '../utils/constants';

export default function (program: Command) {
    program.command('stop')
        .description('stop the servers, for multiple servers, use `omelox stop server-id-1 server-id-2`')
        .option('-u, --username <username>', 'administration user name', DEFAULT_USERNAME)
        .option('-p, --password <password>', 'administration password', DEFAULT_PWD)
        .option('-h, --host <master-host>', 'master server host', DEFAULT_MASTER_HOST)
        .option('-P, --port <master-port>', 'master server port', (value) => parseInt(value), DEFAULT_MASTER_PORT)
        .action(function (opts) {
            let args = [].slice.call(arguments, 0);
            opts.serverIds = args.slice(0, -1);
            terminal('stop', opts);
        });
}