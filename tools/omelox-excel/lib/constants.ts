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
    /** KEY索引，用户常量data配置 */
    KEY: 'key',
    /** KEY索引，用户常量data配置 */
    KEY_DESC: 'keydesc',
    /** 创建多字段联合索引 */
    INDEXS: 'indexs',
    /** 检测字段唯一性 */
    UNIQUE: 'unique',
    /** 客戶端专用 */
    ONLY_CLIENT: 'oc',
    /** 服务端专用 */
    ONLY_SERVER: 'os',
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
    LANG: 'lang',
    /** 错误码配置 */
    ERROR: 'error',
    /** Data模板+常量配置 */
    CONST_MODEL: 'const_model',
}

export enum DocConfigKey {
    /** USE_RANGE定义 1:双端共享2：服务器专用3：客户端专用 */
    use_range = 'use_range',
    /** model：模型；data：数据配置；const：常量配置；lang：语言配置;  error：错误码; */
    config_type = 'config_type',
    /** 数据文件模型名称 */
    category = 'category',
    /** 客户端资源分包 */
    sub_bundle = 'sub_bundle',
    /** 内容说明 */
    content = 'content',
    /** 多语言文件,是否生产fields集合 0：不生成，1：生成 */
    fields = 'fields',
    /** 多语言文件,是否生产fields字段类型定义 0：不生成，1：生成 */
    fieldsDef = 'fieldsDef',
    /** 模型继承父类 */
    parent_class = 'parent_class',
    /** 基础错误码配置 */
    base_code_config = 'base_code_config',
    /** 公共配置 */
    public = 'public',
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
export const SUPPORT_EXCEL_TYPE = ['.xlsx', '.xls', '.xlsm'];