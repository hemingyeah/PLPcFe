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
      </div>
    </div>
    <!-- end 校验 -->
    
    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 移动端列表展示 -->
        <mobile-show-setting  :field="field" :fields="fields" @input="update" v-if="isTaskMode"></mobile-show-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"  v-if="!isTaskCardForm"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';
/* enum */
import TableNameEnum from '@model/enum/TableNameEnum.ts';
export default {
  name: 'form-datetime-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    // 是否是附加组件表单
    isTaskCardForm() {
      return [ TableNameEnum.TaskCard ].indexOf(this.mode) > -1;
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop){
      this.$emit('input', {value, prop})
    }
  }
}
</script>