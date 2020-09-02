<template>
  <base-modal :title="title" :show.sync="addAddressDialog" width="600px" class="edit-address-dialog" @closed="reset">
    <form @submit.prevent="submit" v-if="init">
      <form-builder :fields="fields" class="edit-address-form" ref="form" :value="form" @update="update">
      </form-builder>
    </form>
    <div class="dialog-footer" slot="footer">
      <el-button @click="addAddressDialog = false">关闭</el-button>
      <el-button @click="submit" type="primary" :disabled="pending">保存</el-button>
    </div>
  </base-modal>
</template>

<script>
export default {
  name: 'edit-address-dialog',
  props: {
    customerId: {
      type: String,
      default: '',
    },
    loginUserId: {
      type: String,
      default: '',
    },
    defaultAddress: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      addAddressDialog: false,
      submitted: false,
      pending: false,
      addressBackup: {},
      init: false,
      form: {
        customerAddress: {
          adAddress: [],
          detail: '',
          adLongitude: '',
          adLatitude: '',
          addressType: 0,
        }
      },
      addressField: {
        formType: 'address',
        fieldName: 'customerAddress',
        displayName: '地址',
        placeholder: '请输入详细地址[最多1000字]',
        isNull: 0,
      },
      fields: [{
        formType: 'address',
        fieldName: 'customerAddress',
        displayName: '地址',
        placeholder: '请输入详细地址[最多1000字]',
        isNull: 0,
      }]
    }
  },
  computed: {
    title() {
      return '添加地址';
    }
  },
  methods: {
    reset() {
      this.form = {
        customerAddress: {
          adAddress: [],
          detail: '',
          adLongitude: '',
          adLatitude: '',
          addressType: 0,
        }
      };
      this.addressBackup = {};
      this.init = false;
    },
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        this.pending = true;
        const params = this.buildParams();
        const url = '/customer/address/create';

        let result = await this.$http.post(url, params, false);

        if(result.status != 0) {
          return this.$platform.notification({
            title: '失败',
            message: result.message || '新建失败',
            type: 'error',
          });
        }
        
        let address = [{
          label: params.province + params.city + params.dist + params.address,
          value: result.data
        }]
        this.$emit('updateCustomerAddress', address);

        this.pending = false;
        this.$emit('submit-success');
        this.$eventBus.$emit('customer_address_table.update_address_list');
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.$eventBus.$emit('customer_detail_view.update_statistical_data');
        this.$eventBus.$emit('customer_detail_view.update_customer_detail');
        this.addAddressDialog = false;
        this.$eventBus.$emit('customer_detail_view.select_tab', 'customer-address-table');

      } catch (e) {
        console.error('edit-address-dialog catch err', e);
      }
    },
    buildParams() {
      const address = this.form.customerAddress;
      const addressBackup = this.addressBackup;

      let params = {
        // id: this.loginUserId,
        id: this.defaultAddress.id || '',
        customerId: this.customerId,
        province: address.province || '',
        city: address.city || '',
        dist: address.dist || '',
        addressType: 0,
        longitude: '',
        latitude: '',
        address: address.address,
      };
      if (address.province === addressBackup.province &&
            address.city === addressBackup.city &&
            address.dist === addressBackup.dist &&
            address.address === addressBackup.address
      ) {
        params.longitude = addressBackup.longitude;
        params.latitude = addressBackup.latitude;
        params.addressType = 1;
      }
      return params;
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }

      this.updateAddressBackup(newValue);
      this.$set(this.form, fieldName, newValue)
    },
    updateAddressBackup(ad) {
      if (ad.addressType) {
        this.addressBackup = ad;
      }
    },
    setDefaultAddress(ad) {
      const { adProvince, adCity, adDist, } = ad;
      if (!adProvince || !adCity) return;
      this.form.customerAddress = {
        ...this.form,
        province: adProvince,
        city: adCity,
        dist: adDist,
      }
      // this.form.customerAddress.adAddress = [adProvince, adCity, adDist,].filter(ad => ad);
    },
    openDialog() {
      this.addAddressDialog = true;
      this.updateAddressBackup(this.defaultAddress);
      this.setDefaultAddress(this.defaultAddress);
      this.init = true;
    },
  },
}
</script>

<style lang="scss">

  .edit-address-form {
    padding: 15px 0 0;

    .form-item label {
      display: none;
    }

    .form-item-control {
      max-width: 100%;
    }
  }

  .edit-address-dialog {
    .base-modal-body {
      padding: 15px 30px 0;
    }

    .base-modal-footer {
      padding-top: 5px;
      text-align: right;
    }
  }
</style>