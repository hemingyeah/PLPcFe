<template>
  <div class="full-page" v-loading.fullscreen.lock="loadingPage">
    <!-- start header -->
    <header class="team-list-header">
      <el-input placeholder="输入团队信息进行搜索" v-model="model.keyword" class="input-with-select">
      </el-input>
      <base-button type="primary" @event="search">
        搜索
      </base-button>
    </header>
    <!-- end header -->
    <div class="full-page-main team-list-view">
      <div class="full-page-header">
        <!-- start 按钮 -->
        <div class="manage-operate-btns">
          <!-- TODO: 是否有权限 新建 删除 -->
          <base-button type="primary" icon="icon-add" @event="teamCreate">
            新建
          </base-button>
          <base-button type="primary" icon="icon-add" @event="teamChildCreate">
            新建子团队
          </base-button>
          <base-button type="ghost" icon="icon-fe-close" @event="teamDelete">
            删除团队
          </base-button>
        </div>
        <!-- end 按钮 -->
      </div>
      <base-table 
        class="team-list" 
        max-height="100vh - 100px"
        row-key="id"
        ref="teamTable"
        :rows="page.list" 
        :columns="columns"
        @select="selectTeamList"
        multiple 
        advanced
      >
      </base-table>
      <!-- start 表格底部 -->
      <div class="full-page-footer">
        <div class="list-info">
          共<span class="level-padding">{{ page.total || 0 }}</span>记录，
          已选中
          <span class="selectedCount" @click="multipleSelectionPanelShow = true">
            {{multipleSelection.length}}
          </span>条
          <span class="selectedCount select-init-text" @click="selectionInit()">清空</span>
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
          :total="page.total"
        >
        </el-pagination>
      </div>
      <!-- end 表格底部 -->
      <!-- <div class="full-page-pagination"> 
        <div style="height: 42px;"></div>
      </div> -->
    </div>

    <!-- start 右侧选择团队弹窗 -->
    <base-panel :show.sync="multipleSelectionPanelShow" width="420px" class="selected-team-panel">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.length}})</span>
        <i 
          v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu team-panel-btn" 
          @click="selectionInit" 
          title="清空已选中数据" 
          data-placement="right" 
          v-tooltip
        >
        </i>
      </h3>
      <dl class="selected-team-list">
        <dt>
          <span class="id-team">编号</span>
          <span class="name-team">团队</span>
          <i></i>
        </dt>
        <dd v-for="(team, index) in multipleSelection" :key="team.id">
          <span class="id-team">{{team.serialNumber}}</span>
          <span class="name-team">{{team.tagName}}</span>
          <span class="delete-btn">
            <i class="iconfont icon-fe-close" @click.self="cancelSelecTteam(team, index)"></i>
          </span>
        </dd>

        <div class="team-selected-tip" v-if="multipleSelection.length <= 0">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
      </dl>
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
  data(){
    return {
      columns: this.buildColumns(),
      loadingPage: false,
      multipleSelectionPanelShow: false,
      multipleSelection: [], // 已选择的团队
      // TODO: 单独的model对象维护所有搜索条件
      model: {
        keyword: '',
        pageSize: 10,
        pageNum: 1,
        total: 1,
      },
      page: new Page(),
      selectedLimit: 200,
    }
  },
  methods: {
    buildColumns(){
      // TODO: localStorage
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
                href={`/security/tag/view?id=${row.id}`}
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
            return row.teamLeaders.map(i => i.displayName).join(',')
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
            return row.tagPlaceList.map(p => `${p.province}-${p.city}-${p.dist}`).join('\n')
          },
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
    /* 获取列表 */
    async fetchPageList(pageNum = 1){
      this.loadingPage = true;
      try {
        let params = {
          pageSize: this.page.pageSize,
          pageNum,
          keyword: this.model.keyword
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
      this.multipleSelection = [];

      this.fetchPageList();
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
    /* 获取本地数据 */
    localStorageGet() {
      try {
        const dataStr = localStorage.getItem('teamListData') || '{}';
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

      this.$platform.openTab({
        id: `team_view_${id}`,
        title: '团队详情',
        url: `/security/tag/view?id=${id}&noHistory=1`,
        reload: true,
        close: true,
      });
    },
    revertSearchParams() {
      const localStorageData = this.localStorageGet();

      if(localStorageData.pageSize) {
        this.page.pageSize = localStorageData.pageSize;
      }
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
    computeSelection(selection) {
      let tv = [];
      tv = this.multipleSelection
        .filter(ms => this.page.list.every(l => l.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    /** 
     * 切换团队选择状态
     * @param {Array} list -表格列表
    */
    selectionToggle(list) {
      this.multipleSelection.forEach(selection => {
        for(let i = 0; i < list.length; i++){
          let item = list[i];

          if(selection.id == item.id) {
            this.$refs.teamTable.toggleRowSelection(item, true);
          }
        }
      })
    },
    /* 新建团队 */
    teamCreate() {
      window.location.href = '/security/tag/createTag';
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
        id: item.id,
        tagName: item.tagName,
      }

      window.location.href = `/security/tag/createChildrenTag?${qs.stringify(parent)}`;
    },
    /* 删除团队 */
    async teamDelete() {
      if(this.multipleSelection.length < 0) {
        return this.$platform.alert('请您先选择至少一个团队');
      }
      // 判断是否 删除含有主团队
      let hasParent = false;
      let select = this.multipleSelection;

      hasParent = select.some(s => {
        return this.isParent(s)
      })

      if(hasParent) {
        let confirm = await this.$platform.confirm('您选择了主团队，将会级联删除子团队。');
        if(!confirm) return;
      }

      try {
        const confirm = await this.$platform.confirm('您确定要删除选择的团队？');
        if (!confirm) return;

        let ids = [];
        this.multipleSelection.forEach(m => ids.push(m.id));

        let result = await TeamApi.deleteTag(ids);

        if(result.status == 0) {
          this.initialize();
        } else {
          this.$platform.alert(result.message);
          this.this.loadingPage = false;
        }

      } catch (e) {
        console.error('teamDelete catch error', e);
      }
    },
  },
  mounted(){
    this.revertSearchParams();
    this.initialize();
  }
}
</script>

<style lang="scss">
  .team-list-header {
    background-color: #fff;
    border-radius: 3px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;

    padding: 12px 10px;

    .input-with-select {
      width: 300px;
      margin-right: 10px;
    }
  }

  .full-page-header {
    margin-bottom: 30px;
  }

  .manage-operate-btns {
    background-color: #fff;
    border-bottom: 1px solid #f2f2f2;
    display: flex;
    margin-top: 10px;
    padding: 10px 0;
    
    .danger-button {
      margin-left: 20px;
    }
    button {
      margin-right: 10px;
    }

  }

  .full-page-footer {
    display: flex;
    justify-content: space-between;
    padding: 0px 10px 10px 10px;
    background: #fff;
    border-radius: 0 0 3px 3px;

    margin-top: 20px;

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

  .selected-team-panel {
    .panel-title {
      font-size: 16px;
      line-height: 60px;
      padding: 0 25px;
      color: #848a93;
      border-bottom: 1px solid #f2f8f7;
      font-weight: normal;
      display: flex;
      justify-content: space-between;
    }
  
    .cancel-select-team-btn {
      margin-right: 20px;
      float: right;
      background: #E5E8F0;
      border-color: #E5E8F0;
      color: #646B78; 
    }
  }

  .selected-team-list {
    overflow-y: auto;
    padding: 0 20px;
    line-height: 45px;
    font-size: 14px;
    height: calc(100% - 130px);

    dt {
      display: flex;
      border-bottom: 1px solid #F0F5F5;
      font-weight: normal;
    }
    dd {
      display: flex;
      
      .iconfont {
        color: $color-primary;
        visibility: hidden;
      }
      &:hover {
        cursor: pointer;
        .iconfont {
          visibility: visible;
        }
      }

    }
    .id-team {
      padding: 0 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 120px;
    }
    .name-team {
      padding: 0 5px;
      width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  }

  .team-list-view {
    margin-bottom: 10px;

    .base-table__head {
      th {
        background-color: #f5f5f5;
        border-bottom: 1px solid #ebeef5;
        color: #333;
        font-weight: normal;
        padding-top: 10px;
        padding-bottom: 10px;
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
        padding: 10px 0;
      }
      .base-table-hover-row{
        background-color: #f5f7fa;
      }
    }

    .team-view-detail-btn {
      color: #55B7B4;;
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
</style>

