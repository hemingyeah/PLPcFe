<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      @input="updateForDom"
    ></form-title-setting>
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
        <!-- 不允许重复值 -->
        <form-repeat-setting :field="field" @input="update"></form-repeat-setting>
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 默认值 -->
    <form-default-value-setting
      :field="field"
      @input="update"
    ></form-default-value-setting>
    <!-- end 默认值 -->

    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 移动端列表展示 -->
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->

    <!-- start 其他设置 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">其他设置</h4>
      <div class="form-item-box">
        <el-checkbox :value="field.setting.isScanCode" @input="update($event, 'isScanCode', true)" :true-label="1" :false-label="0">
          支持扫码录入
          <el-tooltip content="支持扫码二维码/条形码，仅移动端可用" placement="top">
            <i class="iconfont icon-question"></i>
          </el-tooltip>
        </el-checkbox>
      </div>
    </div>
    <!-- end 其他设置 -->
  </div>
</template>

<script>
/* mixin */
import SettingMixin from '@src/component/form/mixin/setting';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-text-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.update(value, prop);
    },
    update(value, prop, isSetting = false) {
      this.$emit('input', {value, prop, isSetting});
    }
  }
}
</script>
