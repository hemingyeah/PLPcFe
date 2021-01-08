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
    <div class="form-setting-group form-setting-item form-formula-setting">
      <h4 class="form-item-title">
        公式配置
        <span class="form-formula-setting-btn" @click="openFormulaSetDialog">设置</span>
      </h4>
      <div class="form-item-box">
        <div class="form-formula-setting-result" @click="openFormulaSetDialog">
          <span>计算公式=</span>
          <span :class="['formula-item', {'operator': item.isOperator, 'delete': item.isDelete}]" v-for="(item, index) in formula" :key="index">{{ item.name }}</span>
        </div>
        <el-checkbox v-model="defaultValueConfig.isNotModify" @change="update(defaultValueConfig, 'defaultValueConfig', true)" :true-label="1" :false-label="0" :disabled="modifyDisabled">不允许修改</el-checkbox>
      </div>
    </div>
    <!-- end 校验 -->

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
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->

    <!-- 计算公式设置弹窗 -->
    <base-calculation-formula
      ref="BaseCalculationFormula"
      :calculation-fields="calculationFields"
      @confirm="saveFormula"
    />

  </div>
</template>

<script>
/* mixin */
import SettingMixin from '@src/component/form/mixin/setting';
/* props */
import { settingProps } from '@src/component/form/components/props';
/* components */
import BaseCalculationFormula from '@src/component/common/BaseCalculationFormula/BaseCalculationFormula.tsx'

export default {
  name: 'form-formula-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    defaultValueConfig() {
      return this.field.setting.defaultValueConfig || {};
    },
    /** 
    * @description 不允许修改
    * 未配置计算公式时不允许勾选
    */
    modifyDisabled() {
      return this.formula.length == 0;
    },
    /* 支持运算的字段列表 */
    calculationFields() {
      return this.fields.filter(field => field.formType == 'number' && field.id && !field.isHidden);
    },
    /* 计算公式 */
    formula() {
      let formula = this.field.setting.formula || [];

      // 判断计算公式的运算对象是否已删除或已隐藏，增加标识
      formula.map(item => {
        let index = this.fields.findIndex(field => field.fieldName == item.value);
        let field = this.fields[index];
        item.isDelete = !item.isOperator && (!field || !!field.isHidden);
      })

      return formula;
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.update(value, prop);
    },
    update(value, prop, isSetting = false) {
      this.$emit('input', {value, prop, isSetting});
    },
    openFormulaSetDialog() {
      this.$refs.BaseCalculationFormula.open(this.formula);
    },
    saveFormula(formula) {
      this.update(formula, 'formula', true);
    }
  },
  watch: {
    modifyDisabled(newValue) {
      // 未设置计算公式，取消不允许修改的勾选
      if (newValue) {
        this.defaultValueConfig.isNotModify = 0;
        this.update(this.defaultValueConfig, 'defaultValueConfig', true);
      }
    }
  },
  components: {
    BaseCalculationFormula
  }
}
</script>

<style lang="scss" scoped>
.form-formula-setting {
  .form-item-title {
    display: flex;
    justify-content: space-between;
  }

  &-btn {
    font-weight: normal;
    color: $color-primary;
    cursor: pointer;
  }

  &-result {
    line-height: 2;
    margin-top: 8px;
    padding: 6px 10px;

    color: $text-color-regular;
    font-size: $font-size-small;

    border: 1px solid #e0e1e2;
    border-radius: $border-radius-base;
    cursor: pointer;

    .formula-item {
      line-height: 1;
      display: inline-block;
      
      margin: 0 2px;
      padding: 2px 4px;

      &:not(.operator) {
        background: $bg-color-l1;
        border-radius: 2px;
      }

      &.delete {
        color: $color-danger;
        background-color: rgba(245, 108, 108, 0.2) !important;
      }
    }
  }
}
</style>