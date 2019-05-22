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

const FormFields = [...allFields]

for(let i = 0; i < FormFields.length; i++){
  let formField = FormFields[i];
  let field = {
    formType: formField.formType, // 组件类型
    name: formField.name, // 组件显示名称
    alias: formField.alias, // 组件别名
    isSystem: formField.isSystem // 是否为为系统组件
  }

  if(!formField.alias){
    let settingComp = formField.component.setting;
    let previewComp = formField.component.preview;
    let buildComp = formField.component.build;
    let extendComp = formField.component.extend;

    PreviewComponents[previewComp.name] = previewComp; 
    SettingComponents[settingComp.name] = settingComp;
    BuildComponents[buildComp.name] = buildComp;

    field.preview = previewComp.name; // 预览组件名
    field.setting = settingComp.name; // 设置组件名
    field.build = buildComp.name; // 表单组件名
    field.name = formField.name;
    field.extend = {};

    // 判断有没有扩展组件 -> 注册组件
    if(null != extendComp && Object.keys(extendComp).length > 0) {
      for(let name in extendComp) {
        let comp = extendComp[name];
        SettingComponents[comp.name] = comp;
        field.extend[name] = comp.name;
      }
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
  BuildComponents
}