import { genPlaceholder} from '../util'

const FormMixin = {
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default(){
        return genPlaceholder(this.field);
      }
    },
  },
  watch: {
    value:{
      deep: true,
      handler() {
        // console.info('∆ FormMixin watch a change and trigger form validation.');
        this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
      }
    }
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    },
    /** 获取当前组件的值，验证用 */
    getValue(){
      return this.value;
    }
  },
  mounted(){
    // 触发注册事件，用于注册字段到外层 FormItem 组件，和 FormBuilder 组件
    let params = {value: this.getValue, fieldName: this.field.fieldName, field: this.field};
    let event = new CustomEvent('form.add.field', {detail: params, bubbles: true})
    this.$nextTick(() => this.$el.dispatchEvent(event));
  },
  destroyed(){
    // 注册解绑事件，用于解绑组件
    let params = {fieldName: this.field.fieldName}
    let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true})
    this.$el.dispatchEvent(event);
  }
};

export default FormMixin;
