<template>
  <base-modal title="导出列选择" :show.sync="visible" width="650px" class="base-export-modal">
    <div>
      <el-checkbox v-model="isCheckedAll" @change="toggle">全选</el-checkbox>
    </div>
    <el-checkbox-group
      v-model="checkedArr"
      @change="handleChange"
      style="width:100%;"
      class="base-export-field-wrap"
    >
      <el-checkbox
        v-for="col in filterColumns"
        :key="col.field"
        :label="col.exportAlias ? col.exportAlias : col.field"
        v-if="!col.conType || col.conType !== 'btnArray'"
      >{{col.label}}</el-checkbox>
    </el-checkbox-group>

    <div slot="footer" class="export-footer">
      <button type="button" class="btn base-modal-text-btn" @click="visible = false">关闭</button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="pending"
        @click="exportData"
      >{{pending ? '正在导出' : '导出'}}</button>
    </div>

    <div class="base-export-bridge" ref="bridge"></div>
  </base-modal>
</template>

<script>
import Platform from "@src/platform";
import http from "@src/util/http";
import objHttp from '@src/util/HttpUtil';   // 不以form表单提交

const MAX_COUNT = 5000;

export default {
  name: "base-export",
  props: {
    columns: Array,
    action: String,
    buildParams: Function,
    title: {
      type: String,
      default: "导出列选择"
    },
    method: {
      type: String,
      default: "get"
    },
    needObjReq:{
      type:Boolean,
      default:false
    },
    /**
     * 函数必须返回Promise对象
     * 如果验证失败，promise需要返回错误信息，否则返回null
     */
    validate: Function,
    downloadUrl: String
  },
  data() {
    return {
      ids: [],
      fileName: "",
      visible: false,
      pending: false,
      checkedArr: [],
      isCheckedAll: true,
      isDownloadNow: false, // 导出是否是立刻下载模式

      checked: ""
    };
  },
  computed: {
    filterColumns() {
      return this.columns.filter(item => item.export);
    }
  },
  methods: {
    open(ids = [], fileName = "导出数据.xlsx", isDownloadNow = false) {
      this.pending = false;
      this.ids = ids;
      this.fileName = fileName;

      this.checkedArr = this.filterColumns.map(item =>
        item.exportAlias ? item.exportAlias : item.field
      );
      this.isCheckedAll = true;
      this.isDownloadNow = isDownloadNow;

      this.visible = true;
    },
    toggle(value) {
      this.checkedArr = value
        ? this.filterColumns.map(item =>
            item.exportAlias ? item.exportAlias : item.field
          )
        : [];
    },
    handleChange() {
      this.isCheckedAll = this.checkedArr.length == this.filterColumns.length;
    },
    // 表单形式导出 TODO: 修改
    formExport(params) {
      let form = document.createElement("form");
      this.$refs.bridge.appendChild(form);

      for (let prop in params) {
        let input = document.createElement("input");
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
        this.$refs.bridge.removeChild(form);
      }, 150);
    },
    // ajax形式导出
    async ajaxExport(params) {
      let ajax = null;
      // 是否是立即下载
      if (this.isDownloadNow) {
        if (this.downloadUrl) {
          this.billExport(params);
          return;
        }
        ajax = http
          .axios(this.method, this.action, params, false, {
            responseType: "blob"
          })
          .then(blob => {
            let link = document.createElement("a");
            let url = URL.createObjectURL(blob);
            link.download = this.fileName;
            link.href = url;
            this.$refs.bridge.appendChild(link);
            link.click();

            this.visible = false;
            this.pending = false;
            setTimeout(() => {
              URL.revokeObjectURL(url);
              this.$refs.bridge.removeChild(link);
            }, 150);
          })
          .catch(err => console.error(err));
      } else {
        if(this.needObjReq){
          let model = {
            checked: this.checkedArr.join(','),
            ids: this.ids.join(',')
          };
          _.assign(model, this.params);

          let ua = navigator.userAgent;
          if (ua.indexOf('Trident') >= 0) {
            window.location.href = `${this.action}?${qs.stringify(model)}`;
            this.visible = false;
            return;
          }

          // let responseType = { responseType: 'blob' };
          ajax=objHttp
            .post(this.action, model, true)
            .then(res => {
              this.visible = false;
              this.pending = false;

              Platform.alert(res.message);

              if (res.status == 0) {
                window.parent.showExportList();
                window.parent.exportPopoverToggle(true);
              }
            })
            .catch(err => console.error(err));
        }else{
          ajax = http
            .axios(this.method, this.action, params, false)
            .then(res => {
              this.visible = false;
              this.pending = false;

              Platform.alert(res.message);

              if (res.status == 0) {
                window.parent.showExportList();
                window.parent.exportPopoverToggle(true);
              }
            })
            .catch(err => console.error(err));  
        }
      }

      return ajax;
    },
    async billExport(params) {
      try {
        let ajax = null;
        let token = await http.post(this.downloadUrl, params, false);
        let url = `${ this.action }?token=${ token.data }`;
        ajax = http.axios(this.method, url, {}, false, {responseType: 'blob'}).then(blob => {
          let link = document.createElement('a');
          let url = URL.createObjectURL(blob);
          link.download = this.fileName;
          link.href = url;
          this.$refs.bridge.appendChild(link)
          link.click();

          this.visible = false;
          this.pending = false;
          setTimeout(() => {
            URL.revokeObjectURL(url);
            this.$refs.bridge.removeChild(link)
          }, 150);
        }).catch(err => console.error(err));

        return ajax;
      } catch (error) {
        console.error(error)
      }
    },

    async exportData() {
      if (this.checkedArr.length == 0)
        return Platform.alert("请至少选择一列导出");

      this.pending = true;

      try {
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
      } catch (error) {
        console.error(error)
      }
    }
  }
};
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

  .btn-text {
    margin-right: 10px;
  }
}

.base-export-title {
  display: inline-block;
  min-width: 80px;
  margin-right: 10px;
  line-height: 20px;
  font-size: 16px;
  color: #303133;
}

.base-export-field-wrap {
  display: flex;
  flex-flow: row wrap;

  .el-checkbox {
    margin-left: 0;
    margin-top: 10px;
    width: 25%;
  }
}

.base-export-bridge {
  position: absolute;
  top: -1000px;
  left: -1000px;

  a {
    display: block;
    border: none;
    outline: none;
    width: 0;
    height: 0;
  }
}
</style>
