/* config */
import * as config from '@src/component/form/config';
import { isSelect, isMultiSelect, isInfo } from './index';
import { isEmpty } from '@src/util/lang';
import platform from '@src/platform'


/** 通用验证 */
function common(field){
  let message = [];
  // 自定义字段验证名称长度
  if(field.isSystem == 0){
    if(field.displayName.length > config.FIELD_NAME_LENGTH_MAX) {
      message.push(`标题长度超过${config.FIELD_NAME_LENGTH_MAX}个字符`)
    }
  }

  if(field.placeHolder && field.formType !== 'info' && field.placeHolder.length > config.FIELD_PLACEHOLER_LENGTH_MAX){
    message.push(`描述信息长度超过${config.FIELD_PLACEHOLER_LENGTH_MAX}个字符`)
  }
  
  return message;
}

function select(field){
  let message = [];
  let dataSource = (field.setting && field.setting.dataSource) || [];
  
  // 验证是否存在空值
  for(let i = 0; i < dataSource.length; i++){
    if(isEmpty(dataSource[i])){
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
    if(!isEmpty(option) && dataSource.lastIndexOf(option) != i){
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
 * info字段的验证
 * 默认为空显示 dom.placeholder（不在此处处理)
 */
function info (field) {
  let message = [];
  
  if(field.placeHolder && field.placeHolder.length > config.INFO_FIELD_LENGTH_MAX){
    message.push(`描述信息长度超过${config.INFO_FIELD_LENGTH_MAX}个字符`);
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

    if(isInfo(field)) {
      message = message.concat(info(field));
    }

    return message.length > 0 ? {message, title: field.displayName} : null;
  }).filter(i => i != null);
}

/**
 * 默认提示，可自行根据内容提示
 * @param {string | array} message - 提示内容
 * @param {function} createElement - vue createElement function
 * @returns true - 验证成功，无提示信息。 false - 验证失败，有提示信息
 */
export function notification(message, createElement){
  if(typeof message == 'string' && message.length > 0){
    platform.notification({
      type: 'error',
      title: '请检查字段标题',
      message
    });

    return false;
  }

  if(Array.isArray(message) && message.length > 0){
    platform.notification({
      type: 'error',
      title: '请检查以下字段',
      duration: 0,
      message: (function(h) {
        let content = message.map(i => {
          let nodes = i.message.map(m => <p>- {m}</p>);
          nodes.unshift(<h3>{i.title}</h3>)
          return nodes;
        })

        return (
          <div class="form-design-notification">{content}</div>
        )
      })(createElement)
    }) 
    return false;
  }

  return true
}