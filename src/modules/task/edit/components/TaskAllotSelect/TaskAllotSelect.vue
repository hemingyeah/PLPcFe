<template>
  <!-- start 工单指派 -->
  <div class="task-allot-select-container">
    
    <!-- start 选择派单 -->
    <div class="task-allot-select-container-type">
      <el-radio v-if="taskPoolOn" v-model="allotType" :label="allotTypeMap.pool.value"> {{ allotTypeMap.pool.text }}</el-radio>
      <el-radio v-model="allotType" :label="allotTypeMap.normal.value"> {{ allotTypeMap.normal.text }}</el-radio>
      <el-radio v-if="autoDispatch" v-model="allotType" :label="allotTypeMap.auto.value"> {{ allotTypeMap.auto.text }}</el-radio>
      <!-- 保存至待分配列表 -->
      <el-radio v-if="true" v-model="allotType" :label="allotTypeMap.allot.value"> {{ allotTypeMap.allot.text }}</el-radio>
    </div>
    <!-- end 选择派单 -->

    <!-- start 选择负责人/协同人 -->
    <div class="task-allot-select-container-user">

      <!-- start 负责人员选择 -->
      <el-input
        v-if="isShowSelectExecutor"
        readonly
        :value="value.executors.map(({displayName}) => displayName).join(', ')"
        @click.native="selectExecutorUser"
        placeholder="请选择工单负责人"
      >
        <div slot="suffix" @click.stop="clearExecutors" v-if="value.executors.length > 0">
          <i class="iconfont icon-yemianshanchu"></i>
        </div>
      </el-input>
      <!-- end 负责人员选择 -->

      <!-- start 协同人员选择 -->
      <div class="task-allot-select-synergies" @click="selectSynergiesUser">
        <span class="task-allot-select-synergies-placeholder" v-if="value.synergies.length <= 0">请选择协同人，协同人可查看、接收工单通知，支持多选</span>
        <template v-else>
          <div class="task-allot-select-synergie" v-for="(synergie, index) in value.synergies" :key="synergie.userId">
            <span>{{ synergie.displayName }}</span>
            <i class="iconfont icon-yemianshanchu" @click.stop="deleteSynergie(index)"></i>
          </div>
        </template>
      </div>
      <!-- end 协同人员选择 -->

    </div>
    <!-- end 选择负责人/协同人 -->

  </div>
  <!-- end 工单指派 -->
</template>

<script>
import TaskAllotSelect from '@src/modules/task/edit/components/TaskAllotSelect/TaskAllotSelect';
export default TaskAllotSelect;
</script>

<style lang="scss">
@import './TaskAllotSelect.scss';
</style>