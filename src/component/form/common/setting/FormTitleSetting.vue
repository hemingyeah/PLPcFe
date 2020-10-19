<template>
  <div class="form-title-setting">
    <h4 class="form-title"><span class="form-name">标题</span> <span class="form-remind">最多20个字</span></h4>
    <input type="text" data-prop="displayName" placeholder="[必填] 请输入字段标题" v-model="field.displayName" @input="update" :maxlength="TitleShowMaxLengthMax">
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
    ...settingProps
  },
  computed: {
    // 标题内容展示最大数量
    TitleShowMaxLengthMax() {
      return config.FIELD_NAME_LENGTH_MAX;
    }
  },
  methods: {
    update(value) {
      this.$emit('input',value, 'displayName');
    }
  }
}
</script>

<style lang="scss" scope>
.form-title-setting{
  .form-title{
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