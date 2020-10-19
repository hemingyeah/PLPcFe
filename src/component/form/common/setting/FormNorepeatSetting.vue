<template>
  <div class="form-norepeat-setting">
      <el-checkbox :value="field.isDuplicateEntry" @input="update" :true-label="0" :false-label="1">
        不允许重复录入
        <el-tooltip content="提交表单时将自动校验后台相同内容的值，无法提交表单" placement="top">
          <i class="iconfont icon-info"></i>
        </el-tooltip>
      </el-checkbox>
    
  </div>
</template>

<script>
/* config */
import * as config from '@src/component/form/config';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-norepeat-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input',value, 'isDuplicateEntry');
    }
  }
}
</script>

<style>

</style>