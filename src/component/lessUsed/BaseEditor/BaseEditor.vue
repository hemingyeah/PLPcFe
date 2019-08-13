<template>
  <div class="base-editor-container">
    <div id="toolbar"></div>
    <div id="editor" v-loading="loading"></div>

    <input type="file" ref="input" class="input-file" @change="handleChange" accept="image/png, image/gif, image/jpeg, image/bmp, image/x-icon">
  </div>
</template>

<script>
import Quill from 'quill'
import Uploader from '@src/util/uploader';
import platform from '@src/platform';

import './style.scss';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

import {toolbarOptions} from './defaultOptions';

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
    }
  },
  data() {
    return {
      editor: null,
      pending: false,
      loading: false,
    }
  },
  mounted() {
    const _self = this;
    this.editor = new Quill('#editor', {
      modules: {
        toolbar: {
          container: _self.toolbarOptions,
          handlers: {
            image() {
              _self.chooseFile(); // 1、选择文件；2、上传；3、appendChild
            }
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
  methods: {
    update(delta, oldDelta, source) {
      // delta 推荐的数据格式，为了兼容旧数据，文档的内容还是直接保存html
      let html = this.editor.container.firstChild.innerHTML;

      this.$emit('input', html)
    },
    chooseFile(){
      if(this.pending) return platform.alert('请等待图片上传完成');
      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    handleChange(event){
      const files = event.target.files;
      if(!files || !files.length) return;

      const file = files[0];
      if (!file) return;
      if (file.size > Uploader.FILE_MAX_SIZE) return platform.alert('系统暂不支持大小超过10M的图片上传')

      this.pending = true;
      this.loading = true;
      Uploader.upload(file, this.action)
        .then(res => {
          this.pending = false;
          this.loading = false;

          if (res.status) return platform.alert(res.message || '图片上传失败');
          this.insertImage(res.data);
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

          // 检索剪切板items
          for (let i = 0; i < length; i++) {
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
    insertImage(data) {
      let range = this.editor.getSelection();
      let index = range.index || 0;

      this.editor.insertEmbed(index, 'image', data.ossUrl);
      this.editor.setSelection(index + 1, 0);
    },
  },
  beforeDestroy() {
    document.removeEventListener('paste', this.handlerPaste);
    this.editor.off('text-change', this.update);
  },
}
</script>

<style lang="scss">

  .base-editor-container {
    background: #fff;
    font-size: 14px !important;

    .ql-editor {
      // min-height: 300px;
      height: calc(100vh - 500px);
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