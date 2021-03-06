<template>
  <base-modal
    :title="modalTitle"
    :show.sync="addContactDialog"
    width="600px"
    class="edit-contact-dialog"
    @closed="reset"
  >
    <form @submit.prevent="submit" class="edit-contact-form-container" v-if="init">
      <form-builder
        :fields="fields"
        class="edit-contact-form"
        ref="form"
        :value="form"
        @update="update"
      >
        <template slot="phone" slot-scope="{field}">
          <form-item :label="field.displayName" :validation="validation">
            <form-text
              :field="field"
              :value="form.phone"
              @update="update"
              placeholder="建议使用手机号，可发送短信通知"
            />
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
import * as LinkmanApi from '@src/api/LinkmanApi';
import * as ProductApi from '@src/api/ProductApi';
import { createRemoteValidate } from '@src/util/validator';

export default {
  name: 'edit-contact-dialog',
  props: {
    customer: {
      type: Object,
      default: () => ({})
    },
    originalValue: {
      type: Object,
      default: () => ({})
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
        productId: [] // 数组，包含产品对象
      },
      loadData: false,
      createOriginalValue: {},
    };
  },
  computed: {
    action() {
      return this.originalValue.name ? 'edit' : 'create';
    },
    customerId() {
      return (this.customer && this.customer.id) || '';
    },
    isEdit() {
      return this.action === 'edit';
    },
    linkmanId() {
      return (this.originalValue && this.originalValue.id) || '';
    },
    fields() {
      return [
        {
          formType: 'text',
          fieldName: 'name',
          displayName: '联系人',
          placeholder: '[最多50字]',
          isNull: 0
        },
        {
          formType: 'phone',
          fieldName: 'phone',
          displayName: '电话',
          placeholder: '建议使用手机号,可发送短信通知',
          isNull: 0
        },
        {
          formType: 'select',
          fieldName: 'sex',
          displayName: '性别',
          placeholder: '请选择',
          isNull: 1,
          setting: {
            dataSource: ['男', '女']
          }
        },
        {
          formType: 'email',
          fieldName: 'email',
          displayName: '邮箱',
          placeholder: '',
          isNull: 1
        },
        {
          formType: 'text',
          fieldName: 'position',
          displayName: '职位',
          placeholder: '',
          isNull: 1
        },
        {
          formType: 'text',
          fieldName: 'department',
          displayName: '部门',
          placeholder: '',
          isNull: 1
        },
        {
          formType: 'textarea',
          fieldName: 'remark',
          displayName: '备注',
          placeholder: '[最多500字]',
          isNull: 1
        },
        {
          formType: 'select',
          fieldName: 'productId',
          displayName: '关联产品',
          placeholder: '请选择',
          isNull: 1,
          setting: {
            isMulti: true,
            dataSource: this.products || []
          }
        },
        {
          formType: 'select',
          fieldName: 'address',
          displayName: '关联地址',
          placeholder: '请选择',
          isNull: 1,
          setting: {
            dataSource: this.addresses || []
          }
        }
      ];
    },
    modalTitle() {
      return this.originalValue.name ? '编辑联系人' : '添加联系人';
    },
    validation() {
      return this.isPhoneUnique ? createRemoteValidate(LinkmanApi.checkUnique4Phone, (value, field) => {
        return {
          id: this.originalValue.id || '',
          phone: value
        }
      }) : true
    }
  },
  methods: {
    genPlaceholder(field) {
      return FormUtil.genPlaceholder(field);
    },
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;

        this.pending = true;

        const params = {
          ...this.form,
          customer:{ id: this.customer.id },
          productId: this.products
            .filter(p => this.form.productId.some(pId => pId === p.value))
            .map(p => ({
              id: p.value,
              name: p.text
            }))
        };

        let result = {};

        if (this.action === 'create') {
          result = await this.$http.post('/linkman/createByJson', params);
        } else {
          result = await this.$http.post('/linkman/updateByJson', params);
        }

        if (result.status != 0) {
          this.pending = false;
          return this.$platform.notification({
            title: '失败',
            message:
              result.message
              || `${this.action === 'create' ? '新建' : '更新'}失败`,
            type: 'error'
          });
        }

        this.pending = false;
        this.addContactDialog = false;

        // 新建、编辑工单页面新建联系人
        this.$eventBus.$emit('task_create_or_edit.update_linkman', { ...this.form, id: result.data });

        this.reset();
        this.$eventBus.$emit('customer_contact_table.update_linkman_list');
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.$eventBus.$emit('customer_detail_view.update_statistical_data');
        this.$eventBus.$emit('customer_detail_view.update_customer_detail');
        this.$eventBus.$emit('customer_contact.update_contact_list');

        if (this.action === 'create') {
          this.$eventBus.$emit(
            'customer_detail_view.select_tab',
            'customer-contact-table'
          );
        }
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
        productId: []
      };
      this.init = false;
    },
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        );
      }
      this.$set(this.form, fieldName, newValue);
    },
    openDialog(createOriginalValue = {}) {
      this.addContactDialog = true;

      // console.log(this.originalValue, "asdadsa");
      if (this.action === 'edit') {
        this.matchValueToForm(this.originalValue);
      }
      
      this.createOriginalValue = createOriginalValue;

      this.fetchAddress();
      // this.action === 'edit' ? this.fetchEditProducts() : this.fetchProducts();
      this.fetchProducts();
      this.init = true;
    },
    matchValueToForm(val) {
      const {
        name,
        remark,
        sex,
        position,
        department,
        customerId,
        customer,
        id,
        phone,
        email
      } = val;
      this.form = {
        name,
        remark,
        sex: ['男', '女'].indexOf(sex) === -1 ? '' : sex,
        position,
        department,
        address: '',
        customId: customerId || customer.id,
        customer: customer || {},
        id,
        phone,
        email,
        productId: []
      };

      // 联系人的产品和地址在获取到产品和地址的列表之后过滤掉被删除的再给form使用
    },
    fetchAddress() {
      return this.$http
        .get('/customer/address/list', {
          customerId: this.customer.id,
          pageSize: 100000,
          pageNum: 1
        })
        .then(res => {
          this.addresses = res.list.map(p => ({
            text: p.province + p.city + p.dist + p.address,
            value: p.id
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
      return this.$http
        .get('/customer/product/list', {
          customerId: this.customer.id,
          pageSize: 100000,
          pageNum: 1
        })
        .then(res => {
          this.products = res.list.map(p => ({
            text: p.name,
            value: p.id
          }));
          // 把被删除的产品过滤掉
          const productId = this.originalValue.productId;
          if (productId && productId.length) {
            this.form.productId = productId
              .map(p => p.id)
              .filter(pId => this.products.some(p => p.value === pId));
          }

          // this.form.productId = this.products.map(p => p.value);
          return this.products;
        })
        .catch(err => console.error('fetchProducts catch err', err));
    },
    fetchEditProducts() {
      return ProductApi.searchCustomerLinkmanForProduct({
        linkmanId: this.linkmanId,
        customerId: this.customer.id,
        pageSize: 0,
        pageNum: 1,
      })
        .then(res => {
          let list = res.list || []
          this.products = list.map(p => ({
            text: p.name,
            value: p.id
          }));
          // 把被删除的产品过滤掉
          const productId = this.originalValue.productId;
          if (productId && productId.length) {
            this.form.productId = productId
              .map(p => p.id)
              .filter(pId => this.products.some(p => p.value === pId));
          }

          this.form.productId = this.products.map(p => p.value);
          return this.products;
        })
        .catch(err => console.error('fetchProducts catch err', err));
    },
  }
};
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
      width: 100%;
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
