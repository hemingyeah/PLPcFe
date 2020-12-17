<template>
  <div class="form-item" :class="{err: errMessage}" v-show="!hideform">
    <label :for="forId">{{label}} <span class="form-item-required" v-if="showRequired">*</span></label>
    <div class="form-item-control">
      <slot></slot>
      <div class="err-msg-wrap">
        <div v-if="status" class="form-item-error">正在验证...</div>
        <div v-else-if="errMessage" class="form-item-error">{{errMessage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Validator from '@src/util/validator';
import { findComponentUpward } from '@src/util/assist'
import _ from 'lodash'

export default {
  name: 'form-item',
  props: {
    label: String,
    validation: {
      type: [Boolean, Function],
      default: true
    }, // 是否开启验证
    /** 获取根元素（FormBuilder）的dom对象 */
    findRootEl: {
      type: Function,
      default(){
        let parent = this.$parent;
        return parent && parent.$el;
      }
    },
    needValidate: {
      type: Boolean,
      default: true,
    },
    isNotNull: {
      type: Boolean,
      default: undefined
    },
    hideform: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      field: {},
      errMessage: '',
      valueFn: null, // function 用于获取注册字段的值
      status: false, // true 代表正在验证
      showErr: false
    }
  },
  computed: {
    /** 字段是否必填 */
    isRequired() {
      if(this.isNotNull !== undefined) return this.isNotNull;
      return this.field.isNull == 0;
    },
    showRequired() {
      return this.isRequired && !this.disabled;
    },
    forId(){
      if(!this.field.fieldName) return '';
      return `form_${this.field.fieldName}`;
    },
    formBuilderComponent() {
      return findComponentUpward(this, 'form-builder')
    },
    /** 是否需要验证 */
    needValidation(){
      let validation = this.validation;
      return (typeof validation == 'boolean' && validation) || typeof validation == 'function'
    },
    disabled() {
      let field = this.field;
      return field.disabled
        || (field.setting && field.setting.defaultValueConfig && !!field.setting.defaultValueConfig.isNotModify && !!field.defaultValue);
    },
  },
  methods: {
    /** 
     * @description 默认返回true, 确保不影响表单提交 
     * @param {Boolean} isSample 是否是简单模式 (简单模式的概念是单个字段的单个验证)
    */
    validate(isSample = true) {
      if (typeof this.valueFn != 'function' || !this.needValidate) return true;
      
      this.errMessage = '';
      this.status = false;
      
      let value = this.valueFn();
      let formBuilderComponent = this.formBuilderComponent || {}
      
      return Validator.validate(value, this.field, formBuilderComponent.value, formBuilderComponent.mode, this.changeStatus, isSample, formBuilderComponent)
        .then(res => {
          let validator = this.getValidator();
          return res == null && typeof validator == 'function' 
            ? validator(value, this.field, this.changeStatus)
            : res;
        })
        .then(res => {
          return this.errMessage = res
        })
        .catch(err => {
          if(!err.message.startsWith('Request cancelled:')){
            console.error('validate err', err)
          }
        });
    },
    /** 远程验证时需要做延时 */
    delayValidate: _.debounce(function(){
      this.validate()
    }, 500),
    validateHandler(event) {
      event.stopPropagation(); // 阻止事件继续冒泡
      if(this.needValidation) {
        this.$nextTick(this.validate)
      }
    },
    /** 注册字段取值函数 */
    addFieldHandler(event) {
      if(!this.needValidation) return event.stopPropagation();
      this.valueFn = event.detail.value;
      this.field = event.detail.field;
      event.detail.validate = this.validate;
    },
    removeFieldHandler(event) {
      if(!this.needValidation) return event.stopPropagation();

      /** 此处因为dom 会被移出document, 所以事件不会冒泡至 FormBuilder组件中, 需要手动触发 */
      let rootEl = this.findRootEl()
      if(null != rootEl) {
        let params = event.detail;
        let e = new CustomEvent('form.remove.field', {detail: params, bubbles: true})
        rootEl.dispatchEvent(e);
      }
      this.valueFn = null;
    },
    changeStatus(value){
      this.status = !!value;
    },
    resetValidationStatus() {
      this.errMessage = '';
    },
    getValidator(){
      if(typeof this.validation == 'function') return this.validation;
      return this.field.validator;
    }
  },
  mounted() {
    this.$el.addEventListener('form.add.field', this.addFieldHandler);
    this.$el.addEventListener('form.validate', this.validateHandler);
    this.$el.addEventListener('form.clear.validate', this.resetValidationStatus);
    this.$el.addEventListener('form.remove.field', this.removeFieldHandler);
  },
  destroyed() {
    this.$el.removeEventListener('form.validate', this.validateHandler)
    this.$el.removeEventListener('form.clear.validate', this.resetValidationStatus)
    this.$el.removeEventListener('form.add.field', this.addFieldHandler);
    this.$el.removeEventListener('form.remove.field', this.removeFieldHandler)
  }
}
</script>

<style lang="scss">
  .form-item.err :not(.is-success){
    input, textarea {
      border-color: #f56c6c !important;
    }

    .err-msg-wrap {
      color: #f56c6c !important;
    }
  }

  .form-item {
    display: flex;
    flex-flow: row nowrap;
    font-size: 14px;
    /*margin-bottom: 10px;*/

    label {
      display: block;
      width: 110px;
      padding: 4px 0 0 10px;
      line-height: 24px;
      margin: 0;
      flex-shrink: 0;
    }

    input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
      /* WebKit browsers */
      color: #B3B7C1;
    }
    input:-moz-placeholder, textarea:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #B3B7C1;
    }
    input::-moz-placeholder, textarea::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #B3B7C1;
    }
    input:-ms-input-placeholder, textarea:-ms-input-placeholder {
      /* Internet Explorer 10+ */
      color: #B3B7C1;
    }
  }

  .form-item-required {
    color: red;
  }

  .form-item-control {
    flex: 1;
    /*max-width: calc(100% - 110px);*/
    width: calc(100% - 110px);
    
    input {
      width: 100%;
    }

    .err-msg-wrap {
      min-height: 10px;
      padding-bottom: 3px;
    }
  }

  .form-item-error {
    font-size: 12px;
    line-height: 22px;
  }

  .form-item-attachment{
    .form-item-control{
      overflow: hidden;
    }
  }
</style>

