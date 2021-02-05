<template>
  <div class="task-tab-container task-feedback-tab">
    <!-- start 客户评价信息 -->
    <div class="task-account-main-content">
      <!-- start 审批中 -->
      <template v-if="isApproving">
        <task-feedback-detail-boli
          :evaluate-content="task.evaluateContent"
          :evaluate.sync="evaluateJson"
          :task-evaluate.sync="initData.taskEvaluate"
          v-if="initData.isBoli "
        />
        <task-feedback-detail
          v-else
          :evaluate-config="initData.evaluateConfig"
          :evaluate-content="task.evaluateContent"
          :evaluate="evaluateJson"
        />
        
        <!-- 审批中icon -->
        <div class="approving-img">
          <img :src="getApprovingImg()" />
        </div>
      </template>
      <!-- end 审批中 -->

      <!-- start 未回访 -->
      <no-data-view-new
        v-else-if="!task.reviewTime"
        notice-msg="暂无评价信息"
      ></no-data-view-new>
      <!-- end 未回访 -->

      <!-- start 已回访 -->
      <template v-else>
        <task-feedback-detail-boli
          :evaluate-content="task.evaluateContent"
          :task-evaluate.sync="initData.taskEvaluate"
          :evaluate-config="initData.evaluateConfig"
          :evaluate="task"
          v-if="initData.isBoli"
        />
        <task-feedback-detail
          :evaluate-config="initData.evaluateConfig"
          :evaluate-content="task.evaluateContent"
          :evaluate="task"
          v-else
        />
      </template>
      <!-- end 已回访 -->

    </div>
    <!-- end 客户评价信息 -->

    <!-- start 操作 -->
    <div class="btn-group">
      <el-button type="primary" size="mini" plain @click="feedback" :disabled="pending" v-if="allowReviewTask">回访</el-button>
    </div>
    <!-- end 操作 -->

    <!-- start 回访弹窗 -->
    <task-feedback-dialog-boli
      ref="feedbackDialog"
      :task="task"
      :task-evaluate="initData.taskEvaluate"
      :evaluate-config="initData.evaluateConfig"
      @proposeApprove="proposeApprove"
      v-if="initData.isBoli"
    />
    <task-feedback-dialog
      ref="feedbackDialog"
      :task="task"
      :evaluate-config="initData.evaluateConfig"
      @proposeApprove="proposeApprove"
      v-else
    />
    <!-- end 回访弹窗 -->
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* components */
import FeedbackDialog from './FeedbackDialog';
import FeedbackDialogBoLi from './FeedbackDialogBoLi';
import FeedbackDetail from './FeedbackDetail';
import FeedbackDetailBoLi from './FeedbackDetailBoLi';
import NoDataViewNew from '@src/component/common/NoDataViewNew';

/* image */
import APPROVING_IMG from '@src/assets/img/task/approving.png';

export default {
  name: 'task-feedback',
  inject: ['initData'],
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pending: false,
      isBoli:true
    }
  },
  computed: {
    // 工单详情数据
    task() {
      return this.shareData.task;
    },
    // 审批数据
    approve() {
      return this.initData.unFinishedAppr || {};
    },
    // 是否在回访审批中
    isApproving() {
      return this.task.inApprove == 1 && this.approve.action == '回访';
    },
    // 审批中的回访数据
    evaluateJson() {
      let taskJson = this.approve.otherInfo?.params.taskJson || {};

      return JSON.parse(taskJson);
    },
    /** 
    * @description 是否显示回访按钮
    * 1. 当前登录账户有工单回访权限TASK_FEEDBACK
    * 2. 且 不是审批状态
    * 3. 且 未回访过
    */
    allowReviewTask() {
      let { inApprove, isReviewed, isReview } = this.task;
      let feedbackAuth = this.shareData.auth.TASK_FEEDBACK;

      return feedbackAuth && inApprove != 1 && isReviewed == 0 && isReview == 0;
    }
  },
  methods: {
    getApprovingImg() {
      return APPROVING_IMG;
    },
    async feedback() {
      if (this.pending) return;
      this.pending = true;
      
      try {
        // 检验附加组件是否必填
        const res = await TaskApi.checkNotNullForCard({ id: this.task.id, flow: 'review' });

        this.pending = false;

        if (res.status == 1) return this.$platform.alert(res.message);
        this.$refs.feedbackDialog.openDialog();

      } catch (e) {
        console.error('feedback task error', e);
      }
    },
    // 发起审批
    proposeApprove(data) {
      this.$emit('proposeApprove', data);
    }
  },
  mounted(){
    console.log(this.initData, 'dde')
  },
  components: {
    [NoDataViewNew.name]: NoDataViewNew,
    [FeedbackDetail.name]: FeedbackDetail,
    [FeedbackDetailBoLi.name]: FeedbackDetailBoLi,
    [FeedbackDialog.name]: FeedbackDialog,
    [FeedbackDialogBoLi.name]: FeedbackDialogBoLi
  }
}
</script>

<style lang="scss">
.task-feedback-tab {
  .evaluate-degree-img {
    width: 24px;
    height: 24px;
    margin-right: 2px;
    display: inline-block;
    vertical-align: middle;

    background: url(../../../../../assets/img/task/review-degree.png) no-repeat;
    background-size: 24px 144px;

    &.review-degree-satisfy {
      background-position: 0 0;
    }

    &.review-degree-commonly {
      background-position: 0 -24px;
    }

    &.review-degree-unsatisfy {
      background-position: 0 -48px;
    }

    &.review-degree-satisfy-active {
      background-position: 0 -72px;
    }

    &.review-degree-commonly-active {
      background-position: 0 -96px;
    }

    &.review-degree-unsatisfy-active {
      background-position: 0 -120px;
    }
  }

  .star-evaluate-row-content {
    flex: 1;

    .star-evaluate-row {
      display: flex;
      margin-bottom: 10px;

      .star-title {
        width: 86px;
        margin-right: 6px;
      }
    }
  }

  .evaluate-tag {
    .evaliate-tag-item {
      display: inline-block;
      padding: 2px 8px;
      margin: 0 10px 10px 0;
      font-size: 12px;
      border: 1px solid #e5e5e5;
      background-color: #f8f7f6;
      border-radius: 2px;
      color: #757575;
    }

    .evaliate-tag-active,
    input[type='checkbox']:checked ~ span {
      color: #00d1d3;
      background-color: #f5fffd;
      border-color: #00d1d3;
    }
  }
}
</style>
