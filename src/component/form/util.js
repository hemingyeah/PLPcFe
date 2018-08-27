import Field from '@model/Field';

/** 将设计器输出的字段格式转换成后端可接受的类型 */
export function toField(fields, mode){

  return fields.map((field, index) => {
    let options = {};
    
    options.id = field.id;
    options.fieldId = field.fieldId;
    options.orderId = index;

    options.fieldName = field.fieldName;
    options.formType = field.formType;
    options.displayName = field.displayName;
    options.isNull = field.isNull;
    options.isSearch = field.isSearch;
    options.placeHolder = field.placeHolder;

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

    options.setting = setting;
    options.defaultValue = defaultValue;
    
    return new Field(options, mode)
  })
}

export function toFormField(){

}