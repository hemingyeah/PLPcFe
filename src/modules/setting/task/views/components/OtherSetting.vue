<template>
  <div class="other-setting-container">
    <div class="setting-item">
      <h2>回执其他设置</h2>
      <div class="setting-line">
        <div class="title-line">
          <p class="p-title">允许修改工单费用折扣</p>
          <p class="p-desc">如果启用该选项，允许工单负责人修改工单折扣费</p>
        </div>
        <div>
          <el-checkbox-group v-model="taskPrice">
            <el-checkbox label="修改单品价格" data-value="editUnitPrice" data-name="editUnitPrice" @change="modifyState()"></el-checkbox>
            <el-checkbox label="修改工单总折扣价" data-value="showDiscountCost" data-name="showDiscountCost" @change="modifyState()"></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="setting-line">
        <div>
          <div class="title-line">
            <p class="p-title">发送服务报告</p>
            <p class="p-desc">可在PC端或移动端针对完成的工单生成电子服务报告</p>
          </div>
          <el-switch style="float: right;margin-right: 30px;"
              v-model="reportForm.isReport"
              active-text="开启"
              inactive-text="禁用">
          </el-switch>
        </div>
        <transition name="fade">
          <div v-if="reportForm.isReport">
            <el-radio-group v-model="reportForm.templateSelect">
              <div style="display: inline-block;margin-right: 30px;">
                <el-radio :label="0">使用系统模板</el-radio>
                <button type="button" class="btn btn-primary" :disabled="reportForm.templateSelect == 1">设置字段</button>
              </div>
              <div style="display: inline-block;">
                <el-radio :label="1">上传自己的模板</el-radio>
                <button type="button" class="btn btn-primary" :disabled="reportForm.templateSelect == 0">配置</button>
              </div>

            </el-radio-group>
          </div>
        </transition>
      </div>
      <div class="setting-line">
        <div>
          <div class="title-line">
            <p class="p-title">启用打印功能</p>
            <p class="p-desc">可以在PC端打印工单信息</p>
          </div>
          <el-switch style="float: right;margin-right: 30px;"
                     v-model="printForm.isPrint"
                     active-text="开启"
                     inactive-text="禁用">
          </el-switch>
        </div>
        <transition name="fade">
          <div v-if="printForm.isPrint">
          <el-radio-group v-model="printForm.templateSelect">
            <div style="display: inline-block;margin-right: 30px;">
              <el-radio :label="0">使用系统模板</el-radio>
              <button type="button" class="btn btn-primary" :disabled="printForm.templateSelect == 1">设置字段</button>
            </div>
            <div style="display: inline-block;">
              <el-radio :label="1">上传自己的模板</el-radio>
              <button type="button" class="btn btn-primary" :disabled="printForm.templateSelect == 0">配置</button>
            </div>
          </el-radio-group>
        </div>
        </transition>
      </div>
    </div>


    <div class="setting-item">
      <h2>回执合规设置</h2>
      <div class="setting-line">
        <div>
          <div class="title-line">
            <p class="p-title">启用拍照设置</p>
            <p class="p-desc">开启后，上传照片时只可现场拍摄上传，将不能够在相册选择并进行上传</p>
          </div>
          <el-switch style="float: right;margin-right: 30px;"
                     v-model="cameraForm.attUploadLimitMobile"
                     active-text="开启"
                     inactive-text="禁用">
          </el-switch>
        </div>
      </div>
      <transition name="fade">
        <div class="setting-line" v-if="cameraForm.attUploadLimitMobile">
        <div>
          <div class="title-line">
            <p class="p-title">照片水印设置</p>
            <p class="p-desc">开启后，照片将在
              <el-select v-model="cameraForm.watermarkPosition" placeholder="请选择水印位置">
                <el-option
                    v-for="(item,index) in waterMarkDirection"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
              </el-select>
              自动浮现水印说明以下信息</p>
          </div>
          <el-switch style="float: right;margin-right: 30px;"
                     v-model="cameraForm.photoWatermark"
                     active-text="开启"
                     inactive-text="禁用">
          </el-switch>
        </div>
        <el-select v-model="cameraForm.watermarkContent" multiple style="width: 40%" placeholder="请选择所需展示信息">
          <el-option
              v-for="(item,index) in photoInfoArr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </div>
      </transition>
      <div class="setting-line">
        <div>
          <div class="title-line">
            <p class="p-title">位置异常提示</p>
            <p class="p-desc">开启后，在以下节点时若负责人超出工单距离
              <el-input v-model="cameraForm.exceptionRange" style="width: 100px;" placeholder="请输入距离"></el-input>
              公里，将在工单流程中提示位置异常
              </p>
          </div>
          <el-switch style="float: right;margin-right: 30px;"
                     v-model="cameraForm.positionExceptionFlag"
                     active-text="开启"
                     inactive-text="禁用">
          </el-switch>
        </div>
        <el-select v-model="cameraForm.exceptionFlagFlows" multiple style="width: 40%" placeholder="请选择">
          <el-option
              v-for="(item,index) in processArr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import {getTaskType,modifyOption} from "@src/api/TaskApi";

export default {
  name: 'other-setting',
  data() {
    return {
      //TODO: id后期需要动态获取
      id : 1,
      taskForm : {
        "editUnitPrice" : "修改单品价格",
        "showDiscountCost" : "修改工单总折扣价"
      },
      taskPrice : [],
      reportForm : {
        isReport : true,
        templateSelect : 0,
      },
      printForm : {
        isPrint : true,
        templateSelect : 0,
      },
      cameraForm : {
        attUploadLimitMobile : true,
        photoWatermark : true,
        watermarkPosition : "",
        watermarkContent : [],
        positionExceptionFlag : true,
        exceptionRange : "",
        exceptionFlagFlows : []
      },
      waterMarkDirection : [
        {label : "左上", value : "topLeft"},
        {label : "左下", value : "bottomLeft"},
        {label : "右上", value : "topRight"},
        {label : "右下", value : "bottomRight"},
      ],
      photoInfoArr : [
        {label : "操作人姓名", value : "name"},
        {label : "拍摄时间", value : "time"},
        {label : "拍摄地点", value : "position"},
      ],
      processArr : [
        {label : "开始", value : "start"},
        {label : "完成", value : "finish"}
      ]
    }
  },
  created() {
    this.getTaskType();
  },
  methods: {
    async getTaskType() {
      //工单回执其他模块设置信息回显
      let baseInfo = await getTaskType({id : this.id});
      console.log("------")
      console.log(baseInfo);
      if(!baseInfo.status) {
        let {data} = baseInfo;
        this.taskPrice = [];
        this.filterPrice("editUnitPrice",data.options.editUnitPrice);
        this.filterPrice("showDiscountCost",data.options.showDiscountCost);

        this.reportForm.isReport = data.options.serviceReport == null || data.options.serviceReport;
        if(data.options.srSysTemplate == null || data.options.srSysTemplate) {
          this.reportForm.templateSelect = 0;
        }else if(data.options.srSysTemplate != null && !data.options.srSysTemplate) {
          this.reportForm.templateSelect = 1;
        }

        this.printForm.isPrint = data.options.printTask == null || data.options.printTask;
        if(data.options.ptSysTemplate == null || data.options.ptSysTemplate) {
          this.printForm.templateSelect = 0;
        }else if(data.options.ptSysTemplate != null && !data.options.ptSysTemplate) {
          this.printForm.templateSelect = 1;
        }

        Object.assign(this.cameraForm,data.config.positionExceptionConfig);

      }

    },
    filterPrice(key,value) {
      console.log("key" + key)
      console.log("value" + value)
      if (value) this.taskPrice.push(this.taskForm[key]);
    },
    filterSelect(key,value) {

    },
    modifyState(e) {
      console.log("具体的变化");
      console.log(e)
    }
  },
}
</script>

<style lang="scss">

.other-setting-container {
  background: #fff;
  margin-top: 30px;
  margin-bottom: 10px;
  padding: 10px;

  h2 {
    font-size: 16px;
    font-weight: 500;
  }

  .setting-item {
    padding-left: 15px;
    line-height: 30px;
    padding-top: 10px;
    border-top: 1px solid #dddddd;
    padding-bottom: 30px;

    .setting-line{
      margin-top: 10px;
    }

    .title-line{
      display: inline-block;
    }

    .p-title{
      margin-right: 10px;
      font-size: 14px;
      font-weight: 600;
      display: block;
    }

    .p-desc{
      color: #333333;
      font-size: 12px;
    }

  }

}

.fade-enter{
  opacity: 0;
}
.fade-enter-to{
  opacity: 1;
}
.fade-enter-active{
  transition: opacity 0.3s;
}
.fade-leave{
  opacity: 1;
}
.fade-leave-to{
  opacity: 0;
}
.fade-leave-active{
  transition: opacity 0.3s;
}


</style>