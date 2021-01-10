<template>
  <base-modal title="审批" :show.sync="visible" width="700px" class="task-approve-dialog">
    <div class="base-modal-content">
      <div class="form-view-row">
        <label>来源：</label>
        <div class="form-view-row-content">
          <template v-if="approve.source == 'task'">工单</template>
          <template v-else-if="approve.source == 'event'">事件</template>
        </div>
      </div>
      <div class="form-view-row">
        <label>编号：</label>
        <div class="form-view-row-content">{{ approve.objNo }}</div>
      </div>
      <div class="form-view-row">
        <label>类型：</label>
        <div class="form-view-row-content">{{ approve.typeName }}</div>
      </div>
      <div class="form-view-row">
        <label>节点：</label>
        <div class="form-view-row-content">{{ approve.action }}</div>
      </div>
      <div class="form-view-row" v-if="approve.id && approveContent()">
        <label>内容：</label>
        <div class="form-view-row-content">{{ approveContent() }}</div>
      </div>
      <div class="form-view-row">
        <label>发起人：</label>
        <div class="form-view-row-content">{{ approve.proposerName }}</div>
      </div>
      <div class="form-view-row">
        <label>发起时间：</label>
        <div class="form-view-row-content">{{ approve.createTime | fmt_datetime }}</div>
      </div>
      <div class="form-view-row">
        <label>发起人备注：</label>
        <div class="form-view-row-content">{{ approve.applyRemark }}</div>
      </div>
      <hr class="dividing-line" />
      <!--S 一级审批 -->
      <template v-if="configLevel === 1">
        <!-- <div class="form-view-row">
          <label>审批结果：</label>
          <div class="form-view-row-content result-content">
            <el-radio-group v-model="result">
              <el-radio label="success">通过</el-radio>
              <el-radio label="fail">拒绝</el-radio>
            </el-radio-group>
          </div>
        </div> -->
        <div class="form-view-row">
          <label>审批结果：</label>
          <div class="form-view-row-content">
            <textarea v-model="approveRemark" placeholder="请输入审批结果[最多500字]" rows="3" maxlength="500" />
            <p class="tips">备注：审批后不能修改审批结果</p>
          </div>
        </div>
      </template>
      <!--E 一级审批 -->
      <!-- S 多级审批 -->
      <el-steps v-else class="approve-steps" direction="vertical">
        <!--S 已经审批的步骤 -->
        <el-step class="approve-step-item" v-for="(item, idx) in approve.approverResult" :key="idx">
          <el-row slot="title" type="flex" justify="space-between">
            <h2>{{formatNumToCN(idx + 1)}}级审批</h2>
            <p>{{item.completeTime | fmt_datetime}}</p>
          </el-row>
          <div class="approve-step-item-desc" slot="description">
            <label>审批人： </label>{{ item.approverName }}
            <p>审批建议： {{item.approveRemark}}</p>
          </div>
        </el-step>
        <!--E 已经审批的步骤 -->
        <!--S 当前审批的步骤 -->
        <el-step class="approve-step-item">
          <el-row slot="title" type="flex" justify="space-between">
            <h2>{{formatNumToCN(approve.approverResult.length + 1)}}级审批</h2>
          </el-row>
          <div class="approve-step-item-desc" slot="description">
            <label>审批人： </label>{{ approve.approvers | formatApproveNames}}
            <el-row type="flex">
              <label>审批结果： </label>
              <textarea v-model="approveRemark" placeholder="请输入审批结果[最多500字]" rows="3" maxlength="500" />
            </el-row>
            <span class="tips">审批后不能修改审批结果</span>
          </div>
        </el-step>
        <!--E 当前审批的步骤 -->
        <!--S 未到审批的步骤 -->
        <el-step class="approve-step-item" v-for="(item, idx) in approve.multiApprover" :key="idx">
          <el-row slot="title" type="flex" justify="space-between">
            <h2>{{formatNumToCN(approve.approverResult.length + idx + 2)}}级审批</h2>
          </el-row>
          <div class="approve-step-item-desc" slot="description">
            <label>审批人： </label>{{ item | formatApproveNames}}
          </div>
        </el-step>
        <!--E 未到审批的步骤 -->
      </el-steps>
      <!-- E 多级审批 -->
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="dialog-footer-left"></div>
      <div class="dialog-footer-right">
        <el-button type="danger" plain @click="submit('fail')" :disabled="pending">拒绝</el-button>
        <el-button type="primary" @click="submit('success')" :disabled="pending">审 批</el-button>
      </div>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  name: 'task-approve-dialog',
  props: {
    approveId: {
      type: String,
      default: '',
    },
    taskId: {
      type: String,
      default: '',
    }
  },
  data: () => {
    return {
      visible: false,
      pending: false,
      approve: {},
      approveRemark: '',
      currLevel: 1 // 当前审批层级
    };
  },
  computed: {
    configLevel() {
      return this.approve.otherInfo &&this.approve.otherInfo.params && this.approve.otherInfo.params.level || 1;
    }
  },
  filters: {
    formatApproveNames(approvers) {
      return approvers.map(item => item.displayName).join(',') || '未找到审批人，将自动审批通过';
    }
  },
  methods: {
    formatNumToCN(num) {
      let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; 
      return changeNum[num];
    },
    reset() {
      this.approveRemark = '';
      this.approve = {};
    },
    openDialog() {
      if (this.pending) return;
      this.pending = true;

      // 重置
      this.reset();

      TaskApi.getApprove({ id: this.approveId })
        .then((res) => {
          if (res.status == 0) {
            this.approve = res.data;
            this.visible = true;
            this.currLevel = res.data.approverLevel;
          } else {
            this.$platform.alert(res.message);
          }
        })
        .catch((err) => console.log(err))
        .finally(() => {
          this.pending = false;
        })
    },
    submit(result) {
      this.pending = true;

      let { approveId, approveRemark } = this;
      TaskApi.saveApprove({ id: approveId, result, approveRemark })
        .then((res) => {
          if (res.status == 0) {
            this.$platform.notification({
              type: 'success',
              title: '审批成功'
            })

            let fromId = window.frameElement.getAttribute('fromid');
            // this.$platform.refreshTab(fromId);

            window.location.href = `/task/view/${this.taskId}`;
          } else {
            this.$platform.alert(res.message);
            this.pending = false;
          }
        })
        .catch((err) => {
          this.pending = false;
        });
    },
    // 处理审批时相关展示的内容
    approveContent() {
      try {
        let otherInfo = this.approve.otherInfo.params;

        if (this.approve.source == 'task') {
          if (this.approve.action == '指派') {
            if (otherInfo.auto) return '自动分配';
            if (otherInfo.toPool) return '发布到工单池';

            let executor = JSON.parse(otherInfo.taskJson).executor || {};
            return `指派给${executor.displayName || ''}`;
          }

          if (this.approve.action == '转派') {
            let executor = JSON.parse(otherInfo.taskJson).executor || {};
            return `转派给${executor.displayName}`;
          }

          if (this.approve.action == '完成') {
            return '请到【完成回执】中查看';
          }

          if (this.approve.action == '结算') {
            return '请到【审核结算】中查看';
          }

          if (this.approve.action == '回访') {
            return '请到【客户评价】中查看';
          }

          if (this.approve.action == '暂停') {
            return otherInfo.reason;
          }

          if (this.approve.action == '取消') {
            let content = JSON.parse(otherInfo.contentJson).updateContent;
            return `${content}`;
          }

          return '';
        }

        if (this.approve.source == 'event') {
          if (this.approve.action == '分配') {
            return `分配给${otherInfo.executorName}`;
          }

          if (this.approve.action == '完成') {
            return '请查看回执暂存内容';
          }

          if (this.approve.action == '暂停') {
            return otherInfo.reason;
          }

          return '';
        }
      } catch (err) {
        console.error('approveContent error', err);
      }
    }
  }
}
</script>

<style lang="scss">
.task-approve-dialog {
  .form-view-row {
    padding: 6px 0px;
    label{
      min-width: 84px;
      text-align: right;
    }

    .result-content {
      height: 24px;
      overflow-y: hidden;
    }
  }

  .dialog-footer {
    text-align: left;
    display: flex;
    flex: 1;

    .dialog-footer-left {
      flex: 1;
      font-size: 12px;

      .tips {
        color: $text-color-regular;
      }
    }

    .dialog-footer-right {
      text-align: right;
    }
  }
}
</style>

<style lang="scss" scoped>
.dividing-line{
  width: calc(100% + 38px);
  border-top: 1px #ddd dashed;
  transform: translateX(-20px);
}

.tips {
  color: $text-color-regular;
}

.approve-steps{
  padding-top: 12px;
  .approve-step-item{
    color: #000000;
    h2{
      font-size: 14px;
      color: #262626;
    }
    &-desc{
      padding: 16px;
      background: #FAFAFA;
    }
  }
}

label{
  min-width: 64px;
  text-align: right;
}

// element-ui
/deep/.el-step__description{
  color: #000000;
  padding: 0
}
</style>
