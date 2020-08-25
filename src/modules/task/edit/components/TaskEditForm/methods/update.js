import { FieldNameMappingEnum } from '@src/model/enum/MappingEnum.ts';

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
    this.update({ field: { fieldName: FieldNameMappingEnum.Address }, newValue: value });
  },
  /** 
   * @description 更新客户数据
  */
  updateCustomerValue(value) {
    this.update({ field: { fieldName: FieldNameMappingEnum.Customer }, newValue: value });
  },
  /** 
   * @description 更新联系人数据
  */
  updateLinkmanValue(value) {
    this.update({ field: { fieldName: FieldNameMappingEnum.Linkman }, newValue: value });
  },
  /** 
   * @description 更新客户数据
  */
  updateProductValue(value) {
    this.update({ field: { fieldName: FieldNameMappingEnum.Product }, newValue: value });
  },
  /** 
   * @description 更新通知客户短信数据
  */
  updateTickValue(value) {
    this.update({ field: { fieldName: FieldNameMappingEnum.Tick }, newValue: value });
  }
}