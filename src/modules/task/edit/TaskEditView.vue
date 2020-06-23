<template>
  <div class="task-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack">
            <i class="iconfont icon-arrow-left"></i> 返回
          </button>
          <span class="text">|</span>
          <button type="submit" :disabled="submitting || pending" class="btn btn-primary">提交</button>
        </div>
      </div>
      <task-edit-form :fields.sync="fields" :types="types" :value.sync="form" ref="form" @updatetemplateId="updatetemplateId"></task-edit-form>
    </form>
  </div>
</template>

<script>
import TaskEditForm from './components/TaskEditForm/TaskEditForm.vue'
import * as TaskApi from '@src/api/TaskApi'
import * as FormUtil from '@src/component/form/util'
import * as util from '../util/task'
import platform from '@src/platform'
let taskTemplate = {}
export default {
  name: 'task-edit-view',
  inject: ['initData'],
  data() {
    return {
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      auth: {}
    }
  },
  computed: {
    action() {
      // TODO: 因为initData无数据 暂时通过url区分新建、编辑
      let action = location.pathname.indexOf('/task/create') > -1 ? 'create' : 'edit';
      return this.initData.action || action;
    },
    editId() {
      // TODO: 因为initData无数据 编辑时暂时取form.id
      return this.initData.id || this.form.id || '';
    },
    eventId() {
      return this.initData.eventId || '';
    },
    types() {
      return JSON.parse(`[{"name":"默认工单","id":"1","tags":[]},
      {"name":"测工单排序4","id":"31cdc36c-918d-4525-9ee8-73c89614a891","tags":[]},
      {"name":"测试导出12","id":"9ffbc9c2-c8cc-472a-98ff-873c3e50ea63","tags":[]},
      {"name":"全字段测试","id":"13de8ca3-2d80-46ae-852f-6e692132f0e9","tags":[]},
      {"name":"测试结算回访","id":"278a103a-5806-4e0c-b102-04e37484f675","tags":[]},
      {"name":"测试组件","id":"b84170e4-358e-4b4d-8c79-b0aca7074147","tags":[]},
      {"name":"移动之附加组","id":"1ddde36b-6305-44db-8f1b-958ed39e4ddc","tags":[]},
      {"name":"工时记录测试","id":"9a4067e8-8d18-45d8-984d-52aa500da2fc","tags":[]}]`)
    }
  },
  methods: {
    updatetemplateId(e) {
      taskTemplate = e
    },
    goBack() {
      if (this.action == 'create') {
        let id = window.frameElement.dataset.id
        return this.$platform.closeTab(id)
      }
      parent.frameHistoryBack(window)
    },
    submit() {
      this.submitting = true;
      this.$refs.form
        .validate()
        .then(valid => {
          this.submitting = false;

          if (!valid) return Promise.reject('validate fail.');
          
          const params = util.packToTask(this.fields, this.form);
          params.templateId = taskTemplate.value;
          params.templateName = taskTemplate.text;
          this.pending = true;
          this.loadingPage = true;

          if (this.action === 'edit') {
            return this.updateMethod(params);
          }
          if (this.action === 'create') {
            return this.createMethod(params);
          }

        })
        .catch(err => {
          console.error(err)
          this.pending = false;
          this.loadingPage = false;
        })
    },
    createMethod(params) {
      this.$http
        .post('/task/create', params)
        .then(res => {
          let isSucc = !res.status;
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建工单${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          this.pending = false;
          this.loadingPage = false;

          if (!isSucc) return;

          // this.reloadTab();
          window.location.href = `${res.data}`;
        })
        .catch(err => console.error('err', err))
    },
    updateMethod(params) {
      this.$http
        .post(`/task/update?id=${this.editId}`, params)
        .then(res => {
          if (res.status == 1) {
            this.loadingPage = false;
            this.pending = false;
            return platform.notification({
              type: 'error',
              title: '更新工单失败',
              message: res.message
            })
          }
          window.location.href = `/task/view/${this.editId}`;
        })
        .catch(err => {
          this.pending = false;
          this.loadingPage = false;
          console.error('err', err);
        })
    },
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid');

      this.$platform.refreshTab(fromId);
    }
  },
  async mounted() {
    try {
      this.auth = this.initData.auth || {};
      // 初始化默认值
      let form = {};

      // TODO: 编辑时暂时用假数据
      if (this.action === 'edit') {
        form = {"id":"e569d1c1-6989-11ea-bfc9-00163e304a25","taskNo":"TQK6920030001","name":null,"customer":{"createUser":"3f20b9ac-36af-11ea-bfc9-00163e304a25","updateUser":null,"createTime":null,"updateTime":null,"id":"7516c0e8-5ef4-11ea-bfc9-00163e304a25","name":"小爽","enName":null,"serialNumber":"CUSJT50147","status":null,"level":null,"superior":null,"teamId":null,"customerManager":"","customerManagerName":"","remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[{"id":"bda400f6-2ae1-11ea-bfc9-00163e304a25","tagName":"杭州团队"}],"createUserId":null,"createLoginUser":null,"lmName":"小爽","lmPhone":"82282282","lmEmail":null,"customerAddress":{"adCountry":"","adDist":"静安区","adProvince":"上海市","adCity":"市辖区","adAddress":"工作室","adLongitude":121.45938400,"adLatitude":31.24710500,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"guideData":false,"focus":false},"type":null,"level":"中","serviceType":"类型一","serviceContent":"维修","description":"","state":"created","createTime":1584585157000,"executorId":null,"executor":null,"synergies":[],"attribute":{"field_CsbTwPJbFheGm8KG":"","field_E8mJWecKceDPiN1D":"","field_ESKLNCW8qAh8vegq":"","field_Jug4AptnM3ooJ7Pz":"","field_MQA9ZXlhkPNBv2B9":"","field_X0m3Pq8PXdB9E6ck":"","field_Z9fYURBrnGzpFlq7":[],"field_b5sDM1KR0T56NMF0":"","field_f83Ztxr8UgfGgRmi":"","field_iULucLkdl3bL7248":"","field_myx87dCC6W98wAdO":{},"field_pG4Zn4dJ42cMtkFl":{},"field_tRw0mwlUtuIMceG0":[],"field_xt0TZ7dbBQpo59dD":"","field_y1cm38WWTEPMiqoa":""},"balanceAttribute":{},"createUserId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","createUser":{"userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","loginName":null,"displayName":"庞海翠","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9reHuWmbNA43NA44_910_909.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$/neeSv3WmGtXXgNmqx0XGQ==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"122463461724178791","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"attachment":[],"planTime":"2020-03-19 10:32:26","isReview":0,"degree":null,"suggestion":null,"balanceConfirm":0,"balanceTime":null,"balanceUserId":null,"balanceUser":null,"remark":[],"receiptContent":null,"product":null,"productId":null,"completeTime":null,"startTime":null,"startOn":1,"autograph":null,"reviewTime":null,"reviewUserId":null,"reviewUser":null,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","allotTime":null,"allotUserId":null,"allotUser":null,"acceptTime":null,"closeTime":null,"taddress":{"id":"75594a6b-5ef4-11ea-bfc9-00163e304a25","city":"市辖区","dist":"静安区","address":"工作室","latitude":31.247105,"province":"上海市","longitude":121.459384},"tlmId":"7570f924-5ef4-11ea-bfc9-00163e304a25","tlmName":"小爽","tlmPhone":"82282282","tversion":"v2","inTaskPool":0,"updateTime":1584585156000,"products":[{"id":"aebffd28-5f6d-11ea-bfc9-00163e304a25","name":"发电机","type":"电力设备","serialNumber":"1234"}],"evaluate":null,"evaluateContent":null,"evaluateSource":null,"profit":null,"sale":null,"cost":null,"templateId":"b84170e4-358e-4b4d-8c79-b0aca7074147","templateName":"测试组件","cardInfo":[],"inApprove":0,"isPaused":0,"overTime":null,"isOverTime":0,"taskUsedTime":null,"taskUsedTimeStr":"","acceptUsedTime":null,"acceptUsedTimeStr":"","workUsedTime":null,"workUsedTimeStr":"","onceOverTime":0,"taskResponseTime":null,"taskResponseTimeStr":"","expenseDetail":null,"isDelete":0,"settlement":null,"sparepart":null,"onceRefused":0,"oncePaused":0,"allotType":0,"allotTypeStr":"","onceReallot":0,"positionException":0,"oncePrinted":0,"onceRollback":0,"validAddress":true,"expenseSheet":null,"evaluateObj":null,"source":null,"guideProfessions":[],"isGuideData":false,"isSettled":-1,"isReviewed":-1,"isEvaluated":-1,"isClosed":-1,"taddressStr":"上海市,市辖区,静安区,工作室","v2":true,"guideData":false}
      }

      // let tasktypes = (await TaskApi.taskType()) || []

      this.fields = await TaskApi.getTaskTemplateFields({ templateId: form.templateId || this.types[0].id, tableName: 'task' });

      form = util.packToForm(this.fields, form);
      this.form = FormUtil.initialize(this.fields, form);

      this.init = true;
    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [TaskEditForm.name]: TaskEditForm
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.form-taskNo {
  color: #8a8a8a;
  line-height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
