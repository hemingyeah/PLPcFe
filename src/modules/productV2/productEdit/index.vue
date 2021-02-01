<template>
  <div class="product-container" v-loading.fullscreen.lock="loadingPage">
    <div id="product-product-edit"></div>
    <div class="base-form " v-if="init" >


      <product-edit-form
        :fields="productFields"
        v-model="form"
        :product-id="productId"
        ref="productEditForm"
      >
      </product-edit-form>


      <div class="normal-btn-box mar-l-20">
        <el-button type="primary" @click="submitChooseQrcode" :loading="pending" class="btn btn-primary ">
          保存并关联二维码
        </el-button>
        <el-button @click="submit" :loading="pending">
          仅保存
        </el-button>
         
      </div>
    </div>

    <public-dialog :product-id="productId" :dialog-type="'linkQrcode'" @dialogBind="dialogBind" ref="publicDialog"/>
  </div>
</template>

<script>

import {
  getProductFields,
  getProductDetail,
  createProduct,
  updateProduct
} from '@src/api/ProductApi';
import * as FormUtil from '@src/component/form/util';
import ProductEditForm from '@src/modules/product/components/ProductEditFormV2.vue';
import PublicDialog from '@src/modules/productV2/productView/components/PublicDialog.vue';

import * as util from '@src/modules/product/utils/ProductMapping';


import initData from '@src/modules/productV2/productEdit/initData.js'
import { storageGet, storageSet } from '@src/util/storage';
const {
  PRODUCT_PRODUCT_EDIT
} = require('@src/component/guide/productV2Store');



export default {
  name: 'product-edit',
  provide(){
    return{
      // initData,
      cloneProduct:this.cloneProduct
    }
  },
  inject: ['initData'],
  data() {
    return {
      loadingPage: false,
      pending: false,
      init: false,
      submitting: false,
      form: {},
      // initData,
      dynamicProductFields: []
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
        ...this.dynamicProductFields
      ]
    },
    auth() {
      return this.initData.auth || {};
    },
    productId() {
      // const matchRes = window.location.href.match(/customer\/product\/edit\/([\w-]*)(\??.*)/);
      return this.initData.id || '';
    },
    // 客户上创建产品会带一个cId
    customer() {
      return this.initData.customer || null;
    },
    action() {
      return this.productId ? 'edit' : 'create';
    }
  },
  async mounted() {
    try {
      // 获取产品自定义字段
      let res = await getProductFields({isFromSetting: true});
      this.dynamicProductFields = res.data || [];
    } catch (e) {
      console.error('product-add_edit fetch product fields error', e);
    }

    // 初始化默认值
    let form = {};
    if (this.action === 'edit') {
      // 处理编辑时数据
      this.loadingPage = true;
      let res = await getProductDetail({id: this.productId});

      this.loadingPage = false;
      if(res.id) form = res;
    }
    form = util.packToForm(this.productFields, form);

    // 客户详情新建产品，会带的客户信息
    if (this.customer) {
      form.customer = [{
        label: this.customer.name,
        value: this.customer.id,
        ...this.customer
      }];
    }
    

    /**
     * 初始化所有字段的初始值
     * @param {*} fields 字段
     * @param {*} origin 原始值
     * @param {*} target 待合并的值
     */

    this.form = FormUtil.initialize(this.productFields, form);



    if (storageGet(PRODUCT_PRODUCT_EDIT) && storageGet(PRODUCT_PRODUCT_EDIT) > 0) this.$Guide().destroy('product-product-edit')
    else this.$Guide([{
      content:
          '在这里选择需要关联的产品类型',
      haveStep: false,
      nowStep: 1,
      id: 'product-product-edit',
      domId:'form-related-catalog',
      finishBtn: 'ok',
    }], 0, '', (e) => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }).create().then(res_=>{if(res_)storageSet(PRODUCT_PRODUCT_EDIT, '1')})

    this.init = true;
  },

  methods: {
    submit() {
      this.submitting = true;
      this.$refs.productEditForm.validate()
        .then(valid => {
          this.submitting = false;
          if (!valid) return Promise.reject('validate fail.');
          const params = util.packToProduct(this.productFields, this.form);
          this.productFields.forEach(field =>{
            if(field.fieldName == 'customer' && field.isSystem == 1) {
              if (!field.setting.customerOption.address) {
                params.address = {}
              } else if (!field.setting.customerOption.linkman){
                params.linkman = {}
              }
            }
          });
          this.pending = true;
          this.loadingPage = true;
          let fn = this.action === 'create' ? createProduct : updateProduct;
          fn(params)
            .then(res => {
              let action = this.action === 'create' ? '新建' : '更新';

              if (res.status) {
                this.pending = false;
                this.loadingPage = false;

                return this.$platform.notification({
                  title: `${action}产品失败`,
                  message: res.message || '',
                  type: 'error',
                })
              }
              this.$refs.publicDialog.close();

              this.$platform.notification({
                title: `${action}产品成功`,
                type: 'success',
              });

              if(this.action == 'create') {
                this.reloadTab();
              } else {
                let fromId = window.frameElement.getAttribute('fromid');
                this.$platform.refreshTab(fromId);
              }
              if (this.customer) {
                window.location.href = `/customer/view/${this.customer.id}`;
              } else {
                window.location.href = `/customer/product/view/${res.data}`;
              }
            })
            .catch(err => {
              console.error(err);
              this.pending = false;
              this.loadingPage = false;
            })
            .finally(()=>{
              this.$refs.publicDialog.changeLoading(false);
            });
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        })
    },
    submitChooseQrcode(){
      this.$refs.productEditForm.validate()
        .then(valid => {
          if (!valid) return Promise.reject('validate fail.');
          this.$refs.publicDialog.open();
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        })
    },
    dialogBind(e){
      console.log('dialogBind', e)
      this.form['qrcodeId'] = e.qrcodeId;
      this.submit();
    },
    goBack() {
      if(this.action == 'create') {
        let id = window.frameElement.dataset.id;
        return this.$platform.closeTab(id);
      }
      parent.frameHistoryBack(window);
    },
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid');

      this.$platform.refreshTab(fromId);
    },
    async cloneProduct(id){
      let form = {};
      // 处理编辑时数据
      this.loadingPage = true;
      let res = await getProductDetail({id});

      this.loadingPage = false;
      if(res.id) form = res;
      form = util.packToForm(this.productFields, form);

      // 客户详情新建产品，会带的客户信息
      if (this.customer) {
        form.customer = [{
          label: this.customer.name,
          value: this.customer.id,
          ...this.customer
        }];
      }

      /**
     * 初始化所有字段的初始值
     * @param {*} fields 字段
     * @param {*} origin 原始值
     * @param {*} target 待合并的值
     */

      this.form = FormUtil.initialize(this.productFields, form)
    },
  },
  components: {
    [ProductEditForm.name]: ProductEditForm,
    [PublicDialog.name]:PublicDialog
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.product-container {
  width: 100%;
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

.form-builder {
  width: 700px;
  padding: 10px 0 0 10px;

  .input-and-btn {
    display: flex !important;
    flex-flow: row nowrap;

    .form-item,
    .form-text,
    .form-select,
    .biz-team-select {
      flex: 1;
    }

    .base-dist-picker {
      padding-right: 0;
    }

    button {
      margin-left: 10px;
    }
  }
}
</style>
