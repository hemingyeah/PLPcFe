<template>
  <div>
    <div class="form-preview-group">
      <label>客户 <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control">
        </p>
      </div>
    </div>
    <div class="form-preview-group" v-if="field.setting.customerOption && field.setting.customerOption.linkman">
      <label>联系人 <span class="form-preview-notNull" v-if="field.setting.customerOption && field.setting.customerOption.linkmanNotNull">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control">
        </p>
      </div>
    </div>
    <div class="form-preview-group" v-if="field.setting.customerOption && field.setting.customerOption.address">
      <label>地址 <span class="form-preview-notNull" v-if="field.setting.customerOption && field.setting.customerOption.addressNotNull">*</span></label>
      <div class="form-preview-mock">
        <p class="form-preview-control">
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-customer-preview',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>