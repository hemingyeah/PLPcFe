import FormText from './FormText';
import FormTextarea from './FormTextarea';
import FormNumber from './FormNumber';
import FormSelect from './FormSelect';
import FormCode from './FormCode';
import FormAttachment from './FormAttachment';
import FormUser from './FormUser';
import FormDate from './FormDate';
import FormDatetime from './FormDatetime';
import FormPhone from './FormPhone';
import FormEmail from './FormEmail';
import FormSeparator from './FormSeparator';

import FormAddress from './FormAddress';
import FormLocation from './FormLocation';
import FormInfo from './FormInfo';

// base fields
const BaseFormField = [
  FormText,
  FormTextarea,
  FormNumber,
  FormSelect,
  FormCode,
  FormAttachment,
  FormUser,
  FormDate,
  FormDatetime,
  FormPhone,
  FormEmail,
  FormSeparator,
  FormAddress,
  FormLocation,
  FormInfo,
];

const allFields = BaseFormField.reduce((acc, val) => (Array.isArray(val) ? acc = acc.concat(val) : acc.push(val)) && acc, []);
const FormFieldMap = {};
const PreviewComponents = {};
const SettingComponents = {};
const BuildComponents = {};
const ViewComponents = {};

for(let i = 0; i < allFields.length; i++){
  let formField = allFields[i];
  let field = {
    name: formField.name, // 组件显示名称
    formType: formField.formType, // 组件类型
    fieldName: formField.fieldName, // 字段名，部分系统字段会提供
    isSystem: formField.isSystem, // 是否为为系统组件
    alias: formField.alias
  }

  if(!formField.alias){
    // 预览组件
    let previewComp = formField.component.preview;
    PreviewComponents[previewComp.name] = previewComp; 
    field.preview = previewComp.name; // 预览组件名

    // 设置组件
    let settingComp = formField.component.setting;
    if(null != settingComp){
      SettingComponents[settingComp.name] = settingComp;
      field.setting = settingComp.name; // 设置组件名
    }

    // 表单组件
    let buildComp = formField.component.build;
    if(null != buildComp){
      BuildComponents[buildComp.name] = buildComp;
      field.build = buildComp.name; // 表单组件名
    }

    // 显示组件
    let viewComp = formField.component.view;
    if(null != viewComp){
      ViewComponents[viewComp.name] = viewComp;
      field.view = viewComp.name
    }

    // 扩展组件
    let extendComp = formField.component.extend;
    if(null != extendComp && Object.keys(extendComp).length > 0) {
      let extend = {};

      for(let name in extendComp) {
        let comp = extendComp[name];
        SettingComponents[comp.name] = comp;
        extend[name] = comp.name;
      }

      field.extend = extend;
    }
  }

  FormFieldMap[formField.formType] = field;
}
const MODES = {
  customer: {
    exclude: ['address']
  },
  product: {
    exclude: ['address']
  }
}

const FieldManager = {
  /** 根据mode获取字段 */
  findModeFields(mode = 'base'){
    let fields = allFields;
    let exclude = (MODES[mode] || {}).exclude || [];

    // 排除字段
    if(exclude.length > 0) {
      fields = fields.filter(f => exclude.indexOf(f.formType) < 0)
    }

    return fields.map(f => f.formType);
  },
  /** 根据字段类型获取单个字段 */
  findField(formType){
    let field = FormFieldMap[formType];

    if(field && field.alias){
      let aliasField = FormFieldMap[field.alias];
  
      field.preview = aliasField.preview;
      field.setting = aliasField.setting;
      field.build = aliasField.build;
      field.extend = aliasField.extend || {};
  
      return {...aliasField, ...field};
    }
  
    return field;
  }
}

export {
  FieldManager,
  PreviewComponents,
  SettingComponents,
  BuildComponents,
  ViewComponents
}
