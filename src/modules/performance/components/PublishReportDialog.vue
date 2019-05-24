<template>
  <base-modal title="发布绩效报告" :show.sync="visible" width="600px" class="send-publish-notice-modal" @closed="reset">
    <dl>
      <dt>请检查核对绩效报告内容，发送后将无法撤回。</dt>
      <dd><el-checkbox v-model="form.isAdvice">仅通知有绩效结果的对象</el-checkbox></dd>
      <dd><el-checkbox v-model="form.isRanking">显示排名信息</el-checkbox></dd>
    </dl>
    <div class="warning" v-if="tagsName">提示：{{tagsName}}等团队主管为空，请检查后重新发送或忽略该信息继续发送，这可能导致某些人看不到绩效数据。</div>

    <div class="dialog-footer">
      <el-button type="primary" @click="send" :disabled="pending">发布</el-button>
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
      pending: false,
      form: {
        isAdvice: false,
        isRanking: false,
      }
    }
  },
  computed: {
    tagsName() {
      const {tagsName} = this.publishData;
      if (tagsName && Array.isArray(tagsName) && tagsName.length) {
        return tagsName.join('，')
      }
      return ''
    },
  },
  methods: {
    open() {
      this.visible = true;
    },
    send() {
      this.pending = true;
      publishPerformance({
        reportId: this.publishData.reportId,
        ...this.form,
      })
        .then(res => {
          this.pending = false;
          if (res.status) return this.$platform.notification({
            title: '发布失败',
            message: res.message || '',
            type: 'error',
          });

          this.$platform.notification({
            title: '发布成功',
            type: 'success',
          });

          this.visible = false;
          return window.location.reload()
        })
        .catch(e => console.error('e', e));

    },
    reset() {
      this.form = {
        isAdvice: false,
        isRanking: false,
      }
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