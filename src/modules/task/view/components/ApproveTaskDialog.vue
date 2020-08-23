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
      <div class="form-view-row">
        <label>内容：</label>
        <div class="form-view-row-content" v-if="approve.id">{{ approveContent() }}</div>
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
      <div class="form-view-row">
        <label>审批结果：</label>
        <div class="form-view-row-content">
          <el-radio-group v-model="result">
            <el-radio label="success">通过</el-radio>
            <el-radio label="fail">拒绝</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="form-view-row">
        <label>审批结果：</label>
        <div class="form-view-row-content">
          <textarea v-model="approveRemark" placeholder="请输入审批结果[最多500字]" rows="3" maxlength="500" />
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">审 批</el-button>
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
  },
  data: () => {
    return {
      visible: false,
      pending: false,
      approve: {},
      result: 'success',
      approveRemark: '',
    };
  },
  methods: {
    reset() {
      this.result = 'success';
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
            
            this.pending = false;
            this.visible = true;
          } else {
            this.$platform.alert(res.message);
          }
        })
        .catch((err) => console.log(err));
    },
    submit() {
      this.pending = true;

      let { approveId, result, approveRemark } = this;
      TaskApi.saveApprove({ id: approveId, result, approveRemark })
        .then((res) => {
          if (res.status == 0) {
            this.$platform.alert('审批成功');

            let fromId = window.frameElement.getAttribute('fromid');
            this.$platform.refreshTab(fromId);

            window.location.reload();
          } else {
            this.$platform.alert(res.message);
            this.pending = false;
          }
        })
        .catch((err) => {
          this.pending = false;
          console.log(err);
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
            return `指派给${executor.displayName}`;
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
        console.log('approveContent error', err);
      }
    }
  }
}
</script>

<style lang="scss">
.task-approve-dialog {
  .form-view-row {
    padding: 6px 0px;
  }
}
</style>
