<template>
  <base-modal
      :title="clickType == 'report' ? '设置服务报告系统模板' : '设置打印系统模板'" width="700px" class="form-select-setting-modal"
      @cancel="cancel"
      :show.sync="isShow" :mask-closeable="false">


    <div class="scroll-content" v-loading.fullscreen.lock="loadingCheck">
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
            <!--          工单信息附件类型-->
            <el-checkbox-group class="flex-el-checkbox-group" v-model="attachmentTasklistCheck">
              <template v-for="item in taskList" v-if="item.formType == 'attachment'">
                <div class="checkbox-item">
                  <el-checkbox :label=item.fieldName :value=item.fieldName name="attachment_Fields">工单-{{item.displayName}}</el-checkbox>
                </div>
              </template>
            </el-checkbox-group>

<!--            回执附件-->
            <el-checkbox-group class="flex-el-checkbox-group" v-model="receiptAttachmentsCheck">
              <!--          回执附件-->
              <div class="checkbox-item" v-if="showReceiptAttachment ">
                <el-checkbox label="receiptAttachment" value="receiptAttachment" name="attachment_Fields">回执-回执附件</el-checkbox>
              </div>
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
import {getTaskTemplateFields, getFields, taskSettingSave, getTaskCardDetailList, getTaskType, saveSystemReport,saveSystemPrint} from '@src/api/TaskApi';
import TeamDetailView from "@src/modules/team/views/TeamDetailView";
import platform from "@src/platform";
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
    id : {
      type : String,
      default: ""
    }
  },
  data() {
    return {
      isShow : false,
      loadingCheck : false,
      taskList : [],
      receiptList : [],
      cardDetailList : [],
      //回显设置
      reviewSetting: {
        attachmentFields: {}
      },
      //复选组里被选中的值
      //公司信息
      companyCheck : [],
      //客户信息
      userCheck : [],
      //工单信息
      orderCheck : [],
      //回执信息
      receiptCheck : [],
      //附加组件勾选信息(二位数组)
      additionalCheck : [],
      showReceiptAttachment : false,

      attachmentTasklistCheck : [],
      attachmentReceiptCheck : [],
      attachmentReceiptListCheck : [],
      receiptAttachmentsCheck : [],
      attachmentCardDetailListCheck : [],
      //附加组件数组的最外层id数组(提交时候使用)
      cardDetailCardIdList : [],
      //附加信息attachmentFields提交时需要的数据
      attachmentFieldsObj : {
        multipleCardInfoAttachments : [],
        singleCardInfoAttachments : [],
        taskAttachments : {},
        receiptAttachments : {},
      }


    }
  },
  methods : {
    async getTemplateInfo() {
      this.loadingCheck = true;
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
      this.showReceiptAttachment = result.data.options.showAttachment;
      //创建工单组件时的配置
      let firstFields = await getFields({ tableName: 'task', typeId:this.id});
      this.taskList = firstFields;
      for(let item of this.taskList) {
        this.attachmentFieldsObj.taskAttachments[item.fieldName] = {
          fieldName: item.fieldName,
          displayName: item.displayName
        };
      }
      //回执组件的配置
      let secondFields = await getFields({ tableName: 'task_receipt', typeId:this.id});
      let msg = [];
      msg = secondFields.filter(item => {
        return item.enabled == 1
      });
      this.receiptList = msg;
      console.log("receiptList")
      console.log(this.receiptList)
      for(let item of this.receiptList) {
        this.attachmentFieldsObj.receiptAttachments[item.fieldName] = {
          fieldName: item.fieldName,
          displayName: item.displayName
        };
      }

      //附加组件的配置
      let thirdFields = await getTaskCardDetailList({typeId:this.id});
      this.cardDetailList = thirdFields;

      this.loadingCheck = false;

      console.log("cardDetailList")
      console.log(this.cardDetailList)

      for(let item of this.cardDetailList) {
        this.cardDetailCardIdList.push(item.cardId);
      }
      this.setCheckArr();
    },
    async submit() {
      console.log("保存系统模板配置");

      let result;
      if(this.clickType == "report") {
        //服务报告
        let reportSetting = this.handleData("reportSetting");
        result = await saveSystemReport({id:this.id,reportSetting});
      }else if(this.clickType == "print") {
        //打印
        let printSetting = this.handleData('printSetting');
        result = await saveSystemPrint({id:this.id,printSetting});
      }
      if(result.status == 0){
        platform.alert("保存成功");
        this.cancel();
      }else{
        platform.alert("保存失败");
      }
    },
    handleData(type) {
      let _outObj = {};
      //公司信息
      _outObj.tenantFields = this.companyCheck;
      //客户信息
      _outObj.customerFields = this.userCheck;
      //工单信息
      _outObj.taskFields = this.orderCheck;
      //回执信息
      _outObj.receiptFields = this.receiptCheck;
      //附加组件
      let cardFields = [];
      for(let item in this.additionalCheck) {
        let _obj = {
          cardId : this.cardDetailCardIdList[item],
          fields : this.additionalCheck[item]
        };
        cardFields.push(_obj);
      }
      _outObj.cardFields = cardFields;
      //最下方附件信息
      let attachmentFields = {
        taskAttachments : [],
        receiptAttachments : [],
        singleCardInfoAttachments : [],
        multipleCardInfoAttachments : []
      };

      console.log("最后的")

      for(let item of this.attachmentTasklistCheck) {
        if(this.attachmentFieldsObj.taskAttachments[item].fieldName == item) {
          attachmentFields.taskAttachments.push(this.attachmentFieldsObj.taskAttachments[item]);
        }
      }
      for(let item of this.receiptAttachmentsCheck) {
        if(this.attachmentFieldsObj.receiptAttachments[item].fieldName == item) {
          attachmentFields.receiptAttachments.push(this.attachmentFieldsObj.receiptAttachments[item]);
        }
      }
      for(let item in this.attachmentCardDetailListCheck) {
        //获取附件信息选中数组
        console.log(this.cardDetailList[item])
        let {cardId,cardName,inputType} = this.cardDetailList[item];
        for(let selectItem of this.attachmentCardDetailListCheck[item]) {
          //获取附件信息选中数组每一组的值
          for(let cardItem of this.cardDetailList[item].fields) {
            //查看后端返回的每个附件信息的信息
            console.log(cardItem)
            if(cardItem.fieldName == selectItem) {
              let _obj = {
                cardId,
                cardName,
                displayName: cardItem.displayName,
                fieldName: cardItem.fieldName
              };
              if(inputType == "single") {
                attachmentFields.singleCardInfoAttachments.push(_obj);
              }else if(inputType=="multiple") {
                attachmentFields.multipleCardInfoAttachments.push(_obj);
              }
            }
          }
        }
      }

      _outObj.attachmentFields = attachmentFields;

      return _outObj;

    },
    cancel(res) {
      console.log("cancal")
      this.$emit("hideModal")
      //将后台拿到的数据全部清空

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
      // let cardFields = this.reviewSetting.cardFields;
      // for(let item of cardFields) {
      //   this.additionalCheck.push(item.fields);
      // }

      for(let item of this.cardDetailList) {
        let _arr = [];
        //按照cardDetailList来循环
        for(let cardItem of this.reviewSetting.cardFields) {
          if(item.cardId == cardItem.cardId) {
            _arr = cardItem.fields;
          }
        }
        this.additionalCheck.push(_arr);
      }



    },
    setAttachmentCheck() {
      //工单信息附件类型
      this.attachmentTasklistCheck = this.isInAttachmentArray111(this.taskList,this.reviewSetting.attachmentFields.taskAttachments);
      this.attachmentReceiptCheck = this.isInAttachmentArray111([{fieldName:"receiptAttachment"}],this.reviewSetting.attachmentFields.receiptAttachments)
      let _filterReceiptList = this.receiptList.filter(item => {
        return item.formType == 'attachment';
      })
      this.attachmentReceiptListCheck = this.isInAttachmentArray111(_filterReceiptList,this.reviewSetting.attachmentFields.receiptAttachments);
      this.receiptAttachmentsCheck = [...this.attachmentReceiptCheck,...this.attachmentReceiptListCheck];
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