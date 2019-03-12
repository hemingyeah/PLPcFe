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
        <div class="export-row-badge" :class="{'export-row-badge-finished': item.isFinished == 1}">
          <template v-if="item.action == 'export' || !item.action">
            {{item.isFinished == 0 ? '导出中' : '已完成'}}
          </template>
          <template v-if="item.action == 'import' || item.action == 'update'">
            <span v-if="item.isFinished == 0">
              {{ item.action == 'import' ? '导入' : '更新'}}中
            </span>
            <span v-if="item.isFinished == 1">
              已完成
            </span>
            <span v-if="item.isFinished == 2">
              {{ item.action == 'import' ? '导入' : '更新'}}失败
            </span>
          </template>
        </div>
        <!-- end 导出状态 -->
        <template v-if="operationList.some(o => o.id == item.id)">
          <span class="export-operate-btn">请稍等</span>
        </template>
        <!-- start 导出导入按钮 -->
        <button type="button" class="btn btn-text export-operate-btn" @click="execExportFile(item)" v-else>
          <template v-if="item.action == 'export' || !item.action">
            {{item.isFinished == 0 ? '取消' : '下载'}}
          </template>
          <template v-if="item.action == 'import' || item.action == 'update'">
            <span v-if="item.isFinished == 1">
              确定
            </span>
            <span v-if="item.isFinished == 2">
              {{ item.action == 'import' ? '确定' : '确定'}}
            </span>
          </template>
        </button>
        <!-- end 导出导入按钮 -->
      </div>
    </template>
    <p class="export-empty" v-else>
      您没有待下载的文件
    </p>
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
    }
  },
  methods: {
    async execExportFile(item){
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
            console.log('error: ', error);
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
      // 导入或更新完成
      if(
        (
          item.action == 'import'
          || item.action == 'update'
        )
      ){
        this.operationList.push({id: item.id, operate: 'cancel'});
        try {
          let result = await http.get('/excels/import/delete', { id: item.id});
          let data = JSON.parse(result.data);
          let action = item.action == 'import' ? '导入' : '更新';

          this.operationList = this.operationList.filter(i => i.id != item.id);

          if(data.isImported) {
            platform.alert(`共${action}了${data.total}条数据`);
            this.openTab(item.module);
          } else {
            platform.alert(`${action}失败原因:${data.reasons.join('\n')}`);
          }
          this.$emit('change', this.operationList);
          return
          
        } catch (error) {
          console.log('error: ', error);
        }
        return
      }
    },
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
  },
}
</script>
