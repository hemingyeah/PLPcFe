<template>

  <base-modal
      title='自定义模板' width="700px" class="form-select-setting-modal"
      @cancel="cancel"
      :show.sync="isShow" :mask-closeable="false">

    <div class="upload-content">
      <div class="upload-content-line">
        <p>1、下载此工单类型的标识对应表</p>
        <p>下载</p>
      </div>
      <div class="upload-content-line">
        <p>2、上传打印模板</p>
        <base-upload @input="input" :value="value" :for-id="`form_${field.fieldName}`" :placeholder="placeHolder"></base-upload>
      </div>

    </div>

    <template slot="footer">
      <button type="button" class="btn btn-primary" @click="close">关闭</button>
    </template>
  </base-modal>

</template>

<script>
export default {
  name: "TemplateUploadDialog",
  props: {
    isShowUploadModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShow : false
    }
  },
  methods : {
    cancel(res) {
      console.log("cancal")
      this.$emit("hideModal",{templateType : "system",})
      //将后台那台的数据全部清空

    },
    close() {
      console.log("点击下方关闭按钮")
    },
    input(newValue) {
      console.log("baseupload的input事件")
      console.log(newValue)
      // let oldValue = null;
      // this.$emit('update', {newValue, oldValue, field: this.field});
      // this.$emit('input', newValue);
    }
  },
  watch : {
    isShowUploadModal(newVal,oldVal) {
      console.log("watch isShowSystemModal")
      console.log(newVal)
      this.isShow = newVal;
    }
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
  border: 1px solid red;
}
</style>