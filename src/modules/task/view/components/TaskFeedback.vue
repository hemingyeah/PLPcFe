<template>
  <div class="task-feedback-tab">
    客户评价
  </div>
</template>

<script>
export default {
  name: 'task-feedback',
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss">
.task-feedback-tab {
}
</style>
