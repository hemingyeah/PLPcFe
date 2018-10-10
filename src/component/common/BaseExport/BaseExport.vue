<template>
  <base-modal title="导出列选择" :show.sync="visible" width="600px" class="base-export-modal">
    <div>
      <el-checkbox v-model="isCheckedAll" @change="toggle">全选</el-checkbox>
    </div>
    <el-checkbox-group v-model="checkedArr" @change="handleChange" style="width:100%;" class="base-export-field-wrap">
      <el-checkbox v-for="col in filterColumns" :key="col.field" :label="col.exportAlias ? col.exportAlias : col.field" >{{col.label}}</el-checkbox>
    </el-checkbox-group>
   
    <div slot="footer" class="export-footer">
      <button type="button" class="btn btn-text" @click="visible = false">关闭</button>
      <el-button type="primary" :disabled="pending" :loading="pending" @click="exportData">{{pending ? '正在导出' : '导出'}}</el-button>
    </div>

    <div class="base-export-bridge" ref="bridge"></div>
  </base-modal>
</template>

<script>
import qs from 'qs';
import BaseModal from '../BaseModal';
import Platform from '@src/platform';
import http from '@src/util/http';

export default {
  name: 'base-export',
  props: {
    columns: Array,
    action: String,
    buildParams: Function,
    title: {
      type: String,
      default: '导出列选择'
    }
  },
  data(){
    return {
      ids: [],
      fileName: '',
      visible: false,
      pending: false,
      checkedArr: [],
      isCheckedAll: true,

      checked: ''
    }
  },
  computed: {
    filterColumns(){
      return this.columns.filter(item => item.export)
    }
  },
  methods: {
    open(ids = [], fileName = '导出数据.xlsx'){
      this.pending = false;
      this.ids = ids;
      this.fileName = fileName;

      this.checkedArr = this.filterColumns.map(item => item.exportAlias ? item.exportAlias : item.field);
      this.isCheckedAll = true;

      this.visible = true;
    },
    toggle(value){
      this.checkedArr = value ? this.filterColumns.map(item => item.exportAlias ? item.exportAlias : item.field) : []
    },
    handleChange(){
      this.isCheckedAll = this.checkedArr.length == this.filterColumns.length;
    },
    exportData(){
      if(this.checkedArr.length == 0) return Platform.alert('请至少选择一列导出');

      this.pending = true;
      let params = {
        checked: this.checkedArr.join(','),
        ids: this.ids.join(','),
      };
      // doubt

      if (this.buildParams) {
        params = this.buildParams(this.checkedArr, this.ids);
      }




      let ua = navigator.userAgent;
      if (ua.indexOf('Trident') >= 0){
        window.location.href = `${this.action}?${qs.stringify(params)}`;
        this.visible = false;
        return
      }

      http.get(`${this.action}?${qs.stringify(params)}`, {}, {responseType: 'blob'}).then(blob => {
        let link = document.createElement('a');
        let url = URL.createObjectURL(blob);
        link.download = this.fileName;
        link.href = url;
        this.$refs.bridge.appendChild(link)
        link.click();

        this.visible = false;
        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.$refs.bridge.removeChild(link)
        }, 150);
      }).catch(err => console.error(err))
    }
  },
  components: {
    [BaseModal.name]: BaseModal,
  }
}
</script>

<style lang="scss">
  .base-export-modal {
    .base-modal-body {
      padding: 15px;
    }
    .base-modal-footer {
      padding: 15px;
      .export-footer {
        display: flex;
        justify-content: flex-end;
      }

    }
  }



  .base-export-title{
  display: inline-block;
  min-width: 80px;
  margin-right: 10px;
  line-height: 20px;
  font-size: 16px;
  color: #303133;
}

.base-export-field-wrap{
  display: flex;
  flex-flow: row wrap;

  .el-checkbox{
    margin-left: 0;
    margin-top: 10px;
    width: 25%;
  }
}

.base-export-bridge{
  position: absolute;
  top: -1000px;
  left: -1000px;

  a{
    display: block;
    border: none;
    outline: none;
    width: 0;
    height: 0;
  }
}
</style>
