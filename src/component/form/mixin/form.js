import { genPlaceholder} from '../util'
import { findComponentUpward } from '@src/util/assist'

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
    /** 
    * @description 不允许修改
    * 1.有默认值
    * 2.且 设置不允许修改
    */
    disabled() {
      let field = this.field;
      return (
        field.disabled 
        || (
          field.setting 
            && field.setting.defaultValueConfig 
            && !!field.setting.defaultValueConfig.isNotModify 
            && !!field.defaultValue
        )
      )
    },
    formBuilderComponent() {
      return findComponentUpward(this, 'form-builder')
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
    /** 获取当前组件的值，验证用 */
    getValue(){
      return this.value;
    },
    input(event){
      this.inputForValue(event.target.value)
    },
    inputForValue(value){
      let oldValue = null;
      let newValue = value;
      
      // 远程验证事件处理
      this.remoteValidateHandler()
      
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    },
    remoteValidateHandler() {
      if (!this.formBuilderComponent) return
      
      let { remoteValidateData = {} } = this.formBuilderComponent
      let { field } = remoteValidateData
      let { fieldName } = this.field
      
      if (field !== fieldName) {
        this.formBuilderComponent.outsideSetRemoteValidateData({
          field: fieldName,
          validateFunc: null,
        })
      }
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
