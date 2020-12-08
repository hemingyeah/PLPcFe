<template>
  <div class="base-upload-container">
    <input type="file" ref="input" @change="handleChange" :multiple="multiple" :accept="accept">

    <div class="base-file-list base-file__preview" >
      <base-file-item v-for="file in value" :key="file.id" :file="file" @delete="deleteFile"></base-file-item>        
    </div>
    <div class="base-upload-operation">
      <button type="button" class="btn btn-primary base-upload-btn" @click="chooseFile" :disabled="pending" :id="forId" v-if="allowUpload">
        <i class="iconfont icon-loading" v-if="pending"></i>
        <span>{{pending ? '正在上传' : '点击上传'}}</span>
      </button>
      <p class="base-upload-placeholder" v-if="placeholder">{{placeholder}}</p>
    </div>
  </div>
</template>

<script>
import Uploader from '@src/util/uploader';
import platform from '@src/platform';

export default {
  name: 'base-upload',
  data(){
    return {
      pending: false
    }
  },
  props: {
    limit: {
      type: Number,
      default: Uploader.FILE_MAX_NUM,
    },
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
    },
    value: {
      type: Array,
      default: () => ([])
    },
    placeholder: {
      type: String,
      default: ''
    },
    isShowOperateContent : {
      type: Boolean,
      default: true
    },
    fileType : {
      type : String,
      default: null
    },
    accept: {
      type: String,
      default: ""
    }
  },
  computed: {
    allowUpload(){
      return !(this.limit && this.queue.length >= this.limit);
    },
    queue(){
      return this.value;
    },
  },
  methods: {
    chooseFile(){
      if(!this.allowUpload) return console.warn('Caused: dont chooseFile, because of this.allowUpload is false');
      if(this.pending) return platform.alert('请等待文件上传完成');
      if(this.value.length >= Uploader.FILE_MAX_NUM) {
        return platform.alert(`上传文件数量不能超过${Uploader.FILE_MAX_NUM}个`);
      }

      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    handleChange(event){
      const files = event.target.files;
      if(!files || !files.length) return;
      
      let allFilesLength = this.value.length + files.length;

      if(allFilesLength > Uploader.FILE_MAX_NUM) {
        let message = `上传文件数量不能超过${Uploader.FILE_MAX_NUM}个`;
        let max = Uploader.FILE_MAX_NUM - this.value.length;

        if(max > 0 && files.length < Uploader.FILE_MAX_NUM){
          message += `, 您还能上传${max}个文件`;
        }

        return platform.alert(message)
      }

      if(this.fileType) {
        //需要做文件类型校验
        for (let item of files) {
          let _fileName = item.name;
          if (!_fileName.includes(Uploader.fileTypeObj[this.fileType]["fileName"])) {
            //没有匹配到
            this.$platform.notification({
              title: '文件上传失败',
              message: Uploader.fileTypeObj[this.fileType]["errMsg"],
              type: 'error',
            })
            return false;
          }
        }
      }

      if(allFilesLength > this.limit) {
        return platform.alert(`上传文件数量不能超过${this.limit}个`);
      }

      this.pending = true;
      Uploader.batchUploadWithParse({files, action: this.action}).then((result = {}) => {
        let {success, error} = result;

        if(error && Array.isArray(error) && error.length > 0){
          let message = error.map(item => item.message).join('\n');
          // 此处不能return
          platform.alert(message)
        }

        if(success && Array.isArray(success) && success.length > 0){
          let value = this.value.concat(success);
          this.$emit('input', value);
        }
      })
        .catch(err => console.error(err))
        .then(() => this.pending = false)
    },
    async deleteFile(file) {
      let index = this.value.indexOf(file);
      if(index >= 0) {
        this.value.splice(index, 1);
        this.$emit('input', this.value);
      }
    }
  }
}
</script>

<style lang="scss" >
.base-upload-container {
  overflow: hidden;
  input[type='file']{
    display: none !important;
  }
}

.base-upload-btn{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  min-width: auto;
  
  span{
    color: #fff;
  }

  .icon-loading{
    color: #fff;
    font-size: 18px;
    width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    display: block;
    margin-right: 5px;
    animation: rotating 2s linear infinite;
  }
}

.base-upload-operation{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  .btn-primary {
    background-color: $color-primary !important;
  }

}

.base-upload-placeholder{
  width: 100%;
  color: #9a9a9a;
  margin: 0 0 0 8px;
  font-size: 14px;
  @include text-ellipsis(); 
}
</style>