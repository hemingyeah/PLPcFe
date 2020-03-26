<template>
  <div class="task-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack">
            <i class="iconfont icon-arrow-left"></i> 返回
          </button>
          <span class="text">|</span>
          <button type="submit" :disabled="pending" class="btn btn-primary">暂存</button>
        </div>
      </div>
      <task-receipt-form :fields="fields" :value="form" ref="form"></task-receipt-form>
    </form>
  </div>
</template>

<script>
import TaskReceiptForm from './components/TaskReceiptForm.vue';
import * as TaskApi from '@src/api/TaskApi';
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
      this.auth = this.initData.auth || {};

      // TODO: 暂时用假数据
      const expenseSheet = {"serviceExpense":[{"standard":"","serialNumber":"SE-87","salePrice":190.00,"guideProfessions":[],"primaryId":"00171866-b3b6-4875-9cbe-23774a4497bf","type":"服务","isGuideData":false,"number":11.00,"outPrice":150.00,"guideData":false,"unit":"次","primaryType":"服务类型2","name":"SDI","id":"831d997a-6f69-11ea-bfc9-00163e304a25","taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":190.00},{"standard":"","serialNumber":"SE-361","salePrice":190.00,"guideProfessions":[],"primaryId":"002c3147-f0f8-4702-93ae-14ce7c549864","type":"服务","isGuideData":false,"number":10.00,"outPrice":150.00,"guideData":false,"unit":"次","primaryType":"服务类型2","name":"SDI","id":"831d9b74-6f69-11ea-bfc9-00163e304a25","taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":190.00}],"sparePartsExpense":[{"standard":"12","serialNumber":"TEST_UPLOAD_FIELD_20022502ab","repertoryCount":1.00,"salePrice":999.0,"guideProfessions":[],"primaryId":"bac6d473-6cc5-11ea-bfc9-00163e304a25","type":"备件","isGuideData":false,"number":1,"outPrice":0.01,"guideData":false,"unit":"个","primaryType":"备件类型1","subtotal":999.00,"name":"20022502sunab","id":"831d9241-6f69-11ea-bfc9-00163e304a25","modifiedPrice":0.00,"taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":999.00}],"discountExpense":{"salePrice":-991.00,"guideProfessions":[],"type":"折扣","isGuideData":false,"number":1,"guideData":false,"subtotal":-991.00,"id":"831d9e9f-6f69-11ea-bfc9-00163e304a25","taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":-991.00}}
      const task = {"id":"9be21f43-69c2-11ea-bfc9-00163e304a25","taskNo":"TKB10020030002","name":null,"customer":{"createUser":"d33846ee-6fa9-11e9-bfc9-00163e304a25","updateUser":null,"createTime":null,"updateTime":null,"id":"8383ac6c-b2a4-437e-bf3b-c5105beb4abe","name":"客户导入测试222","enName":null,"serialNumber":"CUSWR50164","status":null,"level":null,"superior":null,"teamId":null,"customerManager":"e105a6fa-6769-11ea-bfc9-00163e304a25","customerManagerName":"吴陈正","remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[{"id":"bda400f6-2ae1-11ea-bfc9-00163e304a25","tagName":"杭州团队"}],"createUserId":null,"createLoginUser":null,"lmName":"客户导入测试222","lmPhone":"15093383493","lmEmail":null,"customerAddress":{"adCountry":"","adDist":"","adProvince":"其他区域","adCity":"其他","adAddress":"","adLongitude":null,"adLatitude":null,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"guideData":false,"focus":false},"type":null,"level":"中","serviceType":"保内免费","serviceContent":"安装","description":null,"state":"finished","createTime":1584609515000,"executorId":null,"executor":{"userId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","loginName":null,"displayName":"张爱军","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$MDwa66wol79LFsAILOB8VA==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"050857046524329386","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"synergies":[],"attribute":{"sparepart":"","serviceIterm":"","customReceipt":"true","paymentMethod":"","systemAutograph":"","receiptAttachment":[],"field_Cg9vvKPN39NtG4Na":[{"id":"231b7d0a-4902-4579-8d1b-6bd658c3cc0a","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/00e8f422-ca82-4aef-83d6-55249c079c83.xlsx","fileSize":"6.81KB","filename":"测试导出12工单字段标识对应表-庞海翠-2020-03-26.xlsx"}],"field_Ea8De5MepuhK7QBi":"lsjdfjsk","field_GGF6AQzgv6J7Zor5":"2020-03-26 21:55:45","field_K7cX1GUgxqxFsXks":"回执","field_WI6UmJ7eSzR6cA3f":"sdkjsdkj","field_wrjoQC7NpBXSTCac":{"all":"北京市市辖区西城区换行","city":"市辖区","dist":"西城区","address":"换行","latitude":"","province":"北京市","longitude":"","addressType":0}},"balanceAttribute":{},"createUserId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","createUser":{"userId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","loginName":null,"displayName":"张爱军","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$MDwa66wol79LFsAILOB8VA==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"050857046524329386","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"attachment":[{"id":"01dc9e6a-bd07-4a82-8ca7-8d3519d63e61","filename":"VCG211268659958-庞海翠-2020-03-25.jpg","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/b5af30f8-ac58-4a68-9959-388dd43be0f9.jpg","fileSize":"12.89KB"},{"id":"f540fde3-4d28-4f0d-a372-a03e1ab2ac50","filename":"VCG41N1206123634-庞海翠-2020-03-26.jpg","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/2009339e-e710-46c3-882b-10f85545d3e7.jpg","fileSize":"14.67KB"},{"filename":"VCG41N1206123634-庞海翠-2020-03-25.jpg","id":"d8b8e238-439b-410e-ad32-6d9de8c106b6","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/fac8e832-c04a-4ca6-be0f-b45ae618a2fe.jpg","fileSize":"14.67KB","receipt":true}],"planTime":"2020-03-19 18:15:00","isReview":0,"degree":null,"suggestion":null,"balanceConfirm":0,"balanceTime":null,"balanceUserId":null,"balanceUser":null,"remark":[],"receiptContent":"","product":null,"productId":null,"completeTime":1584609598000,"startTime":1584609565000,"startOn":1,"autograph":"","reviewTime":null,"reviewUserId":null,"reviewUser":null,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","allotTime":1584609531000,"allotUserId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","allotUser":{"userId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","loginName":null,"displayName":"张爱军","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"050857046524329386","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"acceptTime":1584609552000,"closeTime":null,"taddress":{"id":"7ffa2dd5-6440-11ea-bfc9-00163e304a25","city":"其他","dist":"","address":null,"latitude":null,"province":"其他区域","longitude":null},"tlmId":"8005bc04-6440-11ea-bfc9-00163e304a25","tlmName":"客户导入测试222","tlmPhone":"15093383493","tversion":"v2","inTaskPool":0,"updateTime":1585230954000,"products":[],"evaluate":null,"evaluateContent":null,"evaluateSource":null,"profit":null,"sale":null,"cost":null,"templateId":"3042c40f-4e3f-4997-aac9-bc3df0189dcb","templateName":"工时1234","cardInfo":[{"attribute":{"field_gPB3PtWB":"单行电脑","field_j3IseoLX":"","field_UJgdcRaz":"","field_KtBBZ97u":null,"field_Fc5qPJIb":null,"field_EcR8prWr":"","field_6hVZWJxC":"","id":"c5dadb3a-7b40-4505-b4cb-f5f860f916aa","userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","userName":"庞海翠","updateTime":1584868344937},"cardId":"ccdddc47-390b-11ea-bfc9-00163e304a25","inputType":"single"},{"attribute":[{"field_D2GNO1TI":"测试22","field_aTKeVkIX":"第四十丢货电视电话的abc","field_ethUqoas":"","field_NUqlPmjq":null,"field_gqjGL3DF":null,"field_7zGFvzfI":"","field_A5T4yNSU":"","id":"792d8e2f-a65e-4120-9930-851b56291c6e","userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","userName":"庞海翠","updateTime":1584874071236}],"cardId":"d85b27c8-3906-11ea-bfc9-00163e304a25","inputType":"multiple"}],"inApprove":0,"isPaused":0,"overTime":null,"isOverTime":0,"taskUsedTime":46,"taskUsedTimeStr":"0小时01分钟","acceptUsedTime":21,"acceptUsedTimeStr":"0小时01分钟","workUsedTime":33,"workUsedTimeStr":"0小时01分钟","onceOverTime":0,"taskResponseTime":50,"taskResponseTimeStr":"0小时01分钟","expenseDetail":null,"isDelete":0,"settlement":null,"sparepart":"personalRepertory","onceRefused":0,"oncePaused":0,"allotType":1,"allotTypeStr":"手动派单","onceReallot":0,"positionException":0,"oncePrinted":0,"onceRollback":0,"validAddress":true,"expenseSheet":null,"evaluateObj":null,"source":null,"guideProfessions":[],"isGuideData":false,"isSettled":0,"isReviewed":-1,"isEvaluated":0,"isClosed":-1,"taddressStr":"其他区域,其他","v2":true,"guideData":false}

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
    goBack() {
      if (this.action == 'create') {
        let id = window.frameElement.dataset.id
        return this.$platform.closeTab(id)
      }
      parent.frameHistoryBack(window)
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
