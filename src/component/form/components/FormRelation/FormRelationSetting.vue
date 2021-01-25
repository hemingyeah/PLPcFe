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

    <!-- start 关联项字段 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">关联项字段</h4>
      <div class="form-setting-group"> 
        <el-select class="form-setting-select" v-model="selectedRelatedField" @change="updateRelatedField">
          <el-option
            v-for="item in options"
            :key="item.fieldName"
            :label="item.displayName"
            :value="item.fieldName">
          </el-option>
        </el-select>
      </div>
    </div>
    <!-- end 关联项字段 -->

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
  </div>
</template>
<script>
import SettingMixin from '@src/component/form/mixin/setting'
import { settingProps } from '@src/component/form/components/props';
import { findComponentUpward } from '@src/util/assist';

export default {
  name: 'form-relation-setting',
  mixins: [SettingMixin],
  props: settingProps,
  data() {
    return {
      selectedRelatedField: '' // 当前选择的关联项字段
    }
  },
  computed: {
    /** 
    * @description 关联模块：客户或产品
    */
    module () {
      return this.field.formType === 'relationCustomer' ? 'customer' : 'product';
    },
    /** 
    * @description 关联项数据
    */
    options() {
      let $parent = findComponentUpward(this, 'form-design');
      let moduleOptionName = `${this.module}Fields`;
      return $parent.relationFieldOptions[moduleOptionName];
    }
  },
  mounted() {
    let { fieldName } = this.field.setting || {};

    // 初始化当前选择的关联项字段
    if (fieldName) {
      this.selectedRelatedField = fieldName;
    } else {
      // 默认选中第一个
      this.selectedRelatedField = this.options[0].fieldName;
      this.updateRelatedField(this.selectedRelatedField);
    }
  },
  methods: {
    updateForDom(event) {
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.update(value, prop);
    },
    update(value, prop, isSetting = false){
      this.$emit('input', {value, prop, isSetting});
    },
    /** 
    * @description 更新关联项
    */
    updateRelatedField(value) {
      const selectedField = this.options.filter(field => field.fieldName == value);

      if (selectedField.length) {
        const { fieldName, formType } = selectedField[0];

        this.field.setting = {
          module: this.module,
          fieldName,
          formType
        }
      }
    }
  }
}
</script>
