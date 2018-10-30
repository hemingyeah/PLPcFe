<template>
  <div class="base-upload-container">
    <input type="file" ref="input" @change="handleChange" :multiple="multiple">

    <div class="base-file-list base-file__preview" >
      <base-file-item v-for="file in value" :key="file.id" :file="file" @delete="deleteFile"></base-file-item>        
    </div>
    
    <button type="button" class="btn btn-primary base-upload-btn" @click="chooseFile" :disabled="pending" :id="forId">
      <i class="iconfont icon-loading" v-if="pending"></i>
      <span>{{pending ? '正在上传' : '点击上传'}}</span>
    </button>
  </div>
</template>

<script>
import Uploader from '@src/util/uploader';
import platform from '@src/platform';

export default {
  name: "base-upload",
  data(){
    return {
      pending: false
    }
  },
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
    },
    value: {
      type: Array,
      default: () => ([])
    }
  },
  methods: {
    chooseFile(){
      if(this.pending) return platform.alert('请等待文件上传完成');
      if(this.value.length >= Uploader.FILE_MAX_NUM) {
        return platform.alert(`上传文件数量不能超过个${Uploader.FILE_MAX_NUM}`);
      }
        
      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    handleChange(event){
      const files = event.target.files;
      if(!files || !files.length) return;

      if(this.value.length + files.length > Uploader.FILE_MAX_NUM) {
        let message = `上传文件数量不能超过${Uploader.FILE_MAX_NUM}个`;
        let max = 9 - this.value.length;

        if(max > 0 && files.length < 9){
          message += `, 您还能上传${max}个文件`;
        }

        return platform.alert(message)
      }

      this.pending = true;
      Uploader.batchUploadWithParse(files, this.action).then(result => {
        let {success, error} = result;

        if(error.length > 0){
          let message = error.map(item => item.message).join('\n');
          //此处不能return
          platform.alert(message)
        }

        if(success.length > 0){
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
  
  span{
    color: #fff;
    margin-left: 5px;
  }

  .icon-loading{
    color: #fff;
    font-size: 18px;
    width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    display: block;
    animation: rotating 2s linear infinite;
  }
}
</style>