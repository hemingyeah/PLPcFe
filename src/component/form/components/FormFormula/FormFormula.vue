<template>
  <div class="form-formula">
    <input 
      autocomplete="off"
      ref="input" 
      type="number" 
      :id="`form_${field.fieldName}`"
      :placeholder="placeholder" 
      :value="value"
      @input="input"
      :disabled="disabled"
    >
    <el-tooltip :content="`计算公式：${formulaText}`" placement="top">
      <i class="iconfont icon-question" v-if="formula.length"></i>
    </el-tooltip>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
import { FORM_FIELD_TEXT_MAX_LENGTH } from '@src/model/const/Number.ts';
import { findComponentUpward } from '@src/util/assist';
import * as MathUtil from 'mathjs';

export default {
  name: 'form-formula',
  mixins: [FormMixin],
  props: {
    value: [String, Number]
  },
  computed: {
    getInput() {
      return this.$refs.input || this.$refs.textarea;
    },
    nativeInputValue() {
      return this.value === null || this.value === undefined ? '' : String(this.value);
    },
    /** 
    * @description 不允许修改
    * 1.设置了计算公式
    * 2.且 设置不允许修改
    */
    disabled() {
      let { defaultValueConfig } = this.field.setting || {};
      let { isNotModify } = defaultValueConfig || {};

      return this.formula.length > 0 && isNotModify == 1;
    },
    /** 
    * @description 计算公式
    */
    formula() {
      return this.field.setting.formula || [];
    },
    formulaText() {
      return this.formula.map(item => item.name).join('');
    },
    /** 
    * @description 计算公式计算结果
    */
    formulaValue() {
      let parent = findComponentUpward(this, 'form-builder');
      let form = parent?.value || {};

      // 处理计算公式，最多保留3位小数
      let formulaStr = this.formula.map(item => item.isOperator ? item.value : (form[item.value] ? form[item.value] : 0)).join('');
      let formulaVal = MathUtil.evaluate(formulaStr);
      let value = !isNaN(formulaVal) ? formulaVal.toString() : '';
      
      return value.replace(/([0-9]+.[0-9]{3})[0-9]*/, '$1');
    }
  },
  watch: {
    // native input value is set explicitly
    // do not use v-model / :value in template
    nativeInputValue() {
      this.setNativeInputValue();
    },
    formulaValue(newValue) {
      if (this.formula.length > 0) {
        this.$emit('update', { newValue, field: this.field });
      }
    }
  },
  mounted() {
    const InputEl = this.$refs.input;

    InputEl.addEventListener('paste', this.pasteEventHandler)

    // 无值时计算
    if (this.value == '') {
      this.$emit('update', { newValue: this.formulaValue, field: this.field });
    }
  },
  beforeDestroy() {
    this.$refs.input.removeEventListener('paste', this.pasteEventHandler);
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      
      if(newValue == this.nativeInputValue) return;

      if (newValue === '') {
        this.$nextTick(() => {
          event.target.value = '';
        });
      }

      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    },
    setNativeInputValue() {
      const input = this.getInput;

      if (!input) return;
      if (input.value === this.nativeInputValue) return;

      input.value = this.nativeInputValue;
    },
    pasteEventHandler(event) {
      try {
        let number = event.clipboardData.getData('text')
        let newValue = number
        
        if (number.length > FORM_FIELD_TEXT_MAX_LENGTH) {
          newValue = number.slice(0, FORM_FIELD_TEXT_MAX_LENGTH)
        }

        this.$emit('update', { newValue, field: this.field });
        this.$emit('input', newValue);

      } catch (error) {
        console.warn('form-number: paste -> error', error)
      }
    }
  }
}
</script>

<style lang="scss">
.form-formula{
  width: 100%;
  position: relative;
  
  input {
    width: 100%;
    &:disabled {
      -webkit-text-fill-color: #b2b2b2;
    }
  }

  .icon-question {
    color: $text-color-secondary;
    font-size: $font-size-base;

    position: absolute;
    top: 7px;
    right: -20px;
  }
}
</style>
