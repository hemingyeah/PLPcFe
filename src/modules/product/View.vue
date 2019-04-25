<template>
  <div class="container">

  </div>
</template>

<script>
export default {
  name: 'product-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {}
  },
  mounted() {
    console.log('product-view mounted', this.initData)
  },
  methods: {},
}
</script>

<style lang="scss">

</style>