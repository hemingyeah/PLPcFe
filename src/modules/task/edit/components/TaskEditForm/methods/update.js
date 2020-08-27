import { TaskFieldNameMappingEnum } from '@model/enum/MappingEnum.ts';

export default {
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
   * @description 更新地址数据
  */
  updateAddressValue(value) {
    this.update({ field: { fieldName: TaskFieldNameMappingEnum.Address }, newValue: value });
  },
  /** 
   * @description 更新客户数据
  */
  updateCustomerValue(value) {
    this.update({ field: { fieldName: TaskFieldNameMappingEnum.Customer }, newValue: value });
  },
  /** 
   * @description 更新联系人数据
  */
  updateLinkmanValue(value) {
    this.update({ field: { fieldName: TaskFieldNameMappingEnum.Linkman }, newValue: value });
  },
  /** 
   * @description 更新客户数据
  */
  updateProductValue(value) {
    this.update({ field: { fieldName: TaskFieldNameMappingEnum.Product }, newValue: value });
  },
  /** 
   * @description 更新通知客户短信数据
  */
  updateTickValue(value) {
    this.update({ field: { fieldName: TaskFieldNameMappingEnum.Tick }, newValue: value });
  }
}