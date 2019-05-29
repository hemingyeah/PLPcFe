<template>
  <div class="base-setting-container">
    <h2>绩效报告选项设置</h2>

    <div class="setting-item">
      <p class="setting-title">
        设置绩效报告审批人

        <el-popover
          placement="top-start"
          trigger="hover"
          content="具备运营分析权限的用户才可以被设置为审批人">
          <span style="vertical-align: middle" slot="reference">
            <i class="icon-help iconfont" style="margin-left: 3px;"></i>
          </span>
        </el-popover>

      </p>
      <div class="content">
        <el-select
          style="width: 300px"
          v-model="form.approve"
          filterable
          clearable
          remote
          multiple
          placeholder="请输入关键词搜索"
          :loading="remoteSearchLoading"
          :remote-method="getApproveList">
          <el-option
            v-for="item in approveList"
            :key="item.userId"
            :label="item.displayName"
            :value="item.userId">
          </el-option>
        </el-select>

        <el-button type="primary" @click="setApprove" :disabled="settingPending">保存</el-button>
      </div>
    </div>


    <div class="setting-item">
      <p class="setting-title">绩效报告抄送选项</p>
      <div class="setting-cc">
        <span>请选择抄送绩效报告的发送节点</span>
        <el-radio :label="0" @change="changeSetting" v-model="form.sendToCc" :disabled="pending">创建后抄送</el-radio>
        <el-radio :label="3" @change="changeSetting" v-model="form.sendToCc" :disabled="pending">审批后抄送</el-radio>
      </div>
    </div>
  </div>
</template>

<script>
import {setCcForReport, getApprovePerson, getApprovePersonList, setApprovePerson} from '@src/api/PerformanceApi';

export default {
  name: 'base-setting',
  props: {
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pending: false,
      settingPending: false,
      remoteSearchLoading: false,
      approveList: [],
      form: {
        approve: [],
        sendToCc: false
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.form.sendToCc = this.setting.sendToCc;

      Promise.all([
        this.getApproveInfo(),
        this.getApproveList()
      ])
        .then(res => {
          (res[0] || []).forEach(user => {
            if (this.approveList.every(u => u.userId !== user.userId)) {
              this.approveList = [...this.approveList, user]
            }
          })
        })
        .catch(e => console.error('e', e));
    },
    getApproveList(keyword) {
      return getApprovePersonList({
        keyword: keyword || '',
        pageNum: 1,
        pageSize: 20,
      })
        .then(res => {
          return this.approveList = res.data.list
        })
        .catch(e => console.error('e', e));
    },
    getApproveInfo() {
      return getApprovePerson()
        .then(res => {
          this.form.approve = res.data.map(({userId}) => userId);
          return res.data;
        })
        .catch(e => console.error('e', e));
    },
    setApprove() {
      this.settingPending = true;
      setApprovePerson({
        reviewIds: this.form.approve.join(','),
      })
        .then(res => {
          this.settingPending = false;
          if (!res) return;
          if (res.status) return this.$platform.notification({
            title: '失败',
            message: res.message || '',
            type: 'error',
          });

          return this.$platform.notification({
            title: '成功',
            message: '设置绩效报告审批人',
            type: 'success',
          });

        })
        .catch(e => console.error('e', e));
    },
    changeSetting() {
      if (this.pending) return;

      this.pending = true;
      setCcForReport({
        flag: this.form.sendToCc,
      })
        .then(res => {
          this.pending = false;

          if (!res) return;
          if (res.status) return this.$platform.notification({
            title: '失败',
            message: res.message || '',
            type: 'error',
          });

          return this.$platform.notification({
            title: '成功',
            message: '设置抄送选项',
            type: 'success',
          });
        })
        .catch(e => console.error('e', e));
    }
  },
}
</script>

<style lang="scss">

  .base-setting-container {
    background: #fff;
    margin-bottom: 10px;
    padding: 10px;

    h2 {
      line-height: 30px;
      border-bottom: 1px solid #ddd;
      font-size: 15px;
      margin-bottom: 10px;
    }

    .setting-item {
      padding-left: 15px;
      line-height: 30px;

      .setting-title {
        font-size: 14px;
        font-weight: 700;
        margin: 0;
      }

      .setting-cc {
        &>span {
          margin-right: 25px;
        }
        label {
          margin-bottom: 0;
        }
      }

      .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
      }


    }

  }
</style>