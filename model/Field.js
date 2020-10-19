export default class Field{
  constructor(options = {}){
    // 以下字段需要在提交时补全
    this.tenantId = options.tenantId;
    this.tableName = options.tableName;
    this.templateId = options.templateId;
    this.templateName = options.tableName;
    this.orderId = options.orderId;

    this.fieldName = options.fieldName;
    this.displayName = options.displayName;
    this.formType = options.formType;

    this.isSystem = options.isSystem || 0;
    this.isNull = options.isNull || 0;
    this.isSearch = options.isSearch || 0;
    this.isAdd = options.isAdd || 1;
    this.isAppShow = options.isAppShow || 0;

    this.isDuplicateEntry = options.isDuplicateEntry || 0;
    this.isVisibility = options.isVisibility || 0;
    this.isPublic = options.isPublic || 0;
    this.isScancode = options.isScancode || 0;
    
    
    this.placeHolder = options.placeHolder;
    this.setting = options.setting || {};
    this.defaultValue = options.defaultValue;
    this.enabled = options.enabled || 1;
    this.isDelete = options.isDelete || 0;

    // 客户、产品的字段id
    this.fieldId = options.id;
    this.tableChsName = options.tableChsName;
    // 工单、事件的字段id
    this.id = options.id;


    // linkman组件自定义接口参数
    this.searchUrl = options.searchUrl || '';
  }
}