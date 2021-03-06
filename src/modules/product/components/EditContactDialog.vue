<template>
  <base-modal title="添加联系人" :show.sync="addContactDialog" width="600px" class="edit-contact-dialog" @closed="reset">
    <form @submit.prevent="submit" class="edit-contact-form-container" v-if="init">
      <form-builder :fields="fields" class="edit-contact-form" ref="form" :value="form" @update="update">

        <template slot="phone" slot-scope="{field}">
          <form-item :label="field.displayName" :validation="validation">
            <form-text
              :field="field"
              :value="form.phone" @update="update"
              placeholder="建议使用手机号，可发送短信通知"/>
          </form-item>
        </template>

      </form-builder>
      <div class="dialog-footer" slot="footer">
        <el-button @click="addContactDialog = false">关闭</el-button>
        <el-button native-type="submit" type="primary" :disabled="pending">保存</el-button>
      </div>
    </form>
  </base-modal>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import * as LinkmanApi from '@src/api/LinkmanApi'
import {createRemoteValidate} from '@src/util/validator'

export default {
  name: 'edit-contact-dialog',
  props: {
    customer: {
      type: Object,
      default: () => ({}),
    },
    product: {
      type: Object,
      default: () => ({}),
    },
    originalValue: {
      type: Object,
      default: () => ({}),
    },
    isPhoneUnique: Boolean
  },
  data() {
    return {
      init: false,
      addContactDialog: false,
      pending: false,
      products: [],
      addresses: [],
      form: {
        name: null,
        remark: '',
        sex: '',
        position: '',
        department: '',
        address: '', // address的ID
        customId: '',
        customer: {},
        id: '',
        phone: null,
        email: null,
        productId: [], // 数组，包含产品对象
      },
      loadData: false,
      validation: this.isPhoneUnique ? createRemoteValidate(LinkmanApi.checkUnique4Phone, (value, field) => {
        return {
          id: this.originalValue.id || '',
          phone: value
        }
      }) : true
    }
  },
  computed: {
    customerId() {
      return (this.customer && this.customer.id) || '';
    },
    fields() {
      return [{
        formType: 'text',
        fieldName: 'name',
        displayName: '联系人',
        placeholder: '[最多50字]',
        isNull: 0,
      }, {
        formType: 'phone',
        fieldName: 'phone',
        displayName: '电话',
        placeholder: '建议使用手机号,可发送短信通知',
        isNull: 0,
      }, {
        formType: 'select',
        fieldName: 'sex',
        displayName: '性别',
        placeholder: '请选择',
        isNull: 1,
        setting: {
          dataSource: ['男', '女'],
        }
      }, {
        formType: 'email',
        fieldName: 'email',
        displayName: '邮箱',
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'text',
        fieldName: 'position',
        displayName: '职位',
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'text',
        fieldName: 'department',
        displayName: '部门',
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'textarea',
        fieldName: 'remark',
        displayName: '备注',
        placeholder: '[最多500字]',
        isNull: 1,
      }, {
        formType: 'select',
        fieldName: 'address',
        displayName: '关联地址',
        placeholder: '请选择',
        isNull: 1,
        setting: {
          dataSource: this.addresses || [],
        }
      }]
    },
    address () {
      let address = this.customer.customerAddress ? (this.customer.customerAddress.adProvince || '') + (this.customer.customerAddress.adCity || '') + (this.customer.customerAddress.adDist || '') + (this.customer.customerAddress.adAddress || '') : '';
      return address;
    }
  },
  methods: {
    genPlaceholder(field){
      return FormUtil.genPlaceholder(field);
    },
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        this.pending = true;

        const params = {
          ...this.form,
          customer: this.customer,
          productId: this.products
            .filter(p => this.form.productId.some((pId => pId === p.value)))
            .map(p => ({
              id: p.value,
              name: p.text,
            })),
        };

        let result = await this.$http.post('/linkman/createByJson', params);

        if(result.status != 0) {
          this.pending = false;
          return this.$platform.notification({
            title: '失败',
            message: result.message || '新建失败',
            type: 'error',
          });
        }

        this.pending = false;
        this.addContactDialog = false;
        let linkman = [
          {
            label: this.form.name,
            value: result.data,
            phone: this.form.phone
          }
        ]
        this.$emit('updateLinkman', linkman);
        this.reset();
        this.$eventBus.$emit('customer_contact_table.update_linkman_list');
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.$eventBus.$emit('customer_detail_view.update_statistical_data');
        this.$eventBus.$emit('customer_detail_view.update_customer_detail');

      } catch (e) {
        this.pending = false;
        console.error('addContactDialog submit catch e', e);
      }
    },
    reset() {
      this.form = {
        name: null,
        remark: '',
        sex: '',
        position: '',
        department: '',
        address: '',
        customId: '',
        customer: {},
        id: '',
        phone: null,
        email: null,
        productId: [],
      };
      this.init = false;
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.form, fieldName, newValue)
    },
    openDialog() {
      this.addContactDialog = true;
      this.fetchAddress();
      this.fetchProducts();
      this.init = true;
    },
    fetchAddress() {
      return this.$http.get('/customer/address/list', {
        customerId: this.customer.id,
        pageSize: 100000,
        pageNum: 1,
      })
        .then(res => {
          this.addresses = res.list
            .map(p => ({
              text: p.province + p.city + p.dist + p.address,
              value: p.id,
            }));

          // 把被删除的地址过滤掉
          const address = this.originalValue.address;
          if (address && this.addresses.some(a => a.value === address)) {
            this.form.address = address;
          }

          return this.addresses;
        })
        .catch(err => console.error('fetchAddress catch err', err));
    },
    fetchProducts() {
      return this.$http.get('/customer/product/list', {
        customerId: this.customer.id,
        pageSize: 100000,
        pageNum: 1,
      })
        .then(res => {
          this.products = res.list
            .map(p => ({
              text: p.name,
              value: p.id,
            }));
          // 把被删除的产品过滤掉
          const productId = this.originalValue.productId;
          if (productId && productId.length) {
            this.form.productId = productId.map(p => p.id)
              .filter(pId => this.products.some(p => p.value === pId));
          }

          return this.products;
        })
        .catch(err => console.error('fetchProducts catch err', err));
    }
  },
}
</script>

<style lang="scss">

  .edit-contact-dialog {
    .base-modal-body {
      padding: 15px 30px 0;
    }


    .edit-contact-form-container {
      width: 100%;
      margin: 0 auto;

      .edit-contact-form {
        padding: 10px 0 5px;
      }

      .form-item label {
        /*text-align: right;*/
        width: 80px;
      }

      .form-item-control {
        max-width: calc(100% - 80px);
      }
    }

    .dialog-footer {
      text-align: right;
      padding: 0px 0px 15px;
    }
  }

</style>
