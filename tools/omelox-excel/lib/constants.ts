/** 字段类型定义 */
export const FIELD_TYPE = {
    /** 不导出 */
    UNEXPORT: 'unexport',
    // ANY类型
    ANY: 'any',
    // 小数
    FLOAT: 'float',
    // 整数
    INT: 'int',
    // 字符串
    STRING: 'string',
    // 对象
    TABLE: 'table',
}

/** 字段约束 */
export const FIELD_RULE = {
    /** 创建字段映射索引 */
    INDEX: 'index',
    /** 检测字段唯一性 */
    UNIQUE: 'unique'
};

/** 配置类型定义 */
export const CONFIG_TYPE = {
    /** 未知类型 */
    NONE: 'none',
    /** 模板定义 */
    MODEL: 'model',
    /** 常规配置 */
    DATA: 'data',
    /** 常量配置 */
    CONST: 'const',
    /** 语言配置 */
    LANG: 'lang'
}

/** 配置适用范围 */
export const USE_RANGE = {
    /** 双端共享 */
    DOUBLE: 1,
    /** 服务器专用 */
    SERVER: 2,
    /** 客户端专用 */
    CLIENT: 3
}

/** 数据开始行 */
export const CONFIG_SKIP_ROW = 3;

/** 支持的excel类型 */
export const SUPPORT_EXCEL_TYPE = ['xlsx', 'xls', 'xlsm'];