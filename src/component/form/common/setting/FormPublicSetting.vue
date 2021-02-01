<template>
  <div class="form-public-setting">
    <el-checkbox :value="field.isPublic" @input="update" :true-label="1" :false-label="0">
      设为公用字段
      <el-tooltip placement="top">
        <div slot="content">
          设为公用字段后，可以出现在左侧「公用字段」控件库，<br />并且可以在不同工单类型中共用字段的配置或选项值
        </div>
        <i class="iconfont icon-question"></i>
      </el-tooltip>
    </el-checkbox>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-public-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'isPublic');
    }
  }
}
</script>