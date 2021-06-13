import * as path from 'path';
import * as fs from 'fs';
import ExportServerTS from './exportServerTS';

export default class ExportClientTS extends ExportServerTS {
    protected getHandlerOutDir() {
        return `${this.outRootDir}/handler`;
    }

    protected getLanOutDir() {
        return `${this.outRootDir}/config_i18n`
    }

    protected getDataOutDir(pub: string, isPublic: boolean) {
        let dir = `${this.outRootDir}/config_${pub}`;
        if (isPublic) {
            dir = `${this.outRootDir}/config_public`;
        }

        return dir;
    }

    protected genBaseModel(): void {
        let str = `
export type JsonLoaderHander = (filename: string) => any;

/** 配置模型基础类 */
export abstract class config_model_base {
    private static loaderHander: JsonLoaderHander;

    /** 获取文件链接 */
    public static getUrl(filename: string): string {
        let configUrl = null;
        let dir = this.isPublic() ? 'config_public' : \`config_\${window['PubPlatform']}\`;

        if (window['RemoteConfigURL']) {
            configUrl = \`\${window['RemoteConfigURL']}/\${dir}/\${filename}\`
        } else {
            configUrl = \`\${dir}/\${filename}\`
        }

        return configUrl;
    }

    /** 加载文件 */
    public static loadJson(configUrl: string): any {
        return this.loaderHander(configUrl)
    }

    /** 公共配置 */
    public static isPublic(): boolean {
        return false;
    }

    /** 设置配置加载器 */
    public static setJsonLoaderHandler(handler: JsonLoaderHander) {
        this.loaderHander = handler;
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

        let targetFilename = `${this.getHandlerOutDir()}/config_model.ts`;
        const pathInfo = path.parse(targetFilename);
        this.mkdirsSync(pathInfo.dir);
        fs.writeFileSync(targetFilename, str);
    }

    protected genLangModel(filename: string, content: string, fields: number, fieldsDef: number, datas: any[]): void {
        const oriFilename = path.parse(filename).name;
        let modelrName = `${oriFilename}_model`;

        let str = `import { config_model_base } from './config_model';
import { lang_model_map } from './lang_model_map';

/**
 * ${content}
 */
export class ${modelrName} extends config_model_base {\r\n`
        if (fieldsDef) {
            // 字段定义
            str += this._genLangFieldDefine(datas);
            str += `\r\n`
        }

        if (fields === 1) {
            str += `\tpublic static readonly FIELDS = {\r\n`
            str += this._genLangFields(datas);
            str += `\t}\r\n`
        }

        str += `\r\n`
        str += `\tpublic static getClassName(): string {
        return \'${modelrName}\'
    }

    public static getConfigName(filename?: string): string {
		return \`${oriFilename}-\${filename}.json\`;
    }

    public static getUrl(filename: string): string {
		let configUrl = null;

        if (window['RemoteConfigURL']) {
            configUrl = \`\${window['RemoteConfigURL']}/config_i18n/\${filename}\`
        } else {
            configUrl = \`config_i18n/\${filename}\`
        }

		return configUrl;
	}
}

lang_model_map.add(${modelrName});`

        fs.writeFileSync(`${path.parse(filename).dir}/${modelrName}.ts`, str);
    }

    protected genErrorModel(filename: string, content: string, datas: any[], baseCodeConfig: {
        path: string,
        baseCode: string,
        baseObj: string
    }): void {
        const oriFilename = path.parse(filename).name;
        let modelrName = `${oriFilename}_model`;
        let str = '';
        if (baseCodeConfig) {
            str += `import { ${baseCodeConfig.baseCode}, ${baseCodeConfig.baseObj}} from '${baseCodeConfig.path}';\r\n`
        }
        str += `import { config_model_base } from './config_model';

/**
 * ${content}
 */
export class ${modelrName} extends config_model_base {\r\n`
        str += `\r\n`
        str += `\tpublic static getClassName(): string {
        return \'${modelrName}\'
    }

    public static getConfigName(filename?: string): string {
		return \`${oriFilename}-\${filename}.json\`;
    }

    public static getUrl(filename: string): string {
		let configUrl = null;
        if (window['RemoteConfigURL']) {
            configUrl = \`\${window['RemoteConfigURL']}/config_i18n/\${filename}\`
        } else {
            configUrl = \`config_i18n/\${filename}\`
        }
		return configUrl;
	}
}`
        str += `\r\n`
        str += `export const ${oriFilename} = {\r\n`
        if (baseCodeConfig) {
            str += `\t...${baseCodeConfig.baseCode},\r\n`
        }
        // 字段定义
        str += this._genErrorFieldDefine(datas);
        str += `}\r\n`

        str += `export const ${oriFilename}_key = {};\r\n`
        str += `for (let [k, v] of Object.entries(${oriFilename})) {\r\n`
        str += `\t${oriFilename}_key[v] = k;\r\n`
        str += `}\r\n`

        str += `\r\n`
        str += `export const ${oriFilename}_obj = {\r\n`
        if (baseCodeConfig) {
            str += `\t...${baseCodeConfig.baseObj},\r\n`
        }
        // 字段定义
        str += this._genErrorFieldObj(datas);
        str += `}`

        fs.writeFileSync(`${path.parse(filename).dir}/${modelrName}.ts`, str);
    }
}