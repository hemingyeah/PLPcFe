<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <div class="form-setting-group form-common-setting">
      <h3 class="form-setting-panel-title">{{ field.displayName }}</h3>
      <div class="form-design-warning">备件组件可以在工单完成时选择备件库中的备件直接管理核销出库，并生成价格。</div>
    </div>
    <!-- end 标题 -->

    <!-- start 描述信息 -->
    <form-describe-setting
      :field="field"
      @input="updateForDom"
    ></form-describe-setting>
    <!-- end 描述信息 -->

    <!-- start 校验 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">校验</h4>
      <div class="form-item-box">
        <!-- 必填 -->
        <form-required-setting :field="field" @input="update"></form-required-setting>
      </div>
    </div>
    <!-- end 校验 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-sparepart-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop, isSetting = false) {
      this.$emit('input', {value, prop, isSetting});
    }
  }
}
</script>