<template>
  <div class="form-datetime">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      type="datetime"
      prefix-icon="iconfont icon-fd-datetime"
      value-format="yyyy-MM-dd HH:mm:ss"
      :placeholder="placeholder"
      :value="time" @input="choose"/>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
import { typeOf } from '@src/util/assist';

export default {
  name: 'form-datetime',
  mixins: [FormMixin],
  props: ['value'],
  watch: {
    value(v) {
      this.time = typeOf(v) === 'string' ? v : ''
    }
  },
  data() {
    return {
      time: ''
    }
  },
  mounted() {
    this.time = typeOf(this.value) === 'string' ? v : ''
  },
  methods: {
    choose(newValue){    
      let oldValue = null;
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
}
</script>

<style lang="scss">
.form-datetime{
  width: 100%;

  .el-input__inner {
    cursor: pointer;
  }

  .el-date-editor{
    width: 100%;
  }
}
</style>
