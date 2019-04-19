<template>
  <div class="base-file-item">
    <template v-if="size === 'normal'">
      <div :class="clazz" :style="styl" @click.prevent.stop="preview">
        <img v-if="isImage" :data-origin="file.url" :alt="file.filename">
      </div>
      <div class="base-file-info">
        <a :href="genDownloadUrl(file.url)" @click.prevent.stop="download">{{file.filename}}</a>
        <p>
          <span>{{file.fileSize}}</span>
          <button type="button" class="btn-text base-file-del" @click="deleteFile" v-if="!readonly">删除</button>
        </p>
      </div>
    </template>

    <!-- 用于添加备注 -->
    <template v-else>
      <div :class="clazz" :style="styl" @click.prevent.stop="preview">
        <img v-if="isImage" :data-origin="file.url" :alt="file.filename">
      </div>
      <div class="base-file-info">
        <a :href="genDownloadUrl(file.url)" @click.prevent.stop="download">{{file.filename}}</a>
        <button type="button" class="btn-text base-file-del" @click="deleteFile" v-if="!readonly">
          <i class="iconfont icon-circle-delete" style="position: relative;top: 1px"></i>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import platform from '@src/platform/index';

export default {
  name: 'base-file-item',
  props: {
    file: {
      type: Object,
      default: () => ({})
    },
    /** 是否只读，如果为true，不允许删除操作 */
    readonly: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'normal',
    }
  },
  computed:{
    icon(){
      let file = this.file;
      let icon = '';
      const name = file.filename;

      if (/\.(png|bmp|gif|jpg|jpeg|tiff)$/i.test(name)) {
        icon = 'img';
      } else if (/\.(ppt|pptx)$/i.test(name)) {
        icon = 'ppt-file-icon';
      } else if (/\.(mp3)$/i.test(name)) {
        icon = 'voice-file-icon';
      } else if (/\.(mp4)$/i.test(name)) {
        icon = 'video-file-icon';
      } else if (/\.(zip)$/i.test(name)) {
        icon = 'zip-file-icon';
      } else if (/\.(pdf)$/i.test(name)) {
        icon = 'pdf-file-icon';
      } else if (/\.(xls|xlsx)$/i.test(name)) {
        icon = 'xls-file-icon';
      } else if (/\.(doc|docx)$/i.test(name)) {
        icon = 'doc-file-icon';
      } else if (/\.(txt)$/i.test(name)) {
        icon = 'txt-file-icon';
      } else {
        icon = 'other-file-icon';
      }

      if (this.size === 'small') {
        icon = `small-${ icon }`;
      }

      return icon;
    },
    clazz(){
      let clazz = ['base-file-preview'];

      if(!this.isImage){
        clazz = clazz.concat(['base-file-icon', this.icon])
      }

      if (this.size === 'small') {
        clazz = clazz.concat(['small-base-file-preview', 'small-base-file-icon'])
      }

      return clazz;
    },
    styl(){
      let styl = {};

      if(this.isImage) {
        // TODO: 支持缩略图 
        let url = `${this.file.url}${this.file.url.indexOf('?') >= 0 ? '&' : '?'}isCmp=true`;
        styl.backgroundImage = `url(${url})`;
        styl.cursor = 'pointer';
      }

      return styl;
    },
    // 是否为图片
    isImage(){
      return this.icon === 'img' || this.icon === 'small-img';
    }
  },
  methods: {
    genDownloadUrl(url){
      return `/files/download?ossurl=${encodeURIComponent(url)}`
    },
    download(event){
      if(!this.file.url) return;
      window.location.href = this.file.url;
    },
    preview(event){
      let element = event.target.querySelector('img');
      if(!this.isImage || !element) return;

      let list = event.target.closest('.base-file__preview');
      let images = Array.prototype.slice.call(list.querySelectorAll('img'));

      let currIndex = 0;
      let urls = images.map((item, index) => {
        if(item == element) currIndex = index;
        return item.dataset.origin;
      });

      platform.imagePreview({
        imageDom: list,
        currIndex,
        urls
      });
    },
    async deleteFile(){
      const name = this.file.filename;
      if(await platform.confirm(`确定要删除该附件？\n${ name }`)){
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
    //color: $text-color-regular;
    color: $text-color-primary;
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

.small-base-file-preview {
  width: 20px;
  height: 20px;

}

.base-file-icon{
  background-image: url("../../../assets/img/file-icon.png");
  background-size: 38px;
}

.small-base-file-icon{
  background-size: 20px;
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

// small
.small-ppt-file-icon {
  background-position: left 0 top 0;
}
.small-voice-file-icon {
  background-position: left 0 top -20px;
}
.small-other-file-icon {
  background-position: left 0 top -40px;
}
.small-video-file-icon {
  background-position: left 0 top -60px;
}
.small-zip-file-icon {
  background-position: left 0 top -80px;
}
.small-pdf-file-icon {
  background-position: left 0 top -100px;
}
.small-xls-file-icon {
  background-position: left 0 top -120px;
}
.small-doc-file-icon {
  background-position: left 0 bottom -20px;
}
.small-txt-file-icon {
  background-position: left 0 bottom 0px;
}

.base-file-del{
  margin-left: 5px;
  padding: 0;
  visibility: hidden;
  color: #9a9a9a;

  &:hover{
    color: #ed3f14;
    .iconfont {
      color: #ed3f14;
    }
  }
}
</style>
