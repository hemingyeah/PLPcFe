<template>
  <div class="base-preview">
    <div class="base-preview-item" v-for="file in files" :key="file.id">
      <div class="base-preview-img" v-if="isImage(file)">
        <img :src="file.url" @click.stop="preview">
      </div>
      <div class="base-preview-file" v-else><i class="iconfont icon-attachment"></i></div>

      <div class="base-preview-link"><a :href="genDownloadUrl(file)">{{file.filename}}</a> </div>
      <button type="button" v-if="!readonly" @click="remove(file)"><i class="el-icon-circle-close"></i></button>
    </div>
  </div>
</template>

<script>
import BaseGallery from '../BaseGallery';
import FileConfig from '../../src/model/config/FileConfig';

export default {
  name: 'base-preview',
  props: {
    files: {
      type: Array,
      default: () => []
    },
    readonly: Boolean
  },
  methods: {
    remove(file){
      this.$emit('remove', file);
    },
    isImage(item){
      let ext = item.filename.substring(item.filename.lastIndexOf(".") + 1).toLowerCase();
      return ext && FileConfig.IMG_TYPE.indexOf(ext) >= 0;
    },
    preview(event){
      BaseGallery.preview(event.target)
    },
    genDownloadUrl(file){
      return `/files/download?fileId=${file.id}`;
    }
  }
}
</script>

<style lang="scss">
.base-preview-item{
  padding: 2px;
  border-radius: 2px;

  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;

  &:hover{
    background-color: #fafafa;

    button{
      display: block;
    }
  }

  .base-preview-link{
    padding: 5px;
    line-height: 20px;
    margin-left: 5px;
    flex: 1;
    overflow: hidden;

    a{
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .base-preview-img{
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    
    height: 32px;
    width: 32px;
    cursor: pointer;
    background-color: #fafafa;

    img{
      display: block;
      max-width: 100%;
      max-height: 100%;
    }
  }

  .base-preview-file{
    height: 32px;
    width: 32px;
    text-align: center;
    line-height: 32px;

    .iconfont{
      font-size: 20px;
      color: #333;
    }
  }

  button{
    border: none;
    outline: none;
    background-color: transparent;
    padding: 0;
    width: 32px;
    height: 32px;
    text-align: center;
    cursor: pointer;

    color: #F56C6C;
    font-size: 16px;
    display: none;
  }
}
</style>

