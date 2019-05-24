import * as config from '../config';
import { isSelect, isMultiSelect } from './index'


/** 通用验证 */
function common(field){
  let message = [];
  // 自定义字段验证名称长度
  if(field.isSystem == 0){
    if(field.displayName.length > config.FIELD_NAME_LENGTH_MAX) {
      message.push(`标题长度超过${config.FIELD_NAME_LENGTH_MAX}个字符`)
    }
  }

  if(field.placeHolder && field.placeHolder.length > config.FIELD_PLACEHOLER_LENGTH_MAX){
    message.push(`描述信息长度超过${config.FIELD_PLACEHOLER_LENGTH_MAX}个字符`)
  }
  
  return message;
}

function select(field){
  let message = [];
  let dataSource = (field.setting && field.setting.dataSource) || [];
  
  // 验证是否存在空值
  for(let i = 0; i < dataSource.length; i++){
    if(dataSource[i] == null || dataSource[i].trim().length == 0){
      message.push('存在空白选项')
      break;
    }
  }

  // 验证是否存在重复值
  // 验证选项字数
  for(let i = 0; i < dataSource.length; i++){
    let option = dataSource[i];
    if(option.length > config.SELECT_OPTION_LENGTH_MAX){
      message.push(`第${i + 1}个选项字数超过${config.SELECT_OPTION_LENGTH_MAX}个`)
    }
    if(dataSource.lastIndexOf(option) != i){
      message.push(`选项[${option}]存在重复项`);
    }
  }

  // 验证选项数量
  if(dataSource.length > config.SELECT_OPTION_MAX){
    message.push(`选项数量超过${config.SELECT_OPTION_MAX}`);
  }

  return message;
}


/**
 * 验证表单字段格式
 * @param {array} fields - 待验证字段
 * @returns error message array or error message
 */
export function validate(fields){
  let noNameField = fields.map((f, i) => f.displayName ? null : i + 1).filter(i => i != null);
  if(noNameField.length > 0) return `第${noNameField.join('，')}个字段标题缺失，请补全`

  return fields.map(field => {
    let message = common(field);

    if(isSelect(field) || isMultiSelect(field)){
      message = message.concat(select(field));
    }

    return message.length > 0 ? {message, title: field.displayName} : null;
  }).filter(i => i != null);
}