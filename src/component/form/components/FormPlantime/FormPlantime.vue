<template>
  <div class="form-datetime">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      :type="type"
      :prefix-icon="`iconfont icon-fd-${type}`"
      :picker-options="pickerOptions"
      :value-format="formate"
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
    pickerOptions: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    formate() {
      return this.type == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss'
    },
    type() {
      return this.field.setting.dateType === 'date' ? 'date' : 'datetime';
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
