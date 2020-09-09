<template>
  <div class="form-text">
    <input
      type="text"
      :value="value"
      @compositionstart="compositionstart"
      @compositionend="compositionend"
      @input="inputEvent"
      :placeholder="field.placeholder?field.placeholder:placeholder"
      :maxlength="field.maxlength?field.maxlength:1000"
      :id="`form_${field.fieldName}`" 
      autocomplete="off"
      :disabled="field.disabled"/>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-text',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 是否是输入中文
      $isInputZh: false,
    }
  },
  methods: {
    /* 输入文字之前 */
    compositionstart(event) {
      this.$data.$isInputZh = true;
    },
    /* 输入文字之后 */
    compositionend(event) {
      this.$data.$isInputZh = false;
      this.input(event);
    },
    inputEvent(event) {
      // 如果是在中文输入 return
      if(this.$data.$isInputZh) return

      this.input(event);
    }
  },
}
</script>

<style lang="scss">
.form-text{
  width: 100%;

  input{
    width: 100%;
  }
}
</style>
