<template>
  <div class="page-container">
    <div class="task-tool-bar">
      <div class="task-toolbar-left">
        <button type="button" class="btn btn-text" @click="jump"><i class="iconfont icon-edit"></i> 编辑</button>
      </div>
    </div>
    <div class="main-content" v-loading="loading">
      <div class="task-detail">
        <form-view :fields="fields" :value="task">
          <template slot="taskNo" slot-scope="{ field, value }">
            <!-- 工单编号 -->
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{value}}</div>
            </div>
            <!-- 工单类型 -->
            <div class="form-view-row">
              <label>工单类型</label>
              <div class="form-view-row-content">{{task.templateName}}</div>
            </div>
          </template>

          <!-- start 客户字段 -->
          <template slot="customer" slot-scope="{ field }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{task.customer.name}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.linkman">
              <label>联系人</label>
              <div class="form-view-row-content">{{task.tlmName}} {{task.tlmPhone}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.address">
              <label>地址</label>
              <div class="form-view-row-content">{{prettyAddress(task.taddress)}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.product">
              <label>产品</label>
              <div class="form-view-row-content">
                <span class="row-item-margin" v-for="product in task.products" :key="product.id">{{product.name}}</span>
              </div>
            </div>
          </template>
          <!-- end 客户字段 -->

          <!-- 完成时间 -->
          <template slot="completeTime" slot-scope="{ field, value }" v-if="task.state == 'finished' || task.state == 'costed' || task.state == 'closed'">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{value}}</div>
            </div>
          </template>

          <!-- 协同人 -->
          <template slot="synergies" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <span class="row-item-margin" v-for="item in value" :key="item.userId">{{item.displayName}}</span>
              </div>
            </div>
          </template>

          <!-- 工单状态 -->
          <template slot="state" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{stateText[value]}}</div>
            </div>
          </template>

        </form-view>
      </div>
    </div>
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';

export default {
  name: 'task-detail-view',
  inject: ['initData'],
  data() {
    return {
      loading: false,
      task: {},
      fields: [],
      // TODO: 工单状态从移动端拷贝的数据 后面要修改
      stateText: {
        created: '待分配',
        allocated: '已指派',
        processing: '进行中',
        finished: '已完成',
        offed: '已取消',
      }
    }
  },
  computed: {
    /* 客户字段 */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /* 客户字段配置 */
    customerOption() {
      return (this.customerField.setting && this.customerField.setting.customerOption) || {} ;
    }
  },
  methods: {
    jump() {
      const id = this.task.id || this.initData.id;
      window.location.href = `/task/edit/${id}`;
    },
    prettyAddress(address){
      if(!address || Object.keys(address).length === 0) return '';

      let province = address.province || '';
      let city = address.city || '';
      let dist = address.dist || '';
      let adr = address.address || '';

      return [province, city, dist, adr].filter(a => a).join('-');
    }
  },
  async mounted() {
    try{
      this.loading = true;

      // TODO: 暂时用假数据
      this.task = {"id":"efc9a6bd-6983-11ea-bfc9-00163e304a25","taskNo":"TAW0120030012","name":null,"customer":{"createUser":"3f20b9ac-36af-11ea-bfc9-00163e304a25","updateUser":null,"createTime":null,"updateTime":null,"id":"7ef4f1e3-607a-11ea-bfc9-00163e304a25","name":"呼呼","enName":null,"serialNumber":"CUSBT50157","status":null,"level":null,"superior":null,"teamId":null,"customerManager":"","customerManagerName":"","remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[{"id":"095bf30d-96ea-11e9-bfc9-00163e304a25","tagName":"新建团队测试 子团队2"}],"createUserId":null,"createLoginUser":null,"lmName":"呼呼2","lmPhone":"18900000","lmEmail":null,"customerAddress":{"adCountry":"","adDist":"市北区","adProvince":"山东省","adCity":"青岛市","adAddress":"呼呼的家","adLongitude":120.37473100,"adLatitude":36.08760900,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"guideData":false,"focus":false},"type":null,"level":"中","serviceType":"服务类型三","serviceContent":"服务内容B ","description":"测试新建表单o","state":"created","createTime":1584582597000,"executorId":null,"executor":{"userId":"e09eeb90-5d10-11ea-bfc9-00163e304a25","loginName":null,"displayName":"庞海翠","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9sF74RVrNBgHNBgE_1537_1537.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$uJRv42qKlYjuaXTvvWs4sw==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"170937546621540920","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"synergies":[{"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9sF74RVrNBgHNBgE_1537_1537.jpg","userId":"e09eeb90-5d10-11ea-bfc9-00163e304a25","staffId":"170937546621540920","displayName":"叶泽伟"}],"attribute":{"field_CsbTwPJbFheGm8KG":"数据库的圣彼得堡","field_E8mJWecKceDPiN1D":"选项一","field_ESKLNCW8qAh8vegq":"2020-03-19 09:49:20","field_Jug4AptnM3ooJ7Pz":"CUSBT50157","field_MQA9ZXlhkPNBv2B9":"2020-03-19","field_X0m3Pq8PXdB9E6ck":"の8328","field_Z9fYURBrnGzpFlq7":["一级选项 1","二级选项 1"],"field_b5sDM1KR0T56NMF0":"17098748513","field_f83Ztxr8UgfGgRmi":"会计师事务所","field_iULucLkdl3bL7248":"62376482","field_myx87dCC6W98wAdO":{"all":"浙江省杭州市拱墅区祥符街道莫干山路809号杭州中粮大悦城","city":"杭州市","dist":"拱墅区","address":"祥符街道莫干山路809号杭州中粮大悦城","latitude":30.301169,"province":"浙江省","longitude":120.130316,"addressType":1},"field_pG4Zn4dJ42cMtkFl":{"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9reHuWmbNA43NA44_910_909.jpg","userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","staffId":"122463461724178791","displayName":"庞海翠"},"field_tRw0mwlUtuIMceG0":[{"id":"9bb7e2a8-a09e-482c-846c-ebc1ba050f52","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/c9c7fcb2-a7b8-4411-bdda-f506748e311e.jpg","fileSize":"14.67KB","filename":"VCG41N1206123634-庞海翠-2020-03-19.jpg"}],"field_xt0TZ7dbBQpo59dD":"の8328","field_y1cm38WWTEPMiqoa":"250"},"balanceAttribute":{},"createUserId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","createUser":{"userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","loginName":null,"displayName":"庞海翠","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9reHuWmbNA43NA44_910_909.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$/neeSv3WmGtXXgNmqx0XGQ==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"122463461724178791","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"attachment":[{"id":"04dbfc16-9f50-400f-a392-e530a2b672d3","filename":"服务报告TJR0320020002addPic-庞海翠-2020-03-19.pdf","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/d27d02d6-90cf-4006-9931-22038d5f5129.pdf","fileSize":"0B"}],"planTime":"2020-03-27 10:09:27","isReview":0,"degree":null,"suggestion":null,"balanceConfirm":0,"balanceTime":null,"balanceUserId":null,"balanceUser":null,"remark":[],"receiptContent":null,"product":null,"productId":null,"completeTime":null,"startTime":null,"startOn":1,"autograph":null,"reviewTime":null,"reviewUserId":null,"reviewUser":null,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","allotTime":null,"allotUserId":null,"allotUser":null,"acceptTime":null,"closeTime":null,"taddress":{"id":"7f2b6197-607a-11ea-bfc9-00163e304a25","city":"青岛市","dist":"市北区","address":"呼呼的家","latitude":36.087609,"province":"山东省","longitude":120.374731},"tlmId":"7f402112-607a-11ea-bfc9-00163e304a25","tlmName":"呼呼2","tlmPhone":"18900000","tversion":"v2","inTaskPool":0,"updateTime":1584583942000,"products":[{"id":"8618e631-6983-11ea-bfc9-00163e304a25","name":"哔哔机","type":"其他设备","serialNumber":"の8328"}],"evaluate":null,"evaluateContent":null,"evaluateSource":null,"profit":null,"sale":null,"cost":null,"templateId":"1","templateName":"默认工单","cardInfo":[],"inApprove":0,"isPaused":0,"overTime":1584586197000,"isOverTime":0,"taskUsedTime":null,"taskUsedTimeStr":"","acceptUsedTime":null,"acceptUsedTimeStr":"","workUsedTime":null,"workUsedTimeStr":"","onceOverTime":0,"taskResponseTime":null,"taskResponseTimeStr":"","expenseDetail":null,"isDelete":0,"settlement":null,"sparepart":null,"onceRefused":0,"oncePaused":0,"allotType":0,"allotTypeStr":"","onceReallot":0,"positionException":0,"oncePrinted":0,"onceRollback":0,"validAddress":true,"expenseSheet":null,"evaluateObj":null,"source":null,"guideProfessions":[],"isGuideData":false,"isSettled":-1,"isReviewed":-1,"isEvaluated":-1,"isClosed":-1,"taddressStr":"山东省,青岛市,市北区,呼呼的家","v2":true,"guideData":false}

      const fields = await TaskApi.getTaskTemplateFields({ templateId: this.task.templateId, tableName: 'task' });
      this.fields = [...fields, {
        displayName: '负责人',
        fieldName: 'executor',
        formType: 'user',
        isSystem: 1,
      }, {
        displayName: '协同人',
        fieldName: 'synergies',
        isSystem: 1
      }, {
        displayName: '完成时间',
        fieldName: 'completeTime',
        formType: 'timestamp',
      }, {
        displayName: '工单状态',
        fieldName: 'state',
        isSystem: 1
      }, {
        displayName: '创建人',
        fieldName: 'createUser',
        formType: 'user',
        isSystem: 1,
      }, {
        displayName: '创建时间',
        fieldName: 'createTime',
        formType: 'timestamp',
        isSystem: 1,
      }];

      this.loading = false;

    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
  }
}
</script>

<style lang="scss">
  html, body, .page-container {
    height: 100%;
  }

  body {
    padding: 10px;
    min-width: 1100px;
    overflow-x: auto;
  }

  .page-container {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0 1px 4px rgba(216,216,216, .65);
    display: flex;
    flex-flow: column nowrap;
  }

  .task-tool-bar {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: $text-color-regular;
    border-bottom: 1px solid #f2f2f2;

    .task-toolbar-left{
      padding: 10px 5px 10px 10px;
    }

    .btn-text {
      padding: 5px 12px;
      .iconfont{
        font-size: 14px;
      }
    }
  }

  .main-content {
    display: flex;
    flex-flow: row nowrap;
    flex: 1;
    position: relative;

    .task-detail {
      flex: 3;
      min-width: 420px;
      height: 100%;
      display: flex;
      flex-flow: column nowrap;

      .form-view{
        flex: 1;
        padding-top: 5px;
        overflow-y: auto;
        border-right: 1px solid #f2f2f2;

        .form-view-row {
          .row-item-margin {
            margin-right: 10px;
          }
        }
      }

    }
  }

  
</style>
