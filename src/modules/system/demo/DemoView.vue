<template>
  <div style="padding: 10px;">
    <biz-select-column ref="bizSelectColumn"></biz-select-column>
    <task-allot-modal ref="TaskAllotModal" :user-state-map="userStateMap" customer-id="abd228da-014e-11eb-9baf-00163e0d174e"></task-allot-modal>
  </div>
</template>

<script>
import TaskAllotModal from '@src/modules/task/components/TaskAllotModal/TaskAllotModal.tsx'
import AllotRuleModal from '@src/modules/task/components/AllotRuleModal/AllotRuleModal.tsx'

export default {
  name: 'demo-view',
  data () {
    return {
      userStateMap: {
        '12':'rgb(51, 51, 51)',
        '14':'rgb(51, 51, 51)',
        '15':'rgb(51, 51, 51)',
        '6654':'rgb(51, 51, 51)',
        '非常忙碌':'rgb(110, 207, 64)',
        '结果树':'rgb(110, 207, 64)',
        '❤❤❤❤❤':'rgb(244, 69, 82)',
        '✨✨✨✨✨':'rgb(244, 69, 82)',
        '休假中':'rgb(255, 191, 49)',
        '太突然那':'rgb(51, 51, 51)',
        '工作中':'rgb(110, 207, 64)',
        '游戏中':'rgb(51, 51, 51)'
      },
    }
  },
  methods: {
    openAllotDialog() {
      this.$refs.TaskAllotModal.show()
    },
    openCreateDialog() {
      this.$refs.CreateAllotRuleModal.show()
    },
  },
  mounted() {
    this.openAllotDialog()
    // this.openCreateDialog()
  },
  components: {
    [TaskAllotModal.name]: TaskAllotModal,
    [AllotRuleModal.name]: AllotRuleModal
  }
};
</script>



