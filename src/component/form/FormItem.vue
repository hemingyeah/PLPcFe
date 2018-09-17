<template>
  <div class="form-item" @validate.native="validate">
    <label>{{label}}</label>
    <div>
      <slot></slot>
      <div v-if="errMessage">{{errMessage}}</div>
    </div>
  </div>
</template>

<script>
import Validator from './validator';

export default {
  name: 'form-item',
  props: {
    label: String,
    field: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    return {
      errMessage: '',
      valueFn: null, //function 用于获取注册字段的值和
    }
  },
  methods: {
    /** 默认返回true, 确保不影响表单提交 */
    async validate(){
      if(typeof this.valueFn != 'function') return true;

      let value = this.valueFn();
      let message = await Validator.validate(value, this.field);
      this.errMessage = message;

      return message;
    },
    validateHandler(event){
      event.stopPropagation(); //阻止事件继续冒泡
      this.$nextTick(() => this.validate())
    },
    /** 注册字段取值函数 */
    addFieldHandler(event){
      this.valueFn = event.detail.value;
      event.detail.validate = this.validate;
    },
    removeFieldHandler(event){
      this.valueFn = null;
    }
  },
  mounted(){
    this.$el.addEventListener('form.validate', this.validateHandler);
    this.$el.addEventListener('form.add.field', this.addFieldHandler);
    this.$el.addEventListener('form.remove.field', this.removeFieldHandler)
  },
  destroyed(){
    this.$el.removeEventListener('form.validate', this.handler)
    this.$el.removeEventListener('form.add.field', this.addFieldHandler);
    this.$el.removeEventListener('form.remove.field', this.removeFieldHandler)
  }
}
</script>

<style lang="scss">
.form-item{
  display: flex;
  flex-flow: row nowrap;
}
</style>

