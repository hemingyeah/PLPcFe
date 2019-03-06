<template>
  <div class="form-radio">
    <el-radio-group v-model="value">
      <el-radio 
        v-for="(s, index) in source" 
        :label="s.value" 
        :key="`${s}_${index}`"
        :disabled="s.disabled"
      >
        {{ s.label }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: 'form-radio',
  mixins: [FormMixin],
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    },
    source: {
      type: Array,
      default: () => []
    }
  },
}
</script>

<style lang="scss">
.form-radio{
  width: 100%;

  label{
    width: 100%;
  }
}
</style>
