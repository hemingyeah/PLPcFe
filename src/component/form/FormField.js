import {randomString} from '@src/util/lang';
import Field from '@model/Field'

/** 补全formType 为select时的所需字段 */
function fillPropForSelect(params){
  let setting = params.setting || {};

  let options = [];
  let isMulti = false;
  let dependencies = setting.dependencies || {};

  if(params.formType == 'select'){
    let dataSource = setting.dataSource || [];
    let initDefault = false;

    isMulti = setting.isMulti === true;
    options = dataSource.map(value => {
      let isDefault = false;
      // 只有第一个默认值生效
      if(!initDefault && value == params.defaultValue){
        isDefault = true;
        initDefault = true;
      }

      return {value, isDefault};
    })

    // 没有选项，添加默认项
    if(options.length == 0) options.push({value: '选项1', isDefault: false})
  }

  return {options, isMulti, dependencies};
}

/** 补全fileName 为serialNumber时的所需字段 */
function fillPropForSerialNumber(params){
  let setting = params.setting || {};

  let serialNumberUnique = false;

  if(params.fieldName == 'serialNumber'){
    serialNumberUnique = (setting.serialNumberUnique === true);
  }

  return { serialNumberUnique };
}

/**
 * 用于表单设计的字段类
 * 后端给出的字段数据需要调用 util.toFormField 转换成该格式
 * 
 * @author dongls 
 */
export default class FormField{
  /** 
   * 默认构造函数
   * @param {object} params - 构造函数参数
   * @param {string} params.formType - 字段类型
   * @param {string} params.displayName - 字段名称
   */
  constructor(params = {}){
    // 旧字段没有id字段，而是使用fieldId替代
    this.id = params.id || params.fieldId;
    // 前端生成fieldName
    this.fieldName = params.fieldName || `field_${randomString(16)}`;
    // 字段类型
    this.formType = params.formType; 
    this.displayName = params.displayName || '标题'; 
    // 是否必填   0 - 必填，1 - 非必填
    this.isNull = typeof params.isNull == 'number' ? params.isNull : 1; 
    // 是否允许搜索 0 - 不允许，1 - 允许
    this.isSearch = typeof params.isSearch == 'number' ? params.isSearch : 0; 
    this.placeHolder = params.placeHolder; // 提示信息
    this.defaultValue = params.defaultValue; // 默认值
    // 是否为系统字段 0 - 非系统字段，1 - 系统字段
    this.isSystem = typeof params.isSystem == 'number' ? params.isSystem : 0;

    // formType 为select时需要补全一下字段
    let {options, isMulti, dependencies} = fillPropForSelect(params)
    this.options = options; // 下拉菜单类型选项
    this.isMulti = isMulti; // 是否为多选
    this.dependencies = dependencies; // 逻辑显示项用

    // 编号 需要补全字段
    let { serialNumberUnique } = fillPropForSerialNumber(params);
    this.serialNumberUnique = serialNumberUnique;

    
    let setting = params.setting || {};
    
    // 处理客户地址
    if (this.fieldName === 'customerAddress' && this.isSystem) {
      this.setting = {};
      this.setting.customerAddressConfig = setting.customerAddressConfig || {
        adProvince: '河北省',
        adCity: '唐山市',
        adDist: '古冶区'
      };
    }
    // 处理客户名称
    if (this.displayName === '客户' && this.fieldName === 'name' && this.isSystem) {
      this.setting = {};
      this.setting.customerNameDuplicate = setting.customerNameDuplicate || false;
    }
    // 处理客户地址
    if (this.displayName === '客户编号' && this.fieldName === 'serialNumber' && this.isSystem) {
      this.setting = {};
      this.setting.autoSerialNumber = setting.autoSerialNumber || false;
    }
    // 处理客户电话
    if (this.displayName === '电话' && this.fieldName === 'lmPhone' && this.isSystem) {
      this.setting = {};
      this.setting.phoneUnique = setting.phoneUnique || false;
    }
  
    // 辅助字段
    this.dragging = false; // 当前字段时候正在被拖拽
  }

  /** @deprecated 兼容旧有写法*/
  get _id(){
    return this.fieldName;
  }

  /** 从Filed构建为组件可接受的字段 */
  static fromField(field){ 
    return new FormField(field);
  }

  /** 将字段转换成后端可接收的字段 */
  static toField(field){
    let option = {};

    option.id = field.id;
    option.fieldName = field.fieldName;
    option.formType = field.formType;
    option.displayName = field.displayName;
    option.isNull = field.isNull;
    option.isSearch = field.isSearch;
    option.placeHolder = field.placeHolder;
    option.isSystem = field.isSystem;

    let setting = {};
    let defaultValue = null;

    // 处理下拉选项
    if(field.formType == 'select'){
      let dataSource = [];
      let opts = field.options || [];
      for(let i = 0; i < opts.length; i++){
        let opt = opts[i];
        dataSource.push(opt.value);
        // 只有第一个默认值生效
        if(opt.isDefault && !defaultValue) {
          defaultValue = opt.value;
        }
      }
      setting.isMulti = field.isMulti;
      setting.dataSource = dataSource;
    }
    // 编号
    if(field.fieldName == 'serialNumber') {
      setting.serialNumberUnique = (field.serialNumberUnique || false);
    }

    
    if (field.setting) {
      setting = {
        ...setting,
        ...field.setting
      }
    }
    
    // 过滤空白依赖
    let dependencies = field.dependencies || {};
    Object.keys(dependencies).forEach(prop => {
      let dep = dependencies[prop];
      if(!Array.isArray(dep) || dep.length == 0) {
        delete dependencies[prop]
      }
    })
    
    if(Object.keys(dependencies).length > 0) {
      setting.dependencies = dependencies;
    }
    
    option.setting = setting;
    option.defaultValue = defaultValue;

    return new Field(option);
  }
}