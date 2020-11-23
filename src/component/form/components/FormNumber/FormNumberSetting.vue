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

        <div class="form-decimals-setting">
          <el-checkbox v-model="decimalConfig.isLimit" @change="update(decimalConfig, 'decimalConfig', true)" :true-label="1" :false-label="0">
            小数位数<input class="digit" type="text" v-model="decimalConfig.digit" oninput="this.value = this.value.replace(/\D/g, '')" @blur="decimalLimit" />位
          </el-checkbox>
        </div>
        <div class="form-limits-setting">
          <el-checkbox v-model="limitConig.isLimit" @change="update(limitConig, 'limitConig', true)" :true-label="1" :false-label="0">
            限制数值输入范围
            <el-tooltip placement="top">
              <div slot="content">
                选择自定义范围时：由用户填写最大值和最小值的范围，未设置时不做限制
                <br/>
                选择关联表单中数值时：可以选择表单中数字类型的字段，未设置时不做限制
              </div>
              <i class="iconfont icon-question"></i>
            </el-tooltip>
          </el-checkbox>
          <div class="limits-setting-panel">
            <el-select v-model="limitConig.type" @change="updateLimitType">
              <el-option label="自定义范围" :value="1"></el-option>
              <el-option label="关联表单字段" :value="2"></el-option>
            </el-select>
            <div class="limits-min-setting">
              <p>最小值</p>
              <input type="number" v-model="limitConig.min" placeholder="请输入最小值" @blur="updateMinlimit" v-if="limitConig.type == 1" />
              <el-select v-model="limitConig.min" @change="update(limitConig, 'limitConig', true)" v-else>
                <el-option v-for="item in numberFields" :key="item.fieldName" :label="item.displayName" :value="item.fieldName"></el-option>
              </el-select>
            </div>
            <div class="limits-max-setting">
              <p>最大值</p>
              <input type="number" v-model="limitConig.max" placeholder="请输入最大值" @blur="updateMaxlimit" v-if="limitConig.type == 1" />
              <el-select v-model="limitConig.max" @change="update(limitConig, 'limitConig', true)" v-else>
                <el-option v-for="item in numberFields" :key="item.fieldName" :label="item.displayName" :value="item.fieldName"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 默认值 -->
    <form-default-value-setting
      :field="field"
      type="number"
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
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

const DECIMAL_MIN_LENGTH = 1;
const DECIMAL_MAX_LENGTH = 5;

export default {
  name: 'form-number-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    /** 
    * @description 小数位数配置项
    */
    limitConig() {
      return this.field.setting.limitConig || { isLimit: 0, type: 1, min: '', max: '' };
    },
    /** 
    * @description 数值输入范围配置项
    */
    decimalConfig() {
      return this.field.setting.decimalConfig || { isLimit: 0, digit: '' };
    },
    /** 
    * @description 数字类型的字段
    * 1.数字类型
    * 2.且 保存过
    * 3.且 不能是当前数字控件
    * 4.且 未隐藏
    */
    numberFields() {
      return this.fields.filter(field => {
        let { id, formType, isHidden } = field;
        return formType === 'number' && id && id != this.field.id && !isHidden;
      })
    }
  },
  mounted() {
    // 处理最大值和最小值关联表单的字段已被删除
    let { min, max, type } = this.limitConig;

    // 关联表单字段
    if (type == 2) {
      let minIndex = this.numberFields.findIndex(item => item.fieldName == min);
      let maxIndex = this.numberFields.findIndex(item => item.fieldName == max);

      if (min && minIndex == -1) this.limitConig.min = '';
      if (max && maxIndex == -1) this.limitConig.max = '';
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop, isSetting = false) {
      this.$emit('input', {value, prop, isSetting});
    },
    /** 
    * @description 小数位数
    * 仅可输入正整数，5位以内
    */
    decimalLimit(event) {
      let value = event.target.value;
      let overlimit = Number(value) > DECIMAL_MAX_LENGTH || Number(value) < DECIMAL_MIN_LENGTH;

      if (value && overlimit) {
        value = '';

        this.$platform.notification({
          type: 'error',
          title: '提示',
          message: `小数位数只能输入${DECIMAL_MIN_LENGTH}到${DECIMAL_MAX_LENGTH}位`
        })
      }

      this.decimalConfig.digit = value;
      this.update(this.decimalConfig, 'decimalConfig', true);
    },
    /** 
    * @description 数字输入范围类型选择
    */
    updateLimitType(value) {
      this.limitConig.min = '';
      this.limitConig.max = '';

      this.update(this.limitConig, 'limitConig', true);
    },
    /** 
    * @description 最小值
    */
    updateMinlimit(event) {
      let value = event.target.value;
      let max = this.limitConig.max;

      if (value && max && Number(value) > Number(max)) {
        value = '';

        this.$platform.notification({
          type: 'error',
          title: '提示',
          message: '最小值大于最大值'
        })
      }

      this.limitConig.min = value;
      this.update(this.limitConig, 'limitConig', true);
    },
    /** 
    * @description 最大值
    */
    updateMaxlimit(event) {
      let value = event.target.value;
      let min = this.limitConig.min;
      
      if (value && min && Number(value) < Number(min)) {
        value = '';

        this.$platform.notification({
          type: 'error',
          title: '提示',
          message: '最大值小于最小值'
        })
      }

      this.limitConig.max = value;
      this.update(this.limitConig, 'limitConig', true);
    }
  }
}
</script>

<style lang="scss" scoped>
.form-decimals-setting {
  .digit {
    width: 60px;
    margin: 0 8px;
    padding: 0 6px;
  }
}

.form-limits-setting {
  .limits-setting-panel {
    padding-left: 24px;

    .el-select, input {
      width: 100%;
      height: 32px;
      margin: 8px 0 12px;
    }

    p {
      margin-bottom: 0;
    }

    .limits-max-setting {
      input {
        margin-bottom: 0;
      }
    }
  }
}
</style>
