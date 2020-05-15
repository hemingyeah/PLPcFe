<template>
  <base-modal title="审批" :show.sync="visible" width="600px" class="approve-performance-modal" @closed="reset">

    <ul class="approve-info">
      <li>
        <label>编号：</label> {{approveData.name}}
      </li>
      <li>
        <label>来源：</label> 绩效报告
      </li>
      <li>
        <label>类型：</label> {{approveData.type}}
      </li>
      <li>
        <label>流程节点：</label> 发布
      </li>
      <li>
        <label>内容：</label> 发布 {{approveData.name}}
      </li>
      <li>
        <label>发起人：</label> {{approveData.proposerName}}
      </li>
      <li>
        <label>发起时间：</label> {{approveData.proposerTime}}
      </li>
      <li>
        <label>发起备注：</label> {{approveData.applyRemark}}
      </li>
      <li>
        <label>审批结果：</label>
        <el-radio v-model="form.result" label="success">同意</el-radio>
        <el-radio v-model="form.result" label="fail">不同意</el-radio>
      </li>
      <li>
        <label>审批备注：</label>
        <el-input type="textarea" v-model="form.approveRemark" resize="none" rows="3" :maxlength="500"></el-input>
      </li>
    </ul>


    <p class="tip">备注：审批后不能修改审批结果</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending" >确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import {approvePerformance} from '@src/api/PerformanceApi';

export default {
  name: 'approve-dialog',
  props: {
    approveData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      init: false,
      form: {
        result: 'success',
        approveRemark: '',
      }
    }
  },
  methods: {
    open() {
      this.init = true;
      this.visible = true;
    },
    onSubmit() {
      this.pending = true;

      approvePerformance({
        ...this.form,
        reportId: this.approveData.reportId,
      })
        .then(res => {

          this.pending = false;

          if (res.status) return this.$platform.notification({
            title: '审批失败',
            message: res.message || '',
            type: 'error',
          });

          this.$platform.notification({
            title: '审批成功',
            type: 'success',
          });

          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          return window.location.reload()
        })
        .catch(e => console.error('e', e));
    },
    reset() {
      this.init = false;
    },
  },
}
</script>

<style lang="scss">

  .approve-performance-modal {

    .approve-info {
      margin: 0;
      padding: 15px 0 0;

      li {
        list-style: none;
        display: flex;
        word-break: break-all;

        label {
          width: 100px;
          margin: 0;
          line-height: 26px;
          flex-shrink: 0;
        }
      }
    }

    .tip {
      margin: 10px 0 0;
      line-height: 26px;
      font-size: 12px;
      color: #999;
    }

    .base-modal-body {
      padding: 0 30px;
    }

    .dialog-footer {
      text-align: right;
      /*padding: 15px 0 ;*/
    }
  }
</style>