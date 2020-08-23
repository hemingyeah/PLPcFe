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
import * as TaskApi from '@src/api/TaskApi.ts';

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
      const expenseSheet = {"serviceExpense":[{"standard":"","serialNumber":"SE-278","salePrice":190.00,"guideProfessions":[],"primaryId":"05d4ae69-af70-471c-95cd-78784ba99c4e","type":"服务","isGuideData":false,"number":1.00,"outPrice":150.00,"guideData":false,"unit":"次","primaryType":"服务类型2","name":"SDI","id":"fa81d300-6fd6-11ea-bfc9-00163e304a25","taskId":"72e289e0-56a6-11ea-bfc9-00163e304a25","realPrice":190.00}],"sparePartsExpense":[{"standard":"2019","serialNumber":"1-1-19","repertoryCount":4.00,"salePrice":300.0,"guideProfessions":[],"primaryId":"9f7d51ad-6fd2-11ea-bfc9-00163e304a25","type":"备件","isGuideData":false,"number":1,"outPrice":200.0,"guideData":false,"unit":"个","primaryType":"备件类型1","subtotal":300.00,"name":"显示器","id":"fa81b9bd-6fd6-11ea-bfc9-00163e304a25","modifiedPrice":0.00,"taskId":"72e289e0-56a6-11ea-bfc9-00163e304a25","realPrice":300.00}],"discountExpense":{"salePrice":-90.00,"guideProfessions":[],"type":"折扣","isGuideData":false,"number":1,"guideData":false,"subtotal":-90.00,"id":"fa83c550-6fd6-11ea-bfc9-00163e304a25","taskId":"72e289e0-56a6-11ea-bfc9-00163e304a25","realPrice":-90.00}}
      let task = {"id":"72e289e0-56a6-11ea-bfc9-00163e304a25","taskNo":"TSM0120020029","name":null,"customer":{"createUser":"abd851e4-65f7-11e7-a318-00163e304a25","updateUser":null,"createTime":null,"updateTime":null,"id":"5d9387bd-3c72-11ea-bfc9-00163e304a25","name":"姜玲负责","enName":null,"serialNumber":"CUSAX50109","status":null,"level":null,"superior":null,"teamId":null,"customerManager":"","customerManagerName":"","remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[{"id":"095bf30d-96ea-11e9-bfc9-00163e304a25","tagName":"新建团队测试 子团队2"}],"createUserId":null,"createLoginUser":null,"lmName":"姜玲负责","lmPhone":"13322211111","lmEmail":null,"customerAddress":null,"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"guideData":false,"focus":false},"type":null,"level":"A","serviceType":"类型一","serviceContent":"服务内容A","description":null,"state":"finished","createTime":1582508348000,"executorId":null,"executor":{"userId":"dbbe863a-5422-11e9-bfc9-00163e304a25","loginName":null,"displayName":"赵玉迪","email":null,"cellPhone":"18953243420","lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qqhDfGbNAVTNAVQ_340_340.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$XWrjFoVcWRokjmgRfS5e4YUbrdhRRfeB","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"223963686835754422","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"synergies":[],"attribute":{"sparepart":"","serviceIterm":"","customReceipt":"true","paymentMethod":"","field_DEr3XNsa":"","field_MfGMQHt7":"未解决","field_ORN0MOEK":"2020-03-27","field_qlPDr7d8":["4","5"],"field_sT0l59pV":"202003271100","field_xAhWyFER":"2","field_y0cBy4cC":"2020-03-27 10:56:34","systemAutograph":"","receiptAttachment":[],"field_receipt_content":"回执内容","field_5HS5D74YyBaEM3xA":["选项一","选项二"],"field_7P7Y9ymGoD8eCLhr":"好的","field_9dw6FvtPfRcVSzGM":"","field_AC7SqxMQEfVOP2G7":"","field_BgW8LzfV3yeDnlj7":"电力设备","field_BjQ0Ayl7fnRWi6eJ":[],"field_FKO6vxAfxlz23oEY":"76869869","field_FWcWW47h5Q6xDl3d":"","field_FYF8TLKwgAfkwQPf":{},"field_JwYLcnHcAS9Z4lbY":"76869869","field_V5vnlOwDkaz4QusG":"","field_WHzoF3QVq1ibCzWb":null,"field_Z6PUci4aREaFDQuh":"CUSAX50109","field_ay1Q2vIQon4DOn1K":"","field_blGrZBb2Q21QgkIG":"","field_eirKe2VecolAIHeR":"","field_hQ47BtvO7WFKDA7y":"","field_idho2RPRRGXG4lfp":[],"field_kFDCiPMwEuWhiJu3":[],"field_laCsPTxLCQzgw4rB":"","field_pF6cqys7IqnuW1KU":"","field_s1Fl8d0h0OEw2i4i":"","field_srtJU6UCFFi3D3p0":[],"field_uZFMxDVAnB5ApaxM":"","field_y9kzBSZBT4dxzXcd":""},"balanceAttribute":{},"createUserId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","createUser":{"userId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","loginName":null,"displayName":"姜玲","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem8OKvNBKHNAxY_790_1185.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$eFfBhigg5UXA3izeycH3xZBrQ8PutKAh","longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"2241636048742742","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"attachment":[{"filename":"Screenshot_20200223_105213_com.alibaba.android.rimet-赵玉迪-2020-02-24.jpg","id":"23d96e39-cd0d-4db7-bb8f-2cff0e2701e2","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202002/e107b471-abb2-4e93-a508-1ecc602901f9.jpg","fileSize":"256.42KB","receipt":true}],"planTime":"2020-02-24 09:45:00","isReview":0,"degree":null,"suggestion":null,"balanceConfirm":0,"balanceTime":null,"balanceUserId":null,"balanceUser":null,"remark":[],"receiptContent":"","product":null,"productId":null,"completeTime":1582458944000,"startTime":1582458911000,"startOn":1,"autograph":"","reviewTime":null,"reviewUserId":null,"reviewUser":null,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","allotTime":1582508373000,"allotUserId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","allotUser":{"userId":"48e28fc3-f11a-11e8-b3c6-00163e304a25","loginName":null,"displayName":"姜玲","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem8OKvNBKHNAxY_790_1185.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenid":null,"staffId":"2241636048742742","tenantId":null,"mainTeamId":null,"unfinishedTask":null,"todayFinishedTask":null,"state":null,"cusDistance":null,"superAdmin":null,"isTeamLeader":0},"acceptTime":1582458908000,"closeTime":null,"taddress":{},"tlmId":"5dc03c84-3c72-11ea-bfc9-00163e304a25","tlmName":"姜玲负责","tlmPhone":"13322211111","tversion":"v2","inTaskPool":0,"updateTime":1585277969000,"products":[{"id":"5070bf3b-551d-11ea-bfc9-00163e304a25","name":"电力设备","type":"电力设备","serialNumber":"76869869"}],"evaluate":null,"evaluateContent":null,"evaluateSource":null,"profit":null,"sale":null,"cost":null,"templateId":"1","templateName":"默认工单","cardInfo":[],"inApprove":0,"isPaused":0,"overTime":null,"isOverTime":0,"taskUsedTime":0,"taskUsedTimeStr":"0小时00分钟","acceptUsedTime":19,"acceptUsedTimeStr":"0小时01分钟","workUsedTime":0,"workUsedTimeStr":"0小时00分钟","onceOverTime":0,"taskResponseTime":0,"taskResponseTimeStr":"0小时00分钟","expenseDetail":null,"isDelete":0,"settlement":null,"sparepart":"personalRepertory","onceRefused":0,"oncePaused":0,"allotType":1,"allotTypeStr":"手动派单","onceReallot":1,"positionException":0,"oncePrinted":0,"onceRollback":0,"validAddress":false,"expenseSheet":null,"evaluateObj":null,"source":null,"guideProfessions":[],"isGuideData":false,"isSettled":0,"isReviewed":-1,"isEvaluated":-1,"isClosed":-1,"taddressStr":null,"guideData":false,"v2":true}
      
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
