<template>
  <base-modal title="添加地址" :show.sync="addAddressDialog" width="500px" class="add-address-dialog">
    <form @submit.prevent="submit">
      <form-builder :fields="[]" class="add-address-form" ref="form" :value="form" @input="update">
        <form-item label="" :field="addressField">
          <form-address ref="addressForm" :field="addressField" :value="form.customerAddress" @input="update"
                        @update-address-backup="updateAddressBackup" :address-backup="addressBackup"
                        :placeholder="addressField.placeholder"></form-address>
        </form-item>
      </form-builder>
      <div class="dialog-footer">
        <el-button @click="addRemarkDialog = false">关闭</el-button>
        <el-button native-type="submit" type="primary" :disabled="pending">保存</el-button>
      </div>
    </form>

  </base-modal>
</template>

<script>
  import FormAddress from '../../edit/FormAddress.vue';

  export default {
    name: "add-address-dialog",
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
          fieldName: 'address',
          displayName: "地址",
          placeholder: '请输入详细地址[最多50字]',
          isNull: 0,
        }
      }
    },
    mounted() {

    },
    methods: {
      openDialog() {
        this.addAddressDialog = true;
      },
      async submit() {
        try {
          const validateRes = await this.$refs.form.validate();
          console.log('validateRes', validateRes);

        } catch (e) {
          console.error('add-address-dialog catch err', e);
        }
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
      }
    },
    components: {
      FormAddress,
    },
  }
</script>

<style lang="scss">

  .add-address-form {
    padding: 10px 30px;

    .form-item label {
      display: none;
    }
  }

  .dialog-footer {
    text-align: right;
    padding: 10px 30px 20px;
  }

</style>