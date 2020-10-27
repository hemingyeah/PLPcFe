<template>
  <base-modal title="工单用时" :show.sync="visible" width="500px" class="task-time-dialog">
    <div class="base-modal-content">
        <div class="time-axis-header">
            <div class="time-axis-item">
                <el-tooltip effect="dark" content="从派单到接单用时" placement="left">
                    <label>接单用时：</label>
                </el-tooltip>
                <span>{{receiptTaskForUpdate.acceptUsedTimeStr}}</span>
            </div>
            <div class="time-axis-item">
                <el-tooltip effect="dark" content="从开始到完成用时" placement="left">
                    <label> 工作用时：</label>
                </el-tooltip>
                <span>{{receiptTaskForUpdate.workUsedTimeStr}}</span>
            </div>
            <div class="time-axis-item">
                <el-tooltip effect="dark" content="从接单到完成用时" placement="left">
                    <label>工作用时：</label>
                </el-tooltip>
                <span>{{receiptTaskForUpdate.taskUsedTimeStr}}</span>
            </div>
            <div class="time-axis-item">
                <el-tooltip effect="dark" content="从工单创建到工单开始用时" placement="left">
                    <label>响应用时：</label>
                </el-tooltip>
                <span>{{receiptTaskForUpdate.taskResponseTimeStr}}</span>
            </div>
        </div>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  name: 'task-time-dialog',
  inject: ['initData'],
  data: () => {
    return {
        visible: false
    }
  },
  computed: {
    receiptTaskForUpdate() {
        return this.initData.receiptTaskForUpdate || {};
    }
  },
  methods: {
    openDialog() {
      this.visible = true;
    },
  }
}
</script>

<style lang="scss">
.time-axis-header{
    .time-axis-item{
        label{
            cursor: pointer;
            min-width: 80px;
        }
    }
}
</style>