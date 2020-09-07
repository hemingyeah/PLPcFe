<template>
  <div 
    class="base-comment" :class="{'base-comment-focus': editorFocus}" 
    @keydown.enter.stop="enterDown" tabindex="0">
    <div class="base-comment-inner">

      <!-- start textarea -->
      <textarea 
        ref="editor" 
        class="base-comment-editor" :style="editorCalcStyle"
        :placeholder="`${placeholder} (Alt + Enter 快速提交)`" 
        maxlength="500"
        :value="form.content" @input="inputContent"
        @focus="editorFocus = true" 
        @blur="editorFocus = false"
      />
      <!-- start textarea -->

      <!-- start 附件列表 -->
      <div class="base-comment-attachment base-file__preview" v-if="form.attachments.length > 0">
        <base-file-item v-for="file in form.attachments" :key="file.id" :file="file" @delete="deleteFile" size="small"></base-file-item>
      </div>
      <!-- end 附件列表 -->

      <!-- start 底部操作 -->
      <div class="base-comment-footer">
        <div class="base-comment-toolbar">
          <button type="button" class="base-comment-tool" @click="chooseFile">
            <i class="iconfont icon-attachment"></i> 附件
          </button>
          <span class="base-comment-err" v-if="errMessage">{{errMessage}}</span>
        </div>
        
        <!-- start 操作组 -->
        <div class="base-comment-action">

          <!-- start 模板列表 -->
          <el-select
            v-if="showSelectTemplate"
            :value="template"
            placeholder="从备注模板中选择"
            @input="selectTemplateChange"
          >
            <el-option
              v-for="item in templateListOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <!-- end 模板列表 -->

          <el-checkbox v-model="form.showInOwn" @input="showInOwnChangeHandler" :disabled="checkboxDisabled.showInOwn" :true-label="1" :false-label="0">仅自己可见</el-checkbox>
          <template v-if="showCustomerAction">
            <el-checkbox v-model="form.toCustomer" @input="toCustomerChangeHandler" :disabled="checkboxDisabled.toCustomer" :true-label="1" :false-label="0">仅客户可见</el-checkbox>
            <el-checkbox v-model="form.cusNotice" @input="cusNoticeChangeHandler" :disabled="checkboxDisabled.cusNotice" :true-label="1" :false-label="0">向客户发送通知</el-checkbox>
          </template>
          <button type="button" class="btn btn-primary base-comment-submit" @click="submit" :disabled="!allowOperate">
            <i class="iconfont icon-send"></i> 发送
          </button>

        </div>
        <!-- start 操作组 -->
        
      </div>
      <!-- end 底部操作 -->

    </div>

    <input type="file" ref="input" @change="handleChange" multiple>
    <div class="base-comment-cover" v-if="!allowOperate">
      <base-spin text="请稍等..."></base-spin>
    </div>

  </div>
</template>

<script>
/* utils */
import { trimAll } from '@src/util/lang';
import Uploader from '@src/util/uploader';
import Validator from '@src/util/validator';
import platform from '@src/platform';
import calcTextareaHeight from './calcTextareaHeight';
/* constant */
const EditorCalcStyle = {
  height: '82px',
  minHeight: '82px'
}

export default {
  name: 'base-comment',
  props: {
    autofocus: {
      type: Boolean,
      default: false
    },
    /** 是否禁用该组件，如果禁用不触发submit */
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    /* 显示客户相关的操作 (工单/事件)有用 */
    showCustomerAction: {
      type: Boolean,
      default: false
    },
    /** 
     * @description 备注模板列表
     * 未做处理，有数据即加载
     * 格式: [ { content: '' } ]
     */
    templateList: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      checkboxDisabled: {
        showInOwn: false,
        toCustomer: false,
        cusNotice: false
      },
      editorCalcStyle: EditorCalcStyle,
      errMessage: '',
      editorFocus: false,
      form: this.buildForm(),
      pending: false,
      template: ''
    }
  },
  computed: {
    /* 允许操作 */
    allowOperate(){
      return !this.disabled && !this.pending
    },
    /* 显示选择模板列表 */
    showSelectTemplate() {
      return Array.isArray(this.templateList) && this.templateList.length > 0;
    },
    templateListOptions() {
      return this.templateList.map(template => Object.freeze({ label: template.content, value: template.content }) )
    }
  },
  methods: {
    buildForm(){
      return {
        // 附件
        attachments: [],
        // 内容
        content: '',
        // 向客户发送短信
        cusNotice: 0,
        // 仅自己可见
        showInOwn: 0,
        // 客户可见
        toCustomer: 0,
      }
    },
    /* 向客户发送通知 变化处理 */
    cusNoticeChangeHandler(value) {
      this.checkboxDisabled.showInOwn = true;
      this.form.toCustomer = 1
    },
    chooseFile(){
      if(this.pending) return platform.alert('请等待文件上传完成')
      if(this.form.attachments.length >= Uploader.FILE_MAX_NUM) {
        return platform.alert(`上传文件数量不能超过${Uploader.FILE_MAX_NUM}个`)
      }
        
      this.$refs.input.value = null
      this.$refs.input.click()
    },
    async deleteFile(file) {
      let index = this.form.attachments.indexOf(file)
      if(index >= 0) {
        this.form.attachments.splice(index, 1)
      }
    },
    /** 按下回车后，检测是否按住alt键，如果同时按住alt+enter提交表单 */
    enterDown(event){
      if(!event.altKey) return
      this.submit()
    },
    focus(){
      if(this.autofocus && this.$refs.editor) this.$refs.editor.focus()
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

      Uploader.batchUploadWithParse({files}).then(result => {
        let {success, error} = result;

        if(error.length > 0){
          let message = error.map(item => item.message).join('\n');
          // 此处不能return
          platform.alert(message)
        }

        if(success.length > 0){
          form.attachments = form.attachments.concat(success);
        }
      })
        .catch(err => console.error(err))
        .then(() => this.pending = false)
    },
    inputContent(event){
      let value = event.target.value;
      this.form.content = value;
      // 计算输入框大小
      this.editorCalcStyle = calcTextareaHeight(this.$refs.editor, 3, 8);
      // 验证输入内容
      if(value) this.validateContent(this.form.content);
    },
    reset(){
      this.template = ''
      this.form = this.buildForm()
      this.editorCalcStyle = EditorCalcStyle
      this.focus()
      this.resetDisabled()
    },
    resetDisabled() {
      let { checkboxDisabled } = this
      for(let key in checkboxDisabled) {
        checkboxDisabled[key] = false
      }
    },
    /**
     * @description 切换模板
    */
    async selectTemplateChange(value) {
      // 判断当前输入框中是否有内容，无内容则替换
      let { content } = this.form
      if (trimAll(content).length == 0) {
        this.template = value;
        this.form.content = value;
        return
      }

      let confirm = await this.$platform.confirm('确定要代替输入框中的备注内容吗？');
      if(!confirm) return
      
      this.template = value;
      this.form.content = value;
    },
    /* 仅自己可见 变化处理 */
    showInOwnChangeHandler(value) {
      // 判断是否开始客户相关操作
      if(!this.showCustomerAction) {
        return console.warn('Caused: this.showCustomerAction is false')
      }

      let isDisabled = Boolean(value)
      this.checkboxDisabled.toCustomer = isDisabled
      this.checkboxDisabled.cusNotice = isDisabled
    },
    async submit(){
      try {
        if(!this.allowOperate) return;
        if(this.$refs.editor) this.$refs.editor.blur();

        // 去除前后空白
        let form = _.cloneDeep(this.form);

        // form.content = form.content.trimEnd();
        form.content = form.content.replace(/\s+$/g, '');

        if(!await this.validateContent(this.form.content)) this.$emit('submit', form)
      } catch (error) {
        console.error(error)
      }
      
    },
    /* 仅客户可见 变化处理 */
    toCustomerChangeHandler(value) {
      let isDisabled = Boolean(value)
      this.checkboxDisabled.showInOwn = isDisabled
    },
    validateContent(content){
      let field = {isNull: 0, formType: 'textarea', displayName: '内容'}
      return Validator.validate(this.form.content, field).then(validateRes => {
        this.errMessage = validateRes
        return this.errMessage
      })
    },
  },
  activated(){
    this.focus()
  }
}
</script>

<style lang="scss">
.base-comment{
  position: relative;
  border: 1px solid #ccc;
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

.base-comment-inner{
  background-color: #f9f9f9;
}

.base-comment-editor{
  background-color: #f9f9f9;
  border: none;
  resize: none;
  display: block;
  margin: 0;
  width: 100%;
  padding: 5px 8px;
  line-height: 24px; 
  height: 84px;
}

textarea.base-comment-editor::-webkit-input-placeholder{
  color: #999;
}

textarea.base-comment-editor:-ms-input-placeholder{
  color: #999;
}

textarea.base-comment-editor::-moz-placeholder{
  color: #999;
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
  transition: color ease .3s;
  font-size: 14px;
  color: #999;

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

  .el-select {
    min-width: 200px;
    max-width: 400px;
    margin-right: 20px;
  }

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
  background: #f9f9f9;

  .base-file-item:last-child{
    margin-bottom: 0;
  }
}

.base-comment-err{
  margin-left: 10px;
  color: $color-danger;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}
</style>
