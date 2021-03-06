<template>
  <base-modal :title="title" :show.sync="visible" width="600px" class="base-import-modal">
    <span class="base-import-title" slot="title">{{title}}</span>
    <slot name="tip">    
      <div class="base-import-warn">请先下载<a :href="templateUrl">导入模版</a>，填写完成后再上传导入。</div>
    </slot>
    <div class="base-import-file">
      <p>{{fileName}}</p>
      <el-button type="primary" @click="choose" :disabled="pending">选择文件</el-button>
      <input type="file" ref="file" @change="change"
             accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
    </div>

    <div class="base-import-error" v-if="errors.length > 0">
      <h5>数据未能导入，请修正后重新导入。</h5>
      <p v-for="(err, index) in errors" :key="index">{{err}}</p>
    </div>

    <div slot="footer" class="import-footer">
      <el-button  @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="pending" @click="upload" :loading="pending">{{pending ? '正在导入' : '导入'}}</el-button>
    </div>
  </base-modal>
</template>

<script>

import BaseModal from '../BaseModal';
import Uploader from '@src/util/uploader';
import Platform from '@src/platform';

export default {
  name: 'base-import',
  props: {
    templateUrl: String,
    // 是否立即 导入 或 异步导入显示在 导入导出列表
    isImportNow: {
      type: Boolean,
      default: false,
    }, 
    action: String,
    title: {
      type: String,
      default: '导入'
    }
  },
  data(){
    return {
      fileName: '',
      visible: false,
      pending: false,
      file: null,
      errors: []
    }
  },
  methods: {
    open(){
      this.pending = false;
      this.file = null;
      this.fileName = '';
      this.errors = [];

      this.visible = true;
    },
    choose(){
      this.$refs.file.value = null;
      this.$refs.file.click();
    },
    change(event){
      const files = event.target.files;
      if (!files || files.length == 0) return;
      let file = files[0];

      this.errors = [];
      this.fileName = file.name;
      this.file = file
    },
    upload(){
      if(null == this.file || !(this.file instanceof File)) return Platform.alert('请选择要导入的文件');

      this.pending = true;
      Uploader.upload(this.file, this.action, {validateStorage: false}).then(result => {

        if(result.status == 0){
          if(this.isImportNow) {
            let message = '导入成功！';
            // 导入联系人的时候，返回的total竟然统计了第一行表头
            let total = result.data.total;
            if (this.action === '/contacts/import' || this.action == '/security/user/import/cellPhone') {
              total -= 1;
            }

            if(result.data && result.data.total) message += `共导入${total}条数据。`;

            Platform.alert(message);
            this.visible = false;
            this.$emit('success',result);

          } else {
            Platform.alert(result.message);
            this.visible = false;

            window.parent.showExportList();
            window.parent.exportPopoverToggle(true);
          }

        }else{
          if(this.isImportNow) {
            let data = result.data || [];
            this.errors = data;
          } else {
            Platform.alert(result.message);
          }
        }

        this.pending = false;
      })
        .catch(err => {
          console.error(err)
        })
    }
  },
  components: {
    [BaseModal.name]: BaseModal,
  }
}
</script>


<style lang="scss">
  .base-import-modal {

    .base-modal-header {
      justify-content: space-between;
    }
    .base-modal-body {
      padding: 15px;
    }
    .base-modal-footer {
      .import-footer {
        display: flex;
        justify-content: flex-end;
      }

    }
  }

.base-import-title{
  display: inline-block;
  min-width: 80px;
  margin-right: 10px;
  line-height: 20px;
  font-size: 16px;
  color: #303133;
}

.base-import-warn{
  padding: 5px 10px;
  border-radius: 2px;
  background-color: #fdf6ec;
  color: #e6a23c;
  margin-bottom: 15px;
  a {
    color: #00ac97;
  }
}


.base-import-file{
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 15px;

  &:last-child{
    margin-bottom: 5px;
  }
  p {
    flex: 1;
    line-height: 24px;
    padding: 3px 6px;
    border: 1px solid #d5d5d5;
    border-right: none;
    margin: 0;
    border-radius: 4px 0 0 4px;
  }

  .el-button{
    border-radius: 0 2px 2px 0;
  }

  input[type='file']{
    display: none;
  }
}

.base-import-error{
  max-height: 400px;
  overflow: auto;
  h5{
    font-size: 15px;
    margin: 0;
    line-height: 30px;
    font-weight: 500;
    color: red;
  }

  p{
    margin: 0;
    line-height: 24px;
    word-break: break-all;
  }
}

</style>
