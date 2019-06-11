<template>
  <div class="product-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
          <span class="text">|</span>
          <button type="submit" :disabled="pending" class="btn btn-primary">提交</button>
        </div>
      </div>

      <product-edit-form :fields="productFields" v-model="form" :product-id="productId" ref="productEditForm">
        
      </product-edit-form>
    </form>
  </div>
</template>

<script>

import {
  getProductDetail,
  createProduct,
  updateProduct
} from '@src/api/ProductApi';
import * as FormUtil from '@src/component/form/util';
import ProductEditForm from './components/ProductEditForm.vue';

import * as util from './utils/ProductMapping';


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
        ...this.initData.productFields
      ]
    },
    auth() {
      return this.initData.auth || {};
    },
    productId() {
      // const matchRes = window.location.href.match(/customer\/product\/edit\/([\w-]*)(\??.*)/);
      return this.initData.id;
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
      
      this.form = FormUtil.initialize(this.productFields, form, function (fields, data) {
        let index = fields.findIndex(f => f.fieldName == 'type');
        let typeField = fields[index]
      
        if(typeField) {
          let options = typeField.setting.dataSource || [];

          if(!typeField.defaultValue && !data.type) {
            data.type = options[0]
          }
        }

        return data
      })

      this.init = true;
    } catch (e) {
      console.error('CustomerEditView caught an error ', e);
    }
  },

  methods: {
    submit() {
      this.submitting = true;

      this.$refs.productEditForm.validate()
        .then(valid => {
          this.submitting = false;
          if (!valid) return Promise.reject('validate fail.');
          const params = util.packToProduct(this.productFields, this.form);

          this.pending = true;
          this.loadingPage = true;
          let fn = this.action === 'create' ? createProduct : updateProduct;

          fn(params)
            .then(res => {
              let action = this.action === 'create' ? '新建' : '更新';

              if (res.status) return this.$platform.notification({
                title: `${action}产品失败`,
                message: res.message || '',
                type: 'error',
              });

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
            });
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        })
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
  },
  components: {
    [ProductEditForm.name]: ProductEditForm,
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
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
  width: 655px;
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