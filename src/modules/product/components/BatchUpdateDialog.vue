<template>
  <base-modal :show.sync="batchUpdateCustomerDialog" width="600px" class="batch-update-customer-dialog" @closed="closeModal">
    <div slot="title">
      <el-popover placement="bottom-start" popper-class="batch-update-customer-modal-header" trigger="hover">
        <h3 class="customized-batch-update-customer-modal-header" slot="reference">产品批量更新<i class="iconfont icon-help"></i></h3>

        <div class="tips">
          <p>批量更新注意事项：</p>
          <p>1.数据覆盖上传后无法恢复，请谨慎操作，保留好数据导出文件</p>
          <p>2.批量更新导出数据条数不限，导入最大支持1000条，如果导入数据超出1000条请分批次导入</p>
        </div>
      </el-popover>
    </div>
    <div class="main-content">
      <p>
        <strong v-html="tip" class="info-item"></strong>
        <a href="javascript:;" @click="downloadData">下载</a>
      </p>
      <p>2、上传修改后的文件批量更新</p>

      <div class="base-import-file">
        <p>{{fileName}}</p>
        <el-button type="primary" @click="choose" :disabled="pending">选择文件</el-button>
        <input type="file" ref="file" @change="change"
               accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
      </div>
      <ul class="error-message" v-if="errors.length">
        <li>导入失败！</li>
        <li v-for="item in errors" :key="item">{{item}}</li>
      </ul>
    </div>
    <div slot="footer" class="import-footer">
      <button type="button" class="btn btn-text" @click="batchUpdateCustomerDialog = false">关闭</button>
      <el-button type="primary" :disabled="pending" @click="upload" :loading="pending">{{pending ? '正在导入' : '导入'}}</el-button>
    </div>
  </base-modal>
</template>

<script>
import Uploader from '@src/util/uploader';
import Platform from '@src/platform';

export default {
  name: 'batch-update-dialog',
  data() {
    return {
      fileName: '',
      pending: false,
      file: null,
      errors: [],
      batchUpdateCustomerDialog: false,
    }
  },
  props: {
    selectedIds: {
      type: Array,
      default: () => ([]),
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    action: {
      type: String,
      default: '',
    },
    buildDownloadParams: {
      type: Function,
      default: () => {
        return function () {}
      },
    }
  },
  computed: {
    exportType() {
      if (this.selectedIds.length) {
        return 'exportSelect';
      }
      return 'exportAll';
    },
    selectedCount() {
      if (this.selectedIds.length) {
        return this.selectedIds.length;
      }
      return this.totalItems;
    },
    tip() {
      if (this.selectedIds.length) {
        return `1、您已经选择了<span>${this.selectedIds.length}</span>条数据`
      }
      return `1、您已经选择视图全部数据<span>${this.totalItems}</span>条`
    },

  },
  methods: {
    closeModal() {
      this.file = null;
      this.fileName = '';
      this.errors = [];
    },
    choose(){
      this.$refs.file.value = null;
      this.$refs.file.click();
    },
    openBatchUpdateCustomerDialog() {
      this.batchUpdateCustomerDialog = true;
    },
    downloadData() {
      let params = {
        count: this.selectedCount,
        exportType: this.exportType,
        data: '',
      };

      if (this.exportType === 'exportSelect') {
        params.data = this.selectedIds.join(',');
      } else {
        params.data = this.buildDownloadParams();
      }

      window.location.href = `/product/importCover/export?data=${encodeURI(JSON.stringify(params))}`;
    },
    async upload(){
      try {
        if(null == this.file || !(this.file instanceof File)) return Platform.alert('请选择要导入的文件');

        if (!await this.$platform.confirm('本操作将会批量更新数据，更新成功后将无法恢复，是否确认')) return;

        this.pending = true;
        Uploader.upload(this.file, this.action)
          .then(result => {
            if(!result.status){
              Platform.alert(result.message);

              this.batchUpdateCustomerDialog = false;

              window.parent.showExportList();
              window.parent.exportPopoverToggle(true);
              // this.$emit('success');
            }else{
              this.errors = result.data || [];
              // Platform.alert(`导入失败！\n${data.join('\n')}`);
            }
            this.pending = false;
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.pending = false;
          })

      } catch (e) {
        console.error('upload catch e', e);
      }
    },
    change(event){
      const files = event.target.files;
      if (!files || !files.length) return;
      let file = files[0];

      this.errors = [];
      this.fileName = file.name;
      this.file = file
    },
  },
}
</script>

<style lang="scss">

  .customized-batch-update-customer-modal-header {
    display: inline-block;
    .iconfont {
      margin: 4px;
      position: relative;
      top: 1px;
    }
  }

  .batch-update-customer-modal-header {
    font-size: 12px;
    p {
      margin: 0;
      line-height: 20px;
    }
  }

  .batch-update-customer-dialog {
    .base-modal-header {
      justify-content: space-between;
    }
    .main-content {
      font-size: 12px;
      padding: 20px 20px 0 20px;

      .info-item {
        font-weight: normal;
        span {
          padding: 0 5px;
          color: blue;
        }
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
        background-color: #f0f0f0;
        border-right: none;
        margin: 0;
        border-radius: 2px 0 0 2px;
      }

      .el-button{
        border-radius: 0 2px 2px 0;
      }

      input[type='file']{
        display: none;
      }
    }

    .error-message {
      max-height: 100px;
      overflow-y: auto;
      padding: 0;
      li {
        list-style: none;
      }
    }

    .base-modal-footer {
      padding: 15px 20px;
      .import-footer {
        display: flex;
        justify-content: flex-end;

        button {
          min-width: 80px;
        }
      }

    }
  }

</style>