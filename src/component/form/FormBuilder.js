import { FieldManager } from './components';
import * as util from './util';

function createFormField(h, field, comp){
  if(null == comp.build) return comp.build;

  let data = {
    props: {
      field,
      value: getValue(field, this),
      placeholder: util.genPlaceholder(field),
    },
    on: {
      update: event => this.$emit('update', event)
    }
  };
  
  // if (field.formType === 'address' && !field.isSystem) {
  //   data.props.disableMap = true;
  // }

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
    },
    mode: {
      type: String,
      default: ''
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
      let promises = Object.keys(this.validateMap).map(key => {
        return this.validateMap[key]()
      });
      return Promise.all(promises)
        .then(results => results.every(msg => !msg))
        .catch(err => console.error('validate error', err))
    },
    /** 注册待验证的组件 */
    addFieldHandler(event){
      event.stopPropagation();

      let {fieldName, validate, field} = event.detail;
      if (event.detail && event.detail.field && event.detail.field.formType === 'info') {
        return;
      }
      this.validateMap[fieldName] = validate;
    },
    removeFieldHandler(event){
      event.stopPropagation();
      
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

        //判断是否是已隐藏字段
        if(field.isHidden == 1) return null;

        //判断是否可见
        if(!field.isVisible) return null;

        let comp = FieldManager.findField(field.formType);
        if(comp == null) {
          console.warn(`[not implement]: ${field.displayName}(${field.fieldName}): ${field.formType}. `)
          return null;
        }

        let formField = createFormField.call(this, h, field, comp);
        if(comp.formType == 'separator' || null == formField) return formField;
        
        let formItemClass = [];
        if(field.formType == 'attachment') formItemClass.push('form-item-attachment')

        if(field.formType === 'info') {
          return formField;
        }

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
