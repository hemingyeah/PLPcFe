<template>
  <div class="base-editor-container">
    <div id="toolbar"></div>
    <div id="editor" v-loading="loading" ref="editor"></div>
    <!-- 上传图片 -->
    <input type="file" ref="imgInput" class="input-file" @change="handleChange($event,'image')" accept="image/*">
    <!-- 上传视频 -->
    <input type="file" ref="videoInput" class="input-file" @change="handleChange($event,'video')" accept="video/*">
  </div>
</template>

<script>
import Quill from 'quill'
import Uploader from '@src/util/uploader';
import platform from '@src/platform';

import './style.scss';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

// 这里引入修改过的video/img标签模块并注册
import Video from './videoOptions';
import ImageBlot from './imgOptions';
Quill.register(Video, true)
Quill.register(ImageBlot, true)

//toolbar
import { toolbarOptions } from './defaultOptions';

/**
 * todo
 * 1、样式
 * 2、文件容量验证
 * 3、自动暂存
 *
 *
 * 参考：
 * 1、直接剪切板粘贴上传图片的前端JS实现：https://www.zhangxinxu.com/wordpress/2018/09/ajax-upload-image-from-clipboard/
 * 2、api：https://quilljs.com/docs/api
 * 3、node_modules/quill/dist/quill.js line:6781
 */

export default {
  name: 'base-editor',
  props: {
    toolbarOptions: {
      type: Array,
      default: () => toolbarOptions
    },
    action: {
      type: String,
      default: '/files/upload',
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
    value: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false 
    }
  },
  data() {
    return {
      editor: null,
      pending: false,
      loading: false,
      isInit: false,
    }
  },
  mounted() {
    if(!this.isEdit) this.initEditor();
  },
  methods: {
    initEditor () {
      const _self = this;
      this.editor = new Quill('#editor', {
        modules: {
          toolbar: {
            container: _self.toolbarOptions,
            handlers: {
              image() {
                _self.chooseFile('image'); // 上传图片 1、选择文件；2、上传；3、appendChild
              },
              video() {
                 _self.chooseFile('video'); //上传视频
                
              },
            }
          },
        },
        placeholder: _self.placeholder,
        theme: 'snow'
      });
      // init value
      this.editor.clipboard.dangerouslyPasteHTML(0, this.value);

      this.editor.on('text-change', this.update); 
      document.addEventListener('paste', this.handlerPaste);
    },
    update(delta, oldDelta, source) {
      // delta 推荐的数据格式，为了兼容旧数据，文档的内容还是直接保存html
      let html = this.editor.container.firstChild.innerHTML;

      this.$emit('input', html)
    },
    chooseFile(uploadType){
      if(this.pending) return platform.alert('请等待图片上传完成');
   
      if(uploadType == 'image'){
        this.$refs.imgInput.value = null;
        this.$refs.imgInput.click();
      }else{
        this.$refs.videoInput.value = null;
        this.$refs.videoInput.click();
      }
     
    },
    //TODO:image 上传图片 video上传视频
    handleChange(event,uploadType){
      let imgType = uploadType == 'image'?'图片':'视频';
      const files = event.target.files;
      if(!files || !files.length) return;

      const file = files[0];
      if (!file) return;
      if (file.size > Uploader.FILE_MAX_SIZE) return platform.alert(`系统暂不支持大小超过10M的${imgType}上传`)

      this.pending = true;
      this.loading = true;
      Uploader.upload(file, this.action)
        .then(res => {
          this.pending = false;
          this.loading = false;

          if (res.status) return platform.alert(res.message || `${imgType}上传失败`);
          this.insertImage(res.data,uploadType);
        })
        .catch(err => {
          this.pending = false;
          this.loading = false;
          console.error(err)
        })
    },
    handlerPaste(event) {
      try {
        let items = event.clipboardData && event.clipboardData.items;
        let file = null;
        if (items && items.length) {
          let length = items.length;

          if(items.length > 2 && items[length - 1].type.indexOf('image') !== -1) {
            length = length - 1;
          }
          
          let indexStart = 0;
          if(items.length == 2 && items[length - 1].type.indexOf('image') !== -1 && items[0].kind == 'string') {
            indexStart = 1;
            event.preventDefault();
          }

          // 检索剪切板items
          for (let i = indexStart; i < length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              file = items[i].getAsFile();
              this.handleChange({
                target: {
                  files: [file]
                }
              });
              break;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
      
      // 此时file就是剪切板中的图片文件
    },
    genUrl({fileSizeStr, ossUrl}) {
      let size = Number(fileSizeStr.replace(/[a-z A-Z]/gi, ''));   

      // 1M 以下不压缩
      if (/kb/gi.test(fileSizeStr) || !size) return ossUrl;

      const existParams = ossUrl.indexOf('?') >= 0;
       
      if (size > 3) return existParams ? `${ ossUrl }&x-oss-process=image/resize,p_50` : `${ ossUrl }?x-oss-process=image/resize,p_50`;
      if (size > 1) return existParams ? `${ ossUrl }&x-oss-process=image/resize,p_70` : `${ ossUrl }?x-oss-process=image/resize,p_70`;
      return ossUrl;
    },
    insertImage(data,uploadType) {
      let range = this.editor.getSelection();
      let index = range.index || 0;
      let ossUrl = uploadType == 'image' ? this.genUrl(data) : data.ossUrl;
      if(uploadType == 'image'){
        console.log("ossUrl",ossUrl)
        this.editor.insertEmbed(index, 'image',{ src: ossUrl ,'origin': ossUrl})
      }else{
        this.editor.insertEmbed(index, uploadType, ossUrl);
      }

      this.editor.setSelection(index + 1, 0);
    },

    /**
     * 获取编辑器 文本内容
     */
    getText () {
      return this.editor.getText();
    },
    /**
     * 判断否为含有效内容
     */
    hasValidText () {
      let text = this.getText() || '';
      let reg = /\s+/g;

      let res = text.replace(reg, '');
      return res && res.length > 0;
    },

  },
  beforeDestroy() {
    document.removeEventListener('paste', this.handlerPaste);
    this.editor.off('text-change', this.update);
  },
  watch: {
    value (n) {
      if(this.isEdit && !this.isInit) {
        this.isInit = true;
        this.initEditor();
      }
    }
  }
}
</script>

<style lang="scss">

  .base-editor-container {
    background: #fff;
    font-size: 14px !important;

    .ql-editor {
      height: 400px;
    }

    .ql-editor.ql-blank::before {
      font-style: normal;
      color: #B3B7C1;
      font-size: 14px;
    }

    .input-file {
      display: none;
    }
  }
  .ql-container {
    font-size: 14px !important;
  }
</style>