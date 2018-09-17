<template>
  <div>
    <el-date-picker
      type="date"
      value-format="yyyy-MM-dd"
      placeholder="选择日期"
      :value="value" @input="choose"/>
  </div>
</template>

<script>
export default {
  name: "form-date",
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    choose(newValue){
      let oldValue = null;
      this.$emit('input', {newValue, oldValue, field: this.field});
    }
  }
}
</script>

