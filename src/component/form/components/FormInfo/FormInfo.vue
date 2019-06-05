<template>
  <div class="form-info">
    <input
      type="text"
      :value="value"
      @compositionstart="compositionstart"
      @compositionend="compositionend"
      @input="inputEvent"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"
      autocomplete="off"
    />
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-info',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      $isInputZh: false
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
      if (this.$data.$isInputZh) return

      this.input(event);
    }
  }
}
</script>

<style lang="scss">
.form-info {
  width: 100%;
  input {
    width: 100%;
  }
}
</style>
