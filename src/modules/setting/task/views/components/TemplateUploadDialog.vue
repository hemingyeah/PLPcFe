<template>

  <base-modal
      :title=" uploadTemplateType == 'report' ? '设置服务报告自定义模板' : '设置打印自定义模板'"
      describe="使用前，请阅读使用说明" width="700px" class="form-select-setting-modal"
      @cancel="cancel"
      @describeClick="describeClick"
      :show.sync="isShow" :mask-closeable="false">



    <div class="upload-content">
      <div class="upload-content-line">
        <p class="upload-content-desc">1、下载此工单类型的标识对应表</p>
        <button type="button" class="btn btn-primary" @click="downloadTemplate">下载</button>
      </div>
      <div class="upload-content-line">
        <p class="upload-content-desc">2、上传打印模板</p>
<!--        <base-upload @input="input" :value="value" :for-id="`form_${field.fieldName}`" :placeholder="placeHolder"></base-upload>-->
        <base-upload @input="input" :value="value"></base-upload>
      </div>
      <p class="note-text">注：上传的模板仅支持[xlsx]格式的文件</p>
    </div>

    <template slot="footer">
      <button type="button" class="btn btn-primary" @click="close">关闭</button>
    </template>
  </base-modal>

</template>

<script>
import {getTaskTemplate} from "@src/api/TaskApi";
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
      value : []
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
      }else if(newVal == "print"){
        console.log("打印模板")
        console.log(this.printSetting)
      }
    },
    reportSetting(newVal,oldVal) {
      console.log("reportSetting")
      console.log(newVal)
    },
    printSetting(newVal,oldVal) {
      console.log("printSetting")
      console.log(newVal)
    },
  },
  computed: {
    placeHolder() {
      return `${!this.field.isNull ? ' + 添加' : ''}${this.field.placeHolder || '点击上传文件'}`;
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
  align-items: baseline;
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