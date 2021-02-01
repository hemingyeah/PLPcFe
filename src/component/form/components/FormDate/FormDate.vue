
<template>
  <div class="form-date">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      :type="dateObj.type"
      prefix-icon="iconfont icon-fdn-date"
      :editable="false"
      clearable
      :placeholder="placeholder"
      :value-format="dateObj.format"
      :value="field.returnData?_value[field.returnData]:_value"
      :format="dateObj.format"
      @input="choose"
    />
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
import pickerOption from './pickerOption';
/* utils */
import { fmt_data_time } from '@src/util/lang'; 

export default {
  name: 'form-date',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    /** 
     * @description 初始化日期格式
    */
    _value() {
      if ( !this.value ) return '';
      let { defaultValueConfig, dateType} = this.field.setting || {};
      let newDate = fmt_data_time(new Date(this.value), dateType || 'yyyy-MM-dd');
      this.choose(newDate);
      return newDate
    },
    /** 
     * @description 匹配日期格式
     * 若设置了日期格式返回匹配数据
     * 否择返回默认设置，兼容老数据
    */
    dateObj() {
      let dateTypeObj = pickerOption.find((item=> item.format == this.field.setting.dateType));
      if(dateTypeObj && JSON.stringify(dateTypeObj) !== '{}') return dateTypeObj;
      return { type:'date', format: 'yyyy-MM-dd' }  
    }
  },
  methods: {
    choose(newValue) {
      let oldValue = null
      this.$emit('update', { newValue, oldValue, field: this.field })
      this.$emit('input', newValue)
    }
  }
}
</script>

<style lang="scss">
.form-date {
  width: 100%;
  .el-input__inner {
    cursor: pointer;

    &:hover {
      border-color: #00ac97;
    }
  }

  .el-date-editor {
    width: 100%;
  }
}
</style>
