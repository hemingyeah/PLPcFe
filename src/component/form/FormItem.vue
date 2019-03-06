<template>
  <div class="form-item" :class="{err: errMessage}">
    <label :for="forId">{{label}} <span class="form-item-required" v-if="isRequired">*</span></label>
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
import _ from 'lodash'

export default {
  name: 'form-item',
  props: {
    label: String,
    validation: [Boolean, Function], // 是否开启验证
    /** 获取根元素（FormBuilder）的dom对象 */
    findRootEl: {
      type: Function,
      default(){
        let parent = this.$parent;
        return parent && parent.$el;
      }
    },

    /** @deprecated  远程验证配置对象，使用validator替代 */
    remote: Object
  },
  data() {
    return {
      field: {},
      errMessage: '',
      valueFn: null, // function 用于获取注册字段的值
      status: false // true 代表正在验证
    }
  },
  computed: {
    /** 字段是否必填 */
    isRequired() {
      return this.field.isNull == 0;
    },
    /** 字段是否需要远程验证 **/
    needRemoteValidation() {
      return !!this.remote;
    },
    forId(){
      if(!this.field.fieldName) return '';
      return `form_${this.field.fieldName}`;
    },
    /** 是否需要验证 */
    needValidation(){
      let validation = this.validation;
      return (typeof validation == 'boolean' && validation) || typeof validation == 'function'
    }
  },
  methods: {
    /** 默认返回true, 确保不影响表单提交 */
    validate() {
      if (typeof this.valueFn != 'function') return true;

      this.errMessage = '';
      this.status = false;

      let value = this.valueFn();
      let validator = this.getValidator();

      if(typeof validator == 'function'){
        return validator(value, this.field, this.changeStatus)
          .then(res => this.errMessage = res)
          .catch(err => console.error('validate err', err));
      }
      
      let options = {changeRemoteStatus: this.changeStatus, remote: this.remote};

      return Validator.validate(value, this.field, options)
        .then(res => this.errMessage = res)
        .catch(err => console.error('validate err', err));
    },
    /** 远程验证时需要做延时 */
    delayValidate: _.debounce(function(){
      this.validate()
    }, 500),
    validateHandler(event) {
      event.stopPropagation(); // 阻止事件继续冒泡
      if(this.needValidation) {
        this.needRemoteValidation 
          ? this.delayValidate()
          : this.$nextTick(this.validate)
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
    getValidator(){
      if(typeof this.validation == 'function') return this.validation;

      return this.field.validator;
    }
  },
  mounted() {
    this.$el.addEventListener('form.validate', this.validateHandler);
    this.$el.addEventListener('form.add.field', this.addFieldHandler);
    this.$el.addEventListener('form.remove.field', this.removeFieldHandler);
  },
  destroyed() {
    this.$el.removeEventListener('form.validate', this.validateHandler)
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
      width: 130px;
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

