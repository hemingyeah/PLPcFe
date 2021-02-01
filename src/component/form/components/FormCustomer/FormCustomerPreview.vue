<template>
  <div class="form-preview-task-customer">
    <div class="form-preview-group">
      <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control form-preview-withIcon">
          {{ field.placeHolder }}
        </p>
      </div>
    </div>
    <div class="form-preview-group" v-if="address">
      <label>地址<span class="form-preview-notNull" v-if="field.setting.customerOption && field.setting.customerOption.addressNotNull">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control form-preview-withIcon"></p>
      </div>
    </div>
    <div class="form-preview-group" v-if="linkman">
      <label>联系人<span class="form-preview-notNull" v-if="field.setting.customerOption && field.setting.customerOption.linkmanNotNull">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control form-preview-withIcon"></p>
      </div>
    </div>
    <div class="form-preview-group" v-if="product">
      <label>产品 <span class="form-preview-notNull" v-if="productNotNull">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control form-preview-withIcon"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-customer-preview',
  props: previewProps,
  computed: {
    customerOption() {
      return this.field.setting.customerOption || {} 
    },
    address() {
      return this.customerOption.address 
    },
    linkman() {
      return this.customerOption.linkman 
    },
    product() {
      return this.customerOption.product 
    },
    productNotNull() {
      return this.customerOption.productNotNull 
    },
  }
}
</script>
<style lang="scss" scoped>
  .form-preview-task-customer{
    display: flex;
    flex-direction: column;
    .form-preview-group{
      border-bottom: 1px solid  #F5F5F5;
    }
  }
</style>

