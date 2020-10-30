let id = 1000;

export default class Option{

  constructor(value, isDefault, parent){
    this.id = id; 
    this.value = value || ''; // 选项值
    this.isDefault = isDefault === true; // 是否为默认值
    this.deep = parent == null ? 0 : parent.deep + 1; // 套嵌深度
    this.active = false;

    this.children = []; // 子选项
    
    // 获取父选项
    this.parent = function(){
      return parent;
    }

    id++;
  } 

  /** 设置是否为默认值 */
  setIsDefault(defaultValue){
    let parent = this.parent();
    this.isDefault = (parent == null || parent.isDefault) && defaultValue === this.value;
  }
}