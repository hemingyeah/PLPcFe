<template>
  <div style="padding: 10px;">

    <biz-select-column ref="bizSelectColumn"></biz-select-column>
    <task-allot-modal ref="TaskAllotModal"></task-allot-modal>

  </div>
</template>

<script>
import TaskAllotModal from '@src/modules/task/components/TaskAllotModal/TaskAllotModal.tsx'

export default {
  name: 'demo-view',
  data () {
    return {

    }
  },
  methods: {
    openAllotDialog() {
      this.$refs.TaskAllotModal.show()
    }
  },
  mounted() {
    this.openAllotDialog()
  },
  components: {
    [TaskAllotModal.name]: TaskAllotModal
  }
};
</script>



