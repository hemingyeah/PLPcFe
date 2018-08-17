/** 字段类 @author dongls */
export default class FormField{
  /** 默认构造函数，不接收任何参数 */
  constructor(){
    // this.id = null;
    // this.tenantId = null;
    // this.tableName = null;
    // this.isSystem = 0;
    // this.fieldName = null;
    // this.displayName = null;
    // this.formType = null;
    // this.isNull = 1;
    // this.isSearch = 0;
    // this.isAdd = 1;
    // this.placeHolder = null;
    // this.setting = {};
    // this.orderId = null;
    // this.templateId = null;
    // this.templateName = null;
    // this.defaultValue = null;
    // this.enabled = 1;

    this.fieldName = null; //传入的field数据
    this.formType = null; //字段类型
    this.displayName = null; //标题
    this.isNull = 1; //是否必填
    this.isSearch = 0; //是否允许搜索
    this.placeHolder = null; //提示信息
    this.defaultValue = null; //默认值

    this.options = []; //下拉菜单类型选项
    this.isMulti = false; //是否为多选
  }

  /** 从Filed构建 */
  static fromField(){
    //todo
  }

  /** 将一个对象转换成FormDesignField对象 */
  static as(o){
    let formField = new FormField();

    formField.formType = o.formType;
    formField.displayName = o.displayName;

    return formField;
  }

  /** 转换成Filed类型 */
  toField(){
    console.log('to field')
    //todo
  }
}