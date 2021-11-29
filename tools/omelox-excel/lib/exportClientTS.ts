import * as path from 'path';
import * as fs from 'fs';
import ExportServerTS from './exportServerTS';
import { DocConfigKey } from './constants';

export default class ExportClientTS extends ExportServerTS {
    /** Getter配置输出目录 */
    getterdir: string;
    constructor(opts: any) {
        super(opts);
        this.getterdir = opts.getterdir;
    }
    protected getHandlerOutDir() {
        return this.getterdir || this.outRootDir;
    }

    /** 配置资源Bundle子目录 */
    get subdir(): any {
        let bundleName = this.docConfigKey.get(DocConfigKey.sub_bundle);
        if (!bundleName || bundleName.length === 0) {
            return;
        }
        return bundleName;
    }

    /** 多语言json数据输出目录 */
    protected getLanOutDir(lang?: string) {
        if (this.subdir) {
            return `${this.outRootDir}/config_${this.subdir}_i18n_${lang}/config_${this.subdir}_i18n_${lang}`;
        }
        return `${this.outRootDir}/config_i18n_${lang}/config_i18n_${lang}`;
    }

    /** json数据输出目录 */
    protected getDataOutDir(pub: string, isPublic: boolean) {
        let dir = this.subdir ? `${this.outRootDir}/config_${this.subdir}_${pub}/config_${this.subdir}_${pub}` : `${this.outRootDir}/config_${pub}/config_${pub}`;
        if (isPublic) {
            dir = this.subdir ? `${this.outRootDir}/config_${this.subdir}_common/config_${this.subdir}_common` : `${this.outRootDir}/config_common/config_common`;
        }
        return dir;
    }

    protected getModelGetUrl(): string {
        let str = `
    /** 获取文件链接 */
    public static getUrl(filename: string, lang?:string): string {
        let configUrl = null;`

        if (this.subdir) {
            str += `
        let dir = this.isPublic() ? 'config_${this.subdir}_common' : \`config_${this.subdir}_\${window['PubPlatform']}\`;
        `
        } else {
            str += `
        let dir = this.isPublic() ? 'config_common' : \`config_\${window['PubPlatform']}\`;   
            `
        }

        str += `if (window['RemoteConfigURL']) {
            configUrl = \`\${window['RemoteConfigURL']}/\${dir}/\${filename}\`
        } else {
            configUrl = \`\${dir}/\${filename}\`
        }

        return configUrl;
    }`
        return str;
    }

    protected genBaseModel(): void {
        let str = `
export type JsonLoaderHander = (filename: string) => any;

/** 配置模型基础类 */
export abstract class config_model_base {
    private static loaderHander: JsonLoaderHander;

    /** 获取文件链接 */
    public static getUrl(filename: string, lang?:string): string {
        let configUrl = null;
        let dir = this.isPublic() ? 'config_common' : \`config_\${window['PubPlatform']}\`;

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
    getUrl(filename: string, lang?: string): string;
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

    public static getUrl(filename: string, lang?: string): string {
		let configUrl = null;

        if (window['RemoteConfigURL']) {`
        if (this.subdir) {
            str += `
            configUrl = \`\${window['RemoteConfigURL']}/config_${this.subdir}_i18n_\${lang}/\${filename}\`;
            `
        } else {
            str += `
            configUrl = \`\${window['RemoteConfigURL']}/config_i18n_\${lang}/\${filename}\`;
            `
        }
        str += `
        } else {`

        if (this.subdir) {
            str += `
            configUrl = \`config_${this.subdir}_i18n_\${lang}/\${filename}\`;
            `
        } else {
            str += `
            configUrl = \`config_i18n_\${lang}/\${filename}\`;
            `
        }
        str += `   
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

    public static getUrl(filename: string, lang?: string): string {
		let configUrl = null;
        if (window['RemoteConfigURL']) {`
        if (this.subdir) {
            str += `
            configUrl = \`\${window['RemoteConfigURL']}/config_${this.subdir}_i18n_\${lang}/\${filename}\`
            `
        } else {
            str += `
            configUrl = \`\${window['RemoteConfigURL']}/config_i18n_\${lang}/\${filename}\`
            `
        }
        str += `
        } else {`
        if (this.subdir) {
            str += `
            configUrl = \`config_${this.subdir}_i18n_\${lang}/\${filename}\` 
            `
        } else {
            str += `
            configUrl = \`config_i18n_\${lang}/\${filename}\`
            `
        }
        str += `
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

    protected genConfigErrorGetter(): void {
        let str = `import { config_model_base, ConfigClass } from './config_model';
export class config_error_getter {
    /** 配置数据 */
    private modelDatas = new Map<string, any>();

    private static _instance: config_error_getter = null;

    public static get instance() {
        if (null == config_error_getter._instance) {
            config_error_getter._instance = new config_error_getter();
        }

        return config_error_getter._instance;
    }

    /**
    * 读取配置
    * @param configClass 数据模型类
    * @param lang 语言标识
    */
    public getLangMsg<T extends config_model_base>(configClass: ConfigClass<T>, code: string, lang: string = 'zh-CN'): string {
        let configData = this.getConfigData(configClass, lang);
        return configData[code];
    }

    private getConfigData<T extends config_model_base>(uiClass: ConfigClass<T>, filename: string) {
        let cfgFileName = uiClass.getConfigName(filename);
        let configData = this.modelDatas.get(cfgFileName)
        if (!configData) {
            let configUrl = uiClass.getUrl(cfgFileName, filename);
            configData = config_model_base.loadJson(configUrl);
            this.modelDatas.set(cfgFileName, configData);
        }

        if (!configData) {
            console.log(\`配置文件\${cfgFileName}不存在, 请检查\`);
        }

        return configData;
    }
}`
        fs.writeFileSync(`${this.getHandlerOutDir()}/config_error_getter.ts`, str);
    }

    protected genConfigLangGetter(): void {
        let str = `import { config_model_base, ConfigClass } from './config_model';
export class config_lang_getter {
    /** 配置数据 */
    private modelDatas = new Map<string, any>();

    private static _instance: config_lang_getter = null;

    public static get instance() {
        if (null == config_lang_getter._instance) {
            config_lang_getter._instance = new config_lang_getter();
        }

        return config_lang_getter._instance;
    }

    /**
    * 读取配置
    * @param configClass 数据模型类
    * @param lang 语言标识
    */
    public getLangData<T extends config_model_base>(configClass: ConfigClass<T>, lang: string = 'zh-CN'): T {
        let configData = this.getConfigData(configClass, lang);
        return configData;
    }

    private getConfigData<T extends config_model_base>(uiClass: ConfigClass<T>, filename: string) {
        let cfgFileName = uiClass.getConfigName(filename);
        let configData = this.modelDatas.get(cfgFileName)
        if (!configData) {
            let configUrl = uiClass.getUrl(cfgFileName, filename);
            configData = config_model_base.loadJson(configUrl);
            this.modelDatas.set(cfgFileName, configData);
        }

        if (!configData) {
            console.log(\`配置文件\${cfgFileName}不存在, 请检查\`);
        }

        return configData;
    }
}`
        fs.writeFileSync(`${this.getHandlerOutDir()}/config_lang_getter.ts`, str);
    }
}