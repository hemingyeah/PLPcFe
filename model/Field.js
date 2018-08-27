export default class Field{
  constructor(options = {}, mode){
    this.tenantId = options.tenantId;

    this.tableName = options.tableName;
    this.fieldName = options.fieldName;
    this.displayName = options.displayName;
    this.formType = options.formType;

    this.isSystem = options.isSystem || 0;
    this.isNull = options.isNull || 0;
    this.isSearch = options.isSearch || 0;
    this.isAdd = options.isAdd || 1;

    this.placeHolder = options.placeHolder;
    this.setting = options.setting || {};
    this.defaultValue = options.defaultValue;

    this.enabled = options.enabled || 1;
    this.orderId = options.orderId;

    this.templateId = options.templateId;
    this.templateName = options.tableName;
    
    //id根据mode不同
    if(mode == 'customer' || mode == 'product'){
      //客户、产品的字段id
      this.fieldId = null;
    }else{
       //工单、事件的字段id
      this.id = null;
    }
   
    //客户、产品特殊字段
    // private String fieldId;
    // private int isValidate;
    // private int isReadonly;
    // private String tableChsName;
  }
}