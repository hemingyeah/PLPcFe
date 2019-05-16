<template>
  <div class="form-select">
    <el-select
      :id="`form_${field.fieldName}`"
      :placeholder="placeholder"
      :clearable="clearable"
      :multiple="isMulti"
      ref="elSelect"
      filterable
      :value="value" @change="input">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.text"
        :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: 'form-select',
  mixins: [FormMixin],
  props: {
    value: [String, Array],
    source: {
      type: Array
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isMulti(){
      let setting = this.field.setting || {};
      return setting.isMulti;
    },
    options(){
      let setting = this.field.setting || {};
      let dataSource = setting.dataSource || [];

      dataSource = dataSource.map(d => {
        if (typeof d === 'string') {
          return {
            text: d,
            value: d,
          }
        }
        return d;
      });

      return this.source || dataSource || [];
    }
  },
  methods: {
    input(newValue){
      let oldValue = null;
      this.$refs.elSelect.blur();
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
}
</script>


<style lang="scss">
.form-select{
  width: 100%;

  .el-select{
    width: 100%;

    .el-input__inner{
      padding-left: 10px;
    }
  }
}
</style>
