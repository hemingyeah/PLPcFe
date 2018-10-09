import {genRandomKey} from './util';

/**
 * 用于表单设计的字段类
 * 后端给出的字段数据需要调用 util.toFormField 转换成该格式
 * 
 * @author dongls 
 */
export default class FormField{
  /** 默认构造函数 */
  constructor(params = {}){
    let options = [];

    if(params.formType == 'select'){
      options.push({value: '选项1', isDefault: false})
    }

    this.id = null;
    this.fieldName = null;
    this.formType = params.formType; //字段类型
    this.displayName = params.displayName || '标题'; //标题
    this.isNull = 1; //是否必填
    this.isSearch = 0; //是否允许搜索
    this.placeHolder = null; //提示信息
    this.defaultValue = null; //默认值
    this.isSystem = params.isSystem || 0; //是否为系统字段

    this.options = options; //下拉菜单类型选项
    this.isMulti = false; //是否为多选
    this._id = this.fieldName || `field_${genRandomKey()}`;

    //辅助字段
    this.dragging = false; //当前字段时候正在被拖拽
  }

  /** 从Filed构建 */
  static fromField(field){
    let newField = new FormField();
    let setting = field.setting || {};

    newField.id = field.id || field.fieldId;
    newField.fieldName = field.fieldName;
    newField.formType = field.formType;
    newField.displayName = field.displayName;
    newField.isNull = field.isNull;
    newField.isSearch = field.isSearch;
    newField.placeHolder = field.placeHolder;
    newField.defaultValue = field.defaultValue;
    newField.isSystem = field.isSystem;

    newField._id = newField.fieldName || `field_${genRandomKey()}`;

    if(field.formType == 'select'){
      let dataSource = setting.dataSource || [];
      newField.options = dataSource.map(item => ({value: item, isDefault: item == field.defaultValue}))
      newField.isMulti = setting.isMulti === true
    }

    return newField;
  }

  /** 将字段转换成后端可接受的字段 */
  static toField(field){
    let option = {};

    option.id = field.id;
    option.fieldName = field.fieldName;
    option.formType = field.formType;
    option.displayName = field.displayName;
    option.isNull = field.isNull;
    option.isSearch = field.isSearch;
    option.placeHolder = field.placeHolder;
    option.isSystem = field.isSystem;

    let setting = {};
    let defaultValue = null;

    //处理下拉选项
    if(field.formType == 'select'){
      let dataSource = [];
      let opts = field.options || [];
      for(let i = 0; i < opts.length; i++){
        let opt = opts[i];
        dataSource.push(opt.value);
        if(opt.isDefault) defaultValue = opt.value;
      }
      setting.isMulti = field.isMulti;
      setting.dataSource = dataSource;
    }

    option.setting = setting;
    option.defaultValue = defaultValue;

    return option;
  }
}