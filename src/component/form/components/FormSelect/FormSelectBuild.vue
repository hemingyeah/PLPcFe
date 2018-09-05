<template>
  <div>
    <div>{{field.displayName}}</div>
    <div>
      <el-select 
        placeholder="请选择"
        clearable
        :multiple="isMulti"
        :value="value" @input="input">
        <el-option
          v-for="item in options" :key="item"
          :label="item" :value="item">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-select-build',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: [String, Array]
  },
  computed: {
    isMulti(){
      let setting = this.field.setting || {}
      return setting.isMulti;
    },
    options(){
      let setting = this.field.setting || {};
      return setting.dataSource || [];
    }
  },
  methods: {
    input(newValue){
      let oldValue = null;
      this.$emit('input', {newValue, oldValue})
    }
  }
}
</script>
