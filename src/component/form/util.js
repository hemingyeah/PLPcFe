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