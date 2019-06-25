<template>
  <div class="full-page" v-loading.fullscreen.lock="loadingPage">
    <header class="team-list-header">
      <form class="base-search team-list-header-search" @submit.prevent="search">
        <el-input placeholder="输入团队信息进行搜索" v-model="model.keyword" class="input-with-select">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <button type="submit" class="btn btn-primary">搜索</button>
        <button type="button" class="btn btn-ghost" @click="resetParams">重置</button>
      </form>

      <!-- start 团队选项 -->
      <div class="team-list-checkbox-view">
        <!-- start 按服务团队派单 -->
        <el-checkbox v-model="isAllotByTag" @change="setUsedAllot">启用按服务团队派单</el-checkbox>
        <el-popover
          placement="bottom-end"
          width="300"
          trigger="hover"
          content="开启后，指派工单将按照团队查询人员；禁用时，按通讯录方式查询人员">
          <i class="iconfont icon-help" slot="reference"></i>
        </el-popover>
        <!-- end 按服务团队派单 -->
        <el-checkbox v-model="isSeeAllOrg" @change="setSeeAllOrg" :disabled="!isAllotByTag" class="team-list-header-see">选择人员时隐藏非团队内成员</el-checkbox>
        <el-popover
          placement="bottom-end"
          width="300"
          trigger="hover"
          content="开启本选项后，在选择协同人等调用钉钉通讯录时只可见自己所属服务团队的成员，管理员除外">
          <i class="iconfont icon-help" slot="reference"></i>
        </el-popover>
      </div>
      <!-- end 团队选项 -->
    </header>
    <!-- end header -->
    <div class="full-page-main team-list-view">
      <div class="full-page-header">
        <!-- start 按钮 -->
        <div class="manage-operate-btns">
          <!-- TODO: 是否有权限 新建 删除 -->
          <base-button type="primary" icon="icon-add" @event="teamCreate">新建</base-button>
          <base-button type="primary" icon="icon-add" @event="teamChildCreate" v-if="showNewTeam">新建子团队</base-button>
          <base-button type="ghost" icon="icon-fe-close" @event="teamDelete">删除团队</base-button>
        </div>
        <!-- end 按钮 -->
        <!-- start 服务电话 -->
        <div class="team-service-btn">
          <base-button type="primary" @event="openTelDialog">
            维护服务电话
          </base-button>
        </div>
        <!-- end 服务电话 -->
      </div>
      <div class="team-table-list">
        <base-table 
          class="team-list" 
          max-height="100vh - 205px"
          row-key="id"
          ref="teamTable"
          :rows="page.list" 
          :columns="columns"
          @select="selectTeamList"
          @update="updateTableColumns"
          multiple 
          advanced/>
      </div>
      <!-- start 表格底部 -->
      <div class="full-page-footer">
        <div class="list-info">
          共<span class="level-padding">{{ page.total || 0 }}</span>记录，已选中
          <span class="selectedCount" @click="multipleSelectionPanelShow = true">{{multipleSelection.length}}</span>条
          <span class="selectedCount select-init-text" @click="selectionInit">清空</span>
        </div>
        <el-pagination
          class="customer-table-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="page.pageSize"
          :current-page="page.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="page.total"/>
      </div>
    </div>

    <!-- start 导入服务电话 -->
    <base-import
      title="维护服务电话"
      ref="serviceTelModal"
      :is-import-now="isImportNow"
      @success="importServiceSuccess"
      action="/security/user/import/cellPhone">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载<a :href="`/security/user/import/template?tagId=${serviceTelItemId}`">导入模版 </a>，填写完成后再上传导入。<br>
          这里维护服务电话仅用于给客户发送预约短信时显示服务人员电话；<br>
          如果没有维护服务人员电话将会发送短信设置中统一服务电话；<br>
          此数据为非必填项。  <br>
          <br>
          短信示例<br>
          <br>
          【售后宝】尊敬的客户您好，{公司名称}{计划时间}安排{服务人员姓名}{服务电话}为您提供服务，请安排好您的时间，{客服电话}，谢谢
        </div>
      </div>
    </base-import>
    <!-- end 导入服务电话 -->

    <!-- start 右侧选择团队弹窗 -->
    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.length}})</span>
        <i 
          v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu team-panel-btn" 
          @click="selectionInit" 
          title="清空已选中数据" 
          data-placement="right" 
          v-tooltip/>
      </h3>

      <div class="team-selected-panel">
        <div class="team-selected-tip" v-if="multipleSelection.length <= 0">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>

        <div class="team-selected-list" v-else>
          <div class="team-selected-row team-selected-head">
            <span class="team-selected-name">团队名称</span>
          </div>
          <div class="team-selected-row" v-for="(team, index) in multipleSelection" :key="team.id" >
            <span class="team-selected-name">{{team.tagName}}</span>
            <button type="button" class="team-selected-delete" @click="selectCancelTeam(team, index)">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </div>
        </div>
      </div>
    </base-panel>
    <!-- end 右侧选择团队弹窗 -->
  </div>
</template>

<script>
import _ from 'lodash';
import qs from 'qs';

import Page from '@model/Page';
import * as TeamApi from '@src/api/TeamApi';
import {fmt_address} from '@src/filter/fmt';

export default {
  name: 'team-list-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    return {
      columns: this.buildColumns(),
      loadingPage: false,
      isImportNow: true, // 是否是导入立刻刷新
      isAllotByTag: false, // 是否开始 按服务团队派单选项
      isSeeAllOrg: false, // 是否开启降低组织架构可见性选项
      multipleSelectionPanelShow: false,
      multipleSelection: [], // 已选择的团队
      // TODO: 单独的model对象维护所有搜索条件
      model: this.buildModel(),
      page: new Page(),
      serviceTelItemId: '',
      selectedLimit: 200
    }
  },
  computed: {
    showNewTeam() {
      // return this.initData.showNewTeam === true;
      return true;
    }
  },
  methods: {
    buildColumns(){
      let that = this;
      return [
        {
          field: 'tagName',
          label: '团队名称',
          expandProp: 'children',
          width: 250,
          render(h, col, row){
            return (
              <a class="team-view-detail-btn" 
                href={`/security/tag/view/${row.id}?noHistory=1`}
                onClick={e => that.openTeamView(e, row.id)}>
                {row.tagName}
              </a>
            )
          }
        },
        {
          field: 'teamLeaders',
          label: '团队主管',
          width: 180,
          overflow: 'tooltip',
          formatter(col, row){
            return row.teamLeaders.map(i => i.displayName).join('，')
          },
        },
        {
          field: 'phone',
          label: '电话',
          width: 120,
        },
        {
          field: 'tagPlaceList',
          label: '负责区域',
          width: 250,
          overflow: 'tooltip',
          formatter(col, row){
            return row.tagPlaceList.map(p => `${p.province}${p.city ? `-${p.city}` : ''}${p.dist ? `-${p.dist}` : ''}`).join('，\n')
          }
        },
        {
          field: 'tagAddress',
          label: '所在位置',
          overflow: 'tooltip',
          formatter(col, row){
            return fmt_address(row.tagAddress);
          }
        }
      ]
    },
    buildModel() {
      let model = {
        keyword: '',
      };

      return model
    },
    /* 获取列表 */
    async fetchPageList(pageNum = 1){
      this.loadingPage = true;
      try {
        let params = {
          pageSize: this.page.pageSize,
          pageNum,
          keyword: this.model.keyword,
          onlyParent: true
        }
        let page = await TeamApi.tagList(params);
        this.page.merge(page);
        
        this.$nextTick(() => {
          this.selectionToggle(this.page.list);
        })

        this.loadingPage = false;
      } catch (error) {
        this.loadingPage = false;
        console.error(error)
      }
    },
    /* 页码数 切换 */
    handleSizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.page.list = [];

      this.localStorageSet('pageSize', pageSize);
      this.fetchPageList();
    },
    /* 初始化 */
    initialize(){
      this.page.pageNum = 1;
      this.page.list = [];

      return this.fetchPageList(this.page.pageNum)
    },
    jump(pageNum) {
      this.page.list = [];
      this.fetchPageList(pageNum);
    },
    /* 判断是否是主团队 */
    isParent(item) {
      let bool = (
        !item.parent
        && Array.isArray(item.children)
      );

      return bool
    },
    /* 导入维护服务电话成功 */
    importServiceSuccess() {
      // 
    },
    /* 获取本地数据 */
    localStorageGet() {
      try {
        const dataStr = localStorage.getItem('teamListData') || '{}'
        return JSON.parse(dataStr); 
      } catch (error) {
        console.log('error: ', error);
        return {}
      }
    },
    /* 设置本地数据 */
    localStorageSet(key, value) {
      const data = this.localStorageGet();

      data[key] = value;
      localStorage.setItem('teamListData', JSON.stringify(data));
    },
    openTeamView(e, id){
      e.preventDefault();
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `team_view_${id}`,
        title: '团队详情',
        url: `/security/tag/view/${id}?noHistory=1`,
        reload: true,
        close: true,
        fromId
      });
    },
    /* 打开服务电话弹出框 */
    openTelDialog() {
      if(this.multipleSelection.length != 1) {
        return this.$platform.alert('请您先选择一个团队');
      }
      let item = this.multipleSelection[0];

      this.serviceTelItemId = item.id;
      this.$refs.serviceTelModal.open();
    },
    /** 复原搜索参数 */
    revertSearchParams() {
      const localStorageData = this.localStorageGet();

      if(localStorageData.pageSize) {
        this.page.pageSize = localStorageData.pageSize;
      }
    },
    /** 复原表格列 数据 */
    revertTableColumns() {
      try {
        let data = this.localStorageGet();
        let columns = data.columns ? JSON.parse(data.columns) : [];

        if(Array.isArray(columns) && columns.length > 0) {
          this.columns = this.columns.map((col, index) => {
            return Object.assign(col, columns[index])
          })
        }
      } catch (error) {
        console.log('revertTableColumns error: ', error);
      }
    },
    /* 复原搜索 参数 */
    resetParams() {
      this.model = this.buildModel();
      this.page.list = [];

      this.fetchPageList()
    },  
    /* 搜索 */
    search() {
      this.page.pageNum = 1;
      this.page.list = [];

      this.fetchPageList();
    },
    /* 清空已选择的团队 */
    selectionInit() {
      this.multipleSelection = [];
      this.$refs.teamTable.clearSelection();
    },
    /* 选择的团队 */
    selectTeamList(selection) {
      let tv = this.computeSelection(selection);

      let original = this.multipleSelection
        .filter(ms => this.page.list.some(l => l.id === ms.id));

      let unSelected = this.page.list
        .filter(l => original.every(oc => oc.id !== l.id));

      if (tv.length > this.selectedLimit) {
        unSelected.forEach(row => {
          this.$refs.teamTable.toggleRowSelection(row, false);
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = tv;
    },
    /* 删除某项已选择的团队 */
    selectCancelTeam(row, index) {
      this.multipleSelection.splice(index, 1);
      this.$refs.teamTable.toggleRowSelection(row, false);
    },
    computeSelection(selection) {
      let allTeam = [];
      let tv = [];

      this.page.list.forEach(l => {
        allTeam.push(l);
        l.children.forEach(child => {
          allTeam.push(child)
        })
      })
      
      tv = this.multipleSelection
        .filter(ms => allTeam.every(l => l.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    /** 
     * 切换团队选择状态
     * @param {Array} list -表格列表
    */
    selectionToggle(list) {
      let allTeam = [];
      list.forEach(l => {
        allTeam.push(l);
        l.children.forEach(child => {
          allTeam.push(child)
        })
      })
      this.multipleSelection.forEach(selection => {
        for(let i = 0; i < allTeam.length; i++){
          let item = allTeam[i];

          if(selection.id == item.id) {
            this.$refs.teamTable.toggleRowSelection(item, true);
          }
        }
      })
    },
    /* 设置是否按 服务团队派单 */
    async setUsedAllot(setTag) {
      let _setTag = 'dep';
      if(setTag) {
        _setTag = 'tag'
      }
      try {
        let params = {
          set: _setTag
        }
        let result = await TeamApi.usedAllot(params);

        if(!setTag) {
          this.setSeeAllOrg();
        }

        if(result.status != 0) {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log('setUsedAllot error: ', error);
      }
    },
    /* 是否开启 降低组织架构 */
    async setSeeAllOrg(state = false) {
      try {
        let params = {
          state,
        }
        let result = await TeamApi.saveSeeAllOrg(params);
        if(result.status != 0) {
          this.$platform.alert(result.message);
        } else {
          this.isSeeAllOrg = state;
        }
      } catch (error) {
        console.log('setUsedAllot error: ', error);
      }
    },
    /* 新建团队 */
    teamCreate() {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: 'team_create',
        title: '新建团队',
        url: '/security/tag/createTag?noHistory=1',
        reload: true,
        close: true,
        fromId
      });
    },
    /* 新建子团队 */
    teamChildCreate() {
      let len = this.multipleSelection.length;
      if(len != 1) {
        return this.$platform.alert('请您选择一个团队');
      }
      let item = this.multipleSelection[0];

      if(!this.isParent(item)) {
        return this.$platform.alert('请您选择一个主团队')
      }

      let parent = {
        action: 'create',
        pid: item.id,
        pname: item.tagName,
      }
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'team_create',
        title: '新建子团队',
        url: `/security/tag/createTag?${qs.stringify(parent)}`,
        reload: true,
        close: true,
        fromId
      });
    },
    /* 删除团队 */
    async teamDelete() {
      window.TDAPP.onEvent('pc：团队管理-删除团队事件');
      if(this.multipleSelection.length <= 0) {
        return this.$platform.alert('请您先选择至少一个团队');
      }
      // 判断是否 删除含有主团队
      let hasParent = false;
      let select = this.multipleSelection;
      let confirm = false;

      hasParent = select.some(s => {
        return this.isParent(s)
      })
      
      if(hasParent) {
        confirm = await this.$platform.confirm('您选择了主团队，将会级联删除子团队。');
        if(!confirm) return;
      } else {
        confirm = await this.$platform.confirm('您确定要删除选择的团队？');
        if (!confirm) return;
      }

      try {
        let ids = [];
        this.multipleSelection.forEach(m => ids.push(m.id));

        let result = await TeamApi.deleteTag(ids);

        this.$platform.notification({
          type: result.status == 0 ? 'success' : 'error',
          title: `团队删除${result.status == 0 ? '成功' : '失败'}`,
          message: result.status == 0 ? null : result.message
        })

        if(result.status == 0) {
          this.initialize();
          this.selectionInit();
        } else {
          this.this.loadingPage = false;
        }

      } catch (e) {
        console.error('teamDelete catch error', e);
      }
    },
    /* 更新表格列宽 */
    updateTableColumns(columns) {
      this.columns = this.columns.map((col, index) => {
        return Object.assign(col, columns.data[index]);
      })

      this.localStorageSet('columns', JSON.stringify(columns.data));
    }
  },
  mounted(){
    this.revertSearchParams();
    this.revertTableColumns();
    this.initialize();

    this.isAllotByTag = (this.initData.taskConfig && this.initData.taskConfig.allotByTag !== false);
    this.isSeeAllOrg = this.initData.seeAllOrg !== false;

    // 对外开放刷新方法，用于其他tab刷新本tab数据
    // TODO: [tab_spec]标准化刷新方式
    window.__exports__refresh = this.initialize;
  }
}
</script>

<style lang="scss">
.team-list-header {
  background-color: #fff;
  border-radius: 3px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;

  margin-bottom: 10px;
  padding: 12px 10px;

  .input-with-select {
    width: 300px;
  }

  .team-list-checkbox-view {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .el-checkbox {
      margin-right: 0;
      margin-bottom: 0;
    }
    .team-list-header-see {
      margin-left: 30px;
    }
    .iconfont {
      color: grey;
      margin-left: 5px;
    }
  }
  
  .team-list-header-search .btn{
    margin-left: 7px;
  }

  .el-input {
    input {
      height: 34px;
      line-height: 34px;
    }
  }
    
}

.full-page-main {
  padding: 0;
}

.full-page-header {
  border-bottom: 1px solid #f2f2f2;
  display: flex;
  margin-bottom: 10px;
  padding: 0 10px;
}

.manage-operate-btns,
.team-service-btn{
  background-color: #fff;
  display: flex;
  padding: 10px 0;
  flex: 1;
  
  .danger-button {
    margin-left: 20px;
  }
  button {
    margin-right: 10px;
  }

}

.team-service-btn {
  justify-content: flex-end;
}

.full-page-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #fff;
  border-radius: 0 0 3px 3px;

  .list-info {
    font-size: 13px;
    line-height: 32px;
    margin: 0;
    color: #767e89;

    .level-padding {
      padding: 0 5px;
    }

    .selectedCount {
      color: $color-primary;
      padding: 0 3px;
      width: 15px;
      text-align: center;

      &:hover {
        cursor: pointer;
      }
    }
  }
}

// -------- team selected panel --------
.team-selected-panel{
  font-size: 14px;
  height: calc(100% - 51px);
}

.team-selected-list{
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}

.team-selected-row{
  display: flex;
  flex-flow: row nowrap;
  line-height: 36px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;

  &:hover{
    background-color: #f5f7fa;

    .team-selected-delete{
      visibility: visible;
    }
  }
}

.team-selected-head{
  background-color: #F0F5F5;
  color: #333;
  font-size: 14px;
}

.team-selected-name{
  padding-left: 10px;
  flex: 1;
  @include text-ellipsis;
}

.team-selected-delete{
  width: 36px;
}

.team-selected-row button.team-selected-delete{
  padding: 0;
  width: 36px;
  height: 36px;
  border: none;
  background-color: transparent;
  outline: none;
  color: #646B78;
  visibility: hidden;

  i{
    font-size: 14px;
  }

  &:hover{
    color: #e84040;
  }
}

.team-selected-tip{
  padding-top: 80px;

  img{
    display: block;
    width: 240px;
    margin: 0 auto;
  }

  p{
    text-align: center;
    color: #9a9a9a;
    margin: 30px 0 0 0;
    line-height: 20px;
  }
}

.team-panel-btn{
  float: right;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;

  &:hover{
    color: $color-primary;
  }
}

// -------- team table --------
.team-table-list {
  padding: 0 10px;
}

.team-list-view {
  .base-table__head {
    th {
      background-color: #f5f5f5;
      border-bottom: 1px solid #ebeef5;
      color: #333;
      font-weight: normal;
      line-height: 34px;
      padding-bottom: 10px;
      padding: 6px 0;
    }
    button {
      border: none;
      background-color: #f5f5f5;
      color: #333;
    }
  }

  .base-table__body {
    td {
      color: #909399;
      font-size: 13px;
      height: 42px;
      padding: 6px 0;
    }
    .base-table-hover-row{
      background-color: #f5f7fa;
    }
  }

  .team-view-detail-btn {
    color: #55B7B4;
  }
}

.team-list {
  .base-table-cell {
    padding: 0 10px;
  }

  .base-table-body,
  .base-table__body {
    tr {
      background-color: #fff;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
  }

  .base-table__table {
    .base-table-hover-col{
      background-color: #f5f7fa;
    }
  }
}

.base-table__fixed-left {
  tr {
    th {
      width: 48px;
    }
  }
}
</style>
