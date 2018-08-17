<template>
  <div class="ui-file-item-container">
    <a :href="file.url" @click.prevent.stop="preview($event, file)">
      <div class="img" v-if="judgedFileType(file) === 'img'" :style="{ backgroundImage: `url(${file.url})`,}">
        <img class="img-for-preview" :src="file.url" alt="">
      </div>
      <div v-else class="file-type" :class="judgedFileType(file)"></div>
      <div class="file-info">
        <p>{{file.fileName}}</p>
        <p class="file-size">{{file.fileSize}}</p>
      </div>
    </a>
  </div>
</template>

<script>
  import BaseGallery from '../BaseGallery/index';
  import platform from '@src/platform/index';

  export default {
    name: "ui-file-item",
    props: {
      file: {
        type: Object,
      }
    },
    methods: {
      judgedFileType(file) {
        if (/\.(png|bmp|gif|jpg|jpeg|tiff)$/i.test(file.fileName)) {
          return "img";
        }
        if (/\.(ppt|pptx)$/i.test(file.fileName)) {
          return 'ppt-file-icon';
        }
        if (/\.(mp3)$/i.test(file.fileName)) {
          return 'voice-file-icon';
        }
        if (/\.(mp4)$/i.test(file.fileName)) {
          return 'video-file-icon';
        }
        if (/\.(zip)$/i.test(file.fileName)) {
          return 'zip-file-icon';
        }
        if (/\.(pdf)$/i.test(file.fileName)) {
          return 'pdf-file-icon';
        }
        if (/\.(xls|xlsx)$/i.test(file.fileName)) {
          return 'xls-file-icon';
        }
        if (/\.(doc|docx)$/i.test(file.fileName)) {
          return 'doc-file-icon';
        }
        if (/\.(txt)$/i.test(file.fileName)) {
          return 'txt-file-icon';
        }

        return 'other-file-icon';
      },
      preview(event,file){
        if(!file || !file.url) return;
        let currUrl = window.location.origin + file.url;
        if (this.judgedFileType(file) !== 'img') {
          // download
          return platform.openLink(currUrl);
        }
        // image preview
        let images = this.$el.querySelectorAll('.img-for-preview');
        platform.imagePreview({
          imageDom: images[0],
          imgUrl: currUrl,
        });
      },
    }
  }
</script>

<style lang="scss" scoped>
   .ui-file-item-container{
    height: 44px;
    line-height: 44px;
    display: flex;
    flex-flow: row nowrap;
    box-sizing: content-box;
    /*padding: 5px 0;*/
    padding-bottom: 5px;
    justify-content: space-between;

    a{
      flex-grow: 1;
      display: flex;
      width: 90%;
      height: 100%;
      overflow: hidden;
      white-space:nowrap;
      text-overflow:ellipsis;
      text-decoration: none;

      .img {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        overflow: hidden;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        .img-for-preview {
          display: none;
        }
      }

      .file-type {
        height: 44px;
        width: 44px;
        background-repeat: no-repeat;
        background-image: url("../../assets/img/file-icon.png");
        background-size: 44px;
        border-radius: 4px;
        overflow: hidden;
      }

      .file-type.ppt-file-icon {
        background-position: left 0 top 0;
      }
      .file-type.voice-file-icon {
        background-position: left 0 top -44px;
      }
      .file-type.other-file-icon {
        background-position: left 0 top -88px;
      }
      .file-type.video-file-icon {
        background-position: left 0 top -132px;
      }
      .file-type.zip-file-icon {
        background-position: left 0 top -176px;
      }
      .file-type.pdf-file-icon {
        background-position: left 0 top -220px;
      }
      .file-type.xls-file-icon {
        background-position: left 0 top -264px;
      }
      .file-type.doc-file-icon {
        background-position: left 0 bottom -44px;
      }
      .file-type.txt-file-icon {
        background-position: left 0 bottom 0px;
      }

      .file-info {
        width: 80%;
        padding-left: 15px;
        p {
          margin: 0;
          overflow: hidden;
          padding: 0;
          height: 22px;
          line-height: 22px;
          @include text-ellipsis;
        }

        .file-size {
          color: #999;
        }
      }
    }
  }

</style>