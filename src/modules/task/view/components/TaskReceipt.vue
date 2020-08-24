<template>
  <div class="task-receipt-container">
    回执信息
  </div>
</template>

<script>
export default {
  name: 'task-receipt',
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
.task-receipt-container {
  padding: 15px;
}
</style>
