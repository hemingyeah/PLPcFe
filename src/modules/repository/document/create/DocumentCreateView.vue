<template>
  <div class="hello">
    <div contenteditable style="width: 100px;height: 100px; border:1px solid">123</div>
    <quill-editor
      v-model="content"
      ref="myQuillEditor"
      :options="editorOption"
      @blur="onEditorBlur($event)" 
      @focus="onEditorFocus($event)"
      @change="onEditorChange($event)"></quill-editor>

    <button @click="saveHtml">保存</button>
  </div>
</template>

<script>
import {quillEditor, Quill} from 'vue-quill-editor'
import {ImageExtend, QuillWatch} from 'quill-image-extend-module'

Quill.register('modules/ImageExtend', ImageExtend)

// 自定义字体类型
let fonts = ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif'];
let Font = Quill.import('formats/font');
Font.whitelist = fonts; // 将字体加入到白名单
Quill.register(Font, true);


// 自定义字体大小
let sizes = [false, '16px', '18px', '20px', '22px']
let Size = Quill.import('formats/size');
Size.whitelist = sizes;
Quill.register(Size, true);

import Uploader from '@src/util/uploader';

export default {
  name: 'hello-world',
  components: {quillEditor},
  data () {
    return {
      content: '<p>hello world</p>',
      id: '',
      editorOption: {
        modules: {
          ImageExtend: {
            loading: true,
            name: 'img',
            action: '/files/upload',
            response: (res) => {
              console.log(res);
              return res.info
            },
            change: (xhr, formData) => {
              console.log(xhr);
              console.log(formData);
              // formData.append('token', this.token)
            }
          },
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'], // toggled buttons
              ['blockquote', 'code-block'],
              [{'header': 1}, {'header': 2}], // custom button values
              [{'list': 'ordered'}, {'list': 'bullet'}],
              [{'script': 'sub'}, {'script': 'super'}], // superscript/subscript
              [{'indent': '-1'}, {'indent': '+1'}], // outdent/indent
              [{'direction': 'rtl'}], // text direction
              [{'size': [false, '16px', '18px', '20px', '22px']}], // custom dropdown
              [{'header': [1, 2, 3, 4, 5, 6, false]}],
              [{'color': []}, {'background': []}], // dropdown with defaults from theme
              [{'font': ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif']}],
              [{'align': []}],
              ['link', 'image', 'formula', 'video'] // 去除video即可

              // ['bold', 'italic', 'underline', 'strike'], // 加粗，斜体，下划线，删除线
              // ['blockquote', 'code-block'], // 引用，代码块
            
            
              // [{ 'header': 1 }, { 'header': 2 }], // 标题，键值对的形式；1、2表示字体大小
              // [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 列表
              // [{ 'script': 'sub'}, { 'script': 'super' }], // 上下标
              // [{ 'indent': '-1'}, { 'indent': '+1' }], // 缩进
              // [{ 'direction': 'rtl' }], // 文本方向
            
              // [{ 'size': ['small', false, 'large', 'huge'] }], // 字体大小
              // [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // 几级标题
            
            
              // [{ 'color': [] }, { 'background': [] }], // 字体颜色，字体背景颜色
              // [{ 'font': [] }], // 字体
              // [{ 'align': [] }], // 对齐方式
            
            
              // ['clean'], // 清除字体样式
              // ['image', 'video'] // 上传图片、上传视频
            
            ],
            handlers: {
              'image' () {
                console.log(this.quill.id)
                this.id = this.quill.id
                QuillWatch.emit(this.quill.id)
                console.log(document.querySelector('.quill-image-input'))
                // document.querySelector('.quill-image-input').click()
              }
            }
          }
        }
      },
      modules:{
        toolbar:[
          ['bold', 'italic', 'underline', 'strike'], // 加粗，斜体，下划线，删除线
          ['blockquote', 'code-block'], // 引用，代码块
        
          [{ 'header': 1 }, { 'header': 2 }], // 标题，键值对的形式；1、2表示字体大小
          [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 列表
          [{ 'script': 'sub'}, { 'script': 'super' }], // 上下标
          [{ 'indent': '-1'}, { 'indent': '+1' }], // 缩进
          [{ 'direction': 'rtl' }], // 文本方向
        
          [{ 'size': ['small', false, 'large', 'huge'] }], // 字体大小
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // 几级标题
        
        
          [{ 'color': [] }, { 'background': [] }], // 字体颜色，字体背景颜色
          [{ 'font': [] }], // 字体
          [{ 'align': [] }], // 对齐方式
        
        
          ['clean'], // 清除字体样式
          ['image', 'video'] // 上传图片、上传视频
        
        ],
        theme:'snow'
      }
    }
  },
  created () {
    let _that = this;
    document.addEventListener('paste', function (event) {
      // QuillWatch.emit(this.id);
      let isChrome = false;
      if ( event.clipboardData || event.originalEvent ) {
      //not for ie11   某些chrome版本使用的是event.originalEvent
        let clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
        if ( clipboardData.items ) {
          // for chrome
          let items = clipboardData.items,
            len = items.length,
            blob = null;
          isChrome = true;
          //items.length比较有意思，初步判断是根据mime类型来的，即有几种mime类型，长度就是几（待验证）
          //如果粘贴纯文本，那么len=1，如果粘贴网页图片，len=2, items[0].type = 'text/plain', items[1].type = 'image/*'
          //如果使用截图工具粘贴图片，len=1, items[0].type = 'image/png'
          //如果粘贴纯文本+HTML，len=2, items[0].type = 'text/plain', items[1].type = 'text/html'
          // console.log('len:' + len);
          // console.log(items[0]);
          // console.log(items[1]);
          // console.log( 'items[0] kind:', items[0].kind );
          // console.log( 'items[0] MIME type:', items[0].type );
          // console.log( 'items[1] kind:', items[1].kind );
          // console.log( 'items[1] MIME type:', items[1].type );

          //阻止默认行为即不让剪贴板内容在div中显示出来
          // event.preventDefault();

          //在items里找粘贴的image,据上面分析,需要循环   
          for (let i = 0; i < len; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              // console.log(items[i]);
              // console.log( typeof (items[i]));

              //getAsFile()  此方法只是living standard  firefox ie11 并不支持               
              blob = items[i].getAsFile();
            }
          }
          if ( blob !== null ) {
            let reader = new FileReader();
            reader.onload = function (event) {
              console.log(event)
              // console.log(event.target.result);
              // event.target.result 即为图片的Base64编码字符串
              let base64_str = event.target.result
              //可以在这里写上传逻辑 直接将base64编码的字符串上传（可以尝试传入blob对象，看看后台程序能否解析）
              _that.uploadImgFromPaste(base64_str, 'paste', isChrome);
            }
            reader.readAsDataURL(blob); 
          }
        } else {
          //for firefox
          setTimeout(function () {
            //设置setTimeout的原因是为了保证图片先插入到div里，然后去获取值
            let imgList = document.querySelectorAll('#tar_box img'),
              len = imgList.length,
              src_str = '',
              i;
            for ( i = 0; i < len; i ++ ) {
              if ( imgList[i].className !== 'my_img' ) {
                //如果是截图那么src_str就是base64 如果是复制的其他网页图片那么src_str就是此图片在别人服务器的地址
                src_str = imgList[i].src;
              }
            }
            _that.uploadImgFromPaste(src_str, 'paste', isChrome);
          }, 1);
        }
      } else {
        //for ie11
        setTimeout(function () {
          let imgList = document.querySelectorAll('#tar_box img'),
            len = imgList.length,
            src_str = '',
            i;
          for ( i = 0; i < len; i ++ ) {
            if ( imgList[i].className !== 'my_img' ) {
              src_str = imgList[i].src;
            }
          }
          _that.uploadImgFromPaste(src_str, 'paste', isChrome);
        }, 1);
      }
    })
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  methods: {
    ceshi () {
      console.log('ceshi')
    },
    // uploadImgFromPaste () {
    //   console.log('上传')
    // },
    uploadImgFromPaste (file, type, isChrome) {
      let formData = new FormData();
      formData.append('image', file);
      formData.append('submission-type', type);

      // let xhr = new XMLHttpRequest();
      // xhr.open('POST', '/upload_image_by_paste');
      // xhr.onload = function () {
      //   if ( xhr.readyState === 4 ) {
      //     if ( xhr.status === 200 ) {
      //       let data = JSON.parse( xhr.responseText ),
      //         tarBox = document.getElementById('tar_box');
      //       if ( isChrome ) {
      //         let img = document.createElement('img');
      //         img.className = 'my_img';
      //         img.src = data.store_path;
      //         tarBox.appendChild(img);
      //       } else {
      //         let imgList = document.querySelectorAll('#tar_box img'),
      //           len = imgList.length,
      //           i;
      //         for ( i = 0; i < len; i ++) {
      //           if ( imgList[i].className !== 'my_img' ) {
      //             imgList[i].className = 'my_img';
      //             imgList[i].src = data.store_path;
      //           }
      //         }
      //       }

      //     } else {
      //       console.log( xhr.statusText );
      //     }
      //   }
      // }
      // xhr.onerror = function (e) {
      //   console.log( xhr.statusText );
      // }
      // xhr.send(formData);
    },
    onEditorReady(editor) { // 准备编辑器
    },
    onEditorBlur(){}, // 失去焦点事件
    onEditorFocus(val, editor) {
      // console.log(val); // 富文本获得焦点时的内容
      // editor.enable(false); // 在获取焦点的时候禁用
    }, // 获得焦点事件
    onEditorChange ($event) {
      console.log($event);
    }, // 内容改变事件
    saveHtml(event){
      alert(this.content);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
