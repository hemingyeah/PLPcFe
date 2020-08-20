<template>

  <base-modal
      :title=" uploadTemplateType == 'report' ? '设置服务报告自定义模板' : '设置打印自定义模板'"
      describe="使用前，请阅读使用说明" width="700px" class="form-select-setting-modal"
      @cancel="cancel"
      :show.sync="isShow" :mask-closeable="false">


    <span slot="describe" class="describe-text" @click="describeClick">使用前，请阅读使用说明</span>



    <div class="upload-content">
      <div class="upload-content-line">
        <p class="upload-content-desc">1、下载此工单类型的标识对应表</p>
        <button type="button" class="btn btn-primary" @click="downloadTemplate">下载</button>
      </div>
      <div class="upload-content-line">
        <p class="upload-content-desc">2、上传打印模板</p>
        <base-upload @input="input" :value="value" :isShowOperateContent="isShowOperateContent"></base-upload>
      </div>
      <p class="note-text">注：上传的模板仅支持[xlsx]格式的文件</p>
    </div>

    <template slot="footer">
      <button type="button" class="btn btn-primary" @click="close">关闭</button>
    </template>
  </base-modal>

</template>

<script>
import {getTaskTemplate,savePrintTemplate,saveReportTemplate} from "@src/api/TaskApi";
import platform from "@src/platform";
export default {
  name: "TemplateUploadDialog",
  props: {
    id : {
      type : String,
      default: ""
    },
    isShowUploadModal: {
      type: Boolean,
      default: false,
    },
    uploadTemplateType : {
      type : String,
      default: ""
    },
    reportSetting: {
      type: Object,
      default: {},
    },
    printSetting : {
      type : Object,
      default: {}
    }
  },
  data() {
    return {
      isShow : false,
      value : [],
      isShowOperateContent : true
    }
  },
  methods : {
    cancel(res) {
      console.log("cancal")
      this.$emit("hideModal")
      //将后台拿到的数据全部清空

    },
    close() {
      console.log("点击下方关闭按钮");
      this.cancel();
    },
    input(newValue) {
      console.log("baseupload的input事件")
      console.log(newValue)
      console.log("uploadTemplateType")
      console.log(this.uploadTemplateType)
      if(newValue.length) {
        this.uploadTemplate();
      }else{
        this.deleteTemplate(newValue);
      }
      // let oldValue = null;
      // this.$emit('update', {newValue, oldValue, field: this.field});
      // this.$emit('input', newValue);
    },
    async downloadTemplate() {
      console.log("下载模板")
      console.log(this.id);
      // getTaskTemplate({typeId:this.id}).then(res => {
      //   console.log("----")
      //   console.log(res)
      // });

      let a = document.createElement("a");
      a.href = `/setting/taskType/getTemplateDic?typeId=${this.id}`;
      a.click();

    },
    uploadTemplate(newValue) {
      let _size = (newValue.size/1024).toFixed(2) + "KB";
      let p_templates = [
        {id:newValue.id,filename:newValue.fileName,url:newValue.ossUrl,fileSize:_size}
      ];

      let _obj = {
        typeId:this.id,
        p_templates
      }

      this.didUpload(_obj);
    },
    deleteTemplate() {
      let _obj = {typeId:this.id};
      this.didUpload(_obj);
    },
    async didUpload(_obj) {
      let result;
      if(this.uploadTemplateType == "report") {
        result = await saveReportTemplate(_obj);
      }else if(this.uploadTemplateType == "print") {
        result = await savePrintTemplate(_obj);
      }
      if(result.status == 1){
        platform.alert(result.message);
      }
    },
    describeClick() {
      // window.location.href = 'https://www.yuque.com/shb/help/custom_report';
      window.open('https://www.yuque.com/shb/help/custom_report')
    },
  },
  watch : {
    isShowUploadModal(newVal,oldVal) {
      this.isShow = newVal;
    },
    uploadTemplateType(newVal,oldVal) {
      // console.log("watch uploadTemplateType")
      // console.log(newVal)
      // console.log(this.reportSetting)
      if(newVal == "report") {
        console.log("报告模板")
        console.log(this.reportSetting)
        this.value = this.reportSetting.templates;
      }else if(newVal == "print"){
        console.log("打印模板11111")
        console.log(this.printSetting)
        this.value = this.printSetting.templates;
      }
      console.log(this.value);
    },
    reportSetting(newVal,oldVal) {
      console.log("reportSetting")
      console.log(newVal)
    },
    printSetting(newVal,oldVal) {
      console.log("printSetting")
      console.log(newVal)
    },
    value(newVal,oldVal) {
      console.log("value")
      console.log(newVal)
      if(newVal.length) {
        this.isShowOperateContent = false;
      }else{
        this.isShowOperateContent = true;
      }
    }
  },
}
</script>

<style scoped>
.upload-content{
  padding: 20px;
}
.upload-content-line{
  display: flex;
  align-items: end;
  margin-bottom: 10px;
}
.upload-content-desc{
  margin-right: 20px;
  font-size: 14px;
  color: #333333;
}
.note-text{
  font-size: 13px;
  color: #ff0000;
}
</style>