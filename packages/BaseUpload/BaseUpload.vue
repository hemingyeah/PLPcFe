<template>
  <div class="base-upload">
    <div class="base-upload-wrap" v-if="allowUpload">
      <!--<el-button type="primary" @click="chooseFile" :disabled="pending">-->
        <!--<i class="el-icon-upload"> </i>-->
        <!--<span>{{pending ? '正在上传' : '点击上传'}}</span> -->
      <!--</el-button>-->

      <base-button type="primary" icon="el-icon-upload" @event="chooseFile" :disabled="pending" >{{pending ? '正在上传' : '点击上传'}}</base-button>

      <slot name="tip"></slot>
      <input type="file" ref="input" @change="handleChange" :accept="accept">
    </div>

    <slot name="preview">
      <base-preview :files="queue" @remove="remove"></base-preview>
    </slot>
  </div>
</template>

<script>
import Platform from '@src/util/Platform';
import BasePreview from '../BasePreview';
import Uploader from './uploader';
import FileConfig from '../../src/model/config/FileConfig';


export default {
  name: 'base-upload',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    accept: String,
    action: {
      type: String,
      default: '/files/upload'
    },
    limit: Number
  },
  computed: {
    queue(){
      return this.value;
    },
    allowUpload(){
      return !(this.limit && this.queue.length >= this.limit);
    }
  },
  data(){
    return {
      pending: false
    }
  },
  methods: {
    remove(file){
      this.$emit('remove', file);
    },
    chooseFile(){
      if(this.allowUpload){
        this.$refs.input.value = null;
        this.$refs.input.click();
      }
    },
    handleChange(event){
      const files = event.target.files;
      if (!files || files.length == 0) return;
      if(this.queue.length >= 9) return Platform.alert('上传文件数量不能超过9个');

      const file = files[0];
      let message = this.validateFile(file);

      if(message){
        this.$refs.input.value = null;
        Platform.alert(message);
        return;
      }

      this.pending = true;
      Uploader.upload(file, this.action).then(result => {
        if(result.status != 0){
          this.$emit('error', result);
          return;
        }

        let file = result.data;
        let item = {
          id: file.id,
          filename: file.fileName,
          //如果后端返回url,必须使用。如果后端不返回，需要拼接
          url: file.ossUrl || file.url || `/files/get?fileId=${file.id}`,
          fileSize: file.fileSizeStr
        };

        let queue = JSON.parse(JSON.stringify(this.queue));
        queue.push(item);

        this.$emit('input', queue);
      })
        .catch(err => {
          console.error(err);
          this.$emit('error', err)
        })
        .finally(() => {
          this.pending = false;
        })
    },
    validateFile(file){
      //验证文件大小
      if(file.size > FileConfig.MAX_SIZE) return '只支持小于10m的文件';

      //验证文件类型
      //let fileName = file.name;      
      //let lastDotIndex = fileName.lastIndexOf(".");
      //if(lastDotIndex < 0) return '未知的文件类型';

      //let ext = fileName.substring(lastDotIndex + 1).toLowerCase();
      //if(FileConfig.ALLOW_TYPE.indexOf(ext) < 0) return '不支持的文件类型'; 

      return null;
    }
  },
  components: {
    [BasePreview.name]: BasePreview,
    // [BaseButton.name]: BaseButton,
  }
}
</script>

<style lang="scss">

.base-upload{
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

  user-select: none;
  cursor: pointer;
  transition: backgroud-color .15s ease;

  span, i{
    color: #fff;
  }

  i{
    margin-right: 4px;
  }

}
</style>
