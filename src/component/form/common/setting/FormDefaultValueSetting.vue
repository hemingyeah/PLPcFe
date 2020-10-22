<template>
  <div class="form-setting-group form-default-value-setting">
    <h4 class="form-item-title">
      默认值
      <el-tooltip content="设置后在输入框中可默认显示" placement="top">
        <i class="iconfont icon-question"></i>
      </el-tooltip>
    </h4>
    <div class="form-item-box">
      <input type="text" placeholder="请输入默认值" v-model="field.defaultValue" @input="update(field.defaultValue, 'defaultValue')" />
      <el-checkbox v-model="defaultValueConfig.isNotModify" @change="update(defaultValueConfig, 'defaultValueConfig', true)" :true-label="1" :false-label="0" :disabled="modifyDefaultValueDisabled">不允许修改</el-checkbox>
    </div>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-default-value-setting',
  props: {
    ...settingProps
  },
  computed: {
    defaultValueConfig() {
      return this.field.setting.defaultValueConfig || {}
    },
    /** 
    * @description 不允许修改
    * 必填时且无默认值时不可勾选
    */
    modifyDefaultValueDisabled() {
      let { isNull, defaultValue } = this.field;
      return isNull == 0 && !defaultValue;
    }
  },
  methods: {
    update(value, prop, isSetting = false) {
      this.$emit('input', value, prop, isSetting);
    }
  },
  watch: {
    modifyDefaultValueDisabled(newValue) {
      if (newValue) {
        this.defaultValueConfig.isNotModify = 0;
        this.update(this.defaultValueConfig, 'defaultValueConfig', true);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-default-value-setting {
  .form-item-title {
    margin-bottom: 8px;
  }
}
</style>