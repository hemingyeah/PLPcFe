<template>
  <div class="form-search-setting">
    <el-checkbox :value="field.isSearch" @input="update" :true-label="1" :false-label="0">支持高级搜索</el-checkbox>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-search-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'isSearch');
    }
  }
}
</script>