<template>
  <div class="form-required-setting">
    <el-checkbox :value="field.isNull" @input="update" :true-label="0" :false-label="1">是否必填</el-checkbox>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-required-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'isNull');
    }
  }
}
</script>