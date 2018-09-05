<template>
  <div>
    <div>{{field.displayName}}</div>
    <div>
      <el-date-picker
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
        :value="value" @input="choose"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "form-date-build",
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
      console.log('ha?')
      let oldValue = null;
      this.$emit('input', {newValue, oldValue});
    }
  }
}
</script>

