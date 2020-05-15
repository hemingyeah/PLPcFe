<template>
  <div class="form-location">
    <input
      type="text"
      :value="value"
      @compositionstart="compositionstart"
      @compositionend="compositionend"
      @input="inputEvent"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"
      autocomplete="off"/>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-location-search',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
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
  .form-location{
    width: 100%;

    input{
      width: 100%;
    }
  }
</style>
