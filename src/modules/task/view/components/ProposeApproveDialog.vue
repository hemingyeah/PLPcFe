<template>
  <base-modal title="该操作需要审批" :show.sync="visible" width="432px" class="task-need-approve-dialog">
    <div class="base-modal-content">
      <p><span class="form-item-required" v-if="remarkRequired">*</span>审批说明：</p>
      <textarea v-model="apprForm.applyRemark" :placeholder="remarkPlaceholder" rows="3" maxlength="500" />
      <!--S 审批步骤 -->
      <div class="approve-steps">
        <el-row v-if="approveLevel === 1" :type="chooseApprover || 'flex'">
          <p>审批人：</p>
          <form-user
            v-if="chooseApprover"
            :field="{ displayName: '审批人' }"
            v-model="approver"
            :see-all-org="true"
            placeholder="请选择审批人"
          />
          <template v-else>{{approversName}}</template>
        </el-row>
        <el-steps v-else direction="vertical">
          <!-- 一级审批步骤 -->
          <el-step title="一级审批" status="process">
            <el-row slot="description" type="flex">
              <div class="form-item-control">
                <form-user
                  v-if="chooseApprover"
                  :field="{ displayName: '一级审批人' }"
                  v-model="approver"
                  :see-all-org="true"
                  placeholder="请选择一级审批人"
                />
                <div v-else>
                  <label>审批人：</label>
                  {{approversName}}
                </div>
              </div>
            </el-row>
          </el-step>
          <!-- 二级以上审批步骤 -->
          <el-step v-for="(item, idx) in multiApproverSetting" :key="idx" :title="`${cnNumName[idx + 2]}级审批`" status="process">
            <el-row slot="description" type="flex">
              <div class="form-item-control">
                <form-user
                  v-if="item.isOpt === 1"
                  :field="{ displayName: `${cnNumName[idx + 2]}级审批人` }"
                  :value="item.approver"
                  @input="(val) => updateApprover(val, idx)"
                  :see-all-org="true"
                  :placeholder="`请选择${cnNumName[idx + 2]}级审批人`"
                />
                <div v-else>
                  <label>审批人：</label>
                  {{item.approversName}}
                </div>
              </div>
            </el-row>
          </el-step>
        </el-steps>
      </div>
      <!--E 审批步骤 --> 
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">提 交</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

import FormUser from '@src/component/form/components/FormUser/FormUser.vue';

export default {
  name: 'propose-approve-dialog',
  props: {
    approveId: {
      type: String,
      default: '',
    },
    remarkRequired: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      chooseApprover: false,
      apprForm: {},
      approver: {},
      approversName: '',
      approveLevel: 1, // 审批等级
      multiApproverSetting: [], // 多级审批（2级以上审批）

      successBc: null
    }
  },
  computed: {
    remarkPlaceholder() {
      return `请输入审批说明[最多500字]${this.remarkRequired ? '[必填]' : '[选填]'}`;
    },
    cnNumName() {
      return ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    }
  },
  methods: {
    /**
     * 更新多级选择的审批人
     */
    updateApprover(data, idx) {
      console.log(data, idx);
      this.$set(this.multiApproverSetting, idx, {
        ...this.multiApproverSetting[idx],
        approver: data
      })
    },
    openDialog(data, successBc) {
      if(Object.prototype.toString.call(successBc) === '[object Function]'){
        this.successBc = successBc;
      }
      // 重置
      this.approver = {};
      this.apprForm = { source: 'task' };
      this.apprForm.applyRemark = '';
      this.apprForm.params = data;
      this.chooseApprover = false;

      if (data.isOpt == 1) {
        this.chooseApprover = true;
      } else {
        this.approversName = data.approversName;
      }

      this.approveLevel = data.level || 1;
      this.multiApproverSetting = data.multiApproverSetting ? [...data.multiApproverSetting] : [];

      this.visible = true;
    },
    submit() {
      // 审批人由发起人选择时
      if (this.chooseApprover && !this.approver.userId) return this.$platform.alert(`请选择${this.approveLevel > 1 ? '一级' : ''}审批人`);

      for (let i = 0; i < this.multiApproverSetting.length; i++) {
        const approve = this.multiApproverSetting[i];
        if(approve.isOpt === 1){
          if(!approve.approver) return this.$platform.alert(`请选择${this.cnNumName[i + 2]}级审批人`);
          if(!approve.approver.userId) return this.$platform.alert(`请选择${this.cnNumName[i + 2]}级审批人`);
        }
      }

      // 审批说明必填校验
      if (!this.apprForm.applyRemark && this.remarkRequired) return this.$platform.alert('请填写审批说明');

      if (this.chooseApprover) this.apprForm.params.approveId = this.approver.userId;

      // 多级审批参数
      for (let i = 0; i < this.multiApproverSetting.length; i++) {
        const approve = this.multiApproverSetting[i];
        if(this.approveLevel > 1) {
          if (approve.isOpt === 1) this.apprForm.params.multiApproverSetting[i].approveId = approve.approver.userId;
        }
      }
      this.pending = true;

      TaskApi.applyApprove(this.apprForm).then(res => {
        if (res.status == 0) {
          this.$platform.alert(this.$platform.inDingTalk ? '已发起审批，请等待审批结果，结果会以钉钉消息的方式通知' : '已发起审批，请等待审批结果');
          // 为提供jsp成功回调
          if(this.succseeBc) return this.succseeBc();
          this.$emit('success')
          window.location.href = `/task/view/${this.taskId}`;
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },

  },
  components: {
    [FormUser.name]: FormUser
  }
}
</script>

<style lang="scss">
.task-need-approve-dialog {
  .form-item {
    margin-bottom: 10px;
    align-items: baseline;
  }
  // 以下为jsp页面兼容样式 
  .form-item-required {
    color: red;
  }
  .base-modal {
    .base-modal-body {
      padding: 20px;

      .base-modal-content {
        textarea {
          width: 100%;
        }
        
        p {
          margin-bottom: 8px;

          &.tips {
            color: #999;
            font-size: 12px;
          }

          &.base-upload-placeholder {
            margin-bottom: 0;
          }
        }

        button{
          height: 24px;
          line-height: 32px;
          width: 24px;

          padding: 0;
          margin: 0;
          outline: none;
          color: #666;
          border: none;
          background-color: transparent;
          transition: color ease .15s;

          i {
            font-size: 14px;
          }

          &:hover{
            color: #e84040;
          }
        }
      }

      .el-button {
        min-width: auto;
        max-width: auto;
      }
    }

    .base-modal-footer {
      text-align: right;
    }

    .task-back-dialog {
      p {
        font-size: 12px;
      }
    }
  }
}

</style>

<style lang="scss" scoped>
.approve-steps{
  margin-top: 20px;
}

// elemeny-ui 
/deep/.el-step__description{
  padding: 0;
}

/deep/.el-steps, .el-step{
  width: auto !important;
}

/deep/.el-step__head.is-process{
  color: #BFBFBF;
  border-color: #BFBFBF;
}
</style>