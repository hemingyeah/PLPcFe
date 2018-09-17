//import FormField from './FormField';
import {
  FormFieldMap,
} from './components';

function createFormField(h, field, comp){
  let data = {
    props: {
      field,
      value: this.value[field.fieldName]
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