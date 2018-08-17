<template>
  <div class="file-upload-container">
    <div class="file-list">
      <input type="file" ref="input" @change="handleChange" multiple>
      <div class="file-item" v-for="file in uploadedFiles" :key="file.id">
        <ui-file-item :file="file"></ui-file-item>
        <button type="button" class="base-file-del" @click="deleteFile($event,file)">
          <i class="iconfont icon-guanbi-fill"></i>
        </button>
      </div>
      <button type="button" class="base-upload-btn" @click="chooseFile" :disabled="pending">
        <!--<i class="el-icon-upload"> </i>-->
        <span>{{pending ? '正在上传' : '点击上传'}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import Uploader from './uploader';
  import UIFileItem from './UIFileItem';
  import platform from '@src/platform';

  export default {
    name: "base-file-upload",
    data: () => ({
      pending: false,
      uploadedFiles: [],
    }),
    props: {
      displayName: {
        type: String,
        default: () => '附件',
      },
      action: {
        type: String,
        default: '/files/upload',
      },
    },
    methods: {

      // handleChange(event){
      //   const files = event.target.files;
      //   if (!files || !files.length) return;
      //
      //   const file = files[0];
      //   let message = this.validateFile(file);
      //
      //   if(message){
      //     this.$refs.input.value = null;
      //     platform.alert(message);
      //     return;
      //   }
      //
      //   this.pending = true;
      //   Uploader.upload(file, this.action).then(result => {
      //     if(result.status !== 0){
      //       this.$emit('error', result);
      //       return;
      //     }
      //
      //     let file = result.data;
      //     let item = {
      //       id: file.id,
      //       fileName: file.fileName,
      //       fileSize: file.fileSizeStr,
      //       url: `/files/get?fileId=${file.id}`
      //     };
      //     this.uploadedFiles.push(item);
      //
      //     this.$emit('update-files', this.uploadedFiles);
      //   })
      //     .catch(err => {
      //       console.error(err);
      //       this.$emit('error', err)
      //     })
      //     .finally(() => {
      //       this.pending = false;
      //     })
      // },
      handleChange(event){
        const files = event.target.files;
        if(!files || !files.length) return;

        if(this.uploadedFiles.length + files.length > 9) {
          let message = '上传文件数量不能超过9个';
          let max = 9 - this.uploadedFiles.length;

          if(max > 0 && files.length < 9){
            message += `, 您还能上传${max}个文件`;
          }

          return platform.alert(message)
        }

        let message = [];
        for(let i = 0; i < files.length; i++){
          let res = this.validateFile(files[i]);
          if(res) message.push(res)
        }

        if(message.length > 0) return platform.alert(message.join('\n'));

        this.pending = true;
        // platform.showLoading('正在上传...');
        this.handleUploadFileQueue(files);
      },
      handleUploadFileQueue(files) {
        let promises = Array.prototype.slice.call(files)
          .map(file => this.upload(file));

        Promise.all(promises)
          .then((result) => {
            // filter failed file.
            const newFiles = result.filter(file => file.id) || [];

            // handle failed file
            const failedFiles = result.filter(file => !file.id) || [];
            const failedMessage = failedFiles.map(file => `[${file.fileName}]上传失败`);
            if(failedMessage.length > 0) platform.alert(failedMessage.join('\n'));
            this.uploadedFiles = [...this.uploadedFiles, ...newFiles];

            this.$emit('update-files', this.uploadedFiles);
          })
          .finally(() => {
            this.pending = false;
            // platform.hideLoading();
          })
      },
      upload(file){
        return Uploader.upload(file, this.action).then(result => {
          if(result.status == 0){
            let file = result.data;
            return {
              id: file.id,
              fileName: file.fileName,
              url: `/files/get?fileId=${file.id}`,
              fileSize: file.fileSizeStr,
            };
          }
          return {
            fileName: file.name,
          };
        })
          .catch((error) => {
            console.error(error);
            // 处理失败的上传，不至于影响所有的上传。
            return {
              fileName: file.name,
            };
          })
      },
      async deleteFile(event, file) {
        if(!file) return;
        if(!await platform.confirm('确定要删除该附件？\n' + file.fileName, '' ,2)) return;
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.$emit('update-files', this.uploadedFiles);
      },
      chooseFile(){
        if(this.pending) return platform.alert('请等待文件上传完成');
        if(this.uploadedFiles.length >= 9) return platform.alert('上传文件数量不能超过9个');

        this.$refs.input.value = null;
        this.$refs.input.click();
      },
      validateFile(file){

        const MAX_SIZE = 10 * 1024 * 1024;
        //验证文件大小
        if(file.size > MAX_SIZE) return '只支持小于10m的文件';

        //验证文件类型
        let fileName = file.name;
        let lastDotIndex = fileName.lastIndexOf(".");
        if(lastDotIndex < 0) return `[${fileName}]的文件类型未知，系统暂不支持上传`;

        //let ext = fileName.substring(lastDotIndex + 1).toLowerCase();
        //if(FileConfig.ALLOW_TYPE.indexOf(ext) < 0) return '不支持的文件类型';
        return null;
      }
    },
    components: {
      [UIFileItem.name]: UIFileItem,
    }
  }
</script>

<style lang="scss" scoped>
  .file-upload-container {
    display: flex;
    justify-content: start;

    input[type='file']{
      display: none;
    }

    .base-upload-btn{
      display: inline-block;
      line-height: 1;

      margin: 0;
      padding: 8px 10px;
      font-size: 14px;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;

      border-radius: 2px;
      border: none;
      outline: none;
      color: #fff;
      background-color: #409EFF;

      user-select: none;
      cursor: pointer;
      transition: backgroud-color .15s ease;

      span, i{
        color: #fff;
      }

      i{
        margin-right: 4px;
      }

      &:hover,
      &:focus{
        background: #66b1ff;
        color: #fff;
      }

      &:disabled{
        background: #66b1ff;
        cursor: not-allowed;
      }

      &:active{
        background: #3a8ee6;
        color: #fff;
      }
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      width: 400px;
      .ui-file-item-container {
        width: 90%;
      }
    }
    .base-file-del{
      width: 34px;
      text-align: right;
      background-color: transparent;
      border: none;
      outline: none;
      padding: 0;

      .iconfont{
        display: block;
        background: #ef9f9f;
        width: 18px;
        height: 18px;
        margin: 0 auto;
        /*color: #ef9f9f;*/
        /*font-size: 18px;*/
        /*margin-right: 1px;*/
      }
    }
  }

</style>