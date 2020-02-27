<template>
  <div class="form-view-row">
    <label>{{field.displayName}}</label>
    <!-- TODO: 地理位置值得显示 -->
    <div class="form-view-row-content form-location-view" :class="hasLocation ? '' : 'form-view-location-not'">
      {{ value.address }}
      <i v-if="hasLocation" @click="openMap" class="iconfont icon-address link-text"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-autograph-view',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [String, Object],
      default: () => ({})
    }
  },
  computed: {
    hasLocation() {
      return this.value.latitude && this.value.longitude 
    },
  },
  methods: {
    openMap() {
      // TODO: 处理地址
      this.$fast.map.display(this.value, {title: this.field.displayName })
        .catch(err => console.error('openMap catch an err: ', err));
    }
  },
}
</script>
