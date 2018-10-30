<template>
  <div class="base-file-item">
    <div :class="clazz" :style="styl" @click.prevent.stop="preview">
      <img v-if="isImage" :data-origin="file.url" :alt="file.filename">
    </div>  
    <div class="base-file-info">
      <a :href="file.url" @click.prevent.stop="download">{{file.filename}}</a>
      <p> 
        <span>{{file.fileSize}}</span> 
        <button type="button" class="btn-text base-file-del" @click="deleteFile" v-if="!readonly">删除</button>
      </p>
    </div>
  </div>
</template>

<script>
//TODO: 识别更多类型的文件
import platform from '@src/platform/index';

export default {
  name: "base-file-item",
  props: {
    file: {
      type: Object,
      default: () => ({})
    },
    /** 是否只读，如果为true，不允许删除操作 */
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed:{
    icon(){
      let file = this.file;
      const name = file.filename;

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
    },
    //是否为图片
    isImage(){
      return this.icon == 'img';
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

      let list = event.target.closest('.base-file__preview');
      let images = Array.prototype.slice.call(list.querySelectorAll("img"));

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
      const name = this.file.filename;
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
  align-items: center;
  margin-bottom: 4px;

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
  line-height: 1;

  & > p {
    margin: 0;
    padding: 0;
    line-height: 18px !important;
    color: $text-color-secondary;
    font-size: 12px;
  }

  & > a{
    color: $text-color-regular;
    line-height: 20px !important;;
    font-size: 14px;
    display: inline-block;

    &:hover{
      color: $color-primary;
    }
  }
}

.base-file-preview{
  width: 38px;
  height: 38px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 4px rgba(0,0,0,.095);

  img{
    display: none;
  }
}

.base-file-icon{
  background-image: url("../../../assets/img/file-icon.png");
  background-size: 38px;
}

.ppt-file-icon {
  background-position: left 0 top 0;
}
.voice-file-icon {
  background-position: left 0 top -38px;
}
.other-file-icon {
  background-position: left 0 top -76px;
}
.video-file-icon {
  background-position: left 0 top -114px;
}
.zip-file-icon {
  background-position: left 0 top -152px;
}
.pdf-file-icon {
  background-position: left 0 top -190px;
}
.xls-file-icon {
  background-position: left 0 top -228px;
}
.doc-file-icon {
  background-position: left 0 bottom -38px;
}
.txt-file-icon {
  background-position: left 0 bottom 0px;
}

.base-file-del{
  margin-left: 5px;
  padding: 0;
  visibility: hidden;
  color: #9a9a9a;

  &:hover{
    color: #ed3f14;
  }
}
</style>