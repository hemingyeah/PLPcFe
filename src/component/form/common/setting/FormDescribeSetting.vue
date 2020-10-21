<template>
  <div class="form-common-setting">
    <h4 class="form-common-setting-title">
      <span class="form-common-setting-title-name">描述信息</span>
      <span class="form-common-setting-title-remind">最多128个字</span>
    </h4>
    <textarea :placeholder="placeHolder" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="update" :maxlength="TitleShowMaxLengthMax"></textarea>
  </div>
</template>

<script>
/* config */
import * as config from '@src/component/form/config';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-describe-setting',
  props: {
    ...settingProps,
    placeHolder: {
      type: String,
      default: '请输入描述信息'
    }
  },
  computed: {
    // 描述信息展示最大数量
    TitleShowMaxLengthMax() {
      return config.FIELD_PLACEHOLER_LENGTH_MAX;
    }
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'placeHolder');
    }
  }
}
</script>