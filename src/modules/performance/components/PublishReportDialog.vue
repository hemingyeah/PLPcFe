<template>
  <base-modal title="发布绩效报告" :show.sync="visible" width="600px" class="send-publish-notice-modal" @closed="reset">



    <dl>
      <dt>请检查核对绩效报告内容，发送后将无法撤回。</dt>
      <dd><el-checkbox v-model="form.notice">仅通知有绩效结果的对象</el-checkbox></dd>
      <dd><el-checkbox v-model="form.sort">显示排名信息</el-checkbox></dd>
    </dl>
    <div class="warning">提示：XXX、XXX、XXX团队主管为空，请检查后重新发送或忽略该信息继续发送，这可能导致某些人看不到绩效数据。</div>

    <div class="dialog-footer">
      <el-button type="primary" @click="send">发布</el-button>
    </div>

  </base-modal>
    
</template>

<script>
import {publishPerformance} from '@src/api/PerformanceApi';

export default {
  name: 'publish-report',
  props: {
    publishData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      form: {
        notice: false,
        sort: false,
      }

    }
  },
  mounted() {
  },
  methods: {
    open() {

      this.visible = true;
    },
    send() {

      publishPerformance({
        reportId: this.publishData.reportId,
        isAdvice: false,
        isRanking: false,
      })
        .then(res => {
          if (res.status) return this.$platform.notification({
            title: '发布失败',
            message: res.message || '',
            type: 'error',
          });

          this.visible = false;

          this.$platform.notification({
            title: '发布成功',
            type: 'success',
          });

          return window.location.reload()

        })
        .catch(e => console.error('e', e));

    },
    reset() {

    }
  },
}
</script>

<style lang="scss">
  .send-publish-notice-modal {
    .base-modal-body {
      padding: 35px 32px 0;
    }

    dl {
      padding-left: 20px;
      color: #75777A;
      font-size: 15px;

      dt {
        line-height: 32px;
        font-weight: normal;
      }

      dd {
        line-height: 21px;
        margin: 0;
        padding-left: 5px;
        .el-checkbox {
          margin: 0;
        }
        .el-checkbox__label {
          color: #75777A;
          font-size: 15px;
          font-weight: normal;
        }
      }

    }

    .warning {
      padding-left: 20px;
      font-size: 14px;
      color: #E56A6A;
      line-height: 20px;
    }

    .dialog-footer {
      text-align: right;
      padding: 15px 0 ;
    }
  }

</style>