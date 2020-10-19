<template>
  <div class="form-public-setting">
    <el-checkbox :value="field.isPublic" @input="update" :true-label="0" :false-label="1">
      设为公用字段
      <el-tooltip  placement="top" >
        <div slot="content">设置后这个字段，可以出现在左侧「公用字段」控件库，用户可以在别的工单类型中使用，<br/>默认会带上字段配置的规则，并且可以在不同工单类型中共用字段的配置或选项值</div>
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
  name: 'form-public-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input',value, 'isPublic');
    }
  }
}
</script>

<style lang="scss" scoped>

</style>