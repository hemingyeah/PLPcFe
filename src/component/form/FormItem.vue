<template>
  <div class="form-item" @validate.native="validate" :class="{err: errMessage || remoteValidation.msg}">
    <label :for="`form_${field.fieldName}`"><span class="form-item-required" v-if="isRequired">*</span>{{label}}</label>
    <div class="form-item-control">
      <slot></slot>
      <div class="err-msg-wrap">
        <div v-if="remoteValidation.status === 1" class="form-item-error">正在验证</div>
        <div v-else-if="remoteValidation.status === 2" class="form-item-error">{{remoteValidation.msg}}</div>
        <div v-else-if="errMessage" class="form-item-error">{{errMessage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Validator from './validator';

  export default {
    name: 'form-item',
    props: {
      label: String,
      field: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        errMessage: '',
        valueFn: null, //function 用于获取注册字段的值和
        remoteValidation: {
          need: false,
          status: 0,
          msg: '',
        }
      }
    },
    computed: {
      /** 字段是否必填 */
      isRequired() {
        return this.field.isNull == 0;
      }
    },
    methods: {
      /** 默认返回true, 确保不影响表单提交 */
      // async validate(){
      //   if(typeof this.valueFn != 'function') return true;
      //
      //   let value = this.valueFn();
      //   let message = await Validator.validate(value, this.field);
      //   this.errMessage = message;
      //
      //   return message;
      // },
      validate() {
        if (typeof this.valueFn != 'function') return true;
        let value = this.valueFn();
        if (this.remoteValidation.need && value) {
          this.remoteValidation.status = 1;
          this.remoteValidation.msg = '';
          this.errMessage = '';
        }
        return Validator.validate(value, this.field)
          .then(res => {
            if (this.remoteValidation.need && value) {
              this.remoteValidation.status = 2;
              this.remoteValidation.msg = res.ok === '' ? '' : res.error;
              return;
            }

            this.errMessage = res;
            this.remoteValidation.msg = '';
            this.remoteValidation.status = 0;
            return res;
          })
          .catch(err => console.error('err', err));
      },
      validateHandler(event) {
        event.stopPropagation(); //阻止事件继续冒泡
        this.$nextTick(() => this.validate())
      },
      /** 注册字段取值函数 */
      addFieldHandler(event) {
        this.valueFn = event.detail.value;
        event.detail.validate = this.validate;
      },
      removeFieldHandler(event) {
        this.valueFn = null;
      }
    },
    mounted() {
      this.$el.addEventListener('form.validate', this.validateHandler);
      this.$el.addEventListener('form.add.field', this.addFieldHandler);
      this.$el.addEventListener('form.remove.field', this.removeFieldHandler);

      if (this.field.remoteValidation) {
        this.remoteValidation.need = true;
      }
    },
    destroyed() {
      this.$el.removeEventListener('form.validate', this.handler)
      this.$el.removeEventListener('form.add.field', this.addFieldHandler);
      this.$el.removeEventListener('form.remove.field', this.removeFieldHandler)
    }
  }
</script>

<style lang="scss">
  .form-item.err {
    input {
      border-color: #f56c6c!important;
    }

    .err-msg-wrap {
      color: #f56c6c!important;
    }
  }


  .form-item {
    display: flex;
    flex-flow: row nowrap;
    font-size: 14px;
    /*margin-bottom: 10px;*/

    label {
      display: block;
      width: 120px;
      padding: 4px 10px 0 0;
      line-height: 24px;
      text-align: right;
      margin: 0;
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

    .err-msg-wrap {
      min-height: 10px;
      padding-bottom: 3px;
    }
  }

  .form-item-error {
    font-size: 12px;
    line-height: 20px;
  }
</style>

