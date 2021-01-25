<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <div class="form-setting-group form-common-setting">
      <h3 class="form-setting-panel-title">{{ field.displayName }}</h3>
      <div class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</div>
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

    <!-- start 选项 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">选项</h4>
      <div class="form-item-box form-date-type">
        <el-select v-model="field.setting.dateType"> 
          <el-option label="日期" value="date"></el-option>
          <el-option label="日期+时间" value="dateTime"></el-option>
        </el-select>
      </div>
    </div>
    <!-- end 选项 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-plantime-setting',
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