import { getLogger } from 'omelox-logger';
import * as util from '../util';
import { consts } from '../consts';
require('cliff');
import { ICommand, AgentCommand } from '../command';
import { ReadLine } from 'readline';
import { AdminClient } from 'omelox-admin';
import * as path from 'path';
let logger = getLogger('omelox-cli', path.basename(__filename));


export default function (opts: object) {
    return new Command(opts);
}

export let commandId = 'add';
export let helpCommand = 'help add';

export class Command implements ICommand {
    constructor(opts: object) {

    }
    handle(agent: AgentCommand, comd: string, argv: string, msg: {[key: string]: string}, rl: ReadLine, client: AdminClient): void {
        if (!comd) {
            agent.handle(helpCommand, msg, rl, client);
            return;
        }

        let argvs = util.argsFilter(argv);

        rl.question(consts.ADD_QUESTION_INFO, function (answer) {
            if (answer === 'yes') {
                client.request(consts.CONSOLE_MODULE, {
                    signal: 'add',
                    args: argvs.slice(1)
                }, function (err: Error, data: { msg: { [key: string]: any } }) {
                        if (err) console.log(err);
                        else util.formatOutput(comd, data);
                        rl.prompt();
                    });
            } else {
                rl.prompt();
            }
        });
    }
}