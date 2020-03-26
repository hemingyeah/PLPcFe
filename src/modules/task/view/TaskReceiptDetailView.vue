<template>
  <div class="page-container">
    <div class="task-tool-bar">
      <div class="task-toolbar-left">
        <button type="button" class="btn btn-text" @click="jump"><i class="iconfont icon-edit"></i> 编辑</button>
      </div>
    </div>
    <div class="main-content" v-loading="loading">
      <div class="task-detail">
        <form-view :fields="fields" :value="form">
          <!-- start 客户签名 -->
          <template slot="systemAutograph" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <div class="autograph">
                  <img :src="value" />
                </div>
              </div>
            </div>
          </template>
          <!-- end 客户签名 -->

          <!-- start 电子签名 -->
          <template slot="autograph" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <div class="autograph">
                  <img :src="value" />
                </div>
              </div>
            </div>
          </template>
          <!-- end 电子签名 -->

          <!-- start 备件 -->
          <template slot="sparepart" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <div class="form-table-row" v-for="row in value" :key="row.id">
                  <div class="form-table-row-col">名称：{{row.name}}</div>
                  <div class="form-table-row-col">编号：{{row.serialNumber}}</div>
                  <div class="form-table-row-col">类别：{{row.primaryType}}</div>
                  <div class="form-table-row-col">单价：{{row.salePrice}}</div>
                  <div class="form-table-row-col">数量：{{row.number}}</div>
                  <div class="form-table-row-col">小计：{{(row.number * row.salePrice).toFixed(2)}}</div>
                </div>
              </div>
            </div>
          </template>
          <!-- end 备件 -->

          <!-- start 服务项目 -->
          <template slot="serviceIterm" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <div class="form-table-row" v-for="row in value" :key="row.id">
                  <div class="form-table-row-col">名称：{{row.name}}</div>
                  <div class="form-table-row-col">编号：{{row.serialNumber}}</div>
                  <div class="form-table-row-col">类别：{{row.primaryType}}</div>
                  <div class="form-table-row-col">单价：{{row.salePrice}}</div>
                  <div class="form-table-row-col">数量：{{row.number}}</div>
                  <div class="form-table-row-col">小计：{{(row.number * row.salePrice).toFixed(2)}}</div>
                </div>
              </div>
            </div>
          </template>
          <!-- end 服务项目 -->

        </form-view>

        <!-- 合计 -->
        <div class="totalExpense" v-if="hasExpense">
          <span>折扣费用：{{discountExpense}}</span>
          <span>合计：{{totalExpense}}</span>
        </div>
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
      form: {},
      fields: [],
      discountExpense: 0
    }
  },
  computed: {
    hasExpense() {
      const { sparepart, serviceIterm } = this.form;
      return Array.isArray(sparepart) || Array.isArray(serviceIterm);
    },
    totalExpense() {
      const { sparepart, serviceIterm } = this.form;
      let total = 0;

      if (Array.isArray(sparepart)) {
        sparepart.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      if (Array.isArray(serviceIterm)) {
        serviceIterm.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total;
    }
  },
  methods: {
    jump() {
      window.location.href = '/task/receipt';
    }
  },
  async mounted() {
    try{
      this.loading = true;

      // TODO: 暂时用假数据
      const expenseSheet = {"serviceExpense":[{"standard":"","serialNumber":"SE-87","salePrice":190.00,"guideProfessions":[],"primaryId":"00171866-b3b6-4875-9cbe-23774a4497bf","type":"服务","isGuideData":false,"number":11.00,"outPrice":150.00,"guideData":false,"unit":"次","primaryType":"服务类型2","name":"SDI","id":"831d997a-6f69-11ea-bfc9-00163e304a25","taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":190.00},{"standard":"","serialNumber":"SE-361","salePrice":190.00,"guideProfessions":[],"primaryId":"002c3147-f0f8-4702-93ae-14ce7c549864","type":"服务","isGuideData":false,"number":10.00,"outPrice":150.00,"guideData":false,"unit":"次","primaryType":"服务类型2","name":"SDI","id":"831d9b74-6f69-11ea-bfc9-00163e304a25","taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":190.00}],"sparePartsExpense":[{"standard":"12","serialNumber":"TEST_UPLOAD_FIELD_20022502ab","repertoryCount":1.00,"salePrice":999.0,"guideProfessions":[],"primaryId":"bac6d473-6cc5-11ea-bfc9-00163e304a25","type":"备件","isGuideData":false,"number":1,"outPrice":0.01,"guideData":false,"unit":"个","primaryType":"备件类型1","subtotal":999.00,"name":"20022502sunab","id":"831d9241-6f69-11ea-bfc9-00163e304a25","modifiedPrice":0.00,"taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":999.00}],"discountExpense":{"salePrice":-991.00,"guideProfessions":[],"type":"折扣","isGuideData":false,"number":1,"guideData":false,"subtotal":-991.00,"id":"831d9e9f-6f69-11ea-bfc9-00163e304a25","taskId":"9be21f43-69c2-11ea-bfc9-00163e304a25","realPrice":-991.00}}
      let task = {"id":"9be21f43-69c2-11ea-bfc9-00163e304a25","taskNo":"TKB10020030002","name":null,"customer":{"createUser":"d33846ee-6fa9-11e9-bfc9-00163e304a25","updateUser":null,"createTime":null,"updateTime":null,"id":"8383ac6c-b2a4-437e-bf3b-c5105beb4abe","name":"客户导入测试222","enName":null,"serialNumber":"CUSWR50164","status":null,"level":null,"superior":null,"teamId":null,"customerManager":"e105a6fa-6769-11ea-bfc9-00163e304a25","customerManagerName":"吴陈正","remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[{"id":"bda400f6-2ae1-11ea-bfc9-00163e304a25","tagName":"杭州团队"}],"createUserId":null,"createLoginUser":null,"lmName":"客户导入测试222","lmPhone":"15093383493","lmEmail":null,"customerAddress":{"adCountry":"","adDist":"","adProvince":"其他区域","adCity":"其他","adAddress":"","adLongitude":null,"adLatitude":null,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"guideData":false,"focus":false},"type":null,"level":"中","serviceType":"保内免费","serviceContent":"安装","description":null,"state":"finished","createTime":1584609515000,"executorId":null,"executor":{"userId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","loginName":null,"displayName":"张爱军","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$MDwa66wol79LFsAILOB8VA==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"050857046524329386","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"synergies":[],"attribute":{"sparepart":"","serviceIterm":"","customReceipt":"true","paymentMethod":"","systemAutograph":"data:image/png;base64,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","receiptAttachment":[],"field_Cg9vvKPN39NtG4Na":[{"id":"231b7d0a-4902-4579-8d1b-6bd658c3cc0a","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/00e8f422-ca82-4aef-83d6-55249c079c83.xlsx","fileSize":"6.81KB","filename":"测试导出12工单字段标识对应表-庞海翠-2020-03-26.xlsx"}],"field_Ea8De5MepuhK7QBi":"lsjdfjsk","field_GGF6AQzgv6J7Zor5":"2020-03-26 21:55:45","field_K7cX1GUgxqxFsXks":"回执","field_WI6UmJ7eSzR6cA3f":"sdkjsdkj","field_wrjoQC7NpBXSTCac":{"all":"北京市市辖区西城区换行","city":"市辖区","dist":"西城区","address":"换行","latitude":"","province":"北京市","longitude":"","addressType":0}},"balanceAttribute":{},"createUserId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","createUser":{"userId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","loginName":null,"displayName":"张爱军","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$MDwa66wol79LFsAILOB8VA==","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"050857046524329386","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"attachment":[{"id":"01dc9e6a-bd07-4a82-8ca7-8d3519d63e61","filename":"VCG211268659958-庞海翠-2020-03-25.jpg","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/b5af30f8-ac58-4a68-9959-388dd43be0f9.jpg","fileSize":"12.89KB"},{"id":"f540fde3-4d28-4f0d-a372-a03e1ab2ac50","filename":"VCG41N1206123634-庞海翠-2020-03-26.jpg","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/2009339e-e710-46c3-882b-10f85545d3e7.jpg","fileSize":"14.67KB"},{"filename":"VCG41N1206123634-庞海翠-2020-03-25.jpg","id":"d8b8e238-439b-410e-ad32-6d9de8c106b6","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202003/fac8e832-c04a-4ca6-be0f-b45ae618a2fe.jpg","fileSize":"14.67KB","receipt":true}],"planTime":"2020-03-19 18:15:00","isReview":0,"degree":null,"suggestion":null,"balanceConfirm":0,"balanceTime":null,"balanceUserId":null,"balanceUser":null,"remark":[],"receiptContent":"","product":null,"productId":null,"completeTime":1584609598000,"startTime":1584609565000,"startOn":1,"autograph":"","reviewTime":null,"reviewUserId":null,"reviewUser":null,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","allotTime":1584609531000,"allotUserId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","allotUser":{"userId":"f4cea5f7-49eb-11e9-bfc9-00163e304a25","loginName":null,"displayName":"张爱军","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"050857046524329386","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"acceptTime":1584609552000,"closeTime":null,"taddress":{"id":"7ffa2dd5-6440-11ea-bfc9-00163e304a25","city":"其他","dist":"","address":null,"latitude":null,"province":"其他区域","longitude":null},"tlmId":"8005bc04-6440-11ea-bfc9-00163e304a25","tlmName":"客户导入测试222","tlmPhone":"15093383493","tversion":"v2","inTaskPool":0,"updateTime":1585230954000,"products":[],"evaluate":null,"evaluateContent":null,"evaluateSource":null,"profit":null,"sale":null,"cost":null,"templateId":"3042c40f-4e3f-4997-aac9-bc3df0189dcb","templateName":"工时1234","cardInfo":[{"attribute":{"field_gPB3PtWB":"单行电脑","field_j3IseoLX":"","field_UJgdcRaz":"","field_KtBBZ97u":null,"field_Fc5qPJIb":null,"field_EcR8prWr":"","field_6hVZWJxC":"","id":"c5dadb3a-7b40-4505-b4cb-f5f860f916aa","userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","userName":"庞海翠","updateTime":1584868344937},"cardId":"ccdddc47-390b-11ea-bfc9-00163e304a25","inputType":"single"},{"attribute":[{"field_D2GNO1TI":"测试22","field_aTKeVkIX":"第四十丢货电视电话的abc","field_ethUqoas":"","field_NUqlPmjq":null,"field_gqjGL3DF":null,"field_7zGFvzfI":"","field_A5T4yNSU":"","id":"792d8e2f-a65e-4120-9930-851b56291c6e","userId":"3f20b9ac-36af-11ea-bfc9-00163e304a25","userName":"庞海翠","updateTime":1584874071236}],"cardId":"d85b27c8-3906-11ea-bfc9-00163e304a25","inputType":"multiple"}],"inApprove":0,"isPaused":0,"overTime":null,"isOverTime":0,"taskUsedTime":46,"taskUsedTimeStr":"0小时01分钟","acceptUsedTime":21,"acceptUsedTimeStr":"0小时01分钟","workUsedTime":33,"workUsedTimeStr":"0小时01分钟","onceOverTime":0,"taskResponseTime":50,"taskResponseTimeStr":"0小时01分钟","expenseDetail":null,"isDelete":0,"settlement":null,"sparepart":"personalRepertory","onceRefused":0,"oncePaused":0,"allotType":1,"allotTypeStr":"手动派单","onceReallot":0,"positionException":0,"oncePrinted":0,"onceRollback":0,"validAddress":true,"expenseSheet":null,"evaluateObj":null,"source":null,"guideProfessions":[],"isGuideData":false,"isSettled":0,"isReviewed":-1,"isEvaluated":0,"isClosed":-1,"taddressStr":"其他区域,其他","v2":true,"guideData":false}
      
      this.fields = await TaskApi.getTaskTemplateFields({ templateId: task.templateId, tableName: 'task_receipt' });

      // 处理数据
      this.fields.forEach(field => {
        let { fieldName } = field;

        // 回执附件
        if(fieldName === 'receiptAttachment'){
          task[fieldName] = task.attachment.filter(img => img.receipt);
        }

        // 客户签名
        if(fieldName === 'systemAutograph'){
          task[fieldName] = task.attribute[fieldName];
        }

        // 备件
        if (fieldName === 'sparepart') {
          task[fieldName] = expenseSheet.sparePartsExpense || [];
        }

        // 服务项目
        if (fieldName === 'serviceIterm') {
          task[fieldName] = expenseSheet.serviceExpense || [];
        }

      });

      this.form = task;

      // 折扣费用
      this.discountExpense = expenseSheet.discountExpense.salePrice;
      
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

          .autograph {
            width: 300px;
            height: 100px;
            border: 1px dashed #aaa;

            img {
              width: 100%;
              height: 100%;

              &[src=""], &:not([src]) {
                opacity: 0;
              }
            }
          }

          .form-table-row {
            border-top: 1px solid #f4f4f4;
            display: flex;
            flex-wrap: wrap;

            .form-table-row-col {
              width: 33.3%;
              padding: 8px 10px;
              word-break: break-all;
              box-sizing: border-box;
            }
          }
        }
      }

      .totalExpense {
        border-top: 1px solid #f4f4f4;
        text-align: right;
        padding: 10px;

        span {
          margin-left: 10px;
        }
      }
    }
  }

  
</style>
