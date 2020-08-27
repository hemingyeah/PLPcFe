/* components */
import EditAddressDialog from '@src/modules/customer/view/operationDialog/EditAddressDialog.vue'
import EditContactDialog from '@src/modules/customer/view/operationDialog/EditContactDialog.vue'
/* util */
import _ from 'lodash';
import * as FormUtil from '@src/component/form/util'
import { findComponentDownward } from '@src/util/assist'
import { getFieldValue2string } from '@service/TaskService.ts';
import { taskTypeSelectConversion } from '@src/util/conversionFunctionUtil.ts';
/* Vue */
import props from './props'
import data from './data'
import computed from './computed'
import methods from './methods'
/* enum */
import { TaskFieldNameMappingEnum } from '@model/enum/MappingEnum.ts'
/* constant */
import { 
  TASK_PRODUCT_LINKMAN_AND_ADDRESS_NOT_EQUAL_MESSAGE,
  TASK_PRODUCT_LINKMAN_NOT_EQUAL_MESSAGE,
  TASK_PRODUCT_ADDRESS_NOT_EQUAL_MESSAGE
} from '@src/model/const/Alert.ts'
// 关联项类型
const RELATION_TYPE_MAP = {
  customer: 'relationCustomer',
  product: 'relationProduct'
}

export default {
  name: 'task-edit-form',
  inject: ['initData'],
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
    this.selectedType = taskTypeSelectConversion(this?.initData?.defaultType) || this.taskTypes[0] || {};
    this.$emit('updatetemplateId', this.selectedType);

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
    ...methods.update,
    /** 
     * @description 添加客户 提交
    */
    addCustomerSubmit() {
      // 提交
      this.customerFormDom.submit(data => {
        this.isCreateCustomer = true;
        
        // 绑定客户
        this.updateCustomerValue([{
          label: data.name,
          value: data.id,
          id: data.id
        }])

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
        this.updateProductValue(productArr);
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
      this.updateAddressValue([{
        value: address.id,
        label: address.province + address.city + address.dist + address.address,
        ...address
      }])
    },
    /** 
     * @description 绑定联系人
     * @param {Object} linkman 联系人数据
    */
    bindLinkman(linkman = {}) {
      this.updateLinkmanValue([{
        value: linkman.id,
        label: linkman.name + linkman.phone,
        ...linkman
      }] )
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
      let { id, value } = this.selectedCustomer;
      let customerId = id || value;

      if (!customerId && action != TaskFieldNameMappingEnum.Customer) {
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
     * @description 同时通知客户 checkbox变化
    */
    noticeCustomerCheckdChange(value) {
      this.updateTickValue(Number(value));
    },
    /** 
     * @description 打开客户详情
    */
    openCustomerView() {
      let fromId = window.frameElement.getAttribute('id');
      let { id, value } = this.selectedCustomer;
      let customerId = id || value;
      if(!customerId) return

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      });
    },
    /** 
     * @description 打开产品详情
    */
    openProductView() {
      let fromId = window.frameElement.getAttribute('id');
      let productId = this.selectProduct.id;
      if(!productId) return
      
      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: '产品详情',
        close: true,
        url: `/customer/product/view/${productId}?noHistory=1`,
        fromId
      })
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
     * @description 产品关联联系人/地址处理
     * 判断选择的产品的 关联联系人/地址 是否 当前选择的的 联系人/地址相同，如果不相同，则提示，并替换
     * @param {Object} product 产品
    */
    async productBindLinkmanAndAddressHandler(product) {
      // 产品联系人
      let productLinkman = product.linkman || {};
      // 产品地址
      let productAddress = product.address || {};
      // 当前已选择的联系人地址
      let { linkman, address } = this.value;
      linkman = linkman[0] || {};
      address = address[0] || {};

      // 是否是相同的 联系人/地址
      let isSameLinkman = productLinkman.id === linkman.id;
      let isSameAddress = productAddress.id === address.id;

      let confirm = false;
      
      // 联系人和地址都不相同
      if(!isSameLinkman && !isSameAddress) {
        confirm = await this.$platform.confirm(TASK_PRODUCT_LINKMAN_AND_ADDRESS_NOT_EQUAL_MESSAGE);
        if(!confirm) return

        this.bindLinkman(productLinkman);
        this.bindAddress(productAddress);

      }
      // 联系人不相同
      else if(!isSameLinkman) {
        confirm = await this.$platform.confirm(TASK_PRODUCT_LINKMAN_NOT_EQUAL_MESSAGE);
        if(!confirm) return

        this.bindLinkman(productLinkman);

      } 
      // 地址不相同
      else if(!isSameAddress) {
        confirm = await this.$platform.confirm(TASK_PRODUCT_ADDRESS_NOT_EQUAL_MESSAGE);
        if(!confirm) return

        this.bindAddress(productAddress);
      }

    },
    /** 
     * @description 关联显示项字段选择处理
     * @param {string} type customer/product
    */
    async relationFieldSelectHandler(type = TaskFieldNameMappingEnum.Customer) {
      // 判断类型是否存在
      let types = [TaskFieldNameMappingEnum.Customer, TaskFieldNameMappingEnum.Customer.Product];
      if(types.indexOf(type) < 0) {
        return console.warn(`Caused: relationFieldHandler params.type is not in ${types}`)
      }
      
      // 判断对应类型的关联显示项字段是否存在
      let formType = RELATION_TYPE_MAP[type];
      let relationFields = this.taskFields.filter(field => field.formType == formType);
      if(relationFields.length <= 0) {
        return console.warn(`Caused: this.taskFields not have ${formType} field`);
      }
      
      try {
        let params = {
          customerId: this.selectedCustomer?.value || '',
          productId: this.selectProduct?.value || ''
        }
        let res = await this.fetchRelatedInfo(params);
        let isSuccess = res.success;

        if (isSuccess) {
          let result = res.result || {};
          let { customerInfo, productInfo, relateCustomerFields, relateProductFields } = result;
          let isCustomerRelation = type == TaskFieldNameMappingEnum.Customer;

          this.relationFieldUpdateHandler(
            isCustomerRelation ? customerInfo : productInfo,
            relationFields,
            isCustomerRelation ? relateCustomerFields : relateProductFields,
            isCustomerRelation
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
    relationFieldUpdateHandler(info, relationFields = [], customerOrPorductFields = [], isCustomerRelation = true) {
      let fieldName = '';
      let formType = '';
      let fieldValue = '';

      relationFields.forEach(relationField => {
        fieldName = relationField?.setting?.fieldName;
        formType = relationField?.setting?.formType;
        fieldValue = getFieldValue2string(info, fieldName, formType, customerOrPorductFields, isCustomerRelation);

        this.update({ field: relationField, newValue: fieldValue });
      })

    },
    /** 
     * @description 搜索地址 外层处理器
     * @param {Object} params 搜索参数
    */
    async searchAddressOuterHandler(params = {}) {
      let { id, value } = this.selectedCustomer;
      params.customerId = id || value;
      return this.searchAddress(params);
    },
    /** 
     * @description 搜索联系人 外层处理器
     * @param {Object} params 搜索参数
    */
    async searchLinkmanOuterHandler(params = {}) {
      let customerId = this.selectedCustomer?.value || '';
      
      params.customerId = this.selectedCustomer?.value || '';
      params.phone = customerId ? params.keyword : '';

      return customerId ? this.searchLinkman(params) : this.searchCustomerByPhone(params);
    },
    /** 
     * @description 搜索产品 外层处理器
     * @param {Object} params 搜索参数
    */
    async searchProductOuterHandler(params = {}) {
      let { id, value } = this.selectedCustomer;
      params.customerId = id || value || '';
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
    /** 
     * @description 更新客户信息
     * @param {Array<Object>} value 客户数据
    */
    async updateCustomer(value = []) {
      let selectedCustomer = value?.[0] || {};
      let currentCustomerId = this.selectedCustomer?.id || this.selectedCustomer?.value;
      let selectedCustomerId = selectedCustomer?.id || '';

      // 更新客户数据
      this.updateCustomerValue(value.slice());

      // 判断选中的客户是否与当前客户数据一致
      if(currentCustomerId == selectedCustomerId) return

      try {
        const result = await this.fetchTaskDefaultInfo({ customerId: selectedCustomer.id || '' });
        let { linkman, address } = result;

        // 重置联系人和地址
        this.updateLinkmanValue([]);
        this.updateAddressValue([]);

        // 绑定联系人和地址
        linkman && this.bindLinkman(linkman);
        address && this.bindAddress(address);
        
        // 更新产品数据
        if (Array.isArray(this.value.product) && this.value.product.length) {
          this.updateProductValue(
            this.value.product.filter(item => item.customerId == selectedCustomer.id)
          )
        }

        // 查询关联工单数量
        this.fetchCountForCreate({ module: TaskFieldNameMappingEnum.Customer, id: selectedCustomerId });

      } catch (error) {
        console.warn('task-edit-form: updateCustomer -> error', error);
      }

      // 查询客户关联字段
      this.relationFieldSelectHandler();
    },
    /** 
     * @description 更新联系人信息
    */
    async updateLinkman(linkman = {}) {
      let isHaveCustomer = this.value.customer && this.value.customer.length;
      let linkmanCustomer = linkman?.customer || {};

      try {
        // 判断客户是否存在
        if (!isHaveCustomer) {
          // 客户不存在时则下拉框隐藏
          findComponentDownward(this.$refs.linkman, 'base-select').close();
        
          const customerData = [{
            label: linkmanCustomer.name,
            value: linkmanCustomer.id,
            id: linkmanCustomer.id
          }];

          // 设置客户数据
          this.updateCustomerValue(customerData);
          // 更新客户信息
          await this.updateCustomer(customerData);
        }

        // 绑定联系人数据
        this.bindLinkman(linkman);
        const addressResult = await this.fetchLmBindAddress({ lmId: linkman.id });
        // 如果存在地址信息则绑定地址
        addressResult.data.id && this.bindAddress(addressResult.data);

      } catch (error) {
        console.warn('task-edit-form: updateLinkman -> error', error);
      }

    },
    /** 
     * @description 更新产品信息
    */
    async updateProduct(value) {
      let product = value[0] || {};
      let isHaveCustomer = this.value.customer && this.value.customer.length;

      try {
        // 判断客户是否存在
        if (!isHaveCustomer) {
          // 客户不存在时则下拉框隐藏
          findComponentDownward(this.$refs.product, 'base-select').close();

          const result = await this.fetchCustomerByProduct({ id: product.value });

          const customerData = [{
            label: result.customerName,
            value: result.customerId,
            id: result.customerId
          }];
          // 设置客户数据
          this.updateCustomerValue(customerData);
          // 更新客户信息
          await this.updateCustomer(customerData);
        }

        // 查询产品关联字段, 选一个产品才带入
        let isOnlyOneProduct = value.length === 1;
        
        // 只有一个产品 且 客户存在
        if (isOnlyOneProduct && isHaveCustomer) {
          // 产品关联字段数据
          this.relationFieldSelectHandler(TaskFieldNameMappingEnum.Product);
          // 产品关联联系人地址
          this.productBindLinkmanAndAddressHandler(product);
        }
        // 只有一个产品 且 客户不存在
        else if(isOnlyOneProduct && !isHaveCustomer) {
          let { linkman, address } = product;
          let linkmanId = linkman?.id || '';
          let addressId = address?.id || '';
          
          linkmanId && this.bindLinkman(linkman);
          addressId && this.bindAddress(address);
        }
        else {
          // TODO: 清空产品关联字段数据
          // this.$eventBus.$emit('es.Relation.Product', {});
        }

        if(isOnlyOneProduct) {
          // 查询关联工单数量
          this.fetchCountForCreate({ module: TaskFieldNameMappingEnum.Product, id: product.id });
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