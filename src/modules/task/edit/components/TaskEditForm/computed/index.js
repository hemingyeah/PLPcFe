import _ from 'lodash';
import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum.ts';
import { taskTypeSelectConversion } from '@src/util/conversionFunctionUtil.ts';
/* model */
import TaskStateEnum from '@model/enum/TaskStateEnum.ts'

export default {
  /* 客户字段 */
  customerField() {
    return this.fields.filter(f => f.fieldName === 'customer')[0];
  },
  customerFormDom() {
    return this?.customerFormView?.$refs?.CustomerCreateView || {};
  },
  /* 客户字段配置 */
  customerOption(){
    return (this.customerField.setting && this.customerField.setting.customerOption) || {} ;
  },
  /* 客户关联工单的数量数据 */
  customerRelevanceTaskCountData() {
    return this.relevanceTaskCountData[TaskFieldNameMappingEnum.Customer];
  },
  /* 是否效验计划时间 */
  isVilidatePlantime() {
    let { isTaskEdit, isPlanTaskEdit } = this.state || {}
    // 非编辑状态
    return !isPlanTaskEdit && !isTaskEdit
  },
  /** 
   * @description 是否显示 客户关联的工单数量 按钮 
   * 1. 客户存在
   * 2. 且 全部数量 大于 0
  */
  isShowCustomerRelevanceTaskCountButton() {
    let { all } = this.customerRelevanceTaskCountData;
    return (this.selectedCustomer?.id || this.selectedCustomer?.value) && Number(all) > 0;
  },
  /** 
   * @description 是否显示 产品关联的工单数量 按钮 
   * 1. 产品存在
   * 2. 且 全部数量 大于 0
   * 3. 且 当前选择的产品只有一个
  */
  isShowProductRelevanceTaskCountButton() {
    let { all } = this.productRelevanceTaskCountData;
    return (this.selectProduct?.id || this.selectProduct?.value) && Number(all) > 0 && this.value?.product?.length == 1;
  },
  /** 
   * @description 是否显示 同时通知客户 字段
   * 1. 新建工单/新建计划任务不显示
  */
  isShowNoticeCustomer() {
    let { isFromPlan, isTaskCreate } = this.state;
    return !isFromPlan && !isTaskCreate;
  },
  // 产品字段
  productField(){
    return {
      displayName: '产品',
      fieldName: 'product',
      formType: 'select',
      isNull: this.customerOption?.productNotNull === true ? 0 : 1
    }
  },
  productFormDom() {
    return this?.productFormView?.$refs?.ProductCreateView || {};
  },
  /* 产品关联工单的数量数据 */
  productRelevanceTaskCountData() {
    return this.relevanceTaskCountData[TaskFieldNameMappingEnum.Product];
  },
  // 选择的客户值
  selectedCustomer(){
    return (this.value.customer && this.value.customer[0]) || {};
  },
  // 选择的产品值
  selectProduct() {
    return (this.value.product && this.value.product[0]) || {};
  },
  /* 工单类型 */
  taskTypes(){
    return this.types.map(type => taskTypeSelectConversion(type)) || [];
  },
  /* 工单类型对象 */
  taskTypesMap() {
    return _.reduce(this.taskTypes, (result, value) => {
      result[value.value] = value;
      return result;
    }, {})
  },
  /* 工单表单显示字段 过滤 产品关联字段 */
  taskFormFields() {
    return this.fields.filter(field => field.formType != TaskFieldNameMappingEnum.RelationProduct);
  },
  /* 产品关联字段 */
  relationProductfields() {
    return this.fields.filter(field => field.formType == TaskFieldNameMappingEnum.RelationProduct);
  }
};