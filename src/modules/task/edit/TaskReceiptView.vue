<template>
  <div class="task-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="jump">
            <i class="iconfont icon-arrow-left"></i> 详情
          </button>
          <span class="text">|</span>
          <button type="submit" :disabled="pending" class="btn btn-primary">提交</button>
        </div>
      </div>
      <task-receipt-form :fields="fields" :value="form" ref="form"></task-receipt-form>
    </form>
  </div>
</template>

<script>
import TaskReceiptForm from './components/TaskReceiptForm.vue';
import * as TaskApi from '@src/api/TaskApi.ts';
import * as FormUtil from '@src/component/form/util';
import * as util from '../util/receipt';
import platform from '@src/platform';

export default {
  name: 'task-receipt-view',
  inject: ['initData'],
  data() {
    return {
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      auth: {}
    }
  },
  async mounted() {
    try {
      this.auth = this.initData?.auth || [];

      // TODO: 暂时用假数据
      const expenseSheet = {"serviceExpense":[{"standard":"","serialNumber":"SE-278","salePrice":190.00,"guideProfessions":[],"primaryId":"05d4ae69-af70-471c-95cd-78784ba99c4e","type":"服务","isGuideData":false,"number":1.00,"outPrice":150.00,"guideData":false,"unit":"次","primaryType":"服务类型2","name":"SDI","id":"fa81d300-6fd6-11ea-bfc9-00163e304a25","taskId":"72e289e0-56a6-11ea-bfc9-00163e304a25","realPrice":190.00}],"sparePartsExpense":[{"standard":"2019","serialNumber":"1-1-19","repertoryCount":4.00,"salePrice":300.0,"guideProfessions":[],"primaryId":"9f7d51ad-6fd2-11ea-bfc9-00163e304a25","type":"备件","isGuideData":false,"number":1,"outPrice":200.0,"guideData":false,"unit":"个","primaryType":"备件类型1","subtotal":300.00,"name":"显示器","id":"fa81b9bd-6fd6-11ea-bfc9-00163e304a25","modifiedPrice":0.00,"taskId":"72e289e0-56a6-11ea-bfc9-00163e304a25","realPrice":300.00}],"discountExpense":{"salePrice":-90.00,"guideProfessions":[],"type":"折扣","isGuideData":false,"number":1,"guideData":false,"subtotal":-90.00,"id":"fa83c550-6fd6-11ea-bfc9-00163e304a25","taskId":"72e289e0-56a6-11ea-bfc9-00163e304a25","realPrice":-90.00}}
      const task = {"id":"72e289e0-56a6-11ea-bfc9-00163e304a25","taskNo":"TSM0120020029","name":null,"customer":{"createUser":"abd851e4-65f7-11e7-a318-00163e304a25","updateUser":null,"createTime":null,"updateTime":null,"id":"5d9387bd-3c72-11ea-bfc9-00163e304a25","name":"姜玲负责","enName":null,"serialNumber":"CUSAX50109","status":null,"level":null,"superior":null,"teamId":null,"customerManager":"","customerManagerName":"","remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[{"id":"095bf30d-96ea-11e9-bfc9-00163e304a25","tagName":"新建团队测试 子团队2"}],"createUserId":null,"createLoginUser":null,"lmName":"姜玲负责","lmPhone":"13322211111","lmEmail":null,"customerAddress":null,"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"guideData":false,"focus":false},"type":null,"level":"A","serviceType":"类型一","serviceContent":"服务内容A","description":null,"state":"finished","createTime":1582508348000,"executorId":null,"executor":{"userId":"dbbe863a-5422-11e9-bfc9-00163e304a25","loginName":null,"displayName":"赵玉迪","email":null,"cellPhone":"18953243420","lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qqhDfGbNAVTNAVQ_340_340.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$XWrjFoVcWRokjmgRfS5e4YUbrdhRRfeB","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"223963686835754422","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"synergies":[],"attribute":{"sparepart":"","serviceIterm":"","customReceipt":"true","paymentMethod":"","field_DEr3XNsa":"","field_MfGMQHt7":"未解决","field_ORN0MOEK":"2020-03-27","field_qlPDr7d8":["4","5"],"field_sT0l59pV":"202003271100","field_xAhWyFER":"2","field_y0cBy4cC":"2020-03-27 10:56:34","systemAutograph":"","field_blGrZBb2Q21QgkIG":"","field_eirKe2VecolAIHeR":"","field_hQ47BtvO7WFKDA7y":"","field_idho2RPRRGXG4lfp":[],"field_kFDCiPMwEuWhiJu3":[],"field_laCsPTxLCQzgw4rB":"","field_pF6cqys7IqnuW1KU":"","field_s1Fl8d0h0OEw2i4i":"","field_srtJU6UCFFi3D3p0":[],"field_uZFMxDVAnB5ApaxM":"","field_y9kzBSZBT4dxzXcd":""},"balanceAttribute":{},"createUserId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","createUser":{"userId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","loginName":null,"displayName":"姜玲","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem8OKvNBKHNAxY_790_1185.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$eFfBhigg5UXA3izeycH3xZBrQ8PutKAh","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"2241636048742742","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"attachment":[{"filename":"Screenshot_20200223_105213_com.alibaba.android.rimet-赵玉迪-2020-02-24.jpg","id":"23d96e39-cd0d-4db7-bb8f-2cff0e2701e2","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202002/e107b471-abb2-4e93-a508-1ecc602901f9.jpg","fileSize":"256.42KB","receipt":true}],"planTime":"2020-02-24 09:45:00","isReview":0,"degree":null,"suggestion":null,"balanceConfirm":0,"balanceTime":null,"balanceUserId":null,"balanceUser":null,"remark":[],"receiptContent":"","product":null,"productId":null,"completeTime":1582458944000,"startTime":1582458911000,"startOn":1,"autograph":"","reviewTime":null,"reviewUserId":null,"reviewUser":null,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","allotTime":1582508373000,"allotUserId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","allotUser":{"userId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","loginName":null,"displayName":"姜玲","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem8OKvNBKHNAxY_790_1185.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"2241636048742742","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"acceptTime":1582458908000,"closeTime":null,"taddress":{},"tlmId":"5dc03c84-3c72-11ea-bfc9-00163e304a25","tlmName":"姜玲负责","tlmPhone":"13322211111","tversion":"v2","inTaskPool":0,"updateTime":1585277969000,"products":[{"id":"5070bf3b-551d-11ea-bfc9-00163e304a25","name":"电力设备","type":"电力设备","serialNumber":"76869869"}],"evaluate":null,"evaluateContent":null,"evaluateSource":null,"profit":null,"sale":null,"cost":null,"templateId":"1","templateName":"默认工单","cardInfo":[],"inApprove":0,"isPaused":0,"overTime":null,"isOverTime":0,"taskUsedTime":0,"taskUsedTimeStr":"0小时00分钟","acceptUsedTime":19,"acceptUsedTimeStr":"0小时01分钟","workUsedTime":0,"workUsedTimeStr":"0小时00分钟","onceOverTime":0,"taskResponseTime":0,"taskResponseTimeStr":"0小时00分钟","expenseDetail":null,"isDelete":0,"settlement":null,"sparepart":"personalRepertory","onceRefused":0,"oncePaused":0,"allotType":1,"allotTypeStr":"手动派单","onceReallot":1,"positionException":0,"oncePrinted":0,"onceRollback":0,"validAddress":false,"expenseSheet":null,"evaluateObj":null,"source":null,"guideProfessions":[],"isGuideData":false,"isSettled":0,"isReviewed":-1,"isEvaluated":-1,"isClosed":-1,"taddressStr":null,"guideData":false,"v2":true}
      
      let form = {
        expenseSheet, // 回执表单备件、服务项目数据
        task // 工单详情数据
      };

      this.fields = await TaskApi.getTaskTemplateFields({ templateId: task.templateId, tableName: 'task_receipt' });

      form = util.packToForm(this.fields, form);
      this.form = FormUtil.initialize(this.fields, form);

      this.init = true;
    } catch (e) {
      console.error('error ', e)
    }
  },
  methods: {
    jump() {
      window.location.href = `/task/receipt/view/${this.form.id}`;
    },
    submit() {
      this.$refs.form
        .validate()
        .then(valid => {

          if (!valid) return Promise.reject('validate fail.');

          const params = util.packToReceipt(this.fields, this.form);
          this.pending = true;
          this.loadingPage = true;

          this.createMethod(params);
        })
        .catch(err => {
          this.pending = false;
          this.loadingPage = false;
        })
    },
    createMethod(params) {
      TaskApi.editReceipt(params).then(res => {
        let isSucc = res && !res.status;
        platform.notification({
          type: isSucc ? 'success' : 'error',
          title: `编辑${isSucc ? '成功' : '失败'}`,
          message: !isSucc && res.message
        })
        this.pending = false;
        this.loadingPage = false;
      })
      .catch(err => console.error('err', err))
    },
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid')

      this.$platform.refreshTab(fromId)
    }
  },
  components: {
    [TaskReceiptForm.name]: TaskReceiptForm
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.task-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #fff;

  .page-title {
    border-bottom: 1px solid #f4f7f5;
    padding: 12px 10px;
    display: flex;
    justify-content: space-between;

    .iconfont {
      font-size: 12px;
    }

    .title {
      display: flex;
      justify-content: space-between;
      span.text {
        line-height: 34px;
        margin-right: 12px;
      }
    }
  }
}

.form-builder {
  width: 655px;
  padding: 10px 0 0 10px;

  .input-and-btn {
    display: flex !important;
    flex-flow: row nowrap;

    .form-item,
    .form-text,
    .form-select,
    .biz-team-select {
      flex: 1;
    }

    .base-dist-picker {
      padding-right: 0;
    }

    button {
      margin-left: 10px;
    }
  }
}
</style>
