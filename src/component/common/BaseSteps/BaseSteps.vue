<template>
  <el-steps :active="active" :align-center="alignCenter" :direction="direction" :finish-status="finishStatus" :space="space">
    <el-step 
      v-for="(item, index) in steps" 
      :key="`step_${index}`"
      :title="item.title" 
      :icon="item.icon"
      :status="item.status"
      :description="item.description">
      <!--  -->
    </el-step>
  </el-steps>
</template>

<script>
export default {
  name: 'base-steps',
  props: {
    // 当前激活的步骤
    active: {
      type: Number,
      default: 0
    },
    alignCenter: {
      type: Boolean,
      default: false
    },
    /** 
     * 显示方向
     * vertical / horizontal
     */
    direction: {
      type: String,
      default: 'horizontal'
    },
    /**
     * 结束的步骤状态
     * wait / process / finish / error / success
     */
    finishStatus: {
      type: String,
      default: 'finish'
    },
    // 每个step的间距
    space: [Number, String],
    /**
     * 步骤条列表
     */
    steps: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      
    }
  }
}
</script>

<style>

</style>