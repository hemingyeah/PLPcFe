/** a custom runtime error */
export default class Exception extends Error{
  /**
   * 构造函数
   * @param {*} message - 错误信息
   * @param {*} code - 错误码，用于辅助错误的判断
   */
  constructor(message, code){
    super(message);

    this.name = Exception.name;
    this.code = code;
  }
}

