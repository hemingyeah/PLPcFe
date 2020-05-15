/** 枚举基类 @author dongls */
export default class BaseEnum{

  /**
   * 根据name获取value
   * @param {string} name
   */
  getValue(name){
    for(let prop in this){
      let o = this[prop];
      if(o.name == name) return o.value;
    }
  }

  /**
   * 根据value获取name
   * @param {string} value 
   */
  getName(value){
    for(let prop in this){
      let o = this[prop];
      if(o.value == value) return o.name;
    }
  }
}