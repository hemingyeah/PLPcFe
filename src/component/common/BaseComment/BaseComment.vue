<template>
  <div 
    class="base-comment" :class="{'base-comment-focus': editorFocus}" 
    @keydown.enter.stop="enterDown" tabindex="0">
    <div class="base-comment-inner">
      <textarea 
        ref="editor" 
        class="base-comment-editor" :style="editorCalcStyle"
        placeholder="请输入内容 (Alt + Enter 快速提交)" 
        maxlength="500"
        :value="form.content" @input="inputContent"
        @focus="editorFocus = true" @blur="editorFocus = false"/>
      <div class="base-comment-attachment base-file__preview" v-if="form.attachments.length > 0">
        <base-file-item v-for="file in form.attachments" :key="file.id" :file="file" @delete="deleteFile"></base-file-item>
      </div>
      <div class="base-comment-footer">
        <div class="base-comment-toolbar">
          <button type="button" class="base-comment-tool" @click="chooseFile">
            <i class="iconfont icon-attachment"></i> 附件
          </button>
          <span class="base-comment-err" v-if="errMessage">{{errMessage}}</span>
        </div>
        <div class="base-comment-action">
          <el-checkbox v-model="form.showInOwn" :true-label="1" :false-label="0">仅自己可见</el-checkbox>
          <button 
            type="button" class="btn btn-text btn-primary base-comment-submit" 
            @click="submit" :disabled="!allowOperate"><i class="iconfont icon-send"></i> 发送</button>
        </div>
      </div>
    </div>
    <input type="file" ref="input" @change="handleChange" multiple>
    <div class="base-comment-cover" v-if="!allowOperate">
      <div class="base-comment-loading"></div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Uploader from '@src/util/uploader';
import Validator from '@src/util/validator';
import calcTextareaHeight from './calcTextareaHeight';
import platform from '@src/platform';

export default {
  name: 'base-comment',
  props: {
    /** 是否禁用该组件，如果禁用不触发submit */
    disabled: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      editorCalcStyle: {
        height: '58px',
        minHeight: '58px'
      },

      errMessage: '',
      editorFocus: false,
      pending: false,
      form: this.buildForm()
    }
  },
  computed: {
    allowOperate(){
      return !this.disabled && !this.pending
    }
  },
  methods: {
    resizeTextarea() {
      if (this.$isServer) return;
      const { autosize, type } = this;
      if (type !== 'textarea') return;
      if (!autosize) {
        this.textareaCalcStyle = {
          minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
        };
        return;
      }
      const minRows = autosize.minRows;
      const maxRows = autosize.maxRows;

      this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
    },
    validateContent(content){
      let field = {isNull: 0, formType: 'textarea', displayName: '内容'};
      return Validator.validate(this.form.content, field).then(validateRes => {
        this.errMessage = validateRes;
        return this.errMessage;
      })
    },
    inputContent(event){
      let value = event.target.value;
      this.form.content = value;
      //计算输入框大小
      this.editorCalcStyle = calcTextareaHeight(this.$refs.editor, 2, 8);
      //验证输入内容
      if(value) this.validateContent(this.form.content);
    },
    /** 按下回车后，检测是否按住alt键，如果同时按住alt+enter提交表单 */
    enterDown(event){
      if(!event.altKey) return;
      this.submit();
    },
    async submit(){
      if(!this.allowOperate) return;
      if(this.$refs.editor) this.$refs.editor.blur();

      //去除前后空白
      let form = _.cloneDeep(this.form);
      form.content = form.content.trimEnd();
      
      if(!await this.validateContent(this.form.content)) this.$emit('submit', form)
    },
    buildForm(){
      return {
        content: '',
        attachments: [],
        showInOwn: 0
      }
    },
    chooseFile(){
      if(this.pending) return platform.alert('请等待文件上传完成');
      if(this.form.attachments.length >= Uploader.FILE_MAX_NUM) {
        return platform.alert(`上传文件数量不能超过个${Uploader.FILE_MAX_NUM}`);
      }
        
      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    handleChange(event){
      const files = event.target.files;
      if(!files || !files.length) return;

      let form = this.form;

      if(form.attachments.length + files.length > Uploader.FILE_MAX_NUM) {
        let message = `上传文件数量不能超过${Uploader.FILE_MAX_NUM}个`;
        let max = 9 - form.attachments.length;

        if(max > 0 && files.length < 9){
          message += `, 您还能上传${max}个文件`;
        }

        return platform.alert(message)
      }

      this.pending = true;
      Uploader.batchUploadWithParse(files).then(result => {
        let {success, error} = result;

        if(error.length > 0){
          let message = error.map(item => item.message).join('\n');
          //此处不能return
          platform.alert(message)
        }

        if(success.length > 0){
          form.attachments = form.attachments.concat(success);
        }
      })
      .catch(err => console.error(err))
      .then(() => this.pending = false)
    },
    async deleteFile(file) {
      let index = this.form.attachments.indexOf(file);
      if(index >= 0) {
        this.form.attachments.splice(index, 1);
      }
    },
    reset(){
      this.form = this.buildForm();
      this.editorCalcStyle = {height: '58px',minHeight: '58px'};
      this.focus()
    },
    focus(){
      if(this.autofocus && this.$refs.editor) this.$refs.editor.focus();
    }
  },
  activated(){
    this.focus();
  }
}
</script>

<style lang="scss">
.base-comment{
  position: relative;
  border: 1px solid #ccc;
  border-radius: 2px;
  z-index: 8;
  outline: none;

  input[type='file']{
    display: none !important;
  }
  
  &:hover{
    border-color: $input-border-hover-color;
  }

  &:focus,
  &.base-comment-focus{
    border-color: $color-primary !important;
  }
}

.base-comment-editor{
  border: none;
  resize: none;
  display: block;
  margin: 0;
  width: 100%;
  padding: 5px 8px;
  line-height: 24px; 
  height: 84px;
}

.base-comment-footer{
  padding: 0 8px 5px 8px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
}

.base-comment-tool{
  height: 24px;
  margin: 0;
  padding: 0;
  line-height: 24px;
  background-color: transparent;
  border: none;
  outline: none;
  color: #9a9a9a;
  transition: color ease .3s;
  font-size: 14px;

  &:hover{
    color: $color-primary;
  }
  
  i.iconfont{
    font-size: 14px;
  }
}

.base-comment-action{
  display: flex;
  flex-flow: row;
  align-items: center;

  .el-checkbox{
    margin: 0 10px 0 0;

    .el-checkbox__label{
      padding-left: 5px;
      color: #9a9a9a;
    }
  }
}

.base-comment-submit{
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  padding: 3px 16px;
  border-radius: 2px;
}

.base-comment-cover{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  cursor: not-allowed;
  background-color: rgba(245,245,245,.65);
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.base-comment-attachment{
  padding: 8px;

  .base-file-item:last-child{
    margin-bottom: 0;
  }
}

.base-comment-loading{
  width: 30px;
  height: 30px;
  border: 2px solid #fff;
  background-color: transparent;
  border-top-color: $color-primary !important;
  border-radius: 50%;

  animation: rotating 1.5s linear infinite;
}

.base-comment-err{
  margin-left: 10px;
  color: $color-danger;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}
</style>
