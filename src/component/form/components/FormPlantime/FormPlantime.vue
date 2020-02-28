<template>
  <div class="form-datetime">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      :type="type"
      :prefix-icon="`iconfont icon-fd-${type}`"
      value-format="yyyy-MM-dd HH:mm:ss"
      :placeholder="placeholder"
      :value="value" @input="choose"/>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-plantime',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      type: this.field.setting.dateType === 'date' ? 'date' : 'datetime'
    }
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
