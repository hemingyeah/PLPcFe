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

    <!-- start 日期格式 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">日期格式</h4>
      <div class="form-item-box form-date-type">
        <div class="form-setting-item" >
          <el-select v-model="dateType" @change="update(dateType, 'dateType', true)" placeholder="请选择日期格式">
            <el-option  v-for="item in pickerMapOption" :label="item.lable" :value="item.format" :key="item.format"></el-option>
          </el-select>
        </div>
      </div>
    </div>
    <!-- end 日期格式 -->

    <!-- start 默认当前时间 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">默认当前时间</h4>
      <div class="form-item-box">
        <el-checkbox v-model="defaultValueConfig.isCurrentDate" @change="update(defaultValueConfig, 'defaultValueConfig', true)" :true-label="1" :false-label="0">默认当前时间</el-checkbox>
      </div>
    </div>
    <!-- end 默认当前时间 -->

    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 移动端列表展示 -->
        <mobile-show-setting  :field="field" :fields="fields" @input="update"  v-if="isTaskMode"></mobile-show-setting>
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';
import pickerOption from './pickerOption';
export default {
  name: 'form-date-setting',
  mixins: [SettingMixin],
  props: settingProps,
  data() {
    return{
      dateType: this.field.setting.dateType || "yyyy-MM-dd"
    }
  },
  computed: {
    /** 
    * @description 获取日期格式选择项
    */
    pickerMapOption() {
      return pickerOption;
    },
    /** 
    * @description 默认选择当前时间
    */
    defaultValueConfig() {
      return this.field.setting.defaultValueConfig || { isCurrentDate: 0};
    },
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop, isSetting = false){ 
      this.$emit('input', {value, prop, isSetting})

    }
  }
}
</script>