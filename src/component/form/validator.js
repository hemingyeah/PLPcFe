//单行最大长度
export const SINGLE_LINE_MAX_LEN = 50;
//多行最大长度
export const MULTI_LINE_MAX_LEN = 500;

const RuleMap = {text};

/** 单行文本验证，50字以内 */
function text(value, field = {}){
  return new Promise((resolve, reject) => {
    //先验证长度
    if(value != null && value.toString().length > SINGLE_LINE_MAX_LEN){
      return resolve(`长度不能超过${SINGLE_LINE_MAX_LEN}个字符`);
    }
  
    //允许为空则不继续验证
    if(field.isNull == 1) return resolve(null);
    //不允许为空
    if(value == null || value.toString().length == 0) return resolve(`必填`);
  
    resolve(null);
  })
}


 

/**
 * 根据字段类型验证值
 * @param {*} value 值
 * @param {*} formType 字段类型 
 * @param {*} options 可选项
 */
function validate(value, field){
  let fn = RuleMap[field.formType];
  return typeof fn == 'function' ? fn(value, field) : Promise.resolve(null);
}

const Validator = {validate};

export default Validator;