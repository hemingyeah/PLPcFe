<template>
  <div class="frame-export-panel">
    <h3>{{ title }}（{{sourceList.length || 0}}）</h3>
    <template v-if="sourceList.length > 0">
      <div v-for="item in sourceList" :key="item.id" class="export-row">
        <img src="../../../../assets/img/excel.png">
        <div class="export-row-info">
          <h4>{{item.name}}</h4>
          <p>{{item.createTime | fmt_datetime}}</p>
        </div>

        <!-- start 导出状态 -->
        <div 
          class="export-row-badge" 
          :class="{
            'export-row-badge-finished': item.isFinished == 1,
            'export-row-badge-error': item.isFinished == 2
          }"
        >
          {{ getStatusText(item) }}
        </div>
        <!-- end 导出状态 -->

        <template v-if="operationList.some(o => o.id == item.id)">
          <span class="export-operate-btn">请稍等</span>
        </template>

        <!-- start 操作按钮显示 -->
        <template v-else>

          <!-- start 导出 -->
          <button type="button" class="btn btn-text export-operate-btn" v-if="item.action == 'export' || !item.action" @click="operateExport(item)">
            {{ item.isFinished == 0 ? '取消' : '下载' }}
          </button>
          <!-- end 导出 -->

          <!-- start 导入 或 批量更新 -->
          <button type="button" class="btn btn-text export-operate-btn" v-if="item.action == 'import' || item.action == 'update' " @click="operateImportAndUpdate(item)">
              <span v-if="item.isFinished == 0 && isImportDelete(item.createTime, 30)">
                取消
              </span>
              <span v-if="item.isFinished == 1">
                确定
              </span>
              <span v-if="item.isFinished == 2">
                查看原因
              </span>
          </button>
          <!-- end 导入 或 批量更新 -->

          <!-- start 绩效 -->
          <button type="button" class="btn btn-text export-operate-btn" v-if="item.action == 'calculation'" @click="operateCalculation(item)">
            <span v-if="item.isFinished == 0 && isImportDelete(item.createTime, 10)">
              取消
            </span>
            <span v-if="item.isFinished == 1">
              查看详情
            </span>
            <span v-if="item.isFinished == 2">
              查看原因
            </span>
          </button>
          <!-- end 绩效 -->

        </template>
        <!-- end 操作按钮显示 -->

      </div>
    </template>
    <p class="export-empty" v-else>
      您没有待下载的文件
    </p>

    <!-- start 导出更新失败 原因弹窗 -->
    <base-modal 
      :title="errorDialogTitle" 
      :show.sync="errorDialog" 
      width="500px"
      class="import-update-error-dialog"
    >
      <div class="import-update-error-dialog-body">
        <p v-for="(reason, index) in reasons" :key="`reson_import${index}`">
          {{ reason }}
        </p>
      </div>
      <div slot="footer" class="import-update-error-dialog-footer">
        <el-button type="danger" @click="deleteRecord(item)" :loading="pending" :disabled="pending">
          {{ pending ? '删除中' : '删除记录' }}
        </el-button>
        <el-button type="primary" @click="errorDialog = false" :disabled="pending">
          确 定
        </el-button>
      </div>
    </base-modal>
    <!-- end 导出更新失败 原因弹窗 -->

    <!-- start 查看绩效报告 统计信息弹窗 -->
    <base-modal title="统计成功" :show.sync="performanceDialogVisible" width="500px" class="performance-report-modal">
      <div class="stage-success">
        <p>报告名称：{{createReportResult.name || createReportResult.reportName}}</p>
        <p>统计范围：{{createReportResult.totalNumber}}</p>
        <p>规则命中：{{createReportResult.hitNumber}}</p>
        <p>起止时间：{{createReportResult.time}}</p>
        <div class="dialog-footer" style="margin-top: 15px;">
          <el-button type="primary" @click="performanceViewDetail">查看绩效报告详情</el-button>
          <el-button type="primary" @click="performanceDialogVisible = false" :disabled="pending">
            确 定
          </el-button>
        </div>
      </div>
    </base-modal>
    <!-- end 查看绩效报告 统计信息弹窗 -->
  </div>
</template>

<script>
import platform from '@src/platform'
import http from '@src/util/http';

import FrameManager from './../FrameManager';

export default {
  name: 'import-and-export-view',
  props: {
    sourceList: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '导入导出'
    }
  },
  data() {
    return {
      operationList: [],
      errorDialog: false, // 错误原因弹窗
      errorDialogTitle: '', // 错误原因 弹窗 标题
      pending: false,
      reasons: [], // 错误原因
      item: {},
      performanceDialogVisible: false,
      createReportResult: {}
    }
  },
  computed: {
    
  },
  methods: {
    /** 取消操作  */
    async cancelOperation(item, action) {
      let url = '';
      let itemAction = item.action;
      let subTitle = item.action == 'calculation' ? '生成' : '文件';

      switch (itemAction) {
        case 'export': {
          url = 'excels/cancel';
          break;
        }
        case 'import': {
          url = '/excels/delete/manual';
          break;
        }  
        case 'update': {
          url = '/excels/delete/manual';
          break;
        }
        case 'calculation': {
          url = '/excels/performance/cancel';
          break;
        }        
        default:
          break;
      }

      if(await platform.confirm(`确定要取消${subTitle}[${item.name}]的${action}？`)){

        this.operationList.push({id: item.id, operate: 'cancel'})
        try {
          let result = await http.get(url, {id: item.id});

          this.operationList = this.operationList.filter(i => i.id != item.id)

          if(result.status == 0) {
            // 
          } else {
            platform.alert(result.message);
          }
          this.$emit('change', this.operationList);

          return

        } catch (error) {
          console.log('error: ', error);
        }
      }
    },
    /** @deprecated */
    async execExportFile(item){
      let action = item.action == 'import' ? '导入' : '更新';
      // 导出 取消下载文件
      if((item.action == 'export' || !item.action) && item.isFinished == 0) {
        if(await platform.confirm(`确定要取消文件[${item.name}]的导出？`)){
      
          this.operationList.push({id: item.id, operate: 'cancel'})

          try {
            let result = await http.post('excels/cancel', {id: item.id}, false);

            if(result.status == 0) {
              this.operationList = this.operationList.filter(i => i.id != item.id)
            } else {
              platform.alert(result.message);
            }
            this.$emit('change', this.operationList);

            return

          } catch (error) {
            console.error(error);
          }

        }
      }
      // 导出 下载文件
      if((item.action == 'export' || !item.action) && item.isFinished == 1){
        let frame = document.createElement('iframe');
        frame.style.display = 'none';
        frame.src = `/excels/download?id=${item.id}`;
        document.body.appendChild(frame);

        this.operationList.push({id: item.id, operate: 'download'});
        this.$emit('change', this.operationList);
        return
      }
      // 导入或批量更新 取消
      if((item.action == 'import' || item.action == 'update') && item.isFinished == 0) {
        if(await platform.confirm(`确定要取消文件[${item.name}]的${action}？`)){

          this.operationList.push({id: item.id, operate: 'cancel'})
          try {
            let result = await http.get('/excels/delete/manual', {id: item.id});

            this.operationList = this.operationList.filter(i => i.id != item.id)

            if(result.status == 0) {
              // 
            } else {
              platform.alert(result.message);
            }
            this.$emit('change', this.operationList);

            return

          } catch (error) {
            console.error(error);
          }
        }
      }
      // 导入或更新完成
      if(item.action == 'import' || item.action == 'update'){
        try {

          if(item.isFinished == 1) {
            platform.notification({
              title: `共${action}了${item.importInfo.total}条数据`,
              type: 'successs',
            });
          } else if (item.isFinished == 2) {
            this.errorDialog = true;
            this.item = item;
            this.errorDialogTitle = `${action}失败原因`;
            this.reasons = item.importInfo.reasons;
            return
          }

          this.operationList.push({id: item.id, operate: 'cancel'});

          await http.get('/excels/cancel', { id: item.id});

          this.operationList = this.operationList.filter(i => i.id != item.id);
          this.$emit('change', this.operationList);

          return
          
        } catch (error) {
          console.error(error);
        }
      }
    },
    /** 导出下载 */
    exportDownload(item) {
      let frame = document.createElement('iframe');

      frame.style.display = 'none';
      frame.src = `/excels/download?id=${item.id}`;
      document.body.appendChild(frame);

      this.operationList.push({id: item.id, operate: 'download'});
      this.$emit('change', this.operationList);
    },
    /** 删除记录  */
    async deleteRecord(item) {
      this.pending = true;
      try {
        await http.get('/excels/cancel', { id: item.id});

        this.errorDialog = false;
        this.pending = false;

        this.operationList = this.operationList.filter(i => i.id != item.id);
        
        this.$emit('change', this.operationList);
      } catch (error) {
        console.log('deleteRecord -> error', error)
      }
    },
    /** 当前状态显示的文字  */
    getStatusText(item) {
      let { action, isFinished }  = item;
      let text = '';

      switch (action) {
        case 'export': {
          text = isFinished == 0 ? '导出中' : '已完成';
          break;
        }
        case 'import': {
          switch (isFinished) {
            case 0: {
              text = '导入中';
              break;
            }
            case 1: {
              text = '已完成';
              break;
            }
            case 2: {
              text = '导入失败';
              break;
            }
            default: {
              break;
            }
          }
          break;
        }
        case 'update': {
          switch (isFinished) {
            case 0: {
              text = '更新中';
              break;
            }
            case 1: {
              text = '已完成';
              break;
            }
            case 2: {
              text = '更新失败';
              break;
            }
            default: {
              break;
            }
          }
          break;
        }
        case 'calculation': {
          switch (isFinished) {
            case 0: {
              text = '生成中';
              break;
            }
            case 1: {
              text = '已完成';
              break;
            }
            case 2: {
              text = '生成失败';
              break;
            }
            default: {
              break;
            }
          }
          break;
        }
        default: {
          text = isFinished == 0 ? '导出中' : '已完成';
          break;
        }
      }

      return text;
    },
    isImportDelete(createTime, minutes) {
      let timeOut = minutes * 60 * 1000;
      let now = new Date().getTime();

      if((createTime + timeOut) < now) {
        return true;
      }
      return false
    },
    /** 导入或更新 完成  */
    importAndUpdateDone(item, action) {
      platform.notification({
        title: `共${action}了${item.importInfo.total}条数据`,
        type: 'successs',
      });
      this.deleteRecord(item);
    },
    /** @deprecated */
    openTab(module) {
      let menus = JSON.parse(window._init).menus || [];
      let tab = {};

      if(module == 'customer') { 
        tab = menus.filter(m => m.order == 301)[0];
      } else if(module == 'task') {
        tab = menus.filter(m => m.order == 201)[0];
      }

      this.$platform.openTab({
        id: tab.menuKey,
        title: tab.name,
        close: true,
        reload: true,
        url: tab.url,
      })
    },
    /** 打开  失败的弹窗   */
    openErrorDialog(item, action) {
      let reasons = item?.importInfo?.reasons;

      this.errorDialog = true;
      this.item = item;
      this.errorDialogTitle = `${action}失败原因`;
      this.reasons = Array.isArray(reasons) ? reasons : [reasons];
    },
    /** 导出 按钮操作  */
    operateExport(item) {
      if(item.isFinished == 0) {
        return this.cancelOperation(item, '导出');
      }
      this.exportDownload(item);
    },
    /** 导入，批量更新 按钮操作  */
    operateImportAndUpdate(item) {
      let action = item.action == 'import' ? '导入' : '更新';
      let { isFinished } = item;
      let fn = () => ({ });

      switch (isFinished) {
        case 0: {
          fn = this.cancelOperation;
          break;
        }
        case 1: {
          fn = this.importAndUpdateDone;
          break;
        }
        case 2: {
          fn = this.openErrorDialog;
          break;
        }
        default: {
          break;
        }
      }

      fn(item, action);
    },
    /** 绩效 按钮操作  */
    operateCalculation(item) {
      let action = '绩效报告';
      let { isFinished } = item;
      let fn = () => ({ });

      this.item = item;

      switch (isFinished) {
        case 0: {
          fn = this.cancelOperation;
          break;
        }
        case 1: {
          fn = this.performanceDone;
          break;
        }
        case 2: {
          fn = this.openErrorDialog;
          break;
        }
        default: {
          break;
        }
      }

      fn(item, action);
    },
    /** 绩效报告 完成  */
    performanceDone(item, action) {
      this.performanceDialogVisible = true;
      this.createReportResult = item.importInfo;
    },
    performanceViewDetail() {
      const id = this.createReportResult.reportId || this.createReportResult.id;
      this.performanceDialogVisible = false;

      this.$platform.openTab({
        id: `performanceReport${id}`,
        title: '绩效报告详情',
        close: true,
        url: `/performance/v2/report/desc/${id}`,
      })

      this.deleteRecord(this.item);
    },
  },
}
</script>

<style lang="scss">
  .import-update-error-dialog-body {
    padding: 20px;
    min-height: 200px;
    max-height: 400px;
    overflow-y: scroll;
    p {
      margin-bottom: 5px;
    }
  }
  .import-update-error-dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  .performance-report-modal {

    .approve-process-container {
      width: 300px;
      margin: 0;
    }

    .base-modal-body {
      padding: 15px;
      padding-right: 25px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
    }

  }
</style>
