<template>
  <div class="mobile-show-setting">
    <el-tooltip content="勾选后，将会在移动端工单卡片上显示生效" placement="top">
      <el-checkbox :value="field.isAppShow" @input="update" :true-label="1" :false-label="0" :disabled="isDisabled">
        移动端展示
        ( {{ mobileShowField.length }}/{{ taskMobileShowMaxLengthMax }})
        <i class="iconfont icon-question"></i>
      </el-checkbox>
    </el-tooltip>
  </div>
</template>

<script>
/* config */
import * as config from '@src/component/form/config';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'mobile-show-setting',
  props: {
    ...settingProps,
  },
  computed: {
    // 是否禁用
    isDisabled() {
      return this.mobileShowField.length >= this.taskMobileShowMaxLengthMax && this.field.isAppShow !== 1;
    },
    // 工单：移动端显示的 字段列表
    mobileShowField() {
      return this.fields.filter(field => field.isAppShow === 1);
    },
    // 工单移动端展示最大数量
    taskMobileShowMaxLengthMax() {
      return config.TASK_MOBILE_SHOW_MAX_LENGTH_MAX;
    }
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'isAppShow');
    }
  }
}
</script>

<style>

</style>