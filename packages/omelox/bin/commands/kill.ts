import { Command } from 'commander';
import { terminal } from '../utils/utils';
import { DEFAULT_USERNAME, DEFAULT_PWD, DEFAULT_MASTER_HOST, DEFAULT_MASTER_PORT } from '../utils/constants';

export default function (program: Command) {
    program.command('kill')
        .description('kill the application, for multiple servers, use `omelox stop server-id-1 server-id-2`')
        .option('-u, --username <username>', 'administration user name', DEFAULT_USERNAME)
        .option('-p, --password <password>', 'administration password', DEFAULT_PWD)
        .option('-h, --host <master-host>', 'master server host', DEFAULT_MASTER_HOST)
        .option('-P, --port <master-port>', 'master server port', (value) => parseInt(value), DEFAULT_MASTER_PORT)
        .option('-f, --force', 'using this option would kill all the node processes')
        .action((opts) => {
            let args = [].slice.call(arguments, 0);
            let command = args[args.length - 1];
            opts.serverIds = command.args.slice();
            terminal('kill', opts);
        });
}