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
  computed: {
    disabled() {
      let field = this.field;
      return field.setting && field.setting.defaultValueConfig && !!field.setting.defaultValueConfig.isNotModify;
    }
  },
  watch: {
    field(newValue) {
      this.addFieldEvent();
    },
    value:{
      deep: true,
      handler() {
        this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
      }
    }
  },
  methods: {
    addFieldEvent() {
      // 触发注册事件，用于注册字段到外层 FormItem 组件，和 FormBuilder 组件
      let params = {value: this.getValue, fieldName: this.field.fieldName, field: this.field};
      let event = new CustomEvent('form.add.field', {detail: params, bubbles: true})
      this.$nextTick(() => this.$el.dispatchEvent(event));
    },
    input(event){
      this.inputForValue(event.target.value)
    },
    inputForValue(value){
      let oldValue = null;
      let newValue = value;
      
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    },
    /** 获取当前组件的值，验证用 */
    getValue(){
      return this.value;
    }
  },
  mounted(){
    this.addFieldEvent();
  },
  destroyed(){
    // 注册解绑事件，用于解绑组件
    let params = {fieldName: this.field.fieldName}
    let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true})
    this.$el.dispatchEvent(event);
  }
};

export default FormMixin;
