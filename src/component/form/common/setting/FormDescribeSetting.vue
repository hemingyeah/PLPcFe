<template>
  <div class="form-describe-setting">
    <h4 class="form-title"><span class="form-name">描述信息</span> <span class="form-remind">最多128个字</span></h4>
    <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="update" :maxlength="TitleShowMaxLengthMax"></textarea>
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
    ...settingProps
  },
  computed: {
    // 描述信息展示最大数量
    TitleShowMaxLengthMax() {
      return config.FIELD_PLACEHOLER_LENGTH_MAX;
    }
  },
  methods: {
    update(value) {
      this.$emit('input',value, 'placeHolder');
    }
  }
}
</script>

<style lang="scss" scope>
.form-describe-setting{
  .form-title{
    font-size: 14px;
    font-weight: 500;
    color: #333333;
    line-height: 24px;
    margin-bottom: 8px;
    .form-name{
      font-weight: bold;
    }
    .form-remind{
      font-size: 14px;
      color: #999999;
    }

  }
}
</style>