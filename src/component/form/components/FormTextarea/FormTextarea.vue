<template>
  <div class="form-textarea">
    <textarea :id="`form_${field.fieldName}`" @input="input" :value="value" rows="3" :placeholder="placeholder" maxlength="500"></textarea>
    <span class="form-textarea-summary" :style="{right: `${offsetRight}px`}">{{summary}}</span>
  </div>
</template>

<script>
import {scrollBarWidth} from '@src/util/dom';
export default {
  name: 'form-textarea',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    summary(){
      let length = this.value ? this.value.length : 0;
      return `${length}/500`
    },
    offsetRight(){
      return scrollBarWidth() + 4;
    }
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      this.$emit('input', {newValue, oldValue, field: this.field});
      this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
    },
    /** 获取当前组件的值，验证用 */
    getValue(){
      return this.value;
    }
  },
  mounted(){
    //触发注册事件，用于注册字段到外层formitem组件，和formbuilder组件
    let params = {value: this.getValue, fieldName: this.field.fieldName};
    let event = new CustomEvent('form.add.field', {detail: params, bubbles: true})
    this.$nextTick(() => this.$el.dispatchEvent(event));
  },
  destroyed(){
    //注册解绑事件，用于解绑组件
    let params = {fieldName: this.field.fieldName}
    let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true})
    this.$el.dispatchEvent(event)
  }
}
</script>

<style lang="scss">
.form-textarea{
  width: 100%;
  position: relative;

  textarea{
    width: 100%;
    padding: 3px 10px 16px 10px;
  }
}

.form-textarea-summary{
  position: absolute;
  font-size: 12px;
  line-height: 12px;
  bottom: 2px;
  color: #9a9a9a;
  background-color: #fff;
  z-index: 1;
}
</style>

