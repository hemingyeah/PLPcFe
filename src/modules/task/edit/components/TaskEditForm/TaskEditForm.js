/* api */
import * as TaskApi from '@src/api/TaskApi';
/* components */
import EditAddressDialog from '@src/modules/customer/view/operationDialog/EditAddressDialog.vue'
import EditContactDialog from '@src/modules/customer/view/operationDialog/EditContactDialog.vue'
/* util */
import _ from 'lodash';
import * as FormUtil from '@src/component/form/util'
import { findComponentDownward } from '@src/util/assist'
/* Vue */
import props from './props'
import data from './data'
import computed from './computed'
import methods from './methods'

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
    ...methods.fetch,
    ...methods.render,
    ...methods.search,
    /** 
     * @description 添加客户 提交
    */
    addCustomerSubmit() {
      // 提交
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
        let customerId = data.id || '';
        this.selectCustomerRelation(customerId);
        // 关闭弹窗
        this.addCustomerDialog = false;

      });
    },
    /** 
     * @description 添加产品 提交
    */
    addProductSubmit() {
      // 提交
      this.productFormDom.submit(this.value.customer[0], data => {

        let productArr = this.value.product?.length ? _.cloneDeep(this.value.product) : [];
        productArr.push({
          value: data.productId,
          label: data.productName,
          id: data.productId,
          name: data.productName,
          ...data
        })
        // 绑定产品
        this.$set(this.value, 'product', productArr);
        // 更新产品信息
        this.updateProduct(productArr);
        // 关闭弹窗
        this.addProductDialog = false;

      });
    },
    /** 
     * @description 绑定地址
     * @param {Object} address 地址数据
    */
    bindAddress(address = {}) {
      this.$set(this.value, 'address', [{
        value: address.id,
        label: address.province + address.city + address.dist + address.address,
        ...address
      }]);
    },
    /** 
     * @description 绑定联系人
     * @param {Object} linkman 联系人数据
    */
    bindLinkman(linkman = {}) {
      this.$set(this.value, 'linkman', [{
        value: linkman.id,
        label: linkman.name + linkman.phone,
        ...linkman
      }]);
    },
    /** 
     * @description 选择工单类型
     * @param {String} templateId 工单类型id
    */
    async chooseTemplate(templateId) {
      let loading = this.$loading();
      try {
        this.taskFields = await TaskApi.getTaskTemplateFields({ templateId, tableName: 'task' });
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

        this.selectedType = this.taskTypesMap[templateId];
        this.$emit('updatetemplateId', this.selectedType);
      } catch (error) {
        console.error(error)
      }

      loading.close();
    },
    /** 
     * @description 关闭弹窗
     * @param {String} 动作 customer/product 
    */
    dislogClose(action = '') {
      switch (action) {
      case 'customer': {
        this.customerFormDom.initFormData();
        this.customerFormDom.init = false;
        break;
      }
      case 'product': {
        this.productFormDom.initFormData();
        this.productFormDom.init = false;
        break;
      }
      default: {
        break;
      }
      }
    },
    /** 
     * @description 打开弹窗
     * @param {String} 动作 address/contact/customer/product 
    */
    dialogOpen(action) {
      if (!this.selectedCustomer.id && action != 'customer') {
        this.$platform.alert('请先选择客户');
        return;
      }

      switch (action) {
      case 'address': {
        this.$refs.EditAddressDialog.openDialog();
        break;
      }
      case 'contact': {
        this.$refs.EditContactDialog.openDialog();
        break;
      }
      case 'customer': {
        this.addCustomerDialog = true;
        this.customerFormDom.init = true;
        break;
      }
      case 'product': {
        this.addProductDialog = true;
        this.productFormDom.init = true;
        break;
      }
      default: {
        break;
      }
      }
    },
    /** 
     * @description 初始化
    */
    init() {
      this.loading = true;

      // 获取客户、产品数据
      Promise.all([
        this.fetchCustomerData(),
        this.fetchProductData()
      ])
        .then(res => {
          this.loading = false;
        })
        .catch(err => console.error('error', err));

    },
    /** 
     * @description 搜索地址 外层处理器
     * @param {Object} params 搜索参数
    */
    async searchAddressOuterHandler(params = {}) {
      params.customerId = this.selectedCustomer.value || '';
      return this.searchAddress(params);
    },
    /** 
     * @description 搜索联系人 外层处理器
     * @param {Object} params 搜索参数
    */
    async searchLinkmanOuterHandler(params = {}) {
      params.customerId = this.selectedCustomer.value || '';
      return this.searchLinkman(params);
    },
    /** 
     * @description 搜索产品 外层处理器
     * @param {Object} params 搜索参数
    */
    async searchProductOuterHandler(params = {}) {
      params.customerId = this.selectedCustomer.value || '';
      return this.searchProduct(params);
    },
    /** 
     * @description 选择客户关联
     * @param {String} customerId 客户id
    */
    selectCustomerRelation(customerId) {
      let forRelation = {
        module: 'customer',
        customerId
      };

      this.$eventBus.$emit('es.Relation.Customer', forRelation);
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
    /** 
     * @description 更新客户信息
     * @param {Array<Object>} value 客户数据
    */
    async updateCustomer(value = []) {
      let selectedCustomer = value[0] || {};
      try {
        const result = await TaskApi.getTaskDefaultInfo({ customerId: selectedCustomer.value || '' });

        let { linkman, address } = result;

        // 重置联系人和地址
        this.$set(this.value, 'linkman', []);
        this.$set(this.value, 'address', []);

        // 绑定联系人和地址
        linkman && this.bindLinkman(linkman);
        address && this.bindAddress(address);

        if (Array.isArray(this.value.product) && this.value.product.length) {
          this.value.product = this.value.product.filter(item => item.customerId == value[0].value);
        }

      } catch (error) {
        console.warn('task-edit-form: updateCustomer -> error', error);
      }

      // 查询客户关联字段
      this.selectCustomerRelation(value[0].value);
    },
    /** 
     * @description 更新联系人信息
    */
    async updateLinkman(linkman) {
      this.bindLinkman(linkman);

      try {
        const result = await TaskApi.getLmBindAddress({ lmId: linkman.id });

        // 如果存在地址信息则绑定地址
        result.data.id && this.bindAddress(result.data);

      } catch (error) {
        console.warn('task-edit-form: updateLinkman -> error', error);
      }

    },
    /** 
     * @description 更新产品信息
    */
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
          // 设置客户数据
          this.$set(this.value, 'customer', customerData);
          // 更新客户信息
          this.updateCustomer(customerData);
        }

        // 查询产品关联字段, 选一个产品才带入
        if (value.length === 1) {
          let forRelation = {
            module: 'product',
            id: value[0].value
          }
          // 产品关联字段数据
          this.$eventBus.$emit('es.Relation.Product', forRelation);
        } else {
          // 清空产品关联字段数据
          this.$eventBus.$emit('es.Relation.Product', {});
        }

      } catch (error) {
        console.warn('task-edit-form: updateProduct -> error', error);
      }
    },
    /** 
     * @description 效验
    */
    validate() {
      return this.$refs.form.validate();
    },
  },
  components: {
    [EditAddressDialog.name]: EditAddressDialog,
    [EditContactDialog.name]: EditContactDialog
  }
}