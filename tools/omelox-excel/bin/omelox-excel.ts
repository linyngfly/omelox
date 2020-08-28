import * as commander from 'commander';
import * as fs from 'fs';
import { isFunction } from 'util';
const version = require('../package.json').version;
const COMMAND_ERROR = ('Illegal command format. Use `omelox-excel --help` to get more info.\n' as any).red;

commander.version(version);

commander.command('*')
    .action(function () {
        console.log(COMMAND_ERROR);
    });

fs.readdirSync(__dirname + '/commands').forEach(function (filename) {
    if (/\.js$/.test(filename)) {
        let name = filename.substr(0, filename.lastIndexOf('.'));
        let _command = require('./commands/' + name).default;
        if (isFunction(_command)) {
            _command(commander);
        }
    }
});

commander.parse(process.argv);