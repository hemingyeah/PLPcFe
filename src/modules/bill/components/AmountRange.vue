<template>
  <div class="amount-item-content">
    <el-input v-model="value.amountStart" @change="handleChange(value, 'start')"></el-input>
    <span>至</span>
    <el-input v-model="value.amountEnd" @change="handleChange(value, 'end')"></el-input>
  </div>
</template>

<script>
export default {
  name: 'bill-amount-range',
  props: {
    value: {
      type: Object,
      default: () => ({
        amountStart: '',
        amountEnd: ''
      })
    },
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleChange(newValue, msg) {
      let oldValue = null;
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
}
</script>

<style lang="scss">
.amount-item-content {
  display: flex;
  justify-content: space-between;
  line-height: 32px;

  .el-input {
    width: 110px;
  }
}
</style>