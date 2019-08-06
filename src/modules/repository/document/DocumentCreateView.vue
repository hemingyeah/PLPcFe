<template>
  <div class="hello">
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
import {container, ImageExtend, QuillWatch} from 'quill-image-extend-module'

Quill.register('modules/ImageExtend', ImageExtend)

export default {
  name: 'hello-world',
  components: {quillEditor},
  data () {
    return {
      content: '<p>hello world</p>',
      editorOption: {
        modules: {
          ImageExtend: {
            loading: true,
            name: 'img',
            action: '',
            response: (res) => {
              return res.info
            }
          },
          toolbar: {
            container: [
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
            handlers: {
              'image' () {
                console.log(this.quill.id)
                QuillWatch.emit(this.quill.id)
                console.log(document.querySelector('.quill-image-input'))
                document.querySelector('.quill-image-input').click()
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
    document.addEventListener('paste', function (event) {
      console.log(event) 
    })
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  methods: {
    onEditorReady(editor) { // 准备编辑器
    },
    onEditorBlur(){}, // 失去焦点事件
    onEditorFocus(val, editor) {
      // console.log(val); // 富文本获得焦点时的内容
      // editor.enable(false); // 在获取焦点的时候禁用
    }, // 获得焦点事件
    onEditorChange(){}, // 内容改变事件
    saveHtml(event){
      alert(this.content);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
