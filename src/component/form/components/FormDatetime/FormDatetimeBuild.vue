<template>
  <div>
    <div>{{field.displayName}}</div>
    <div>
      <el-date-picker
        type="datetime"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="选择日期时间"
        :value="value" @input="choose"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "form-datetime-build",
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
      this.$emit('input', {newValue, oldValue});
    }
  }
}
</script>

