<template>
  <div class="form-design-group" @click="choose">
    <label>{{field.displayName}} <span class="form-design-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-design-mock">
      <p>{{field.placeHolder}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-number-preview',
  props: {
    field: {
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

