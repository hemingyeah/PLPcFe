<template>
  <div class="product-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init">
      <product-edit-form :fields="productFields" v-model="form" customer-is-readonly ref="productEditForm">

      </product-edit-form>
    </form>
  </div>
</template>

<script>

import {
  getProductFields,
  createProduct
} from '@src/api/ProductApi';
import * as FormUtil from '@src/component/form/util';
import ProductEditForm from '@src/modules/product/components/ProductEditFormV2.vue';

import * as util from '@src/modules/product/utils/ProductMapping';


export default {
  name: 'product-edit',
  inject: ['initData'],
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
      // 产品编号限制字数最大长度为100
      this.dynamicFields.forEach(field => {
        if (field.fieldName == 'serialNumber') {
          field.maxlength = 100
        }
      })
    } catch (error) {
      console.error('product-edit-modal fetch product fields error', error);
    }

    window.submit = this.submit;

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
          this.submitting = false;
          if (!valid) return Promise.reject('validate fail.');
          const params = util.packToProduct(this.productFields, this.form);

          this.pending = true;
          this.loadingPage = true;

          params.customerId = customer.id;

          createProduct(params)
            .then(res => {
              this.pending = false;
              this.loadingPage = false;

              if (res.status) return this.$platform.notification({
                title: '新建产品失败',
                message: res.message || '',
                type: 'error',
              });

              callBack && typeof callBack === 'function' && callBack({

                productId: res.data,
                productName: params.name,
                serialNumber: params.serialNumber,
                type: params.type
              });

            })
            .catch(err => {
              console.error(err);
            });
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        })
    },
    goBack() {
      parent.frameHistoryBack(window);
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