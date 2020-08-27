import Platform from '@src/platform';
import http from '@src/util/http';

const MAX_COUNT = 5000;

export default {
  name: 'base-export-mixin',
  data() {
    return {

    };
  },
  methods: {
    // 表单形式导出  修改
    formExport(params) {
      let form = document.createElement('form');
      this.$refs.bridge.appendChild(form);
    
      for (let prop in params) {
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
            responseType: 'blob'
          })
          .then(blob => {
            let link = document.createElement('a');
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
        ajax = http
          .axios(this.method, this.action, params)
          .then(res => {
            this.visible = false;
            this.pending = false;
            
            this.exportAlert(res, params);
    
            if (res.status == 0) {
              window.parent.showExportList();
              window.parent.exportPopoverToggle(true);
            }
          })
          .catch(err => console.error(err));
      }
    
      return ajax;
    },
    async billExport(params) {
      let ajax = null;
      let token = await http.post(this.downloadUrl, params, false);
      let url = `${this.action}?token=${token.data}`;
      ajax = http
        .axios(this.method, url, {}, false, { responseType: 'blob' })
        .then(blob => {
          let link = document.createElement('a');
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
    
      return ajax;
    },
    
    async exportData() {
      if (this.isCheckedEmpty()) {
        return Platform.alert('请至少选择一列导出');
      }
    
      this.pending = true;
    
      // 如果提供验证函数，则进行验证
      if (typeof this.validate == 'function') {
        let validateRes = await this.validate(this.ids, MAX_COUNT);
        if (validateRes) {
          this.pending = false;
          this.visible = false;
          return Platform.alert(validateRes);
        }
      }
    
      let params = this.buildParamsFunc();
    
      return navigator.userAgent.indexOf('Trident') >= 0
        ? this.formExport(params)
        : this.ajaxExport(params);
    },
    exportAlert(result, params) {
      let isAlertFunction = typeof this.alert == 'function';
      let isSuccess = result.status == 0;

      if(isSuccess && isAlertFunction) {
        this.alert(result, params);
      } else {
        Platform.alert(result.message)
      }


    }
  }
}