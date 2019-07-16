import { assign } from 'lodash'
import FormField from '../FormField';

export * from './validate';

const DEFAULT_PLACEHOLDER = {
  text: '最多50字',
  number: '请输入数字',
  customerAddress: '请填写详细地址',
  relationCustomer: '由客户信息查询',
  relationProduct: '由产品信息查询',
  user: '请选择人员',
  date: '日期',
  datetime: '日期 + 时间',
  select: '请选择',
  location: '请输入',
}

/** 
 * 将设计器输出的字段格式转换成后端可接受的类型 
 * 注意： 需要在提交时补全以下字段，如果有的话：
 *  tableName、templateId、templateName
 */
export function toField(fields){
  return fields.map(field => FormField.toField(field))
}

/** 将后端字段转换成设计器可接受的字段 */
export function toFormField(fields){
  return migration(fields).map(item => FormField.fromField(item));
}

/** 迁移旧有字段至新类型，主要用于兼容客户、产品旧字段 */
export function migration(fields){
  return fields.map(field => {
    // 多选格式调整
    if(field.formType == 'selectMulti'){
      if(!field.setting) field.setting = {isMulti: true, dataSource: []};
      field.formType = 'select';
      field.setting.isMulti = true;
    }

    return field;
  })
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

/** 是否为说明信息类型 */
export function isInfo(field) {
  return field.formType === 'info';
}

/** 构建placeholder */
export function genPlaceholder(field, defaultText = ''){
  let text = '';
  if(field.isNull == 0) {
    text += (isSelect(field) || isMultiSelect(field)) ? '[必选] ' : '[必填] '
  }

  if(field.placeHolder) return text + field.placeHolder;

  let key = field.formType;
  if(isDate(field)) key = 'date';
  if(isDatetime(field)) key = 'datetime';
  if(isSelect(field) || isMultiSelect(field) || field.formType == 'cascader') key = 'select';  
  return text + (DEFAULT_PLACEHOLDER[key] || '');
}
/**
 * 初始化所有字段的初始值
 * @param {*} fields 字段
 * @param {*} origin 原始值
 * @param {*} target 待合并的值
 */
export function initialize(fields = [], origin = {}, callback){
  let result = typeof callback == 'function' ? callback(fields, origin) : origin;

  fields.filter(field => field.formType !== 'info' && field.formType !== 'separator').forEach(field => {
    let formType = field.formType;
    let setting = field.setting || {};
    let fieldName = field.fieldName;
    let dataSource = setting.dataSource || [];
    let defaultValue = field.defaultValue || '';
    
    // 客户和编号类型不出初始化值
    if(field.formType == 'customer' || field.formType == 'eventNo' || field.formType == 'taskNo') return;
    // 如果已经存在值 则无需初始化
    if(result[fieldName]) return;

    // 屏蔽工单上单选里不存在默认值
    if(isSelect(field) && dataSource.indexOf(defaultValue) < 0) defaultValue = '';

    // 优先级、服务类型、服务内容在空值时选中第一个
    if(field.formType == 'level' || field.formType == 'serviceContent' || field.formType == 'serviceType') {
      if(defaultValue == '') defaultValue = dataSource[0];
    }

    // 多选和附件的默认值初始化为空数组
    if(isMultiSelect(field) || field.formType == 'attachment'){
      defaultValue = [];
    }

    // 多级选择，需要拆解默认值
    if(formType == 'cascader'){
      let cascaderDefaultValue = [];
      if(defaultValue) cascaderDefaultValue = defaultValue.split(',')

      defaultValue = cascaderDefaultValue;
    }

    // 地址的默认值初始化为对象
    if(field.formType == 'customerAddress' || field.formType == 'address') defaultValue = {};
    // 人员的默认值初始化为对象
    if(field.formType == 'user') defaultValue = {}

    // 来自表单的值，用于编辑时初始化值
    let attribute = origin.attribute || {};
    let formData = field.isSystem === 1 ? origin[fieldName] : attribute[fieldName];

    // 多选改单选,若原来有值则保留第一个
    if(isSelect(field) && Array.isArray(formData)) {
      formData = (formData && formData.length >= 1) ? formData[0] : '';
    }
    // 单选改多选，将原值加入数组
    if(isMultiSelect(field) && !Array.isArray(formData)) {
      formData = formData ? [formData] : [];
    }

    result[fieldName] = formData == null ? defaultValue : formData;
  });


  return assign({}, origin.attribute, result);

}

/**
 * 检测是否为隐藏字段
 * @param {*} field - 待检测的字段
 * @param {*} form - 表单值
 * @param {*} allFields - 所有字段
 * @param {string} isSmooth - 是否平整。 值为true时，直接从form对象上取值；值为false时，根据字段isSystem取值
 */
export function isHiddenField(field, form, allFields, isSmooth = true){
  let map = {};

  for(let i = 0; i < allFields.length; i++) {
    map[allFields[i].fieldName] = allFields[i];
  }

  return _isHiddenField(field, form, map, isSmooth);
}

function _isHiddenField(field, form, fieldMap, isSmooth){
  let setting = field.setting || {};
  let dependencies = setting.dependencies;
  // 无依赖不隐藏
  if(null == dependencies || Object.keys(dependencies).length == 0) return false;

  for(let prop in dependencies){
    // 先判定依赖字段是否显示
    let depField = fieldMap[prop];
    if(depField == null) return true;
    if(_isHiddenField(depField, form, fieldMap, isSmooth)) return true;

    let val = getHiddenFieldValue(prop, form, fieldMap, isSmooth)
    let dep = dependencies[prop];
    if(Array.isArray(dep) && dep.length > 0 && dep.indexOf(val) >= 0) return false;
  }

  return true;
}

function getHiddenFieldValue(prop, form, fieldMap, isSmooth){
  let field = fieldMap[prop];
  return getValue(field, form, isSmooth)
}

/**
 * 根据字段取值
 * @param {*} field - 字段
 * @param {*} form - 表单对象
 * @param {*} isSmooth - 是否平整。 值为true时，直接从form对象上取值；值为false时，根据字段isSystem取值
 */
export function getValue(field, form, isSmooth = false){
  if(null == field) return null;
  let fieldName = field.fieldName;

  // 直接从form上取值，适用于FormBuilder
  if(isSmooth) return form[fieldName];

  // 客户负责人
  if(field.tableName == 'customer' && fieldName == 'manager'){
    return {userId:form.customerManager, displayName: form.customerManagerName}
  }

  // 系统字段
  if(field.isSystem == 1) return form[fieldName];

  // 自定义字段
  let attribute = form.attribute || {};
  return attribute[fieldName];
}