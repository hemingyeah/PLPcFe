<template>
  <div class="form-design-form-preview" @click="choose">
    <div class="form-design-preview-group">
      <label>{{field.displayName}} <span class="form-design-notNull" v-if="field.isNull == 0">*</span></label>
      <div class="form-design-preview-mock">
        <p>{{field.placeHolder}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-date-preview',
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

