<template>
  <base-modal
      :title="clickType == 'report' ? '设置服务报告' : '设置打印模板'" width="700px" class="form-select-setting-modal"
      @cancel="cancel"
      :show.sync="isShow" :mask-closeable="false">


    <div class="scroll-content">
      <div class="row">
        <p class="title">公司信息</p>
        <div class="section-line">
          <el-checkbox-group class="checkbox-group" v-model="companyCheck">
            <div class="checkbox-item">
              <el-checkbox label="name" name="r_tenantFields" value="name">名称</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="phone" name="r_tenantFields" value="phone">电话</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="email" name="r_tenantFields" value="email">邮箱</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="address" name="r_tenantFields" value="address">地址</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="portal" name="r_tenantFields" value="portal">自助门户</el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      <div class="row">
        <p class="title">客户信息</p>
        <el-checkbox-group class="checkbox-group" v-model="userCheck">
          <template v-for="(item,index) in taskList" v-if="item.formType == 'customer' && item.fieldName == 'customer' ">
            <!--              系统客户字段-->
            <template v-if="item.setting.customerOption.product">
              <div class="checkbox-item">
                <el-checkbox label="product" name="r_customerFields" value="product">产品</el-checkbox>
              </div>
            </template>
            <template v-if="item.setting.customerOption.address">
              <div class="checkbox-item">
                <el-checkbox label="address" name="r_customerFields" value="address">地址</el-checkbox>
              </div>
            </template>
            <template v-if="item.setting.customerOption.linkman">
              <div class="checkbox-item">
                <el-checkbox label="linkman" name="r_customerFields" value="linkman">联系人</el-checkbox>
              </div>
            </template>
          </template>
          <div class="checkbox-item">
            <el-checkbox label="name" name="r_customerFields" value="name">客户</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <div class="row">
        <p class="title">工单信息</p>
        <div class="section-line">
          <el-checkbox-group class="checkbox-group" v-model="orderCheck">
            <!--            负责人、协同人、派单时间、创建时间、开始时间、完成时间-->
            <template v-for="(item,index) in taskList" v-if="item.formType != 'attachment' && item.formType != 'customer' && item.enabled">
              <div class="checkbox-item">
                <el-checkbox :label=item.fieldName name="r_taskFields" :value=item.fieldName>{{item.displayName}}</el-checkbox>
              </div>
            </template>

            <div class="checkbox-item">
              <el-checkbox label="templateName" name="r_taskFields" value="templateName">工单类型</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="state" name="r_taskFields" value="state">工单状态</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="createUser" name="r_taskFields" value="createUser">创建人</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="allotUser" name="r_taskFields" value="allotUser">派单人</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="executor" name="r_taskFields" value="executor">负责人</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="synergies" name="r_taskFields" value="synergies">协同人</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="allotTime" name="r_taskFields" value="allotTime">派单时间</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="createTime" name="r_taskFields" value="createTime">创建时间</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="startTime" name="r_taskFields" value="startTime">开始时间</el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="completeTime" name="r_taskFields" value="completeTime">完成时间</el-checkbox>
            </div>
          </el-checkbox-group>

        </div>
      </div>
      <div class="row">
        <p class="title">回执信息</p>
        <el-checkbox-group class="checkbox-group" v-model="receiptCheck">
          <div class="checkbox-item">
            <el-checkbox label="sparepart" name="r_receiptFields" value="sparepart">备件</el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox label="service" name="r_receiptFields" value="service">服务项目</el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox label="autograph" name="r_receiptFields" value="autograph">客户签名</el-checkbox>
          </div>
          <template v-for="item in receiptList" v-if="item.formType != 'attachment' && item.formType != 'receiptAttachment' && item.formType != 'sparepart' && item.formType != 'serviceIterm' && item.formType != 'systemAutograph'">
            <div class="checkbox-item">
              <el-checkbox :label=item.fieldName name="r_receiptFields" :value=item.fieldName>{{item.displayName}}</el-checkbox>
            </div>
          </template>
        </el-checkbox-group>
      </div>
      <template v-for="(cardInfo,index) in cardDetailList">
        <div class="row">
          <p class="title">附加组件：{{cardInfo.cardName}}</p>
          <div class="section-line">

            <el-checkbox-group class="checkbox-group" v-model="additionalCheck[index]">
              <template v-for="field in cardInfo.fields" v-if="field.formType != 'attachment'">
                <div class="checkbox-item">
                  <el-checkbox :label=field.fieldName name="r_cardFields" :value=field.fieldName>{{field.displayName}}</el-checkbox>
                </div>
              </template>
              <div class="checkbox-item">
                <el-checkbox label="userName" name="r_cardFields" value="userName">操作人</el-checkbox>
              </div>
              <div class="checkbox-item">
                <el-checkbox label="updateTime" name="r_cardFields" value="updateTime">操作时间</el-checkbox>
              </div>
              <div class="checkbox-item">
                <el-checkbox label="distance" name="r_cardFields" value="distance">行程距离</el-checkbox>
              </div>
            </el-checkbox-group>

          </div>
        </div>
      </template>

      <div class="row">
        <p class="title">附件信息</p>
        <div class="section-line">
          <div class="checkbox-group">
            <el-checkbox-group class="flex-el-checkbox-group" v-model="attachmentTasklistCheck">

              <!--          工单信息附件类型-->
              <template v-for="item in taskList" v-if="item.formType == 'attachment'">
                <div class="checkbox-item">
                  <el-checkbox :label=item.fieldName :value=item.fieldName name="attachment_Fields">工单-{{item.displayName}}</el-checkbox>
                </div>
              </template>
            </el-checkbox-group>

            <el-checkbox-group class="flex-el-checkbox-group" v-model="attachmentReceiptCheck">
              <!--          回执附件-->
              <div class="checkbox-item">
                <el-checkbox label="receiptAttachment" value="receiptAttachment" name="attachment_Fields">回执-回执附件</el-checkbox>
              </div>
            </el-checkbox-group>

            <el-checkbox-group class="flex-el-checkbox-group" v-model="attachmentReceiptListCheck">
              <template v-for="item in receiptList" v-if="item.formType == 'attachment'">
                <div class="checkbox-item">
                  <el-checkbox :label=item.fieldName :value=item.fieldName name="attachment_Fields">回执{{item.displayName}}</el-checkbox>
                </div>
              </template>
            </el-checkbox-group>

            <!--          附件组件附件-->
            <template v-for="(cardInfo,index) in cardDetailList" >
              <el-checkbox-group class="flex-el-checkbox-group" v-model="attachmentCardDetailListCheck[index]">
                <template v-for="field in cardInfo.fields" v-if="field.formType == 'attachment'">
                  <div class="checkbox-item">
                    <el-checkbox :label=field.fieldName :value=field.fieldName name="attachment_Fields">
                      {{cardInfo.cardName}}-{{field.displayName}}
                    </el-checkbox>
                  </div>
                </template>
              </el-checkbox-group>
            </template>
          </div>
        </div>
      </div>

    </div>


    <template slot="footer">
      <button type="button" class="btn btn-primary" @click="submit">保存</button>
    </template>
  </base-modal>
</template>

<script>
import {getTaskTemplateFields, getFields, taskSettingSave, getTaskCardDetailList, getTaskType} from '@src/api/TaskApi';
import TeamDetailView from "@src/modules/team/views/TeamDetailView";
export default {
  name: "system-template-dialog",
  components: {TeamDetailView},
  props: {
    isShowSystemModal: {
      type: Boolean,
      default: false,
    },
    clickType : {
      type : String,
      default: ""
    },
  },
  data() {
    return {
      checkList : ["名称"],
      isShow : false,
      //TODO: id后期需要动态获取
      id : 1,
      taskList : [],
      receiptList : [],
      cardDetailList : [],
      //回显设置
      reviewSetting: {
        attachmentFields: {}
      },
      //复选组里被选中的值
      companyCheck : [],
      userCheck : [],
      orderCheck : [],
      receiptCheck : [],
      additionalCheck : [],
      attachmentTasklistCheck : [],
      attachmentReceiptCheck : [],
      attachmentReceiptListCheck : [],
      attachmentCardDetailListCheck : []

    }
  },
  methods : {
    async getTemplateInfo() {
      console.log("异步查看配置")
      console.log(this.clickType)
      //查看配置
      let result = await getTaskType({id : this.id});
      if(this.clickType == 'report') {
        if(JSON.stringify(result.data.reportSetting) == "{}"){
          this.reviewSetting = {"tenantFields":["name","phone","email","address","portal"],"customerFields":["name","product","address","linkman"],"taskFields":["taskNo","planTime","executor"],"receiptFields":["sparepart","service","autograph"],"attachmentFields":{}}
        }else{
          this.reviewSetting = result.data.reportSetting;
          let attachmentFields = this.reviewSetting.attachmentFields;
          if(!attachmentFields){
            this.reviewSetting.attachmentFields = {};
          }
        }
      }else if(this.clickType == 'print') {
        if(JSON.stringify(result.data.printSetting) == "{}"){
          this.reviewSetting = {"tenantFields":["name","phone","email","address","portal"],"customerFields":["name","product","address","linkman"],"taskFields":["taskNo","planTime","executor"],"receiptFields":["sparepart","service","autograph"],"attachmentFields":{}}
        }else{
          this.reviewSetting = result.data.printSetting;
          let attachmentFields = this.reviewSetting.attachmentFields;
          if(!attachmentFields){
            this.reviewSetting.attachmentFields = {};
          }
        }
      }
      //创建工单组件时的配置
      let firstFields = await getFields({ tableName: 'task', typeId:this.id});
      this.taskList = firstFields;
      //回执组件的配置
      let secondFields = await getFields({ tableName: 'task_receipt', typeId:this.id});
      let msg = [];
      msg = secondFields.filter(item => {
        return item.enabled == 1
      });
      this.receiptList = msg;
      //附加组件的配置
      let thirdFields = await getTaskCardDetailList({typeId:this.id});
      this.cardDetailList = thirdFields;

      this.setCheckArr();
    },
    async submit() {
      console.log("保存系统模板配置");
    },
    cancel(res) {
      console.log("cancal")
      this.$emit("hideModal",{templateType : "system",})
      //将后台那台的数据全部清空

    },
    setCheckArr() {
      //勾选信息回显列表
      console.log("勾选信息回显列表")
      this.companyCheck = this.reviewSetting.tenantFields;
      this.userCheck = this.reviewSetting.customerFields;
      this.orderCheck = this.reviewSetting.taskFields;
      this.receiptCheck = this.reviewSetting.receiptFields;
      this.setAdditionalCheck();
      this.setAttachmentCheck();
    },
    setAdditionalCheck() {
      this.additionalCheck = [];
      let cardFields = this.reviewSetting.cardFields;
      for(let item of cardFields) {
        this.additionalCheck.push(item.fields);
      }
    },
    setAttachmentCheck() {
      //工单信息附件类型
      this.attachmentTasklistCheck = this.isInAttachmentArray111(this.taskList,this.reviewSetting.attachmentFields.taskAttachments);
      this.attachmentReceiptCheck = this.isInAttachmentArray111([{fieldName:"receiptAttachment"}],this.reviewSetting.attachmentFields.receiptAttachments);
      this.attachmentReceiptListCheck = this.isInAttachmentArray111(this.receiptList,this.reviewSetting.attachmentFields.receiptAttachments);
      this.attachmentCardDetailListCheck = [];
      for(let item of this.cardDetailList) {
        let _arr = this.isInAttachmentArray111(item.fields,this.reviewSetting.attachmentFields.singleCardInfoAttachments,this.reviewSetting.attachmentFields.multipleCardInfoAttachments);
        this.attachmentCardDetailListCheck.push(_arr);
      }
    },

    isInAttachmentArray111(value,arr1,arr2) {
      let arr1Obj = {};
      //判定是个数组
      arr1 = Array.isArray(arr1) ? arr1 : [];
      arr1.forEach((item) => {
        arr1Obj[item.fieldName] = item;
      });
      // console.log("arr1Obj")
      // console.log(arr1Obj)

      let arr2Obj = {};
      arr2 = Array.isArray(arr2) ? arr2 : [];
      arr2.forEach((item) => {
        arr2Obj[item.fieldName] = item;
      });

      let _arr = [];
      for(let item of value) {
        // console.log("item")
        // console.log(item)
        if(arr1Obj[item['fieldName']] || arr2Obj[item['fieldName']]) {
          // console.log("合适")
          // console.log(item['fieldName'])
          _arr.push(item['fieldName']);
          // console.log("limina de _arr")
          // console.log(_arr)
        }
      }

      // console.log("_arr")
      // console.log(_arr)

      return _arr;
    },
    isInArray(_arr,_value) {
      let arr = _arr || [];
      let _index = arr.indexOf(_value);
      return _index >= 0;
    }
  },
  watch : {
    clickType(newVal,oldVal) {

      console.log("systemTemplateDialog")
      console.log("clickType" + this.clickType)
      if(this.clickType) {
        //点击显示
        this.getTemplateInfo();
      }
      if(newVal == "report") {
        console.log("访问报告方面的接口")
        // getFields
        // getFields
      }else if(newVal == "print"){
        console.log("访问打印方面的接口")
      }
    },
    isShowSystemModal(newVal,oldVal) {
      console.log("watch isShowSystemModal")
      console.log(newVal)
      this.isShow = newVal;
    }
  }
}
</script>

<style scoped>
  .title{
    font-size: 12px;
    color: #333333;
    text-indent: 10px;
  }

  .checkbox-group{
    width: 90%;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .checkbox-item{
    /*width: 33%;*/
    margin-right: 20px;
    margin-bottom: 10px;
  }

  .scroll-content{
    padding: 10px 0px;
    max-height: 500px;
    overflow-y: auto;
  }

  .flex-el-checkbox-group{
    display: inline-flex;
    flex-wrap: wrap;
  }

</style>