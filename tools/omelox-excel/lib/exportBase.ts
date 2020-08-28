import XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as consts from './constants';
const FIELD_TYPE = consts.FIELD_TYPE;
const CONFIG_TYPE = consts.CONFIG_TYPE;

export abstract class ExportBase {
    /** 支持字段类型 */
    supportTypes: string[] = Object.values(FIELD_TYPE);
    /** 配置输出目录 */
    outRootDir: string;
    /** 发布渠道 */
    publishChannel: string[];
    /** 数据文件名集合 */
    dataFileName: any = {};
    /** excel目录 */
    excelDir: string;
    /** 发布类型(服务器、客户端) */
    publishType: number = 1;
    constructor(opts: any) {
        this.excelDir = opts.inputdir;
        this.outRootDir = opts.outdir;
        this.publishChannel = opts.channel;
        this.publishType = opts.type;
    }

    public genConfig() {
        this.dataFileName = {};
        this.genBaseModel();
        this.genConfigDataGetter();
        this.genConfigConstGetter();
        this.genConfigLangGetter();
        this.walkExcels(this.excelDir);
        this.genDataFileName();
    }
    /**
     * 生成配置文件名集合
     */
    protected abstract genDataFileName();

    /**
     * 生成模型基类
     */
    protected abstract genBaseModel();

    /**
     * 生成数据配置模型
     * @param filename 文件名
     * @param content 文件功能描述
     * @param datas 数据
     */
    protected abstract genDataModel(filename: string, content: string, fields: string[], types: string[], descs: string[]);

    /**
     * 生成常量模型
     * @param filename 文件名
     * @param content 文件功能描述
     * @param datas 数据
     */
    protected abstract genConstModel(filename: string, content: string, datas: any[]);

    /**
     * 生成语言模型
     * @param filename 文件名
     * @param content 文件功能描述
     * @param datas 数据
     */
    protected abstract genLangModel(filename: string, content: string, datas: any[]);

    /**
     * 生成数据配置读取器
     */
    protected abstract genConfigDataGetter();

    /**
     * 生成常量配置读取器
     */
    protected abstract genConfigConstGetter();

    /**
     * 生成语言配置读取器
     */
    protected abstract genConfigLangGetter();

    /**
     * 生成数据配置文件
     * @param filename 文件名
     * @param fmtType 配置文件类型
     * @param fields 配置字段
     * @param types 字段类型
     * @param datas 数据
     * @param descs 字段描述
     */
    protected abstract genDataBuffer(filename, fmtType, fields, types, datas, descs);

    protected paresFieldValue(value, type) {
        let result = null;

        if (null == value) {
            return result;
        }

        switch (type) {
            case FIELD_TYPE.FLOAT:
            case FIELD_TYPE.INT:
                if (typeof value === 'number' || typeof Number(value) === 'number') {
                    result = Number(value);
                }
                break;
            case FIELD_TYPE.STRING:
                if (typeof value === 'string' || typeof value.toString() === 'string') {
                    result = value;
                }
                break;
            case FIELD_TYPE.TABLE:
                if (typeof value === 'object') {
                    result = value;
                } else if (typeof value === 'string') {
                    try {
                        result = JSON.parse(value);
                    } catch (error) {

                    }
                }
                break;
            case FIELD_TYPE.ANY:
                result = value;
                break
            default:
                console.log('未知类型', value, type);
                break;
        }

        return result;
    }

    protected mkdirsSync(dirName) {
        if (fs.existsSync(dirName)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirName))) {
                fs.mkdirSync(dirName);
                return true;
            }
        }
    }

    private walkExcels(dir) {
        fs.readdirSync(dir).forEach((filename) => {
            const subDir = dir + '/' + filename;
            const stat = fs.statSync(subDir);
            if (stat && stat.isDirectory()) {
                this.walkExcels(subDir);
            }
            else {
                const info = path.parse(subDir);
                if (consts.SUPPORT_EXCEL_TYPE.length > 0 && consts.SUPPORT_EXCEL_TYPE.indexOf(info.ext) === -1) {
                    return;
                }
                this.handleExcel(subDir);
            }
        });
    }

    private handleExcel(filePath) {
        let oriFilename = path.parse(filePath).name;
        if (oriFilename.startsWith('~$')) {
            return;
        }

        let workBook = XLSX.readFile(filePath, { type: 'binary' })

        let descriptionData = workBook.Sheets['description'];
        if (!descriptionData) {
            console.log(`${filePath} 无description描述表单`);
            return;
        }
        let descriptionSheetJson = XLSX.utils.sheet_to_json(descriptionData, { header: 1, raw: true, blankrows: false });

        if (descriptionSheetJson[3][0] !== 'use_range' || descriptionSheetJson[4][0] !== 'config_type') {
            console.log(`${filePath} description描述表单配置缺少client_use_only、config_type定义`);
            return;
        }

        let use_range = Number(descriptionSheetJson[3][1]);
        let config_type = descriptionSheetJson[4][1];
        if (Object.values(CONFIG_TYPE).indexOf(config_type) === -1) {
            console.log(`${filePath} description描述表单config_type不支持，只支持${Object.values(CONFIG_TYPE)}`);
            return;
        }

        if (config_type === CONFIG_TYPE.MODEL) {
            // 根据模型文件生成数据配置模型
            let modelData = workBook.Sheets['model'];
            if (!modelData) {
                console.log(`${filePath} 无template表单`);
                return;
            }

            let category = descriptionSheetJson[5][1];
            let content = descriptionSheetJson[6][1];
            let sheetJson = XLSX.utils.sheet_to_json<any>(modelData, { header: 1, raw: true, blankrows: false });

            // 字段名
            let fields = sheetJson[0];
            // 数据类型：unexport（不导出）、float（小数）、int(整数)、string（字符串）、table(对象)、key,cst第一列类型可以取key（map）、cst(常量)
            let types = sheetJson[1];
            // 字段描述
            let descs = sheetJson[2];

            let filename = `${this.outRootDir}/${category}`;

            const pathInfo = path.parse(filename);
            this.mkdirsSync(pathInfo.dir);

            this.genDataModel(filename, content, fields, types, descs);
        } else if (config_type === CONFIG_TYPE.CONST) {
            // 生成CONST模型
            let modelData = workBook.Sheets['model'];
            if (!modelData) {
                console.log(`${filePath} 无template表单`);
                return;
            }

            let content = descriptionSheetJson[5][1];
            let sheetJson = XLSX.utils.sheet_to_json(modelData, { header: 1, raw: true, blankrows: false });
            let filename = `${this.outRootDir}/${oriFilename}`;

            const pathInfo = path.parse(filename);
            this.mkdirsSync(pathInfo.dir);

            this.genConstModel(filename, content, sheetJson.slice(consts.CONFIG_SKIP_ROW))
        } else if (config_type === CONFIG_TYPE.LANG) {
            // 生成LANG模型
            let modelData = workBook.Sheets['default'];
            if (!modelData) {
                console.log(`${filePath} 无default表单`);
                return;
            }

            let content = descriptionSheetJson[5][1];
            let sheetJson = XLSX.utils.sheet_to_json(modelData, { header: 1, raw: true, blankrows: false });
            let filename = `${this.outRootDir}/${oriFilename}`;

            const pathInfo = path.parse(filename);
            this.mkdirsSync(pathInfo.dir);

            this.genLangModel(filename, content, sheetJson.slice(consts.CONFIG_SKIP_ROW));
        }

        for (let pub of this.publishChannel) {
            let sheetData = workBook.Sheets[pub] || workBook.Sheets['default'];
            if (!sheetData) {
                continue;
            }

            let sheetJson = XLSX.utils.sheet_to_json(sheetData, { header: 1, raw: true, blankrows: false });

            // 字段名
            let fields = sheetJson[0];
            // 数据类型：unexport（不导出）、float（小数）、int(整数)、string（字符串）、table(对象)、key,cst第一列类型可以取key（map）、cst(常量)
            let types = sheetJson[1];
            // 字段描述
            let descs = sheetJson[2];


            let filename = `${this.outRootDir}/${pub}/${oriFilename}`;

            let fmtType = null; // 数组
            if (config_type === CONFIG_TYPE.CONST) {
                // 生成常量对象
                fmtType = CONFIG_TYPE.CONST;
            } else if (config_type === CONFIG_TYPE.LANG) {
                // 语言配置类型
                fmtType = CONFIG_TYPE.LANG;
                filename = `${this.outRootDir}/i18n`;
            } else {
                // 常规数据类型
                fmtType = CONFIG_TYPE.DATA;
            }

            const pathInfo = path.parse(filename);
            this.mkdirsSync(pathInfo.dir);

            this.genDataBuffer(filename, fmtType, fields, types, sheetJson.slice(consts.CONFIG_SKIP_ROW), descs);

            if (CONFIG_TYPE.LANG === fmtType) {
                break;
            }
        }
    }
}