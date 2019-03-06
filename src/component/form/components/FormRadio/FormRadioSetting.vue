<template>
  <div class="form-setting-group">
    <!--  -->
  </div>
</template>

<script>
export default {
  name: 'form-radio-setting',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    choose(){
      this.$emit('chooseField', this.field)
    }
  }
}
</script>