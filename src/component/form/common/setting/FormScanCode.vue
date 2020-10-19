<template>
  <div class="form-public-setting">
    <el-checkbox :value="field.isScancode" @input="update" :true-label="0" :false-label="1">
      支持扫码录入
      <el-tooltip  content="支持二维码/条形码，仅支持移动端使用" placement="top" >
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
  name: 'form-scan-code',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input',value, 'isScancode');
    }
  }
}
</script>

<style lang="scss" scoped>

</style>