import _ from 'lodash';
import { FieldNameMappingEnum } from '@src/model/enum/MappingEnum.ts';

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
    return this.relevanceTaskCountData[FieldNameMappingEnum.Customer];
  },
  /** 
   * @description 是否显示 客户关联的工单数量 按钮 
   * 1. 客户存在
   * 2. 且 全部数量 大于 0
  */
  isShowCustomerRelevanceTaskCountButton() {
    let { all } = this.customerRelevanceTaskCountData;
    return this.selectedCustomer?.id && Number(all) > 0;
  },
  /** 
   * @description 是否显示 产品关联的工单数量 按钮 
   * 1. 产品存在
   * 2. 且 全部数量 大于 0
   * 3. 且 当前选择的产品只有一个
  */
  isShowProductRelevanceTaskCountButton() {
    let { all } = this.productRelevanceTaskCountData;
    return this.selectProduct?.id && Number(all) > 0 && this.value?.product?.length == 1;
  },
  // 产品字段
  productField(){
    return {
      displayName: '产品',
      fieldName: 'product',
      formType: 'select',
      isNull: this.customerOption.productNotNull ? 0 : 1
    }
  },
  productFormDom() {
    return this?.productFormView?.$refs?.ProductCreateView || {};
  },
  /* 产品关联工单的数量数据 */
  productRelevanceTaskCountData() {
    return this.relevanceTaskCountData[FieldNameMappingEnum.Product];
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
    return this.types.map(d => {
      return {
        text: d.name,
        value: d.id
      }
    }) || [];
  },
  /* 工单类型对象 */
  taskTypesMap() {
    return _.reduce(this.taskTypes, (result, value) => {
      result[value.value] = value;
      return result;
    }, {})
  },
};