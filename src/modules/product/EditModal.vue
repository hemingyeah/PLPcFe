<template>
  <div class="product-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init">
      <product-edit-form :fields="productFields" v-model="form" customer-is-readonly ref="productEditForm">

      </product-edit-form>
    </form>
  </div>
</template>

<script>
/* api */
import {
  getProductFields,
  createProduct
} from '@src/api/ProductApi'
/* component */
import ProductEditForm from './components/ProductEditForm.vue'
/* enum */
import TenantDataLimitSourceEnum from '@model/enum/TenantDataLimitSourceEnum'
import TenantDataLimitTypeEnum from '@model/enum/TenantDataLimitTypeEnum'
/* mixin */
import VersionMixin from '@src/mixins/versionMixin/index.ts'
/* util */
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/product/utils/ProductMapping'
import { isFunction } from '@src/util/type'

export default {
  name: 'product-edit',
  inject: ['initData'],
  mixins: [VersionMixin],
  data() {
    return {
      loadingPage: false,
      pending: false,
      init: false,
      submitting: false,
      form: {},
      dynamicFields: []
    }
  },
  computed: {
    productFields() {
      return [
        {
          displayName: '从模板中选择',
          fieldName: 'template',
          formType: 'select',
          isSystem: 1
        },
        ...this.dynamicFields
      ]
    },
  },
  async mounted() {
    // 获取产品动态字段
    try {
      let res = await getProductFields({isFromSetting:false});
      this.dynamicFields = res.data || [];
    } catch (error) {
      console.error('product-edit-modal fetch product fields error',error);
    }
    
    window.submit = this.submit;
    
    // 检查版本数量限制
    this.checkNumExceedLimitBeforeHandler 
    && this.checkNumExceedLimitBeforeHandler(
      TenantDataLimitSourceEnum.Product,
      TenantDataLimitTypeEnum.Product
    )
    
    try {
      // 初始化默认值
      this.initFormData();
      this.init = true;
    } catch (e) {
      console.error('CustomerEditView caught an error ', e);
    }
  },

  methods: {
    initFormData() {
      let form = {};
      form = util.packToForm(this.productFields, form);
      
      // 客户详情新建产品，会带的客户信息
      /**
       * 初始化所有字段的初始值
       * @param {*} fields 字段
       * @param {*} origin 原始值
       * @param {*} target 待合并的值
      */
      this.form = FormUtil.initialize(this.productFields, form);
    },
    submit(customer, callBack) {
      this.submitting = true;
      
      this.$refs.productEditForm.validate()
        .then(valid => {
          this.submitting = false
          
          if (!valid) return Promise.reject('validate fail.')
          
          const params = util.packToProduct(this.productFields, this.form)
          
          this.toggleLoading()
          
          params.customerId = customer.id;
          
          this.checkNumExceedLimitAfterHandler(createProduct(params))
            .then(res => {
              
              if (!res.succ) {
                return (
                  this.$platform.notification({
                    title: '新建产品失败',
                    message: res.message || '',
                    type: 'error',
                  })
                )
              }
              
              isFunction(callBack) && callBack({
                productId: res.data,
                productName: params.name,
                serialNumber: params.serialNumber,
                type: params.type
              })
              
            })
            .catch(err => {
              console.error(err);
            })
            .finally(() => {
              this.toggleLoading(false)
            })
            
        })
        .catch(err => {
          console.error(err);
          this.toggleLoading(false)
        })
    },
    goBack() {
      parent.frameHistoryBack(window);
    },
    toggleLoading(loading = true) {
      this.pending = loading
      this.loadingPage = loading
    }
  },
  components: {
    [ProductEditForm.name]: ProductEditForm,
  }
}
</script>

<style lang="scss">
  body {
    .base-modal-mask{
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .base-modal {
      margin: 0;
    }
  }

  .product-container {
    height: 100%;
    width: 100%;
    overflow: auto;
    background-color: #fff;

    .page-title {
      border-bottom: 1px solid #f4f7f5;
      padding: 12px 10px;
      display: flex;
      justify-content: space-between;

      .iconfont {
        font-size: 12px;
      }

      .title {
        display: flex;
        justify-content: space-between;
        span.text {
          line-height: 34px;
          margin-right: 12px;
        }
      }
    }
  }

  .form-builder{
    width: 700px;
    padding: 10px 0 0 10px;

    .input-and-btn{
      display: flex !important;
      flex-flow: row nowrap;

      .form-item, .form-text, .form-select, .biz-team-select {
        flex: 1;
      }

      .base-dist-picker{
        padding-right: 0;
      }

      button{
        margin-left: 10px;
      }
    }
  }


</style>