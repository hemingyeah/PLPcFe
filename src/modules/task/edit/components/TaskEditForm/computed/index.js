import _ from 'lodash';

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
  // 选择的客户值
  selectedCustomer(){
    return (this.value.customer && this.value.customer[0]) || {};
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