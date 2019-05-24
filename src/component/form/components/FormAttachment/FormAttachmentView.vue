<template>
  <div class="form-view-row">
    <label>{{field.displayName}}</label>
    <div class="form-view-row-content base-file__preview">
      <base-file-item v-for="a in value" :key="a.id" :file="a" readonly/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-attachment-view',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    }
  }
}
</script>
