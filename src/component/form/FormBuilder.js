import {
  FormFieldMap,
} from './components';
import * as util from './util';

const DefaultPlaceholer = {
  text: '最多50字',
  number: '请输入数字',
  address: '请填写详细地址',
  relationCustomer: '由客户信息查询',
  relationProduct: '由产品信息查询',
  user: '请选择人员',
  date: '日期',
  datetime: '日期 + 时间',
  select: '请选择'
}

function buildPlaceholder(field, defaultText = ''){
  let text = '';
  if(field.isNull == 0) {
    text += (util.isSelect(field) || util.isMultiSelect(field)) ? "[必选] " : "[必填] "
  }

  if(field.placeHolder) return text + field.placeHolder;

  let key = field.formType;
  if(util.isDate(field)) key = 'date';
  if(util.isDatetime(field)) key = 'datetime';
  if(util.isSelect(field) || util.isMultiSelect(field) || field.formType == 'cascader') key = 'select';  
  return text + (DefaultPlaceholer[key] || '');
}

function createFormField(h, field, comp){
  const placeholder = buildPlaceholder(field);
  let data = {
    props: {
      field,
      value: getValue(field, this),
      placeholder,
    },
    on: {
      input: event => this.$emit('input', event)
    }
  };

  return h(comp.build, data);
}

function getValue(field, ctx){
  return ctx.value[field.fieldName]
}

function createGroup(fields){
  let groups = [];

  let group = {title: '',fields: []};
  fields.forEach(field => {
    if(field.formType == 'separator'){
      if(group.fields.length > 0) groups.push(group);
      group = {title: field.displayName,fields: []};
      return;
    }

    group.fields.push(field);
  });

  return groups;
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
      let promises = Object.keys(this.validateMap).map(key => this.validateMap[key]());
      
      return Promise.all(promises)
        .then(results => results.every(msg => !msg))
        .catch(err => console.error('validate error', err))
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
    // let groups = createGroup(this.fields);
    // let formGroups = groups.map(group => {
    //   let fields = group.fields || [];

    //   let formItems = fields
    //     .map(field => {
    //       let comp = FormFieldMap.get(field.formType);
    //       if(comp == null) return;

    //       let formField = createFormField.call(this, h, field, comp);
    //       if(comp.formType == 'separator') return formField;
        
    //       return (
    //         <form-item label={field.displayName} field={field}>
    //           {formField}
    //         </form-item>
    //       );
    //     })
    //     .filter(item => item != null);
      
    //   return (
    //     [
    //       group.title ? <h4>{group.title}</h4> : '',
    //       <div class="form-builder-group">
    //         {formItems}
    //       </div>
    //     ]
    //   )

      // return (
      //   <fieldset>
      //     <legend>{group.title}</legend>
      //     {formItems}
      //   </fieldset>
      // );
    //})

    let formGroups = this.fields.map(field => {
      let fieldName = field.fieldName;

      if(this.$slots[fieldName]) {
        return this.$slots[fieldName];
      }
      
      if(this.$scopedSlots[fieldName]) {
        return this.$scopedSlots[fieldName]({field, value: getValue(field, this)});
      }

      let comp = FormFieldMap.get(field.formType);
      if(comp == null) return;

      let formField = createFormField.call(this, h, field, comp);
      if(comp.formType == 'separator') return formField;
    
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
