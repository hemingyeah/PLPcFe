<template>
  <div class="base-upload-container">
    <input type="file" ref="input" @change="handleChange" :multiple="multiple">

    <div class="base-file-list" >
      <base-file-item v-for="file in uploadedFiles" :key="file.id" :file="file" @delete="deleteFile"></base-file-item>        
    </div>
    
    <button type="button" class="base-upload-btn" @click="chooseFile" :disabled="pending" :id="forId">
      <span>{{pending ? '正在上传' : '点击上传'}}</span>
    </button>
  </div>
</template>

<script>
  import Uploader from './uploader';
  import BaseFileItem from './BaseFileItem';
  import platform from '@src/platform';

  export default {
    name: "base-upload",
    data: () => ({
      pending: false,
      uploadedFiles: []
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
      multiple: {
        type: Boolean,
        default: true
      },
      forId: {
        type: String,
        default: ''
      }
    },
    methods: {
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
        this.handleUploadFileQueue(files);
      },
      async handleUploadFileQueue(files) {
        try {
          let promises = Array.prototype.slice.call(files).map(file => this.upload(file));

          let result = await Promise.all(promises) || [];
          // filter failed file.
          const newFiles = result.filter(file => file.id);

          // handle failed file
          const failedMessage = result.filter(file => !file.id).map(file => `[${file.fileName}]上传失败`);
          if(failedMessage.length > 0) platform.alert(failedMessage.join('\n'));

          this.uploadedFiles = this.uploadedFiles.concat(newFiles);
          this.$emit('input', this.uploadedFiles);
        } catch (error) {
          console.log(error)
        }
      
        this.pending = false;
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
      async deleteFile(file) {
        let index = this.uploadedFiles.indexOf(file);
        if(index >= 0) {
          this.uploadedFiles.splice(index, 1);
          this.$emit('input', this.uploadedFiles);
        }
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
        if(file.size > MAX_SIZE) return '只支持小于10MB的文件';

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
      [BaseFileItem.name]: BaseFileItem
    }
  }
</script>

<style lang="scss" >
.base-upload-container {
  input[type='file']{
    display: none;
  }
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
  background-color: $color-primary;

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
    background: #33bdac;
  }

  &:disabled{
    background: #33bdac;
    cursor: not-allowed;
  }

  &:active{
    background: #009b88;
  }
}
</style>