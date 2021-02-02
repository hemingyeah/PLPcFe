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
/* api */
import {
  getProductFields,
  getProductDetail,
  createProduct,
  updateProduct
} from '@src/api/ProductApi'
/* component */
import ProductEditForm from '@src/modules/product/components/ProductEditForm.vue'
/* enum */
import TenantDataLimitSourceEnum from '@model/enum/TenantDataLimitSourceEnum'
import TenantDataLimitTypeEnum from '@model/enum/TenantDataLimitTypeEnum'
/* mixin */
import VersionMixin from '@src/mixins/versionMixin/index.ts'
/* util */
import * as FormUtil from '@src/component/form/util'
import * as util from './utils/ProductMapping'

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
      // 获取产品自定义字段
      let res = await getProductFields({isFromSetting: true});
      this.dynamicProductFields = res.data.filter(item =>
        // 过滤新的产品类型
        item.formType != 'related_catalog'
      ) || [];
    } catch (e) {
      console.error('product Edit mounted error', e);
    }
    
    // 初始化默认值
    let form = {};
    if (this.action === 'edit') {
      // 处理编辑时数据
      this.loadingPage = true;
      let res = await getProductDetail({id: this.productId});
      
      this.loadingPage = false;
      if(res.id) form = res;
      
    } else {
      // 检查版本数量限制
      this.checkNumExceedLimitBeforeHandler 
      && this.checkNumExceedLimitBeforeHandler(
        TenantDataLimitSourceEnum.Product,
        TenantDataLimitTypeEnum.Product
      )
    }
    
    form = util.packToForm(this.productFields, form)
    
    // 客户详情新建产品，会带的客户信息
    if (this.customer) {
      form.customer = [{
        label: this.customer.name,
        value: this.customer.id,
        ...this.customer
      }]
    }
    
    /**
     * 初始化所有字段的初始值
     * @param {*} fields 字段
     * @param {*} origin 原始值
     * @param {*} target 待合并的值
     */
    
    this.form = FormUtil.initialize(this.productFields, form)
    
    this.init = true
  },

  methods: {
    submit() {
      this.submitting = true;
      this.$refs.productEditForm.validate()
        .then(valid => {
          this.submitting = false
          
          if (!valid) return Promise.reject('validate fail.')
          
          const params = util.packToProduct(this.productFields, this.form)
          
          this.productFields.forEach(field =>{
            if(field.fieldName == 'customer' && field.isSystem == 1) {
              if (!field.setting.customerOption.address) {
                params.address = {}
              } else if (!field.setting.customerOption.linkman){
                params.linkman = {}
              }  
            }
          })
          
          if(this.action !== 'create'){
            params.attribute.remindCount = localStorage.getItem('product_remind_count') || 0
          }
          
          this.toggleLoading()
          
          let fn = this.action === 'create' ? createProduct : updateProduct
          
          this.checkNumExceedLimitAfterHandler(fn(params))
            .then(res => {
              let action = this.action === 'create' ? '新建' : '更新';
              
              if (res.status) {                
                return this.$platform.notification({
                  title: `${action}产品失败`,
                  message: res.message || '',
                  type: 'error',
                })
              }
              
              this.$platform.notification({
                title: `${action}产品成功`,
                type: 'success',
              })
              
              if(this.action == 'create') {
                this.reloadTab()
              } else {
                let fromId = window.frameElement.getAttribute('fromid')
                this.$platform.refreshTab(fromId)
              }
              
              if (this.customer) {
                window.location.href = `/customer/view/${this.customer.id}`
              } else {
                window.location.href = `/customer/product/view/${res.data}`
              }
              
            })
            .catch(err => {
              console.error(err)
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