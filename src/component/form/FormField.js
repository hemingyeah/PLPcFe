import {genRandomKey} from './util';

/**
 * 用于表单设计的字段类
 * 后端给出的字段数据需要调用 util.toFormField 转换成该格式
 * 
 * @author dongls 
 */
export default class FormField{
  /** 默认构造函数 */
  constructor(params = {}){
    let options = [];

    if(params.formType == 'select'){
      options.push({value: '选项1', isDefault: false})
    }

    this.fieldName = null;
    this.formType = params.formType; //字段类型
    this.displayName = params.displayName || '标题'; //标题
    this.isNull = 1; //是否必填
    this.isSearch = 0; //是否允许搜索
    this.placeHolder = null; //提示信息
    this.defaultValue = null; //默认值
    this.isSystem = params.isSystem || 0; //是否为系统字段

    this.options = options; //下拉菜单类型选项
    this.isMulti = false; //是否为多选
    this._id = this.fieldName || `field_${genRandomKey()}`;

    //辅助字段
    this.dragging = false; //当前字段时候正在被拖拽

  }

  /** 从Filed构建 */
  static fromField(){
    //todo
  }

  /** 将一个对象转换成FormDesignField对象 */
  static as(o){
    let formField = new FormField();

    formField.formType = o.formType;
    formField.displayName = o.displayName;

    return formField;
  }
}