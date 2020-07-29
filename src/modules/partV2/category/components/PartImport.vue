<template>
  <el-dialog :visible.sync="visible" width="600px">   
    <span class="base-import-title" slot="title">{{title}}批量更新 <slot name="explain"></slot></span>    
    <div class="import-step">
      <slot name="tip">
        <template v-if="selected.length > 0">
          <span>1、您已经选择{{selected.length}}条{{title}}数据</span>
          <a @click="downloadData" href="javascript:;">下载</a>
        </template>
        <template v-else>
          <span>1、您未选择数据,</span>
          <a :href="templateBlankUrl">下载</a>
          <span>空白模板</span>
        </template>
        <!-- <span v-else>1、您已经选择视图全部数据{{total}}条</span>     -->
      </slot>
    </div>
    <div class="base-import-file">
      <slot name="next">2、上传修改后批量更新文件</slot>
      <p>{{fileName}}</p>
      <el-button type="primary" @click="choose" :disabled="pending">上传</el-button>
      <input type="file" ref="file" @change="change"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
    </div>
    
    <div class="base-import-error" v-if="errors.length > 0">
      <h5>数据未能导入，请修正后重新导入。</h5>
      <p v-for="(err, index) in errors" :key="index">{{err}}</p>
    </div>

    <div slot="footer">
      <button type="button" class="btn btn-text" @click="visible = false">关闭</button>
      <el-button type="primary" :disabled="pending" @click="upload" :loading="pending">{{pending ? '正在导入' : '确定'}}</el-button>
    </div>

    <div class="part-export-bridge" ref="bridge"></div>

  </el-dialog>
</template>

<script>
import Uploader from 'packages/BaseUpload/uploader';
import Platform from '@src/util/Platform';
import http from '@src/util/HttpUtil';
import DateUtil from '@src/util/DateUtil';  

export default {
  name: 'part-import',
  props: {
    templateUrl: String,
    templateBlankUrl: String, // 空白模板url
    action: String,
    title: {
      type: String,
      default: ''
    },
    selected:{
      type: Array,
      default: []
    },
    total:{
      type: Number,
      default: 0
    },
    templateParams: {
      type: [Object, Array],
      default: () => ({})
    }
  },
  data(){
    return {
      fileName: '',
      visible: false,
      pending: false,
      file: null,
      errors: []
    }
  },
  methods: {
    open(){
      this.pending = false;
      this.file = null;
      this.fileName = '';
      this.errors = [];

      this.visible = true;
    },
    choose(){
      this.$refs.file.value = null;
      this.$refs.file.click();
    },
    change(event){
      const files = event.target.files;
      if (!files || files.length == 0) return;
      let file = files[0];

      this.errors = [];
      this.fileName = file.name;
      this.file = file
    },
    upload(){
      if(null == this.file || !(this.file instanceof File)) return Platform.alert(`请选择要导入的文件`);
      this.$confirm('更新成功后将无法恢复，是否确认?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.pending = true;
        return Uploader.upload(this.file, this.action, {validateStorage: false})
      }).then(result => {
        if(result.status == 0){
          let message = '操作成功！';
          if(result.data && result.data.total) message += `共更新了${result.data.total}条数据。`;

          Platform.alert(message);
          this.visible = false;
          this.$emit('success');
        }else{
          let data = result.data || [];
          this.errors = data;
        }
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        this.pending = false;
      })
    },
    downloadData() {
      // /partV2/category/export/update/template?
      let params = this.templateParams;
      let fileName = `${DateUtil.format(new Date(),'yyyy-MM-dd')}备件数据.xlsx`;

      http.post(this.templateUrl, params, true, {responseType: 'blob'})
        .then(blob => {
          let link = document.createElement('a');
          let url = URL.createObjectURL(blob);
          link.download = fileName;
          link.href = url;
          this.$refs.bridge.appendChild(link);
          link.click();

          setTimeout(() => {
            URL.revokeObjectURL(url);
            this.$refs.bridge.removeChild(link);
          }, 150);
        })
        .catch(err => console.error(err))
    }
  }
}
</script>


<style lang="scss">
.base-import-title{
  display: inline-block;
  min-width: 80px;
  margin-right: 10px;
  line-height: 20px;
  font-size: 16px;
  color: #303133;
}

.import-step{
  margin-bottom:15px;
  line-height:32px;
}
.download-btn{
  text-decoration: none !important;
  border-radius:5px;
  padding:3px 15px;
  color:#606266 !important;
  font-size: 12px;
  border: 1px solid #d5d5d5;
  background-color: #f0f0f0;
  margin-left:20px;
}

.base-import-warn{
  padding: 5px 10px;
  border-radius: 2px;
  background-color: #fdf6ec;
  color: #e6a23c;
  margin-bottom: 15px;
}


.base-import-file{
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 15px;
  line-height:32px;

  &:last-child{
    margin-bottom: 5px;
  }
  p {
    flex: 1;
    line-height: 24px;
    padding: 3px 6px;

    border: 1px solid #d5d5d5;
    background-color: #f0f0f0;
    border-right: none;
    margin: 0;
    border-radius: 2px 0 0 2px;
  }

  .el-button{
    border-radius: 0 2px 2px 0;
  }

  input[type='file']{
    display: none;
  }
}

.base-import-error{
  max-height: 400px;
  overflow: auto;
  h5{
    font-size: 15px;
    margin: 0;
    line-height: 30px;
    font-weight: 500;
    color: red;
  }

  p{
    margin: 0;
    line-height: 24px;
    word-break: break-all;
  }
}
.title-explain{
  margin: 0;
  padding-left: 20px;
}

.part-export-bridge{
  position: absolute;
  top: -1000px;
  left: -1000px;

  a{
    display: block;
    border: none;
    outline: none;
    width: 0;
    height: 0;
  }
}
</style>
