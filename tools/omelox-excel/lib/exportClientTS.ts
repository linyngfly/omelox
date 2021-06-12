import * as path from 'path';
import * as fs from 'fs';
import { FIELD_TYPE, CONFIG_SKIP_ROW, FIELD_RULE, CONFIG_TYPE } from './constants';
import ExportServerTS from './exportServerTS';

const TSTypeLink: any = {};
TSTypeLink[FIELD_TYPE.FLOAT] = 'number';
TSTypeLink[FIELD_TYPE.INT] = 'number';
TSTypeLink[FIELD_TYPE.STRING] = 'string';
TSTypeLink[FIELD_TYPE.TABLE] = 'any';

export default class ExportClientTS extends ExportServerTS {
    protected genBaseModel(): void {
        let str = `import path = require('path');
import fs = require('fs');

/** 配置模型基础类 */
export abstract class config_model_base {
    /** 获取文件链接 */
    public static getUrl(filename: string): string {
        let configUrl = null;
        let dir = this.isPublic() ? 'public' : process.env.PUB_PLATFORM;

        if (process.env.CONFIG_DIR) {
            configUrl = \`\${path.join(process.env.CONFIG_DIR, dir, filename)}\`;
        } else {
            configUrl = \`\${path.join(__dirname, dir, filename)}\`;
        }

        return configUrl;
    }

    /** 加载文件 */
    public static loadJson(configUrl: string): any {
        if (!fs.existsSync(configUrl)) {
            console.log(\`配置文件\${configUrl}不存在\`);
            return;
        }
        return require(configUrl);
    }

    /** 公共配置 */
    public static isPublic(): boolean {
        return false;
    }
}

export interface ConfigClass<T extends config_model_base> {
    new(): T;
    FIELDS?: any;
    getUrl(filename: string): string;
    loadJson(configUrl: string): any;
    getConfigName(filename?: string): string;
    getClassName(): string;
    /** 公共配置 */
    isPublic(): boolean;
}`;

        let targetFilename = `${this.outRootDir}/config_model.ts`;
        const pathInfo = path.parse(targetFilename);
        this.mkdirsSync(pathInfo.dir);
        fs.writeFileSync(targetFilename, str);
    }
}