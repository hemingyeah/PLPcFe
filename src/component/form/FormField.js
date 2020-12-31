import {randomString} from '@src/util/lang';
import Field from '@model/Field';
import { isSelect, isMultiSelect, isCascader} from './util';
import * as FormInfoConfig from './components/FormInfo/config';

/** 补全formType 为select时的所需字段 */
function fillPropForSelect(params){
  let setting = params.setting || {};

  let options = [];
  let isMulti = false;
  let dependencies = setting.dependencies || {};

  if(isSelect(params) || isMultiSelect(params)){

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
    if(options.length == 0) {
      // 优先级
      if(params.formType == 'level') {
        options.push({value: '中', isDefault: false}, {value: '低', isDefault: false}, {value: '高', isDefault: false});
      }
      // 服务内容
      else if(params.formType == 'serviceType') {
        options.push({value: '保内免费', isDefault: false}, {value: '保内收费', isDefault: false}, {value: '保外免费', isDefault: false}, {value: '保外收费', isDefault: false});
      }
      // 服务类型
      else if(params.formType == 'serviceContent') {
        options.push({value: '安装', isDefault: false}, {value: '维修', isDefault: false}, {value: '保养', isDefault: false}, {value: '巡检', isDefault: false}, {value: '检查', isDefault: false});
      }
      else { 
        options.push({value: '', isDefault: false}, {value: '', isDefault: false}, {value: '', isDefault: false});
      }
    }
    
  }

  return {options, isMulti, dependencies};
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
    this.placeHolder = params.placeHolder || ''; // 提示信息
    this.defaultValue = params.defaultValue; // 默认值
    // 是否为系统字段 0 - 非系统字段，1 - 系统字段
    this.isSystem = typeof params.isSystem == 'number' ? params.isSystem : 0;
    // 工单专属字段： 是否在移动端显示 0 - 不显示，1 - 显示
    this.isAppShow = typeof params.isAppShow == 'number' ? params.isAppShow : 0;
    // 是否隐藏   1 - 隐藏，0 - 不隐藏
    this.isHidden = typeof params.isHidden == 'number' ? params.isHidden : 0; 
    // 工单专属字段：是否是公用字段 1 - 是，0 - 否
    this.isCommon = typeof params.isCommon == 'number' ? params.isCommon : 0;
    // 公用字段: 1.设为公用字段设置 2.需判断是否是升级为公用字段而非拖拽进来的公共字段 而不能直接用isCommon
    this.isPublic = this.isCommon;
    // 是否是拖拽进来的公共字段 0 - 不是，1 - 是
    this.isDragCommon = typeof params.isDragCommon == 'number' ? params.isDragCommon : 0;

    // formType 为select时需要补全一下字段
    let {options, isMulti, dependencies} = fillPropForSelect(params)
    this.options = options; // 下拉菜单类型选项
    this.isMulti = isMulti; // 是否为多选
    this.dependencies = dependencies; // 逻辑显示项用

    this.setting = params.setting || {};

    // // 处理客户地址
    if (this.fieldName === 'customerAddress' && this.isSystem && !params.setting.customerAddressConfig) {
      this.setting.customerAddressConfig = {};
    }
    
    // 多级菜单设置默认项
    if(isCascader(params)){
      this.setting = { maxDeep: 2, dataSource:[{value:'一级选项 1', children:[{ value : '二级选项 1'}]}]}
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
    option.isAppShow = field.isAppShow;
    option.isHidden = field.isHidden;
    option.isCommon = field.isCommon;
    option.isPublic = field.isPublic;
    option.isDragCommon = field.isDragCommon;

    let setting = {};
    let defaultValue = null;

    // 处理下拉选项
    if(isSelect(field) || isMultiSelect(field)){
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
      field.formType == 'select' && (setting.isMulti = field.isMulti);
      setting.dataSource = dataSource;
    }

    if(field.formType === 'info') {
      option.placeHolder = option.placeHolder || FormInfoConfig.PLACE_HOLDER;
    }

    if(field.formType === 'cascader' || field.formType === 'text' || field.formType === 'textarea' || field.formType === 'number') {
      defaultValue = field.defaultValue;
    }

    if (field.setting) {
      setting = {
        ...field.setting,
        ...setting,
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
    } else {
      delete setting.dependencies
    }
    
    option.setting = setting;
    option.defaultValue = defaultValue;

    return new Field(option);
  }
}