<template>
  <div class="form-repeat-setting">
    <el-checkbox :value="field.setting.isRepeat" @input="update" :true-label="1" :false-label="0">
      不允许重复值
      <el-tooltip content="提交表单时将自动校验后台相同内容的值，如果重复，无法提交表单" placement="top">
        <i class="iconfont icon-question"></i>
      </el-tooltip>
    </el-checkbox>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-repeat-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'isRepeat', true);
    }
  }
}
</script>