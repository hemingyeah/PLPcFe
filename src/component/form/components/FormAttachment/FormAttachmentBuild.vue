<template>
  <div>
    <div>{{field.displayName}}</div>
    <div>
      <base-upload></base-upload>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-attachment-build',
  props: {
    field: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
