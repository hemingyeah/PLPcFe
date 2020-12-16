<template>
  <div class="form-setting-group form-default-value-setting">
    <h4 class="form-item-title">
      默认值
      <el-tooltip v-show="showTip" :content="tooltipContent" placement="top">
        <i class="iconfont icon-question"></i>
      </el-tooltip>
    </h4>
    <div class="form-item-box">
      <!-- 后备插槽(默认渲染) -->
      <slot>
        <input :type="type" placeholder="请输入默认值" v-model="field.defaultValue" @input="handleInput" />
        <el-checkbox v-model="defaultValueConfig.isNotModify" @change="update(defaultValueConfig, 'defaultValueConfig', true)" :true-label="1" :false-label="0" :disabled="modifyDefaultValueDisabled">不允许修改</el-checkbox>
      </slot>
    </div>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

import { FORM_FIELD_TEXT_MAX_LENGTH } from '@src/model/const/Number.ts';

export default {
  name: 'form-default-value-setting',
  props: {
    ...settingProps,
    type: {
      type: String,
      default: 'text'
    },
    showTip: {
      type: Boolean,
      default: true
    },
    tooltipContent: {
      type: String,
      default: '设置后在输入框中可默认显示'
    },
    maxLength: {
      type: Number,
      default: FORM_FIELD_TEXT_MAX_LENGTH
    }
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
      return !this.field.defaultValue;
    }
  },
  methods: {
    handleInput(e) {
      let value = e.target.value;
      if(value.length > this.maxLength) {
        value = value.slice(0, this.maxLength);
      }

      this.update(value, 'defaultValue');
    },
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
    margin-bottom: 0;
  }

  .form-item-box {
    input {
      width: 100%;
      margin-top: 8px;
    }
  }
}
</style>