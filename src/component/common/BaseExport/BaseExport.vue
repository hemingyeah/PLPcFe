<template>
  <base-modal title="导出列选择" :show.sync="visible" width="600px" class="base-export-modal">
    <div>
      <el-checkbox v-model="isCheckedAll" @change="toggle">
        全选
      </el-checkbox>
    </div>
    <el-checkbox-group v-model="checkedArr" @change="handleChange" style="width:100%;" class="base-export-field-wrap">
      <el-checkbox v-for="col in filterColumns" :key="col.field" :label="col.exportAlias ? col.exportAlias : col.field" >
        {{col.label}}
      </el-checkbox>
    </el-checkbox-group>
  
    <div slot="footer" class="export-footer">
      <button type="button" class="btn base-modal-text-btn" @click="visible = false">
        关闭
      </button>
      <button type="button" class="btn btn-primary" :disabled="pending" @click="exportData">
        {{pending ? '正在导出' : '导出'}}
      </button>
    </div>

    <div class="base-export-bridge" ref="bridge"></div>
  </base-modal>
</template>

<script>
import Platform from '@src/platform';
import http from '@src/util/http';

const MAX_COUNT = 5000;

export default {
  name: 'base-export',
  props: {
    columns: Array,
    action: String,
    buildParams: Function,
    title: {
      type: String,
      default: '导出列选择'
    },
    method: {
      type: String,
      default: 'get'
    },
    /**
     * 函数必须返回Promise对象
     * 如果验证失败，promise需要返回错误信息，否则返回null
     */
    validate: Function
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
    // 表单形式导出 TODO: 修改
    formExport(params){
      let form = document.createElement('form');
      this.$refs.bridge.appendChild(form)
      
      for(let prop in params){
        let input = document.createElement('input');  
        input.name = prop;  
        input.value = params[prop];  
        form.appendChild(input);  
      }
      
      form.method = this.method;
      form.action = this.action;
      form.submit();

      this.visible = false;
      this.pending = false;

      setTimeout(() => {
        this.$refs.bridge.removeChild(form)
      }, 150);
    },
    // ajax形式导出
    ajaxExport(params){
      return http.axios(this.method, this.action, params, false).then(res => {

        this.visible = false;
        this.pending = false;

        Platform.alert(res.message);
        window.parent.showExportList();
        window.parent.exportPopoverToggle(true);

      }).catch(err => console.error(err))
    },
    async exportData(){
      if(this.checkedArr.length == 0) return Platform.alert('请至少选择一列导出');

      this.pending = true;

      // 如果提供验证函数，则进行验证
      if(typeof this.validate == 'function'){
        let validateRes = await this.validate(this.ids, MAX_COUNT)
        if(validateRes) {
          this.pending = false;
          this.visible = false;
          return Platform.alert(validateRes)
        }
      }

      let params = typeof this.buildParams == 'function' 
        ? this.buildParams(this.checkedArr, this.ids)
        : {checked: this.checkedArr.join(','), ids: this.ids.join(',')};

      return navigator.userAgent.indexOf('Trident') >= 0 ? this.formExport(params) : this.ajaxExport(params);
    }
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
  }
}

.export-footer {
  display: flex;
  justify-content: flex-end;
  
  .btn-text{
    margin-right: 10px;
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
