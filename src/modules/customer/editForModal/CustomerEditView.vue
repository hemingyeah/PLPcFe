<template>
  <div class="customer-modal-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <customer-edit-form :fields="fields" v-model="form" ref="form"/>
    </form>
  </div>
</template>

<script>
/* api */
import * as CustomerApi from '@src/api/CustomerApi.ts'
/* component */
import CustomerEditForm from '@src/modules/customer/components/CustomerEditForm.vue'
/* enum */
import TenantDataLimitSourceEnum from '@model/enum/TenantDataLimitSourceEnum'
import TenantDataLimitTypeEnum from '@model/enum/TenantDataLimitTypeEnum'
/* util */
import platform from '@src/platform'
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/customer/util/customer'
import { isFunction } from '@src/util/type'
/* mixin */
import VersionMixin from '@src/mixins/versionMixin/index.ts'

export default {
  name: 'customer-edit-view',
  inject: ['initData'],
  mixins: [VersionMixin],
  data() {
    return {
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      fieldInfo: []
    };
  },
  computed: {
    action() {
      return this.initData.action;
    },
    fields() {
      let originFields = this.fieldInfo || [];
      let sortedFields = originFields.sort((a, b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.isAddressAllowNull ? 1 : 0;
          }
          return f;
        })
        .filter(f => {
          return (
            (
              f.fieldName !== 'tags' 
              || (f.fieldName === 'tags' && this.initData.isDivideByTag)
            )
          )
        });
      return FormUtil.migration(sortedFields)
    },
    postUrl() {
      if (location.pathname.indexOf('task') >= 0) {
        return '/task/customer/create';
      }
      return '/event/customer/create';
    }
  },
  methods: {
    submit(callBack) {
      this.submitting = true;
      this.$refs.form.validate()
        .then(valid => {
          this.submitting = false;
          if (!valid) return Promise.reject('validate fail.');
          
          const params = util.packToCustomer(this.fields, this.form, this.initData.tags);
          
          this.toggleLoading()
          this.createMethod(params, callBack);
        })
        .catch(err => {
          console.error(err)
          this.toggleLoading(false)
        });
    },
    createMethod(params, callBack) {
      this.checkNumExceedLimitAfterHandler(this.$http.post(this.postUrl, params))
        .then(result => {
          let isSucc = result.succ
          
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建客户${isSucc ? '成功' : '失败'}`,
            message: !isSucc && result.message
          });
          
          if (!isSucc) return;
          
          const addressId = result.data.addressId;
          const customerId = result.data.customerId;
          const linkmanId = result.data.linkmanId;
          
          const customer = {
            id:customerId,
            name: params.name,
            lmId:linkmanId,
            lmName: params.lmName,
            lmPhone: params.lmPhone,
            addressId,
            country: params.customerAddress.adCountry || '',
            province:params.customerAddress.adProvince || '',
            city: params.customerAddress.adCity || '',
            dist: params.customerAddress.adDist || '',
            address: params.customerAddress.adAddress || '',
            latitude: result.data.latitude,
            longitude: result.data.longitude,
            customerManager: params.customerManager,
            customerManagerName: params.customerManagerName || ''
          }
          
          isFunction(callBack) && callBack(customer)
          
        })
        .catch(err => {
          console.error('editForModal CustomerEditView createMethod error', err)
        })
        .finally(() => {
          this.toggleLoading(false)
        })
    },
    initFormData() {
      let form = util.packToForm(this.fields, {}, this.initData.customerAddress);
      this.form = FormUtil.initialize(this.fields, form);
      this.addressBackup = this.form.customerAddress;
    },
    toggleLoading(loading = true) {
      this.pending = loading
      this.loadingPage = loading
    }
  },
  async mounted() {
    // 暴露提交方法
    window.submit = this.submit;
    
    try {
      // 获取客户表单字段列表
      let result = await CustomerApi.getCustomerFields({isFromSetting: true});
      if (result.succ) {
        this.fieldInfo = result.data;
      }
      
      // 检查版本数量限制
      this.checkNumExceedLimitBeforeHandler 
      && this.checkNumExceedLimitBeforeHandler(
        TenantDataLimitSourceEnum.Customer,
        TenantDataLimitTypeEnum.Customer
      )
      
      // 初始化默认值
      this.initFormData()
      this.init = true
      
    } catch (error) {
      console.error('editForModal CustomerEditView mounted an error ', error)
    }
    
  },
  components: {
    [CustomerEditForm.name]: CustomerEditForm
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

.customer-modal-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #fff;

  .form-builder{
    padding: 10px 15px;

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
}
</style>