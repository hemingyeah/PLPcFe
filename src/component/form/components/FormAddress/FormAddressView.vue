<template>
  <div class="form-view-row base-address-view">
    <label>{{field.displayName}}</label>
    <div class="form-view-row-content">
      <span>{{value | fmt_address}}</span>
      <i v-if="displayMap" @click="openMap" class="iconfont icon-address"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-address-view',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: Object
  },
  computed: {
    displayMap(){
      let value = this.value;

      if (!value) return;
      return (value.adLatitude && value.adLongitude) || (value.latitude && value.longitude)
    }
  },
  methods: {
    openMap() {
      this.$fast.map
        .display(this.value, {title: this.field.displayName})
        .catch(err => console.error('openMap catch an err: ', err));
    }
  }
}
</script>

<style lang="scss">
.base-address-view{
  i.iconfont {
    color: $color-primary;
    cursor: pointer;
    font-size: 14px;
  }
}
</style>
