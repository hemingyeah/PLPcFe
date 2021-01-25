/* components */
import EditAddressDialog from '@src/modules/customer/view/operationDialog/EditAddressDialog.vue'
import EditContactDialog from '@src/modules/customer/view/operationDialog/EditContactDialog.vue'
/* util */
import _ from 'lodash'
import * as FormUtil from '@src/component/form/util'
import DateUtil from '@src/util/date'
import { findComponentDownward } from '@src/util/assist'
import { getFieldValue2string } from '@service/TaskService.ts'
import ObjectUtil from '@src/util/object';
import Filter from '@src/filter/filter.js';
import { isEmpty } from '@src/util/type';
import { 
  customerAddressSelectConversion,
  linkmanSelectConversion,
  taskTypeSelectConversion
} from '@src/util/conversionFunctionUtil.ts'
/* Vue */
import props from './props'
import data from './data'
import computed from './computed'
import methods from './methods'
/* enum */
import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum.ts'
/* constant */
import { 
  TASK_PRODUCT_LINKMAN_AND_ADDRESS_NOT_EQUAL_MESSAGE,
  TASK_PRODUCT_LINKMAN_NOT_EQUAL_MESSAGE,
  TASK_PRODUCT_ADDRESS_NOT_EQUAL_MESSAGE,
  REQUIRES_PRODUCT_MESSAGE,
  PLAN_TIME_NOT_LESS_THEN_NOW_MEESSAGE
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
    data.validation = this.buildValidation();
    data.planTimeDatePickerOptions = {
      disabledDate(time) {
        return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
      }
    }
    
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
        this.relationFieldSelectHandler();
        // 关闭弹窗
        this.addCustomerDialog = false;

      });
    },
    /** 
     * @description 添加产品 提交
    */
    addProductSubmit() {
      let selectedCustomer = this.selectedCustomer
      let customer = {
        ...selectedCustomer,
        id: selectedCustomer.id || selectedCustomer.value
      }
      // 提交
      this.productFormDom.submit(customer, data => {

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
        this.updateProduct(productArr, {
          isForceUpdateCustomer: false,
          isUpdateCustomerProduct: true,
          isSilentUpdateLinkmanAndAddress: true
        });
        // 关闭弹窗
        this.addProductDialog = false;

      });
    },
    buildValidation(){
      const that = this;
      return Object.freeze({
        product(value, field, changeStatus){
          changeStatus(true);
          let isProductRequired = that.customerOption?.productNotNull === true;
          let isSelectedProduct = Array.isArray(value) && value.length > 0;

          return new Promise((resolve, reject) => {
            changeStatus(false);
            let errorMessage = isSelectedProduct ? '' : REQUIRES_PRODUCT_MESSAGE;
            resolve(isProductRequired ? errorMessage : '')
          })
        },
        planTime(value, field, changeStatus){
          changeStatus(true);
          
          let isDateTimeType = field?.setting?.dateType == 'dateTime';
          let errorMessage = '';

          if(isDateTimeType) {
            let planTime = DateUtil.parseDateTime(value).getTime();
            let nowTime = new Date().getTime();
            errorMessage = planTime < nowTime && that.isVilidatePlantime ? PLAN_TIME_NOT_LESS_THEN_NOW_MEESSAGE : '';
          }

          return new Promise((resolve, reject) => {
            changeStatus(false);
            resolve(errorMessage)
          })
        }
      });
    },
    /**
     * @description: 绑定地址select数据
     * @param {Object | null} address 地址信息
     * @return {void}
    */    
    bindAddressOptions(address) {
      if (isEmpty(address)) return
      
      this.customerAddressOptions = [customerAddressSelectConversion(address)]
      this.$nextTick(() => {
        this.bindAddress(address)
      })
    },
    /**
     * @description: 绑定联系人select数据
     * @param {Object | null} address 地址信息
     * @return {void}
    */    
    bindLinkmanOptions(linkman) {
      if (isEmpty(linkman)) return
      
      this.customerLinkmanOptions = [linkmanSelectConversion(linkman)]
      this.$nextTick(() => {
        this.bindLinkman(linkman)
      })
    },
    /** 
     * @description 绑定地址
     * @param {Object} address 地址数据
    */
    bindAddress(address = {}) {
      this.updateAddressValue([customerAddressSelectConversion(address)])
    },
    /** 
     * @description 绑定联系人
     * @param {Object} linkman 联系人数据
    */
    bindLinkman(linkman = {}) {
      this.updateLinkmanValue([linkmanSelectConversion(linkman)])
    },
    bindProductLinkmanAndAddress(product = {}) {
      let { linkman, address } = product;
      let linkmanId = linkman?.id || '';
      let addressId = address?.id || '';
      
      linkmanId && this.bindLinkman(linkman);
      addressId && this.bindAddress(address);
    },
    /** 
     * @description 选择工单类型
     * @param {String} templateId 工单类型id
    */
    async chooseTemplate(templateId) {
      if(this.state.isCopyTask) {
        return this.copyTaskHandler(templateId);
      }
      if(this.state.isFromEvent) {
        return this.convertTaskHandler(templateId);
      }

      let loading = this.$loading();
      try {
        this.taskFields = await this.fetchTaskTemplateFields({ typeId: templateId, tableName: 'task', isFromSetting: true });
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
        
        // 更新工单类型数据
        this.selectedType = this.taskTypesMap[templateId];
        this.$emit('updatetemplateId', this.selectedType);

      } catch (error) {
        console.error(error)
      }

      loading.close();
    },
    /** 
     * @description 复制工单处理
     * @param {String} templateId 工单类型id
    */
    copyTaskHandler(templateId = '') {
      if(!this.state.isCopyTask) return

      this.$emit('loading', true);

      let { taskId = '' } = this.urlParams;
      window.location.href = `/task/copyTask?taskId=${taskId}&newTaskTemplateId=${templateId}`
    },
    /**
     * @description 事件转工单处理
     * @param {String} templateId 工单类型id
    */
    convertTaskHandler(templateId = '') {
      if(!this.state.isFromEvent) return

      this.$emit('loading', true);

      let { eventId = '', flow = '' } = this.urlParams;
      window.location.href = `/event/convent2Task/jump?eventId=${eventId}&defaultTypeId=${templateId}&flow=${flow}`
    },
    convertCustomerOfSelect(customer = {}) {
      let customerCloneData = _.cloneDeep(customer)
      customerCloneData.id = (customer.id || customer.value || '')

      return customerCloneData
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
    judegeSelectTaskType(value) {
      return !value || this.state.isFromEvent;
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
      let isSameLinkman = productLinkman.id === linkman.id || !productLinkman.id;
      // 地址需要判断是否 值也相同
      let isSameAddress = productAddress.id === address.id || !productAddress.id;
      let productAddressText = Filter.prettyAddress(productAddress)
      let addressText = Filter.prettyAddress(address)
      if (productAddressText && addressText && (productAddressText == addressText)) {
        isSameAddress = true
      }
      
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
    relationFieldsFilter(type = TaskFieldNameMappingEnum.Customer) {
      let relationFields = [];

      // 判断类型是否存在
      let types = [TaskFieldNameMappingEnum.Customer, TaskFieldNameMappingEnum.Product];
      if(types.indexOf(type) < 0) {
        console.warn(`Caused: relationFieldHandler params.type is not in ${types}`);
        return relationFields;
      }
      
      // 判断对应类型的关联显示项字段是否存在
      let formType = RELATION_TYPE_MAP[type];
      relationFields = this.taskFields.filter(field => field.formType == formType);
      if(relationFields.length <= 0) {
        console.warn(`Caused: this.taskFields not have ${formType} field`);
      }

      return relationFields;
    },
    /** 
     * @description 关联显示项字段清空
     * @param {string} type customer/product
    */
    async relationFieldClear(type = TaskFieldNameMappingEnum.Customer) {
      let relationFields = this.relationFieldsFilter(type);
      relationFields.forEach(relationField => { 
        this.update({ field: relationField, newValue: '' }) 
      })
    },
    /** 
     * @description 关联显示项字段选择处理
     * @param {string} type customer/product
    */
    async relationFieldSelectHandler(type = TaskFieldNameMappingEnum.Customer) {
      let relationFields = this.relationFieldsFilter(type)
      if (relationFields.length <= 0) return

      let productIds = [];
      if (Array.isArray(this.value.product) && this.value.product.length) {
        productIds = this.value.product.map(product => product.value);
      }
      
      try {
        let params = {
          customerId: this.selectedCustomer?.value || '',
          productIds
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

        if (isCustomerRelation) {
          fieldValue = getFieldValue2string(info, fieldName, formType, customerOrPorductFields, isCustomerRelation);
        } else {
          fieldValue = [];
          
          if (Array.isArray(info)) {
            info.map(item => {
              fieldValue.push(getFieldValue2string(item, fieldName, formType, customerOrPorductFields, isCustomerRelation));
            })
          }
        }

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
     * @param {Object} options 配置
    */
    async updateCustomer(value = [], options = {
      isForceUpdateCustomer: false,
      isUpdateCustomerProduct: true
    }) {
      let { isForceUpdateCustomer, isUpdateCustomerProduct } = options;
      let selectedCustomer = value?.[0] || {};
      let currentCustomerId = this.selectedCustomer?.id || this.selectedCustomer?.value;
      let selectedCustomerId = selectedCustomer?.id || selectedCustomer?.value || '';
      
      // 更新客户数据
      this.updateCustomerValue(value.slice());
      
      // 判断选中的客户是否与当前客户数据一致
      if(currentCustomerId == selectedCustomerId && !isForceUpdateCustomer) return
      
      try {
        const result = await this.fetchTaskDefaultInfo({ customerId: selectedCustomerId });
        let { linkman, address } = result;
        
        // 重置联系人和地址
        this.updateLinkmanValue([]);
        this.updateAddressValue([]);
        
        // 绑定联系人和地址
        linkman && this.bindLinkman(linkman);
        address && this.bindAddress(address);
        
        // 更新产品数据
        if (Array.isArray(this.value.product) && this.value.product.length && isUpdateCustomerProduct) {
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
      if (ObjectUtil.isEmpty(linkman)) {
        return console.warn('Caused: linkman is not object or is empty')
      }
      
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
     * @param {Array[Product]} value 产品数据
     * @param {Object} options 配置
    */
    async updateProduct(value, options = {
      isForceUpdateCustomer: false,
      isUpdateCustomerProduct: true,
      isSilentUpdateLinkmanAndAddress: false
    }) {
      let { isForceUpdateCustomer, isUpdateCustomerProduct, isSilentUpdateLinkmanAndAddress } = options;
      let product = value[0] || {};
      let isHaveCustomer = (this.value.customer && this.value.customer.length);
      
      try {
        // 判断客户是否存在
        if ((!isHaveCustomer || isForceUpdateCustomer) && product.value) {
          // 客户不存在时则下拉框隐藏
          const LinkmanSelectComponent = findComponentDownward(this.$refs.linkman, 'base-select')
          LinkmanSelectComponent?.close()
          
          const result = await this.fetchCustomerByProduct({ id: product.value });
          
          const customerData = [{
            label: result.customerName,
            value: result.customerId,
            id: result.customerId
          }];
          // 设置客户数据
          this.updateCustomerValue(customerData);
          // 更新客户信息
          await this.updateCustomer(customerData, { isForceUpdateCustomer, isUpdateCustomerProduct });
        }
        
        // 查询产品关联字段, 选一个产品才带入
        let isOnlyOneProduct = value.length === 1;
        
        if(isOnlyOneProduct && isSilentUpdateLinkmanAndAddress) {
          // 静默绑定联系人/地址
          this.bindProductLinkmanAndAddress(product);
        }
        // 只有一个产品 且 客户存在
        else if (isOnlyOneProduct && isHaveCustomer) {
          // 产品关联联系人地址
          this.productBindLinkmanAndAddressHandler(product);
        }
        // 只有一个产品 且 客户不存在
        else if(isOnlyOneProduct && !isHaveCustomer) {
          this.bindProductLinkmanAndAddress(product);
        }
        
        if (isOnlyOneProduct) {
          // 查询关联工单数量
          this.fetchCountForCreate({ module: TaskFieldNameMappingEnum.Product, id: product.id });
        }
        
        // 产品关联字段数据
        this.relationFieldSelectHandler(TaskFieldNameMappingEnum.Product);

      } catch (error) {
        console.warn('task-edit-form: updateProduct -> error', error);
      }
    },
    updateProductForProductSelect(value = []) {
      this.updateProduct(value, { isForceUpdateCustomer: true })
    },
    /** 
     * @description 效验
    */
    validate() {
      return this.$refs.form.validate(false);
    },
  },
  components: {
    [EditAddressDialog.name]: EditAddressDialog,
    [EditContactDialog.name]: EditContactDialog
  }
}