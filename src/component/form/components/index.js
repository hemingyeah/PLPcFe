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
  // FormAddress,
  // FormLocation,
  FormInfo
];

const allFields = [...BaseFormField, FormAddress];
const BaseModeField = BaseFormField.map(item => item.formType)

const Modes = {
  base: {
    fields: BaseModeField
  },
  customer: {
    fields: [...BaseModeField]
  },
  product: {
    fields: [...BaseModeField]
  }
  // task: {
  //   fields: [FormText.formType]
  // }
}

const FormFieldMap = {};
const PreviewComponents = {};
const SettingComponents = {};
const BuildComponents = {};
const ViewComponents = {};

const FormFields = [...allFields]

for(let i = 0; i < FormFields.length; i++){
  let formField = FormFields[i];
  let field = {
    name: formField.name, // 组件显示名称
    formType: formField.formType, // 组件类型
    isSystem: formField.isSystem // 是否为为系统组件
  }

  if(formField.alias) field.alias = formField.alias;

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

/** 获取字段 */
FormFieldMap.get = function(formType){
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

// 冻结字段
Object.freeze(FormFieldMap);

export {
  FormFields,
  FormFieldMap,
  Modes,
  PreviewComponents,
  SettingComponents,
  BuildComponents,
  ViewComponents
}
