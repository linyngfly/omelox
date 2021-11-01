import * as path from 'path';
import * as fs from 'fs';
import { ExportBase } from './exportBase';
import { FIELD_TYPE, CONFIG_SKIP_ROW, FIELD_RULE, CONFIG_TYPE } from './constants';

const TSTypeLink: any = {};
TSTypeLink[FIELD_TYPE.FLOAT] = 'number';
TSTypeLink[FIELD_TYPE.INT] = 'number';
TSTypeLink[FIELD_TYPE.STRING] = 'string';
TSTypeLink[FIELD_TYPE.TABLE] = 'any';

export default class ExportServerTS extends ExportBase {
    protected genDataFileName(): void {
        let str = `/** 数据文件名 */
const config_data_file_name = {\r\n`
        let keys = Object.keys(this.dataFileName);
        for (let item of keys) {
            str += `\t${item}: \'${this.dataFileName[item]}\',\r\n`
        }
        str += `}\r\n`
        str += `\r\n`
        str += `export { config_data_file_name };`

        fs.writeFileSync(`${this.getHandlerOutDir()}/config_data_file_name.ts`, str);
    }

    protected genBaseModel(): void {
        let str = `import path = require('path');
import fs = require('fs');

/** 配置模型基础类 */
export abstract class config_model_base {
    /** 获取文件链接 */
    public static getUrl(filename: string): string {
        let configUrl = null;
        let dir = this.isPublic() ? 'common' : process.env.PUB_PLATFORM;

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

        let targetFilename = `${this.getHandlerOutDir()}/config_model.ts`;
        const pathInfo = path.parse(targetFilename);
        this.mkdirsSync(pathInfo.dir);
        fs.writeFileSync(targetFilename, str);
    }

    protected getModelGetUrl(): string { return; };

    /**
     * 生成模型类名映射
     */
    protected genModelMap(): void {
        let str = `
export class lang_model_map {
    private static maps = new Map<string, any>();

    public static add(model: any) {
        this.maps.set(model.getClassName(), model);
    }

    public static get(filename: string) {
        return this.maps.get(filename);
    }
}`;

        let targetFilename = `${this.getHandlerOutDir()}/lang_model_map.ts`;
        const pathInfo = path.parse(targetFilename);
        this.mkdirsSync(pathInfo.dir);
        fs.writeFileSync(targetFilename, str);
    }

    protected genDataModel(filename: string, content: string, fields: string[], types: string[], descs: string[], isPublic: boolean, isAppendData: boolean): void {
        const oriFilename = path.parse(filename).name;
        let modelrName = `${oriFilename}_model`;

        let str = `import { config_data_file_name } from './config_data_file_name';
import { config_model_base } from './config_model';

/**
 * ${content}
 */
export class ${modelrName} extends config_model_base {\r\n`

        if (this.getModelGetUrl()) {
            str += this.getModelGetUrl();
            str += `\r\n`
        }
        // 字段定义
        str += this._genFieldDefine(fields, types, descs);
        str += `\r\n`
        str += `\tpublic static readonly FIELDS = {\r\n`
        str += this._genFIELDS(types, fields);
        str += `\t}\r\n`

        str += `\r\n`
        str += `\tpublic static getClassName(): string {
        return \'${modelrName}\'
    }
`

        if (isAppendData) {
            str += `
    public static getConfigName(filename?: string): string {
        return filename || config_data_file_name.${oriFilename};
    }
`
        } else {
            str += `
    public static getConfigName(filename?: string): string {
        return filename;
    }
`
        }


        if (isPublic) {
            str += `
    public static isPublic(): boolean {
        return true;
    }
`
        }

        str += `
}`;

        fs.writeFileSync(`${path.parse(filename).dir}/${modelrName}.ts`, str);
    }

    protected genConstModel(filename: string, content: string, datas: any[]): void {
        const oriFilename = path.parse(filename).name;
        let modelrName = `${oriFilename}_model`;
        let defaultDataName = `${oriFilename}`;

        let str = `import { config_data_file_name } from './config_data_file_name';
import { config_model_base } from './config_model';

/**
 * ${content}
 */
export class ${modelrName} extends config_model_base {\r\n`
        if (this.getModelGetUrl()) {
            str += this.getModelGetUrl();
            str += `\r\n`
        }
        // 字段定义
        str += this._genConstFieldDefine(oriFilename, datas);
        str += `\r\n`

        str += `\r\n`
        str += `\tpublic static getClassName(): string {
        return \'${modelrName}\'
    }

    public static getConfigName(filename?: string): string {
        return filename || config_data_file_name.${defaultDataName};
    }
}`

        fs.writeFileSync(`${path.parse(filename).dir}/${modelrName}.ts`, str);
    }

    protected genLangModel(filename: string, content: string, fields: number, fieldsDef: number, datas: any[]): void {
        const oriFilename = path.parse(filename).name;
        let modelrName = `${oriFilename}_model`;

        let str = `import path = require('path');
import { config_model_base } from './config_model';
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
		if (process.env.CONFIG_DIR) {
			configUrl = \`\${path.join(process.env.CONFIG_DIR, 'i18n', filename)}\`;
		} else {
			configUrl = \`\${path.join(__dirname, 'i18n', filename)}\`;
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
        let str = 'import path = require(\'path\');\r\n';
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
		if (process.env.CONFIG_DIR) {
			configUrl = \`\${path.join(process.env.CONFIG_DIR, 'i18n', filename)}\`;
		} else {
			configUrl = \`\${path.join(__dirname, 'i18n', filename)}\`;
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

    protected genConfigDataGetter(): void {
        let str = `import { config_model_base, ConfigClass } from './config_model';

interface DataConfigStruct {
	fieldData: any[];
	fieldMap: any;
}

export class config_data_getter {
	/** 配置数据 */
	private modelDatas = new Map<string, DataConfigStruct>();

	private static _instance: config_data_getter = null;

	public static get instance() {
		if (null == config_data_getter._instance) {
			config_data_getter._instance = new config_data_getter();
		}

		return config_data_getter._instance;
	}

	/**
	* 获取配置数据行数
	* @param configClass 数据模型类
	* @param dataFile 数据文件名
	*/
	public getRowNumber<T extends config_model_base>(configClass: ConfigClass<T>, dataFile?: string): number {
		let configData = this.getConfigData(configClass, dataFile);
		if (null == configData) {
			return 0;
		}
		return configData.fieldData.length;
	}

	/**
	 * 通过数组索引获取数据
	 * 字段key必须定义为索引字段
	 * @param configClass 数据模型类
	 * @param index 数组坐标
	 * @param dataFile 数据文件名
	 */
	public getRowById<T extends config_model_base>(configClass: ConfigClass<T>, index: number, dataFile?: string): T {
		let configData = this.getConfigData(configClass, dataFile);
		if (null == configData) {
			return;
		}

		if (index >= configData.fieldData.length) {
			return;
		}

		return configData.fieldData[index];
	}

	/**
	 * 通过key、value映射map索引数据
	 * 字段key必须定义为索引字段
	 * @param configClass 数据模型类
	 * @param key 索引字段
	 * @param value 索引值
	 * @param dataFile 数据文件名
	 */
	public getRowByIndex<T extends config_model_base>(configClass: ConfigClass<T>, key: string, value: any, dataFile?: string): T {
		let configData = this.getConfigData(configClass, dataFile);
		if (null == configData) {
			return;
		}

		let rowDataIndex = configData.fieldMap[key + '_' + value.toString()];
		if (null == rowDataIndex) {
			console.log(\`在模型配置文件\${configClass.getClassName()}中,字段【\${key}】未创建索引, 不能通过该字段查找数据\`);
			return null;
		}
		let rowData = configData.fieldData[rowDataIndex];
		if (!rowData) {
			console.log(\`在数据文件\${configClass.getConfigName(dataFile)}中找不到指定配置key=\${key}&value=\${value}, 请重新生成数据文件\`);
			return null;
		}
		return rowData;
	}

	/**
	* 通过key、value匹配获取数据
	 * @param configClass 数据模型类
	 * @param key 字段名
	 * @param value 值
	 * @param dataFile 数据文件名
	*/
	public getRowByEnumKV<T extends config_model_base>(configClass: ConfigClass<T>, key: string, value: any, dataFile?: string): T {
		let configData = this.getConfigData(configClass, dataFile);
		if (null == configData) {
			return;
		}

		for (let i = 0; i <= configData.fieldData.length; i++) {
			let rowData: any = this.getRowById(configClass, i, dataFile) as any;
			if (rowData && rowData[key] === value) {
				return rowData;
			}
		}
	}

	/**
	* 获取数据集合
	* @param configClass 数据模型类
	* @param dataFile 数据文件名
	*/
	public getDataArray<T extends config_model_base>(configClass: ConfigClass<T>, dataFile?: string): T[] {
		let configData = this.getConfigData(configClass, dataFile);
		if (null == configData) {
			return;
		}

		return configData.fieldData;
	}

	private getConfigData<T extends config_model_base>(uiClass: ConfigClass<T>, filename: string): DataConfigStruct {
		let cfgFileName = uiClass.getConfigName(filename);
		let configData = this.modelDatas.get(cfgFileName)
		if (!configData) {
			let configUrl = uiClass.getUrl(cfgFileName);
			configData = config_model_base.loadJson(configUrl);
			if (configData) {
				console.log(\`读取磁盘文件\${cfgFileName}成功\`)
				// 空间换时间
				let newFiledData = [];
				let fields = Object.values<string>(uiClass.FIELDS);
				for (let i = 0; i < configData.fieldData.length; i++) {
					let rowDatas = configData.fieldData[i];
					let item: any = {};
					for (let j = 0; j < rowDatas.length; j++) {
						if (!fields[j]) {
							console.log(\`配置文件\${cfgFileName}数据和模型不匹配，请重新生成配置\`);
							return;
						}
						item[fields[j]] = rowDatas[j];
					}
					newFiledData.push(item);
				}
				configData.fieldData = newFiledData;
			}
			this.modelDatas.set(cfgFileName, configData);
		}

		if (!configData) {
			console.log(\`配置文件\${cfgFileName}不存在, 请检查\`);
		}

		return configData;
	}
}`
        fs.writeFileSync(`${this.getHandlerOutDir()}/config_data_getter.ts`, str);
    }

    protected genConfigConstGetter(): void {
        let str = `import { config_model_base, ConfigClass } from './config_model';
export class config_const_getter {
    /** 配置数据 */
    private modelDatas = new Map<string, any>();

    private static _instance: config_const_getter = null;

    public static get instance() {
        if (null == config_const_getter._instance) {
            config_const_getter._instance = new config_const_getter();
        }

        return config_const_getter._instance;
    }

    /**
    * 读取配置
    * @param configClass 数据模型类
    * @param dataFile 数据文件名
    */
    public getConstData<T extends config_model_base>(configClass: ConfigClass<T>, dataFile?: string): T {
        let configData = this.getConfigData(configClass, dataFile);
        return configData;
    }

    private getConfigData<T extends config_model_base>(uiClass: ConfigClass<T>, filename: string) {
        let cfgFileName = uiClass.getConfigName(filename);
        let configData = this.modelDatas.get(cfgFileName)
        if (!configData) {
            let configUrl = uiClass.getUrl(cfgFileName);
            configData = config_model_base.loadJson(configUrl);
            this.modelDatas.set(cfgFileName, configData);
        }

        if (!configData) {
            console.log(\`配置文件\${cfgFileName}不存在, 请检查\`);
        }

        return configData;
    }
}`
        fs.writeFileSync(`${this.getHandlerOutDir()}/config_const_getter.ts`, str);
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
            let configUrl = uiClass.getUrl(cfgFileName);
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
            let configUrl = uiClass.getUrl(cfgFileName);
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

    /**
     * 生成JOSN数据配置
     * @param filename 文件名称
     * @param fmtType 配置文件类型
     * @param fields 字段
     * @param types 字段类型
     * @param datas 数据
     * @param descs 描述
     */
    protected genDataBuffer(filename: string, fmtType: string, fields: string[], types: any[], datas: any[], descs: string[]): void {
        let oriFilename = path.parse(filename).name;
        let str = null;
        switch (fmtType) {
            case CONFIG_TYPE.DATA:
            case CONFIG_TYPE.MODEL:
                str = this.genDataConfigBuffer(oriFilename, fields, types, datas)
                break;
            case CONFIG_TYPE.CONST:
                str = this.genConstConfigBuffer(oriFilename, fields, types, datas, descs)
                break;
            case CONFIG_TYPE.LANG:
                this.genLangConfigBuffer(oriFilename, fields, types, datas, descs);
                break;
            case CONFIG_TYPE.ERROR:
                this.genErrorConfigBuffer(oriFilename, fields, types, datas, descs);
                break;
            default:
                console.log(`${filename} 不支持的配置结构`)
                break;
        }

        if (str) {
            this.dataFileName[oriFilename] = `${oriFilename}.json`;
            fs.writeFileSync(`${filename}.json`, str);
        }
    }

    /**
     * 生成TS类成员字段定义
     * @param fields 字段
     * @param types 字段类型
     * @param descs 字段描述
     */
    protected _genFieldDefine(fields: string[], types: string[], descs: string[]) {
        let str = '';
        for (let i = 0; i < fields.length; i++) {
            let typeRules = types[i].split(',');
            if (typeRules.indexOf(FIELD_RULE.ONLY_SERVER) !== -1 && this.publishType == 2) {
                continue;
            }
            if (typeRules.indexOf(FIELD_RULE.ONLY_CLIENT) !== -1 && this.publishType == 1) {
                continue;
            }
            let fieldType = typeRules[0];
            if (fieldType === FIELD_TYPE.UNEXPORT) {
                continue;
            }
            str += `\t/** ${descs[i]} */\r\n`
            str += `\t${fields[i]}: ${TSTypeLink[fieldType]};\r\n`
        }

        return str;
    }

    /**
     * 生成常量配置字段定义
     * @param oriFilename 文件名
     * @param datas 行数据
     */
    protected _genConstFieldDefine(oriFilename: string, datas: any[]) {
        let str = '';
        for (let i = 0; i < datas.length; i++) {
            let rowArray = datas[i];
            if (rowArray.length < 4) {
                console.log(`配置文件${oriFilename}第${i + 1 + CONFIG_SKIP_ROW}行数据异常, 列数不足4`, JSON.stringify(rowArray));
                return;
            }

            const keyCst = rowArray[0].toString().trim();
            let fieldType = rowArray[2];
            str += `\t/** ${rowArray[3]} */\r\n`
            str += `\t${keyCst}: ${TSTypeLink[fieldType]};\r\n`
        }

        return str;
    }

    /**
     * 生成语言字段定义
     * @param datas 数据
     */
    protected _genLangFieldDefine(datas: any[]) {
        let str = '';
        for (let i = 0; i < datas.length; i++) {
            let rowArray = datas[i];
            if (rowArray.length < 1) {
                return;
            }

            const keyCst = rowArray[0].toString().trim();
            str += `\t/** ${rowArray[1]} */\r\n`
            str += `\t${keyCst}: string;\r\n`
        }

        return str;
    }

    /**
     * 生成语言字段名常量集合
     * @param datas 数据
     */
    protected _genLangFields(datas: any[]) {
        let str = '';
        for (let i = 0; i < datas.length; i++) {
            let rowArray = datas[i];
            if (rowArray.length < 1) {
                return;
            }

            const keyCst = rowArray[0].toString().trim();
            str += `\t\t/** ${rowArray[1]} */\r\n`
            str += `\t\t${keyCst.toUpperCase()}: \'${keyCst}\',\r\n`
        }

        return str;
    }

    /**
     * 生成错误码字段定义
     * @param datas 数据
     */
    protected _genErrorFieldDefine(datas: any[]) {
        let str = '';
        for (let i = 0; i < datas.length; i++) {
            let rowArray = datas[i];
            if (rowArray.length < 1) {
                return;
            }

            const keyCst = rowArray[0].toString().trim();
            str += `\t/** ${rowArray[2]} */\r\n`
            str += `\t${keyCst} : ${rowArray[1]},\r\n`
        }

        return str;
    }

    /**
     * 生成错误码字段定义
     * @param datas 数据
     */
    protected _genErrorFieldObj(datas: any[]) {
        let str = '';
        for (let i = 0; i < datas.length; i++) {
            let rowArray = datas[i];
            if (rowArray.length < 1) {
                return;
            }

            const keyCst = rowArray[0].toString().trim();
            str += `\t/** ${rowArray[2]} */\r\n`
            str += `\t${keyCst}: {\r\n`
            str += `\t\tcode: ${rowArray[1]},\r\n`
            str += `\t\tmsg: \'${rowArray[2]}\'\r\n`
            str += `\t},\r\n`
        }

        return str;
    }

    /**
     * 生成字段常量
     * @param types 类型
     * @param fields 字段
     */
    protected _genFIELDS(types: string[], fields: string[]) {
        let str = '';
        for (let i = 0; i < fields.length; i++) {
            let typeRules = types[i].split(',');
            if (typeRules.indexOf(FIELD_RULE.ONLY_SERVER) !== -1 && this.publishType == 2) {
                continue;
            }
            if (typeRules.indexOf(FIELD_RULE.ONLY_CLIENT) !== -1 && this.publishType == 1) {
                continue;
            }

            let fieldType = typeRules[0];
            if (fieldType === FIELD_TYPE.UNEXPORT) {
                continue;
            }
            str += `\t\t${fields[i].toUpperCase()}: \'${fields[i]}\',\r\n`
        }

        return str;
    }

    /**
     * 生成数据JSON配置
     * @param oriFilename 文件名称
     * @param fields 字段
     * @param types 字段类型
     * @param datas 数据
     */
    protected genDataConfigBuffer(oriFilename: string, fields: string[], types: string[], datas: any[]): string {
        let str = `{\r\n`
        str += `\t\"fieldData\" : [`;
        for (let i = 0; i < datas.length; i++) {
            let rowDatas = datas[i];

            let parseDatas = [];
            for (let j = 0; j < fields.length; j++) {
                let typeRules = types[j].split(',');
                if (typeRules.indexOf(FIELD_RULE.ONLY_SERVER) !== -1 && this.publishType == 2) {
                    continue;
                }
                if (typeRules.indexOf(FIELD_RULE.ONLY_CLIENT) !== -1 && this.publishType == 1) {
                    continue;
                }

                let rcType = typeRules[0];
                if (rcType === FIELD_TYPE.UNEXPORT) {
                    continue;
                }
                // 字段值合法性校验
                let value = this.paresFieldValue(rowDatas[j], rcType)
                if (null == value) {
                    console.log(`配置文件${oriFilename}第${i + 1 + CONFIG_SKIP_ROW}行字段${fields[j]}值类型${rcType}, 异常配置为`, JSON.stringify(rowDatas[j]));
                    return;
                }
                parseDatas.push(value);

            }
            str += `${JSON.stringify(parseDatas).trim()}${datas.length - 1 === i ? '' : ','}`
        }
        str += `],\r\n`

        str += `\t\"fieldMap\" : {`;

        for (let i = 0; i < datas.length; i++) {
            let noKey = true;
            let dotstr = ',';
            if (i === datas.length - 1) {
                dotstr = '';
            }
            for (let j = 0; j < fields.length; j++) {
                let typeRules = types[j].split(',');
                if (typeRules.indexOf(FIELD_RULE.ONLY_SERVER) !== -1 && this.publishType == 2) {
                    continue;
                }
                if (typeRules.indexOf(FIELD_RULE.ONLY_CLIENT) !== -1 && this.publishType == 1) {
                    continue;
                }

                let rcType = typeRules[0];
                if (rcType === FIELD_TYPE.UNEXPORT) {
                    // 不倒出字段
                    continue;
                }

                switch (typeRules[1]) {
                    case FIELD_RULE.INDEX: {
                        str += `\"${fields[j].trim()}_${datas[i][j].toString().trim()}\":${i}${dotstr}`
                        noKey = false;
                    }
                        break;
                    case FIELD_RULE.UNION_INDEX: {
                        let unionString = typeRules[2];
                        if (!unionString) {
                            console.error(`配置文件联合索引未配置索引字段, 请检查配置`);
                            return;
                        }

                        let unionKey = '';
                        let unions = unionString.split('|');
                        unions.forEach((uField, idx) => {
                            let uIndex = fields.indexOf(uField);
                            if (uIndex < 0) {
                                console.error(`配置文件联合索引字段${uField}不存在, 请检查配置`);
                                return;
                            }

                            let dot = idx === unions.length - 1 ? '' : '_';
                            unionKey += `${datas[i][uIndex]}${dot}`;
                        })

                        str += `\"${unionKey}\":${i}${dotstr}`
                        noKey = false;
                    }
                        break;
                }
            }

            if (noKey) {
                str += `IDX${i}:${i}${dotstr}`
            }
        }
        str += `}\r\n`
        str += `}\r\n`

        return str;
    }
    /**
     * 生成常量JSON配置
     * @param oriFilename 文件名称
     * @param fields 字段
     * @param types 字段类型
     * @param datas 数据
     */
    protected genConstConfigBuffer(oriFilename: string, fields: string[], types: string[], datas: any[], descs: string[]): string {

        let str = `{\r\n`;
        for (let i = 0; i < datas.length; i++) {
            let rowArray = datas[i];
            if (rowArray.length < 4) {
                console.log(`配置文件${oriFilename}第${i + 1 + CONFIG_SKIP_ROW}行数据异常, 列数不足4`, JSON.stringify(rowArray));
                return;
            }

            const keyCst = rowArray[0].toString().trim();
            let value = this.paresFieldValue(rowArray[1], rowArray[2])
            if (null == value) {
                console.log(`配置文件${oriFilename}第${i + 1 + CONFIG_SKIP_ROW}行字段${keyCst}值类型${rowArray[2]}, 异常配置为`, JSON.stringify(rowArray[1]));
                return;
            }

            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            str += `\t\"${keyCst}\":${value}${datas.length - 1 === i ? '' : ','}\r\n`
        }
        str += `}\r\n`

        return str;
    }
    /**
     * 生成语言JSON配置
     * @param oriFilename 文件名称
     * @param fields 字段
     * @param types 字段类型
     * @param datas 数据
     */
    protected genLangConfigBuffer(oriFilename: string, fields: string[], types: string[], datas: any[], descs: string[]): string {
        for (let i = 1; i < fields.length; i++) {
            let lang = fields[i];
            let str = `{\r\n`;
            for (let j = 0; j < datas.length; j++) {
                let rowArray = datas[j];
                if (rowArray.length < 2) {
                    console.log(`配置文件${oriFilename}第${i + 1 + CONFIG_SKIP_ROW}行数据异常, 列数不足4`, JSON.stringify(rowArray));
                    return;
                }

                const keyCst = rowArray[0].toString().trim();
                rowArray[i] = rowArray[i] || '';
                if (j === datas.length - 1) {
                    str += `\t\"${keyCst}\":\"${rowArray[i].toString().trim()}\"\r\n`
                } else {
                    str += `\t\"${keyCst}\":\"${rowArray[i].toString().trim()}\",\r\n`
                }
            }
            str += `}\r\n`

            if (str) {
                let filename1 = `${this.getLanOutDir(lang)}/${oriFilename}-${lang}.json`
                const pathInfo = path.parse(filename1);
                this.mkdirsSync(pathInfo.dir);

                fs.writeFileSync(filename1, str);
            }

        }
    }

    protected genErrorConfigBuffer(oriFilename: string, fields: string[], types: string[], datas: any[], descs: string[]): string {
        for (let i = 2; i < fields.length; i++) {
            let lang = fields[i];
            let str = `{\r\n`;
            for (let j = 0; j < datas.length; j++) {
                let rowArray = datas[j];
                if (rowArray.length < 2) {
                    console.log(`配置文件${oriFilename}第${i + 1 + CONFIG_SKIP_ROW}行数据异常, 列数不足4`, JSON.stringify(rowArray));
                    return;
                }

                const keyCst = rowArray[0].toString().trim();
                rowArray[i] = rowArray[i] || '';
                if (j === datas.length - 1) {
                    str += `\t\"${keyCst}\":\"${rowArray[i].toString().trim()}\"\r\n`
                } else {
                    str += `\t\"${keyCst}\":\"${rowArray[i].toString().trim()}\",\r\n`
                }
            }
            str += `}\r\n`

            if (str) {
                let filename1 = `${this.getLanOutDir(lang)}/${oriFilename}-${lang}.json`
                const pathInfo = path.parse(filename1);
                this.mkdirsSync(pathInfo.dir);

                fs.writeFileSync(filename1, str);
            }

        }
    }

}