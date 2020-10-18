#!/usr/bin/env node
require('cliff');
import * as program from 'commander';
import * as fs from 'fs';
const version = require('../../package.json').version;
const COMMAND_ERROR = ('Illegal command format. Use `omelox-gen-route --help` to get more info.\n' as any).red;

program.version(version);

program.command('*')
    .action(function () {
        console.log(COMMAND_ERROR);
    });

fs.readdirSync(__dirname + '/commands').forEach(function (filename) {
    if (/\.js$/.test(filename)) {
        let name = filename.substr(0, filename.lastIndexOf('.'));
        let _command = require('./commands/' + name).default;
        if (typeof _command === 'function') {
            _command(program);
        }
    }
});

program.parse(process.argv);