<template>
  <div class="form-preview-group">
    <!--  -->
  </div>
</template>

<script>
export default {
  name: 'form-radio-preview',
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