<template>
  <div class="form-datetime">
    <el-date-picker
      :id="`form_${field.fieldName}`"
      :type="type"
      :prefix-icon="`iconfont icon-fd-${type}`"
      :picker-options="pickerOptions"
      :value-format="formate"
      :placeholder="placeholder"
      :value="value" 
      @focus="dateTimePickerFocusHandler"
      @blur="dateTimePickerBlurHandler"
      @input="choose"
    />
  </div>
</template>

<script>
/* utils */
import { addClass, removeClass } from '@src/util/dom';
import FormMixin from '@src/component/form/mixin/form';
/* constants */
const PlanTimeClassName = 'body-for-plantime';

export default {
  name: 'form-plantime',
  mixins: [FormMixin],
  props: {
    pickerOptions: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    formate() {
      return this.isDateTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
    },
    isDateTime() {
      return this.type == 'datetime';
    },
    type() {
      return this.field.setting.dateType === 'date' ? 'date' : 'datetime';
    }
  },
  methods: {
    /**
     * @description 日期时间选择器获得焦点事件处理 
     * 只为 日期时间 处理，添加class, 为了隐藏 el-datetime-picker 此刻的按钮
    */
    dateTimePickerFocusHandler() {
      if(!this.isDateTime) return

      addClass(document.body, PlanTimeClassName);
    },
    dateTimePickerBlurHandler() {
      if(!this.isDateTime) return

      removeClass(document.body, PlanTimeClassName);
    },
    choose(newValue){    
      let oldValue = null;
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
}
</script>

<style lang="scss">
.form-datetime{
  width: 100%;

  .el-input__inner {
    cursor: pointer;
  }

  .el-date-editor{
    width: 100%;
  }
}

.body-for-plantime {
  .el-date-picker {
    .el-picker-panel__footer {
      button:nth-child(1) {
        display: none;
      }
    }
  }
}
</style>
