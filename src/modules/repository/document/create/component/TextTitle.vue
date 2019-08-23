<template>
  <div class="document-create-title">
    <el-form>

      <el-form-item label="标题：" class="create-item item-title">
        <input class="title" v-model="params.title" />
      </el-form-item>

      <el-form-item label="分类：" class="create-item">
        <el-cascader :options="params.options" class="type" v-model="params.typeId" filterable>
        </el-cascader>
      </el-form-item>

      <el-form-item label="权限：" class="create-item">
        <el-radio-group v-model="params.permission">
          <el-radio :label="'内部'">
            内部
            <el-tooltip content="仅应用内部用户可查看" placement="top">
              <i class="iconfont icon-info icon-permission"></i>
            </el-tooltip>
          </el-radio>
          <el-radio :label="'外部'">
            外部
            <el-tooltip content="可分享给所有人，支持应用外查看" placement="top">
              <i class="iconfont icon-info icon-permission"></i>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="标签：" class="create-item">
        <el-tag class="search-tag" closable @close="handleTags(tag)" v-for="(tag,index) in params.label" :key="index">{{tag}}</el-tag>
        <el-input v-if="inputVisible" class="input-new-tag" @keyup.enter.native="addTags" @blur="addTags" v-model="tagValue" ref="saveTagInput"></el-input>
        <div class="icon-add-tags-btn" @click="showInput" v-if="!params.label || (!inputVisible && params.label.length < 4)">
          <i class="iconfont icon-jia icon-addTags"></i>
        </div>
      </el-form-item>

      <el-form-item label="附件列表：" class="create-item">
        <div class="file">
          <div class="base-comment-attachment base-file__preview file-item" v-if="params.form.attachments && params.form.attachments.length > 0">
            <base-file-item v-for="file in params.form.attachments" :key="file.id" :file="file" @delete="deleteFile" size="small"></base-file-item>
          </div>
          <button type="button" class="base-comment-tool file-button" @click="chooseFile">
            <i class="iconfont icon-attachment"></i> 添加附件
          </button> 
          <input type="file" ref="input" @change="handleChange" multiple>
          <div class="base-comment-cover loading" v-if="!allowOperate">
            <base-spin text="请稍等..."></base-spin>
          </div>
        </div> 
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import platform from '@src/platform';
import Uploader from '@src/util/uploader';

export default {
  name: 'text-title',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      params: this.value,
      inputVisible: false, // 添加标签input显示标识
      tagValue: '', // 添加的标签
      options: [], // 文章分类
      pending: false,
    }
  },
  computed: {
    // 加载显示
    allowOperate(){
      return !this.pending
    }
  },
  created () {
    this.params.form = this.buildForm();
  },
  methods: {
    // 点击加号显示标签输入框
    showInput () {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    // 添加标签，最多5个
    addTags () {
      if(this.tagValue) {
        if (this.tagValue.length <= 10) {
          this.params.label.push(this.tagValue);
        } else {
          this.$platform.alert('标签最多只支持10个字符。');
        }
      }
      this.inputVisible = false;
      this.tagValue = '';
    },
    // 删除标签
    handleTags (tag) {
      this.params.tags.splice(this.params.tags.indexOf(tag), 1);
    },
    // 文件存储form结构
    buildForm(){
      return {
        content: '',
        attachments: [],
        showInOwn: 0
      }
    },
    // 选择文件
    handleChange(event){
      const files = event.target.files;
      if(!files || !files.length) return;

      let form = this.params.form;

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
    // 触发inputclick事件选择文件
    chooseFile () {
      if(this.pending) return platform.alert('请等待文件上传完成');
      if(this.params.form.attachments.length >= Uploader.FILE_MAX_NUM) {
        return platform.alert(`上传文件数量不能超过${Uploader.FILE_MAX_NUM}个`);
      }
        
      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    // 删除文件
    deleteFile(file) {
      let index = this.params.form.attachments.indexOf(file);
      if(index >= 0) {
        this.params.form.attachments.splice(index, 1);
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.document-create-title {
  background: #fff;

  .create-item {
    width: 100%;
    padding-top: 10px;
    margin: 0;

    border-bottom: 1px solid #EBEBEB;

    .el-form-item__label {
      color: #909399;
    }

    .el-radio {
      line-height: 30px;

      .el-radio__label {
        font-size: 13px;
      }
    }

    .icon-permission {
      position: relative;
      top: 1px;

      font-size: 14px;
      margin-left: 4px;
      color: #999;
    }

    .search-tag {
      margin-left: 4px;
      border: none;
      background: #E8EFF0;
      color: #606266;
      line-height: 24px;
    }

    .input-new-tag {
      display: inline-block;
      width: 80px;
    }

    .icon-add-tags-btn {
      display: inline-block;
      position: relative;
      top: 2px;
      width: 20px;
      height: 20px;
      line-height: 20px;

      margin-left: 5px;

      cursor: pointer;
      .icon-addTags {
        font-size: 14px;
        color: #38A6A6; 
      }
    }
    
    
    input[type='file']{
      display: none !important;
    }

    .file {
      font-size: 0;
      margin-left: 82px;

      .file-item {
        display: inline-flex;
        flex-wrap: wrap;

        vertical-align: middle;
      }

      .file-button {
        vertical-align: middle;
        margin-left: 8px;
      }

      .loading {
        bottom: 10px;

        .base-spin-text {
          padding: 0;
        }
      }
    }
    
  }

  .item-title {

    .el-form-item__content {

      input {
        border: none;
      }
    }
  }
}
</style>