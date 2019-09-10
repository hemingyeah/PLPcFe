<template>
  <div class="document-create-title">
    <el-form :model="params" :rules="rules" ref="ruleForm">

      <el-form-item label="标题：" class="create-item item-title" prop="rule">
        <el-input class="title" v-model="params.title" @blur="titleCheck"></el-input>
      </el-form-item>
      <p class="title-error" v-if="params.title && params.title.length > 100">标题不能超过100个字符！</p>
      <p class="title-error" v-if="msg && !params.title">请填写通知公告标题！</p>

      <el-form-item label="分类：" class="create-item" prop="typeId">
        <el-select v-model="params.typeId" class="search-type">
          <el-option v-for="item in params.options" :key="item.id" :value="item.id" :label="item.name">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="通知范围：" class="create-item" prop="typeId">
        <div class="range">
          <span style="color: #999" v-if="params.selectedDepts.length > 0">部门：
            <el-tag class="search-tag" closable @close="handleTags(tag, 'depts')" v-for="tag in params.selectedDepts" :key="tag.id">{{tag.name}}</el-tag>
          </span>
          <span style="color: #999; padding-left: 15px" v-if="params.selectedUsers.length > 0">人员：
            <el-tag class="search-tag" closable @close="handleTags(tag, 'users')" v-for="tag in params.selectedUsers" :key="tag.userId">{{tag.displayName}}</el-tag>
          </span>
          <div class="icon-add-tags-btn" @click="chooseTeam">
            <i class="iconfont icon-jia icon-addTags"></i>
          </div>
        </div>
      </el-form-item>
      <p class="title-error" v-if="range">{{range}}</p>

      <el-form-item label="附件列表：" class="create-item">
        <div class="file">
          <div class="base-comment-attachment base-file__preview file-item" v-if="params.form.attachments.length > 0">
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
import http from '@src/util/http';

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
      msg: '',
      range: '',
      rules: {
        title: [
          { required: true, message: '请填写知识库标题！', trigger: 'blur' },
          { max: 100, message: '标题不能超过100字！', trigger: 'blur' }
        ],
        rule: [
          { required: true, message: '请填写知识库标题！', trigger: 'blur' },
        ],
        typeId: [
          { required: true, message: '请选择知识库分类', trigger: 'change' }
        ],
        range: [
          { required: true, message: '请选择知识库权限', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 加载显示
    allowOperate(){
      return !this.pending
    }
  },
  methods: {
    // 点击加号显示标签输入框
    chooseTeam () {
      // this.$refs.notificationRange.$el.click();
      let max = -1;
      
      let options = {
        title: '请选择推送部门或人员',
        seeAllOrg: true,
        selectedUsers: this.params.selectedUsers,
        selectedDepts: this.params.selectedDepts,
        max,
        showDeptCheckbox: true
      };
      return this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0){
          let data = result.data || {};
          let users = data.users || [];
          let depts = data.depts || [];
          let newValue = users;

          this.params.selectedUsers = newValue;
          this.params.selectedDepts = depts;
          if(newValue.length > 0 || depts.length > 0) {
            this.range = false;
          }
          this.deftCheck();

          this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
        }
      })
        .catch(err => console.error(err))
    },

    async deftCheck () {
      if(this.params.selectedDepts.length > 0) {
        let num = 0;
        this.params.selectedDepts.forEach(async item => {
          let params = {
            deptId: item.id,
            pageNum: 1,
            pageSize: 50,
            sellAllOrg: false,
            keyword: '',
          }
          let res = await http.get('/security/department/user', params);
          num = res.list.length + num;
          this.params.deptPerson = num;
        })
      }
    },

    // 添加标签，最多5个
    addTags () {
      if(this.tagValue) {
        this.params.tags.push(this.tagValue);
      }
      this.inputVisible = false;
      this.tagValue = '';
    },

    // 删除标签
    handleTags (tag, text) {
      if(text == 'users') {
        this.params.selectedUsers.splice(this.params.selectedUsers.indexOf(tag), 1);
      } else {
        this.params.selectedDepts.splice(this.params.selectedDepts.indexOf(tag), 1);
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

    titleCheck() {
      this.msg = '';
      if(!this.params.title) {
        this.msg = '请填通知公告标题！';
        return false;
      }
      if(this.params.title.length > 100) {
        return false;
      }
      return true;
    },

    rangeCheck () {
      if(this.params.selectedUsers.length <= 0 && this.params.selectedDepts.length <= 0) {
        this.range = '请选择通知范围！';
        return false;
      }
      return true;
    },
  }
}
</script>

<style lang="scss">
.document-create-title {
  background: #fff;

  .create-item {
    position: relative;
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

    .range {
      margin-left: 82px;

      .notification-range {
        position: absolute;
        bottom: 0;
        z-index: -20;
        display: inline-block;
        width: calc(100% - 82px);
        border: none;

        .biz-team-select-tags {
          display: none;
        }
      }
    }

    .el-input__inner {
      border-color: #e0e1e2;
    }
    
    
  }

  .title-error {
    height: 17px;
    color: #f56c6c;
    font-size: 12px;
    line-height: 12px;
    margin: 0;
    padding-top: 5px;
  }

  .item-title {

    .el-form-item__content {

      input {
        border: none;
        width: calc(100% - 60px);
      }
    }

    .title {
      width: calc(100% - 65px);

      .el-input__inner {
        border: none;
      }
    }
  }
}
</style>