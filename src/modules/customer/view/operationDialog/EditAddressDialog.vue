<template>
  <base-modal :title="title" :show.sync="addAddressDialog" width="500px" class="edit-address-dialog">
    <form @submit.prevent="submit">
      <form-builder :fields="fields" class="edit-address-form" ref="form" :value="form" @input="update">
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
  name: "edit-address-dialog",
  props: {
    customerId: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      default: 'create',
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
      pending: false,
      addressBackup: {
        adAddress: [],
      },
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
        displayName: "地址",
        placeholder: '请输入详细地址[最多50字]',
        isNull: 0,
      },
      fields: [{
        formType: 'address',
        fieldName: 'customerAddress',
        displayName: "地址",
        placeholder: '请输入详细地址[最多50字]',
        isNull: 0,
      }]
    }
  },
  computed: {
    title() {
      return this.action === 'create' ? '添加地址' : '编辑地址';
    }
  },
  methods: {
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        this.pending = true;
        const params = this.buildParams();
        const url = `/customer/address/${this.action === 'create' ? 'create' : 'update'}`;

        await this.$http.post(url, params, false);

        this.pending = false;
        this.$emit('submit-success');

        // todo reload customer address
        this.$eventBus.$emit('customer_address_table.update_address_list');
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.addAddressDialog = false;
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
        params.longitude = address.longitude;
        params.latitude = address.latitude;
        params.addressType = 1;
      }
      return params;
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.form, fieldName, newValue)
    },
    updateAddressBackup(ad) {
      this.addressBackup = ad;
    },
    setDefaultAddress(ad) {
      const { adProvince, adCity, adDist, } = ad;
      if (!adProvince || !adCity) return;
      this.form.customerAddress.adAddress = [adProvince, adCity, adDist,].filter(ad => ad);
    },
    openDialog() {
      this.addAddressDialog = true;
      if (this.action === 'edit') {
        this.update({field: this.fields[0], newValue: this.defaultAddress});
      }

      if (this.defaultAddress.addressType) {
        this.updateAddressBackup(this.defaultAddress);
      }
      this.setDefaultAddress(this.defaultAddress)
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
