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
/* constant */
// 关联项类型
const RELATION_TYPE_MAP = {
  customer: 'relationCustomer',
  product: 'relationProduct',
}

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
        this.taskFields = await this.fetchTaskTemplateFields({ templateId, tableName: 'task' });
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
    async dialogOpen(action) {
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
        this.openCustomerDialogHandler();
        break;
      }
      case 'product': {
        this.openProductDialogHandler();
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
      // this.loading = true;

      // // 获取客户、产品数据
      // Promise.all([
      //   this.fetchCustomerData(),
      //   this.fetchProductData()
      // ])
      //   .then(res => {
      //     this.loading = false;
      //   })
      //   .catch(err => console.error('error', err));

    },
    /** 
     * @description 打开客户弹窗处理
    */
    async openCustomerDialogHandler() {
      try {
        // 打开客户弹窗前，判断是否存在客户初始化数据
        let isHaveCustomerInitData = Object.keys(this.customerInitData) > 0;
        if(!isHaveCustomerInitData) {
          this.loading = true;
          await this.fetchCustomerData();
        }
        
        this.addCustomerDialog = true;
        this.customerFormDom.init = true;

      } catch (error) {
        this.$platform.alert('请稍后再试');
        console.warn('openCustomerDialogHandler -> error', error)
      } finally {
        this.loading = false;
      }
    },
    /** 
     * @description 打开产品弹窗处理
    */
    async openProductDialogHandler() {
      try {
        // 打开产品弹窗前，判断是否存在产品初始化数据
        let isHaveProductInitData = Object.keys(this.productInitData) > 0;
        if(!isHaveProductInitData) {
          this.loading = true;
          await this.fetchProductData();
        }
        
        this.addProductDialog = true;
        this.productFormDom.init = true;
        
      } catch (error) {
        this.$platform.alert('请稍后再试');
        console.warn('openProductDialogHandler -> error', error)
      } finally {
        this.loading = false;
      }
    },
    /** 
     * @description 关联显示项字段选择处理
     * @param {string} type customer/product
    */
    async relationFieldSelectHandler(type = 'customer') {
      // 判断类型是否存在
      let types = ['customer', 'product'];
      if(types.indexOf(type) < 0) {
        return console.warn(`Caused: relationFieldHandler params.type is not in ${types}`)
      }
      
      // 判断对应类型的关联显示项字段是否存在
      let formType = RELATION_TYPE_MAP[type];
      let relationFields = this.taskFields.filter(field => field.formType == formType);
      if(relationFields.length <= 0) {
        return console.warn(`Caused: this.taskFields not have ${formType} filed`);
      }
      
      try {
        let params = {
          customerId: this.selectedCustomer?.value || '',
          productId: this.selectProduct?.[0]?.value || ''
        }
        let res = await this.fetchTaskTemplateFields(params);
        let isSuccess = res.success;

        if (isSuccess) {
          let result = res.result || {};
          let { customerInfo, productInfo, relateCustomerFields, relateProductFields } = result;
          let isCustomerRelation = type == 'customer';

          this.relationFieldUpdateHandler(
            isCustomerRelation ? customerInfo : productInfo,
            relationFields,
          );

        } else {
          this.$platform.alert(res.message);
        }

      } catch (error) {
        console.warn('relationFieldSelectHandler -> error', error)
      }

    },
    /** 
     * @description 关联显示项字段更新处理
    */
    relationFieldUpdateHandler(info, relationFields = []) {
      let fieldName = '';
      let fieldValue = '';

      relationFields.forEach(relationField => {
        fieldName = relationField.fieldName;
        fieldValue = info[fieldName] || info.attribute?.[fieldName] || '';

        this.update({ field: relationField, newValue: fieldValue });
      })

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
     * @deprecated 旧的方法，已废弃
     * @description 选择客户关联
     * @param {String} customerId 客户id
    */
    selectCustomerRelation(customerId) {
      let forRelation = {
        module: 'customer',
        id: customerId
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
        const result = await this.fetchTaskDefaultInfo({ customerId: selectedCustomer.value || '' });

        let { linkman, address } = result;

        // 重置联系人和地址
        this.$set(this.value, 'linkman', []);
        this.$set(this.value, 'address', []);

        // 绑定联系人和地址
        linkman && this.bindLinkman(linkman);
        address && this.bindAddress(address);
        
        // 更新产品数据
        if (Array.isArray(this.value.product) && this.value.product.length) {
          this.value.product = this.value.product.filter(item => item.customerId == selectedCustomer.value);
        }

      } catch (error) {
        console.warn('task-edit-form: updateCustomer -> error', error);
      }

      // 查询客户关联字段
      // this.selectCustomerRelation(selectedCustomer.value);
      this.relationFieldSelectHandler();
    },
    /** 
     * @description 更新联系人信息
    */
    async updateLinkman(linkman) {
      this.bindLinkman(linkman);

      try {
        const result = await this.fetchLmBindAddress({ lmId: linkman.id });

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

          const result = await this.fetchCustomerByProduct({ id: value[value.length - 1].value });

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
          // this.$eventBus.$emit('es.Relation.Product', forRelation);
        } else {
          // 清空产品关联字段数据
          // this.$eventBus.$emit('es.Relation.Product', {});
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