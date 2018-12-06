/**
 * 验证机制
 * 
 * 结构: Form组件 -> FormItem -> FormBuilder
 *  Form组件提供每种字段的具体实现
 *  FormItem主要用于验证
 *  FormBuilder作为容器，并提供整个表单的验证 
 * 
 * 注册流程：
 * 1. Form组件在挂载时触发form.add.field事件，将其注册到FormItem和FormBuilder中. 参数： {value: Function, fieldName: String}
 * 2. FormItem在收到form.add.field事件后，保存value用于取值（闭包），并在原参数上附加validate方法
 * 3. FormBuilder在收到form.add.field事件后，保存validate方法，在提交表单时验证整个表单
 * 
 * 验证流程：
 * 1. Form组件中的值发生变化时，触发form.validate事件
 * 2. FormItem接受到事件后，阻止事件冒泡并调用validate方法进行验证
 * 3. 表单提交时，FormBuilder根据自身维护的validateMap验证整个表单
 */

import {
  FormFieldMap,
} from './components';
import * as util from './util';

function createFormField(h, field, comp){
  const placeholder = util.genPlaceholder(field);
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
        <form-item label={field.displayName} validation>
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
    this.$el.addEventListener('form.remove.field', this.removeFieldHandler)
  },
  destroyed(){
    this.$el.removeEventListener('form.add.field', this.addFieldHandler);
    this.$el.removeEventListener('form.remove.field', this.removeFieldHandler)
  }
};

export default FormBuilder;
