//import FormField from './FormField';
import _ from 'lodash';
import {
  FormFieldMap,
} from './components';

const util = {
  /**
   * 初始化所有字段的初始值
   * @param {*} fields 字段
   * @param {*} origin 原始值
   * @param {*} target 待合并的值
   */
  initialize(fields = [], origin = {}){
    let result = {};

    fields.forEach(field => {
      let formType = field.formType;
      //客户和编号类型不出初始化值
      if(field.formType == 'customer' || field.formType == 'eventNo' || field.formType == 'taskNo') return;

      let setting = field.setting || {};
      let fieldName = field.fieldName;
      let dataSource = setting.dataSource || [];
      let defaultValue = field.defaultValue || '';

      //屏蔽工单上单选里不存在默认值
      if(this.isSelect(field) && dataSource.indexOf(defaultValue) < 0) defaultValue = '';

      //优先级、服务类型、服务内容在空值时选中第一个
      if(field.formType == 'level' || field.formType == 'serviceContent' || field.formType == 'serviceType') {
        if(defaultValue == '') defaultValue = dataSource[0];
      }


      //单选且必填时 或 非系统字段，默认选中第一个
      // if( (field.isNull == 0 || field.isSystem == 1) && this.isSelect(field)){
      //   let data = setting.dataSource || [];
      //   if(data.length > 0) defaultValue = data[0];
      // }

      //多选和附件的默认值初始化为空数组
      if(this.isMultiSelect(field) || field.formType == 'attachment'){
        defaultValue = [];
      }

      //多级选择，需要拆解默认值
      if(formType == 'cascader'){
        let cascaderDafaultValue = [];
        if(defaultValue) cascaderDafaultValue = defaultValue.split(',')

        defaultValue = cascaderDafaultValue;
      }

      //地址的默认值初始化为对象
      if(field.formType == 'address') defaultValue = {};
      //人员的默认值初始化为对象
      if(field.formType == 'user') defaultValue = {}

      //来自表单的值，用于编辑时初始化值
      let attribute = origin.attribute || {};
      let formData = field.isSystem === 1 ? origin[fieldName] : attribute[fieldName];

      //多选改单选,若原来有值则保留第一个
      if(this.isSelect(field) && Array.isArray(formData)) {
        formData = (formData && formData.length >= 1) ? formData[0] : '';
      }
      //单选改多选，将原值加入数组
      if(this.isMultiSelect(field) && !Array.isArray(formData)) {
        formData = formData ? [formData] : [];
      }
      result[fieldName] = formData == null ? defaultValue : formData;
    });

    return _.assign({}, origin.attribute, result);
  },

  /**
   * 是否为多选类型
   */
  isMultiSelect(field){
    let setting = field.setting || {};

    return (field.formType == 'select' && setting.isMulti) || field.formType == 'selectMulti';
  },

  /**
   * 是否为单选类型
   */
  isSelect(field){
    let setting = field.setting || {};

    return (field.formType == 'select' && !setting.isMulti)
      || field.formType == 'level'
      || field.formType == 'serviceContent'
      || field.formType == 'serviceType';
  },

  /**
   * 是否为日期类型 yyyy-MM-dd
   */
  isDate(field){
    let setting = field.setting;

    return field.formType == 'date' || (field.formType == 'planTime' && (setting != null && setting.dateType == 'date'));
  },

  /**
   * 是否为日期时间类型 yyyy-MM-dd HH:mm:ss
   */
  isDatetime(field){
    let setting = field.setting;

    return field.formType == 'datetime' || (field.formType == 'planTime' && (setting == null || setting.dateType != 'date'));
  }
};

function placeholder(field, defaultText = ''){
  let text = '';
  if(field.isNull == 0) {
    text += (util.isSelect(field) || util.isMultiSelect(field)) ? "[必选]" : "[必填]"
  }

  if(field.placeHolder) return text + field.placeHolder;

  if(field.formType == 'number') text += '请输入数字';
  if(field.formType == 'address') text += '请填写详细地址';

  if(field.formType == 'relationCustomer') text += '由客户信息查询'
  if(field.formType == 'relationProduct') text += '由产品信息查询'

  if(field.formType == 'user') text += '请选择人员'

  if(util.isDate(field)) text += '日期';
  if(util.isDatetime(field)) text += '日期+时间';
  if((util.isSelect(field) || util.isMultiSelect(field) || field.formType == 'cascader') && !text) text += '请选择';

  return text;
}

function createFormField(h, field, comp){
  const placeHolder = placeholder(field);
  console.log('placeHolder', placeHolder);
  let data = {
    props: {
      field,
      value: this.value[field.fieldName],
      placeHolder,
    },
    on: {
      input: event => this.$emit('input', event)
    }
  };

  return h(comp.build, data);
}

const FormBuilder = {
  name: 'form-builder',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    return {
      validateMap: {} //所有注册的验证方法
    }
  },
  methods: {
    /**    
     * 检测所有字段的结果，都验证通过，返回true, 否则返回false
     */
    validate(){
      let promises = Object.keys(this.validateMap).map(key => this.validateMap[key]())
      
      return Promise.all(promises).then(results => results.every(msg => msg == null))
    },
    /** 注册待验证的组件 */
    addFieldHandler(event){
      let {fieldName, validate} = event.detail;
      this.validateMap[fieldName] = validate;
    },
    removeFieldHandler(event){
      let {fieldName} = event.detail;
      delete this.validateMap[fieldName];
    }
  },
  render(h){
    let formGroups = this.fields.map(field => {
      let comp = FormFieldMap.get(field.formType);
      if(comp == null) return;
      
      let formField = createFormField.call(this, h, field, comp);
    
      return (
        <form-item label={field.displayName} field={field}>
          {formField}
        </form-item>
      );
    }).filter(item => item != null);

    return (
      <div class="form-builder">
        {this.$slots.default}
        {formGroups}
      </div>
    )
  },
  mounted(){
    this.$el.addEventListener('form.add.field', this.addFieldHandler)
  }
};

export default FormBuilder;