<template>
  <div class="form-setting-group form-setting-group-smallform-common-setting">
    <div class="form-common-setting-panel">
      <h4 class="form-common-setting-title">
        <span class="form-common-setting-title-name">标题</span>
        <el-tooltip :content="questionText" placement="top">
          <i class="iconfont icon-question" v-if="showQuestionIcon"></i>
        </el-tooltip>
        <span class="form-common-setting-title-remind" v-if="showMaxLength">最多20个字</span>
      </h4>
      <div class="form-type-text">{{ setting.name }}</div>
    </div>
    <input type="text" data-prop="displayName" placeholder="[必填] 请输入字段标题" v-model="field.displayName" @input="update" :maxlength="TitleShowMaxLengthMax" :disabled="disabled">
  </div>
</template>

<script>
/* config */
import * as config from '@src/component/form/config';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-title-setting',
  props: {
    ...settingProps,
    disabled: {
      type: Boolean,
      default: false
    },
    showQuestionIcon: {
      type: Boolean,
      default: false
    },
    questionText: {
      type: String,
      default: ''
    },
    showMaxLength: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    // 标题内容展示最大数量
    TitleShowMaxLengthMax() {
      return config.FIELD_NAME_LENGTH_MAX;
    }
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'displayName');
    }
  }
}
</script>

<style lang="scss" scoped>
.form-common-setting {
  .form-type-text {
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
    
    font-size: $font-size-small;
    color: $text-color-regular;
    background-color: $bg-color-l3;
    border-radius: 10px;
  }
}
</style>