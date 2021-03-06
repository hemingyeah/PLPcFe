/**
 * 格式化表单设计器特殊字段显示
 * 
 * @param {string} value 格式前的值
 * @param {string} formType 控件类型
 * @param {string} fieldName 字段对应键值
 * @param {object} attribute 存放自定义字段的对象
 */
export const fmt_form_field = function(value, formType, fieldName, attribute) {
  let formatVal = value;

  if(formType && fieldName && attribute && attribute[fieldName]) {
    switch(formType) {
    case 'cascader': // 多级菜单
      formatVal = fmt_form_cascader(attribute[fieldName]);
      break;
    case 'select': // 下拉框
      formatVal = fmt_form_select(attribute[fieldName]);
      break;
    case 'user': // 人员
      formatVal = fmt_form_user(attribute[fieldName]);
      break;
    case 'related_task': // 关联工单
      formatVal = fmt_form_related_task(attribute[fieldName]);
      break;
    case 'address': 
      formatVal = fmt_form_address(attribute[fieldName]);
      break;
    case 'location': 
      formatVal = fmt_form_location(attribute[fieldName]);
      break;
    default: 
      formatVal = fmt_form_default(attribute[fieldName]);
      break;
    }
  }

  return fmt_form_default(formatVal);
}


/** 多级菜单 */
export function fmt_form_cascader(value) {
  if (!value) return null;
  if (value && typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length) {
    return value.join('/');
  }
  return null;
}

/** 下拉 */
export function fmt_form_select(value) {
  if (!value) return null;
  if (value && typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length) {
    return value.join('，');
  }
  return null;
}

/** 人员（支持多选） */
export function fmt_form_user(value) {
  // 多选
  if(Array.isArray(value)) {
    return value.map(i => i.displayName || i.name).join(',');
  }
    
  let user = value || {};
  return user.displayName || user.name;
}

/** 关联工单 */
export function fmt_form_related_task(value) {
  return Array.isArray(value) ? value.map(item => item.taskNo).join(',') : '';
}

/** 字符串数组 */
export function fmt_form_array(value) {
  return value && value.join(', ')
}
/** 地址 */
export function fmt_form_address(value) {
  const { province, city, dist, address } = value;
  return value ? [province, city, dist, address].filter(d => !!d).join('-') : '';
}
/** 位置 */
export function fmt_form_location(value) {
  return JSON.stringify(value) !== '{}' ? value.address : ''
}

/** 默认格式化 */
function fmt_form_default(value) {
  if(Array.isArray(value)){
    return fmt_form_array(value);
  }

  return value;
}

export default {
  fmt_form_field,
  fmt_form_cascader,
  fmt_form_select,
  fmt_form_user,
  fmt_form_related_task,
  fmt_form_address,
  fmt_form_location,
  fmt_form_default
};