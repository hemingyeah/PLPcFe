<template>
  <div class="customer-modal-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form">
      <customer-edit-form :fields="fields" v-model="form" ref="form"/>
    </form>
  </div>
</template>

<script>
import CustomerEditForm from '../components/CustomerEditForm.vue'

import * as FormUtil from '@src/component/form/util';
import * as util from '../util/customer'

import platform from '@src/platform';

export default {
  name: 'customer-edit-view',
  inject: ['initData'],
  data() {
    return {
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false
    };
  },
  computed: {
    action() {
      return this.initData.action;
    },
    fields() {
      let originFields = this.initData.fieldInfo || [];
      let sortedFields = originFields.sort((a, b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.isAddressAllowNull ? 1 : 0;
          }
          return f;
        })
        .filter(f => f.fieldName !== 'tags' || (f.fieldName === 'tags' && this.initData.isDivideByTag));
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
          this.pending = true;
          this.loadingPage = true;
          this.createMethod(params, callBack);
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        });
    },
    createMethod(params, callBack) {
      this.$http.post(this.postUrl, params)
        .then(result => {
          if (result.status == 1) return platform.notification({
            type: 'error',
            title: '创建客户成功失败',
            message: result.message
          });

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

          callBack && typeof callBack == 'function' && callBack(customer);
        })
        .catch(err => console.error('err', err));
    }
  },
  async mounted() {
    // 暴露提交方法
    window.submit = this.submit;

    try {
      // 初始化默认值
      let form = util.packToForm(this.fields, {}, this.initData.customerAddress);
      this.form = FormUtil.initialize(this.fields, form);
      this.addressBackup = this.form.customerAddress;
      this.init = true;
    } catch (e) {
      console.error('CustomerEditView caught an error ', e);
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