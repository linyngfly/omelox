import { Application, IPlugin } from 'omelox';
import { Robot, RobotCfg } from 'omelox-robot';
import * as  fs from 'fs';
import { argv } from 'yargs';

console.log('启动robotAgent');

let arg = argv as any;

let config = {
    master: { host: arg.host, port: arg.port, interval: arg.interval }
} as RobotCfg;

let robot = new Robot(config, {});
robot.runAgent(arg.scriptFile as any);

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
    if (!!robot && !!robot.agent) {
        // robot.agent.socket.emit('crash', err.stack);
    }
    fs.appendFile('./log/.log', err.stack, function (err) { });
});
