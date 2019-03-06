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
import { FormFieldMap } from './components';
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
      update: event => this.$emit('update', event)
    }
  };

  return h(comp.build, data);
}

function getValue(field, ctx){
  return ctx.value[field.fieldName]
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
      validateMap: {} // 所有注册的验证方法
    }
  },
  methods: {
    /** 获取该dom元素 */
    findRootEl(){
      return this.$el;
    },
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
    let formGroups = this.fields
      .map(field => {
        let fieldName = field.fieldName;

        if(this.$slots[fieldName]) {
          return this.$slots[fieldName];
        }
        
        if(this.$scopedSlots[fieldName]) {
          return this.$scopedSlots[fieldName]({field, value: getValue(field, this)});
        }
        
        // 判读是否隐藏该字段
        if(util.isHiddenField(field, this.value, this.fields)) return null;

        let comp = FormFieldMap.get(field.formType);
        if(comp == null) return;

        let formField = createFormField.call(this, h, field, comp);
        if(comp.formType == 'separator') return formField;
        
        let formItemClass = [];
        if(field.formType == 'attachment') formItemClass.push('form-item-attachment')
        return (
          <form-item
            label={field.displayName} class={formItemClass}
            key={field.fieldName} findRootEl={this.findRootEl} validation>
            {formField}
          </form-item>
        );
      })
      .filter((vnode, index, arr) => {
        // 过滤不渲染节点
        if(null == vnode) return false;

        let options = vnode.componentOptions || {};
        // 非分割线字段直接显示
        if(options.tag != 'form-separator') return true;

        // 只有在下一个元素存在且不是分割线时，才显示该分割线
        // 如果该节点后面没有非分割线字段，则不显示
        for(let i = index + 1; i < arr.length; i++){
          let next = arr[i];
          if(next == null) continue;
          
          let nextOptions = next.componentOptions || {};
          return nextOptions.tag != 'form-separator';
        }

        // 默认返回false, 走到这里意味着后面的节点都是null
        return false;
      });

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
