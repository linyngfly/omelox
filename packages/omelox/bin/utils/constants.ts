
require('cliff');
/**
 *  Constant Variables
 */
export const TIME_INIT = 5 * 1000;
export const TIME_KILL_WAIT = 5 * 1000;
export const KILL_CMD_LUX = 'kill -9 `ps -ef|grep node|awk \'{print $2}\'`';
export const KILL_CMD_WIN = 'taskkill /im node.exe /f';

export const CUR_DIR = process.cwd();
export const DEFAULT_GAME_SERVER_DIR = CUR_DIR;
export const DEFAULT_USERNAME = 'admin';
export const DEFAULT_PWD = 'admin';
export const DEFAULT_ENV = 'development';
export const DEFAULT_MASTER_HOST = '127.0.0.1';
export const DEFAULT_MASTER_PORT = 3005;

export const CONNECT_ERROR = 'Fail to connect to admin console server.';
export const FILEREAD_ERROR = 'Fail to read the file, please check if the application is started legally.';
export const CLOSEAPP_INFO = 'Closing the application......\nPlease wait......';
export const ADD_SERVER_INFO = 'Successfully add server.';
export const RESTART_SERVER_INFO = 'Successfully restart server.';
export const INIT_PROJ_NOTICE = ('\nThe default admin user is: \n\n' + '  username' as any).green + ': admin\n  ' + ('password' as any).green + ': admin\n\nYou can configure admin users by editing adminUser.json later.\n ';
export const SCRIPT_NOT_FOUND = ('Fail to find an appropriate script to run,\nplease check the current work directory or the directory specified by option `--directory`.\n' as any).red;
export const MASTER_HA_NOT_FOUND = ('Fail to find an appropriate masterha config file, \nplease check the current work directory or the arguments passed to.\n' as any).red;
export const COMMAND_ERROR = ('Illegal command format. Use `omelox --help` to get more info.\n' as any).red;
export const DAEMON_INFO = 'The application is running in the background now.\n';
