import _ from 'lodash';
import Field from '@model/Field';
import FormField from './FormField';

/** 
 * 将设计器输出的字段格式转换成后端可接受的类型 
 * 注意： 需要在提交时补全以下字段，如果有的话：
 *  tableName、templateId、templateName
 */
export function toField(fields, mode){
  return fields.map((field, index) => {
    let option = FormField.toField(field);
    option.orderId = index;
    return new Field(option);
  })
}

/** 将后端字段转换成设计器可接受的字段 */
export function toFormField(fields){
  return migration(fields).map(item => FormField.fromField(item));
}

/** 迁移旧有字段至新类型，主要用于兼容客户、产品旧字段 */
export function migration(fields){
  return fields.map(field => {
    //多选格式调整
    if(field.formType == 'selectMulti'){
      if(!field.setting) field.setting = {isMulti: true,dataSource: []};
      field.formType = 'select';
      field.setting.isMulti = true;
    }

    return field;
  })
}

/** 返回一个随机key */
export function genRandomKey(){
  let random = Math.random() * 100000000 >> 0;
  return random.toString(16);
} 

/** 是否为多选类型 */
export function isMultiSelect(field){
  let setting = field.setting || {};

  return (field.formType == 'select' && setting.isMulti) 
    || field.formType == 'selectMulti';
}

/** 是否为单选类型 */
export function isSelect(field){
  let setting = field.setting || {};

  return (field.formType == 'select' && !setting.isMulti)
    || field.formType == 'level'
    || field.formType == 'serviceContent'
    || field.formType == 'serviceType';
}

/** 是否为日期类型 yyyy-MM-dd */
export function isDate(field){
  let setting = field.setting;

  return field.formType == 'date' 
    || (field.formType == 'planTime' && (setting != null && setting.dateType == 'date'));
}

/** 是否为日期时间类型 yyyy-MM-dd HH:mm:ss */
export function isDatetime(field){
  let setting = field.setting;

  return field.formType == 'datetime' 
    || (field.formType == 'planTime' && (setting == null || setting.dateType != 'date'));
}

/**
 * 初始化所有字段的初始值
 * @param {*} fields 字段
 * @param {*} origin 原始值
 * @param {*} target 待合并的值
 */
export function initialize(fields = [], origin = {}){
  let result = {};

  fields.forEach(field => {
    let formType = field.formType;
    //客户和编号类型不出初始化值
    if(field.formType == 'customer' || field.formType == 'eventNo' || field.formType == 'taskNo') return;

    let setting = field.setting || {};
    let fieldName = field.fieldName;
    let dataSource = setting.dataSource || [];
    let defaultValue = field.defaultValue || '';

    //屏蔽工单上单选里不存在默认值
    if(this.isSelect(field) && dataSource.indexOf(defaultValue) < 0) defaultValue = '';

    //优先级、服务类型、服务内容在空值时选中第一个
    if(field.formType == 'level' || field.formType == 'serviceContent' || field.formType == 'serviceType') {
      if(defaultValue == '') defaultValue = dataSource[0];
    }

    //多选和附件的默认值初始化为空数组
    if(this.isMultiSelect(field) || field.formType == 'attachment'){
      defaultValue = [];
    }

    //多级选择，需要拆解默认值
    if(formType == 'cascader'){
      let cascaderDafaultValue = [];
      if(defaultValue) cascaderDafaultValue = defaultValue.split(',')

      defaultValue = cascaderDafaultValue;
    }

    //地址的默认值初始化为对象
    if(field.formType == 'address') defaultValue = {};
    //人员的默认值初始化为对象
    if(field.formType == 'user') defaultValue = {}

    //来自表单的值，用于编辑时初始化值
    let attribute = origin.attribute || {};
    let formData = field.isSystem === 1 ? origin[fieldName] : attribute[fieldName];

    //多选改单选,若原来有值则保留第一个
    if(this.isSelect(field) && Array.isArray(formData)) {
      formData = (formData && formData.length >= 1) ? formData[0] : '';
    }
    //单选改多选，将原值加入数组
    if(this.isMultiSelect(field) && !Array.isArray(formData)) {
      formData = formData ? [formData] : [];
    }
    result[fieldName] = formData == null ? defaultValue : formData;
  });

  return _.assign({}, origin.attribute, result);
}