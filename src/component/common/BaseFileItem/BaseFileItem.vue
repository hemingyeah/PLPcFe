<template>
  <div class="base-file-item">
    <div :class="clazz" :style="styl" @click.prevent.stop="preview">
      <img :data-origin="file.url">
    </div>  
    <div class="base-file-info">
      <a :href="file.url" @click.prevent.stop="download">{{file.fileName || file.filename}}</a>
      <p>{{file.fileSize}}</p>
    </div>
    <button type="button" class="base-file-del" @click="deleteFile" v-if="del">
      <i class="iconfont icon-guanbi-fill"></i>
    </button>
  </div>
</template>

<script>
import platform from '@src/platform/index';

export default {
  name: "base-file-item",
  props: {
    file: {
      type: Object,
      default: () => ({})
    },
    del: {
      type: Boolean,
      default: true,
    },
  },
  computed:{
    icon(){
      let file = this.file;
      const name = file.fileName || file.filename;

      if (/\.(png|bmp|gif|jpg|jpeg|tiff)$/i.test(name)) {
        return "img";
      }
      if (/\.(ppt|pptx)$/i.test(name)) {
        return 'ppt-file-icon';
      }
      if (/\.(mp3)$/i.test(name)) {
        return 'voice-file-icon';
      }
      if (/\.(mp4)$/i.test(name)) {
        return 'video-file-icon';
      }
      if (/\.(zip)$/i.test(name)) {
        return 'zip-file-icon';
      }
      if (/\.(pdf)$/i.test(name)) {
        return 'pdf-file-icon';
      }
      if (/\.(xls|xlsx)$/i.test(name)) {
        return 'xls-file-icon';
      }
      if (/\.(doc|docx)$/i.test(name)) {
        return 'doc-file-icon';
      }
      if (/\.(txt)$/i.test(name)) {
        return 'txt-file-icon';
      }

      return 'other-file-icon';
    },
    clazz(){
      let clazz = ['base-file-preview'];

      if(this.icon != 'img'){
        clazz = clazz.concat(['base-file-icon', this.icon])
      }

      return clazz;
    },
    styl(){
      let styl = {};
  
      if(this.icon == 'img') {
        let url = `${this.file.url}${this.file.url.indexOf('?') >= 0 ? '&' : '?'}isCmp=true`;
        styl.backgroundImage = `url(${url})`;
        styl.cursor = 'pointer';
      }

      return styl;
    }
  },
  methods: {
    download(event){
      if(!this.file.url) return;

      window.location.href = window.location.origin + this.file.url;
    },
    preview(event){
      let element = event.target.querySelector('img');
      if(this.icon != 'img' || !element) return;

      let list = event.target.closest('.base-file-list');
      let images = Array.prototype.slice.call(list.querySelectorAll('img'));
      let currIndex = 0;
      let urls = images.map((item, index) => {
        if(item == element) currIndex = index;
        return window.location.origin + item.dataset.origin;
      })

      platform.imagePreview({
        imageDom: list,
        currIndex: currIndex,
        urls
      });
    },
    async deleteFile(){
      const name = this.file.fileName || this.file.filename;
      if(await platform.confirm('确定要删除该附件？\n' + name)){
        this.$emit('delete', this.file);
      }
    }
  }
}
</script>

<style lang="scss">
.base-file-item{
  display: flex;
  flex-flow: row nowrap;
  height: 44px;
  align-items: center;
  margin-bottom: 8px;

  &:hover {
    .base-file-del{
      visibility: visible;
    }
  }
}

.base-file-info {
  flex: 1;
  overflow: hidden;
  margin-left: 10px;
  @include text-ellipsis;

  & > p {
    margin: 0;
    padding: 0;
    height: 20px;
    line-height: 20px;
    color: #9a9a9a;
    font-size: 12px;
  }

  & > a{
    height: 24px;
    line-height: 24px;
    font-size: 14px;
  }
}

.base-file-preview{
  width: 44px;
  height: 44px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 4px rgba(0,0,0,.095)
}

.base-file-icon{
  background-image: url("../../../assets/img/file-icon.png");
  background-size: 44px;
}

.ppt-file-icon {
  background-position: left 0 top 0;
}
.voice-file-icon {
  background-position: left 0 top -44px;
}
.other-file-icon {
  background-position: left 0 top -88px;
}
.video-file-icon {
  background-position: left 0 top -132px;
}
.zip-file-icon {
  background-position: left 0 top -176px;
}
.pdf-file-icon {
  background-position: left 0 top -220px;
}
.xls-file-icon {
  background-position: left 0 top -264px;
}
.doc-file-icon {
  background-position: left 0 bottom -44px;
}
.txt-file-icon {
  background-position: left 0 bottom 0px;
}

.base-file-del{
  width: 34px;
  text-align: center;
  background-color: transparent;
  border: none;
  outline: none;
  padding: 0;
  visibility: hidden;

  .iconfont{
    color: #ef9f9f;
    font-size: 18px;
  }
}
</style>