import { Command } from 'commander';
import { CUR_DIR, INIT_PROJ_NOTICE } from '../utils/constants';
import { confirm, abort, version, prompt } from '../utils/utils';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

export default function (program: Command) {
    program.command('init [path]')
        .description('create a new application')
        .action(function (path) {
            init(path || CUR_DIR);
        });
}

/**
 * Get user's choice on connector selecting
 *
 * @param {Function} cb
 */
function connectorType(cb: Function) {
    prompt('Please select underly connector, 1 for websocket(native socket), 2 for socket.io, 3 for wss, 4 for socket.io(wss), 5 for udp, 6 for mqtt: [1]', function (msg: string) {
        console.log('selected', msg);
        switch (msg.trim()) {
            case '':
                cb(1);
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                cb(msg.trim());
                break;
            default:
                console.log(('Invalid choice! Please input 1 - 5.' as any).red + '\n');
                connectorType(cb);
                break;
        }
    });
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */
export function emptyDirectory(path: string) {
    if (!fs.existsSync(path))
        return true;
    let files = fs.readdirSync(path);
    return (!files || !files.length);
}

/**
 * Init application at the given directory `path`.
 *
 * @param {String} path
 */
function init(path: string) {
    console.log(INIT_PROJ_NOTICE);
    connectorType(function (type: string) {
        let empty = emptyDirectory(path);
        if (empty) {
            process.stdin.destroy();
            console.log('start createApplication');
            createApplicationAt(path, type);
        } else {
            confirm('Destination is not empty, continue? (y/n) [no] ', function (force: boolean) {
                process.stdin.destroy();
                if (force) {
                    createApplicationAt(path, type);
                } else {
                    abort(('Fail to init a project' as any).red);
                }
            });
        }
    });
}


/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */
function mkdir(path: string) {
    let err = mkdirp.sync(path, 0o755);

    console.log(('   create : ' as any).green + path);

}
/**
 * Copy template files to project.
 *
 * @param {String} origin
 * @param {String} target
 */
function copy(origin: string, target: string) {
    if (!fs.existsSync(origin)) {
        abort(origin + 'does not exist.');
    }
    if (!fs.existsSync(target)) {
        mkdir(target);
        console.log(('   create : ' as any).green + target);
    }
    let datalist = fs.readdirSync(origin);

    for (let i = 0; i < datalist.length; i++) {
        let oCurrent = path.resolve(origin, datalist[i]);
        let tCurrent = path.resolve(target, datalist[i]);
        if (fs.statSync(oCurrent).isFile()) {
            console.log(('   create : ' as any).green + tCurrent + ' from : ' + oCurrent);
            fs.writeFileSync(tCurrent, fs.readFileSync(oCurrent));
        } else if (fs.statSync(oCurrent).isDirectory()) {
            copy(oCurrent, tCurrent);
        }
    }
}

/**
 * Create directory and files at the given directory `path`.
 *
 * @param {String} ph
 */
function createApplicationAt(ph: string, type: string) {
    let name = path.basename(path.resolve(CUR_DIR, ph));
    copy(path.join(__dirname, '../../../template/'), ph);
    mkdir(path.join(ph, 'build/logs'));
    mkdir(path.join(ph, 'shared'));
    // rmdir -r
    let rmdir = function (dir: string) {
        let list = fs.readdirSync(dir);
        for (let i = 0; i < list.length; i++) {
            let filename = path.join(dir, list[i]);
            let stat = fs.statSync(filename);
            if (filename === '.' || filename === '..') {
            } else if (stat.isDirectory()) {
                rmdir(filename);
            } else {
                fs.unlinkSync(filename);
            }
        }
        fs.rmdirSync(dir);
    };
    let unlinkFiles: string[];
    switch (type) {
        case '1':
            // use websocket
            unlinkFiles = ['app.ts.sio',
                'app.ts.wss',
                'app.ts.mqtt',
                'app.ts.sio.wss',
                'app.ts.udp'];
            for (let i = 0; i < unlinkFiles.length; ++i) {
                let f = path.resolve(ph, unlinkFiles[i]);
                console.log('delete : ' + f);
                fs.unlinkSync(f);
            }
            break;
        case '2':
            // use socket.io
            unlinkFiles = ['app.ts',
                'app.ts.wss',
                'app.ts.udp',
                'app.ts.mqtt',
                'app.ts.sio.wss'];
            for (let i = 0; i < unlinkFiles.length; ++i) {
                fs.unlinkSync(path.resolve(ph, unlinkFiles[i]));
            }

            fs.renameSync(path.resolve(ph, 'app.ts.sio'), path.resolve(ph, 'app.ts'));
            break;
        case '3':
            // use websocket wss
            unlinkFiles = ['app.ts.sio',
                'app.ts',
                'app.ts.udp',
                'app.ts.sio.wss',
                'app.ts.mqtt'];
            for (let i = 0; i < unlinkFiles.length; ++i) {
                fs.unlinkSync(path.resolve(ph, unlinkFiles[i]));
            }

            fs.renameSync(path.resolve(ph, 'app.ts.wss'), path.resolve(ph, 'app.ts'));
            break;
        case '4':
            // use socket.io wss
            unlinkFiles = ['app.ts.sio',
                'app.ts',
                'app.ts.udp',
                'app.ts.wss',
                'app.ts.mqtt'];
            for (let i = 0; i < unlinkFiles.length; ++i) {
                fs.unlinkSync(path.resolve(ph, unlinkFiles[i]));
            }

            fs.renameSync(path.resolve(ph, 'app.ts.sio.wss'), path.resolve(ph, 'app.ts'));
            break;
        case '5':
            // use socket.io wss
            unlinkFiles = ['app.ts.sio',
                'app.ts',
                'app.ts.wss',
                'app.ts.mqtt',
                'app.ts.sio.wss']
            for (let i = 0; i < unlinkFiles.length; ++i) {
                fs.unlinkSync(path.resolve(ph, unlinkFiles[i]));
            }

            fs.renameSync(path.resolve(ph, 'app.ts.udp'), path.resolve(ph, 'app.ts'));
            break;
        case '6':
            // use socket.io
            unlinkFiles = ['app.ts',
                'app.ts.wss',
                'app.ts.udp',
                'app.ts.sio',
                'app.ts.sio.wss']
            for (let i = 0; i < unlinkFiles.length; ++i) {
                fs.unlinkSync(path.resolve(ph, unlinkFiles[i]));
            }

            fs.renameSync(path.resolve(ph, 'app.ts.mqtt'), path.resolve(ph, 'app.ts'));
            break;
    }
    let replaceFiles = ['app.ts',
        'package.json'];
    for (let j = 0; j < replaceFiles.length; j++) {
        let str = fs.readFileSync(path.resolve(ph, replaceFiles[j])).toString();
        fs.writeFileSync(path.resolve(ph, replaceFiles[j]), str.replace('$', name));
    }
    let f = path.resolve(ph, 'package.json');
    let content = fs.readFileSync(f).toString();
    fs.writeFileSync(f, content.replace('#', version));
}

