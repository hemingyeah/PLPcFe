/* util */
import _ from 'lodash';
import * as FormUtil from '@src/component/form/util';
import { findComponentDownward } from '@src/util/assist';

import EditAddressDialog from '@src/modules/customer/view/operationDialog/EditAddressDialog.vue';
import EditContactDialog from '@src/modules/customer/view/operationDialog/EditContactDialog.vue';
/* Vue */
import props from './props'
import data from './data'
import computed from './computed'

export default {
  name: 'task-edit-form',
  props,
  data() {
    return data
  },
  computed,
  created () {
    this.init();
  },
  mounted () {
    this.taskFields = this.fields;
    this.taskValue = this.value;
    this.selectedType = this.taskTypes[0] || {};

    this.$eventBus.$on('task_create_or_edit.update_linkman', this.updateLinkman);
    this.$eventBus.$on('task_create_or_edit.update_address', this.bindAddress);
  },
  beforeDestroy() {
    this.$eventBus.$off('task_create_or_edit.update_linkman', this.updateLinkman);
    this.$eventBus.$off('task_create_or_edit.update_address', this.bindAddress);
  },
  methods: {
    init() {
      this.loading = true;

      // 获取客户、产品数据
      Promise.all([
        this.getTaskTypes(),
        this.fetchCustomerData(),
        this.fetchProductData()
      ])
        .then(res => {
          this.loading = false;
        })
        .catch(err => console.error('error', err));
    },
    async chooseTemplate(id) {
      let loading = this.$loading();
      try {
        this.taskFields = await TaskApi.getTaskTemplateFields({ templateId: id, tableName: 'task' });
        this.taskValue = FormUtil.initialize(this.taskFields, {});

        // 表单初始化
        this.$emit('update:value', this.taskValue);
        this.$emit('update:fields', this.taskFields);

        // 清空校验结果
        setTimeout(() => {
          this.$refs.form.$children.map(child => {
            if (child.$el.className == 'form-item err') {
              child.$el.dispatchEvent(new CustomEvent('form.clear.validate', {bubbles: false}));
            }
          })
        }, 0);

        this.selectedType = this.taskTypesMap[id];
        this.$emit('updatetemplateId', this.selectedType);
      } catch (error) {
        console.error(error)
      }

      loading.close();
    },
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;

      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        )
      }

      let value = this.value;
      this.$set(value, fieldName, newValue);
      this.$emit('input', value);
    },
    validate() {
      return this.$refs.form.validate();
    },
    async searchCustomer(params = {}) {

      try {
        const result = await TaskApi.getTaskCustomerList(params);

        if (!result || !result.list) return;

        result.list = result.list.map(customer =>
          Object.freeze({
            label: customer.name,
            value: customer.id,
            ...customer
          })
        )

        return result;

      } catch (error) {
        console.error(error);
      }
    },
    async updateCustomer(value = []) {

      try {
        const result = await TaskApi.getTaskDefaultInfo({ customerId: value[0].value });

        let { linkman, address } = result;

        // 重置联系人和地址
        this.$set(this.value, 'linkman', []);
        this.$set(this.value, 'address', []);

        // 绑定联系人和地址
        linkman && this.bindLinkman(linkman);
        address && this.bindAddress(address);

        if (this.value.product && this.value.product.length) {
          this.value.product = this.value.product.filter(item => item.customerId == value[0].value);
        }

      } catch (error) {
        console.log('task-edit-form: updateCustomer -> error', error);
      }

      // 查询客户关联字段
      this.selectCustomerRelation(value[0].value);

    },
    selectCustomerRelation(id) {
      let forRelation = {
        module: 'customer',
        id
      };

      this.$eventBus.$emit('es.Relation.Customer', forRelation);
    },
    async searchLinkman(params) {
      const pms = params || {};
      pms.customerId = this.selectedCustomer.value;

      try {
        const data = await TaskApi.getTaskCustomerLinkman(pms);
        
        let result = data.result;
        
        if (!result || !result.list) return;

        result.list = result.list.map(linkman =>
          Object.freeze({
            label: linkman.name + linkman.phone,
            value: linkman.id,
            ...linkman
          })
        );
        
        return result;  

      } catch (error) {
        console.log('task-edit-form: searchProduct -> error', error);
      }

    },
    async updateLinkman(linkman) {
      this.bindLinkman(linkman);

      try {
        const result = await TaskApi.getLmBindAddress({ lmId: linkman.id });

        // 如果存在地址信息则绑定地址
        result.data.id && this.bindAddress(result.data);

      } catch (error) {
        console.log('task-edit-form: updateLinkmanByCreate -> error', error);
      }

    },
    bindLinkman(linkman) {
      this.$set(this.value, 'linkman', [{
        value: linkman.id,
        label: linkman.name + linkman.phone,
        ...linkman
      }]);
    },
    async searchAddress(params) {
      const pms = params || {};
      pms.customerId = this.selectedCustomer.value;

      try {
        const result = await TaskApi.getTaskCustomerAddress(pms);

        if (!result || !result.data) return;

        result.list = result.data.map(address =>
          Object.freeze({
            label: address.province + address.city + address.dist + address.address,
            value: address.id,
            ...address
          })
        );
        
        return result;  

      } catch (error) {
        console.log('task-edit-form: searchAddress -> error', error)
      }

    },
    bindAddress(address) {
      this.$set(this.value, 'address', [{
        value: address.id,
        label: address.province + address.city + address.dist + address.address,
        ...address
      }]);
    },
    async searchProduct(params) {
      const pms = params || {};
      pms.customerId = this.selectedCustomer.value;

      try {
        const result = await TaskApi.getTaskCustomerProduct(pms);

        if (!result || !result.list) return;

        result.list = result.list.map(template =>
          Object.freeze({
            label: template.name,
            value: template.id,
            ...template
          })
        );
        
        return result;  

      } catch (error) {
        console.log('task-edit-form: searchProduct -> error', error)
      }

    },
    async updateProduct(value) {

      try {
        // 判断客户是否存在
        if (!this.value.customer || !this.value.customer.length) {
          // 客户不存在时则下拉框隐藏
          findComponentDownward(this.$refs.product, 'base-select').close();
          const result = await TaskApi.getCustomerByProduct({ id: value[value.length - 1].value });

          const customerData = [{
            label: result.customerName,
            value: result.customerId,
            id: result.customerId
          }];

          this.$set(this.value, 'customer', customerData);
          this.updateCustomer(customerData);
        }

        // 查询产品关联字段, 选一个产品才带入
        if (value.length === 1) {
          let forRelation = {
            module: 'product',
            id: value[0].value
          }

          this.$eventBus.$emit('es.Relation.Product', forRelation);
        } else {
          // 清空产品关联字段数据
          this.$eventBus.$emit('es.Relation.Product', {});
        }

      } catch (error) {
        console.log('task-edit-form: updateProduct -> error', error);
      }
    },
    addCustomerSubmit() {
      this.customerFormDom.submit(data => {
        this.isCreateCustomer = true;
        
        // 绑定客户
        this.$set(this.value, 'customer', [{
          label: data.name,
          value: data.id,
          id: data.id
        }]);

        // 绑定联系人
        this.bindLinkman({
          id: data.lmId,
          name: data.lmName,
          phone: data.lmPhone
        })

        // 绑定地址
        data.addressId && this.bindAddress({
          id: data.addressId,
          country: data.country,
          province: data.province,
          city: data.city,
          dist: data.dist,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
        })

        // 查询客户关联字段
        this.selectCustomerRelation(data.id);

        this.addCustomerDialog = false;

      });
    },
    addProductSubmit() {
      this.productFormDom.submit(this.value.customer[0], data => {

        let productArr = this.value.product?.length ? _.cloneDeep(this.value.product) : [];
        productArr.push({
          value: data.productId,
          label: data.productName,
          id: data.productId,
          name: data.productName,
          ...data
        })

        this.$set(this.value, 'product', productArr);
        this.updateProduct(productArr);

        this.addProductDialog = false;

      });
    },
    openDialog(action) {
      if (!this.selectedCustomer.id && action != 'customer') {
        this.$platform.alert('请先选择客户');
        return;
      }
      if (action === 'address') {
        this.$refs.EditAddressDialog.openDialog();
      } else if (action === 'contact') {
        this.$refs.EditContactDialog.openDialog();
      } else if (action === 'customer') {
        this.addCustomerDialog = true;
        this.customerFormDom.init = true;
      } else if (action === 'product') {
        this.addProductDialog = true;
        this.productFormDom.init = true;
      }
    },
    closeDialog(action) {
      if (action === 'customer') {
        this.customerFormDom.initFormData();
        this.customerFormDom.init = false;
      } else if (action === 'product') {
        this.productFormDom.initFormData();
        this.productFormDom.init = false;
      }
    }
  },
  components: {
    [EditAddressDialog.name]: EditAddressDialog,
    [EditContactDialog.name]: EditContactDialog
  }
}