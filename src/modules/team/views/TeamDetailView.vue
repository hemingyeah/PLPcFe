<template>
  <section class="team-detail-view" v-loading.fullscreen.lock="loadingPage">
    <!-- start 详情内容 -->
    <div class="team-detail-content">
      <!-- start 工具栏 -->
      <div class="team-tool-bar">
        <div class="func-btn">
          <base-button type="only-text" icon="icon-arrow-left" @event="goBack" v-if="displayGoBackBtn">返回</base-button>
          <!-- TODO: 编辑 需要权限 控制 -->
          <base-button type="only-text" icon="icon-edit" @event="teamEdit" v-if="allowEditTeam">编辑</base-button>
          <base-button type="only-text" icon="icon-fe-close" @event="teamDelete" v-if="allowEditTeam">删除</base-button>
        </div>

        <div class="action-btns">
          <!-- TODO: 新建子团队 需要权限控制 -->
          <div class="action-btn-view" v-if="!teamData.parent && showNewTeam" @click="teamChildCreate">
            <span class="action-btn"> <i class="iconfont icon-add"> </i>新建子团队</span>
          </div>
          <div class="action-btn-view" @click="personAddChoose">
            <span class="action-btn"><i class="iconfont icon-add"></i>添加成员</span>
          </div>
          <div class="action-btn-view" @click="personDelete">
            <span class="action-btn"><i class="iconfont icon-fe-close"></i>删除成员</span>
          </div>
        </div>
      </div>
      <!-- end 工具栏 -->
      <!-- start 主体内容 -->
      <div class="team-detail-main">
        <!-- start  主体左侧 信息 -->
        <div class="team-detail-list">
          <h3>{{ teamData.tagName }}</h3>

          <div class="team-detail-form-group">
            <div class="form-view-row">
              <label>团队描述</label>
              <div class="form-view-row-content">{{ teamData.description }}</div>
            </div>

            <div class="form-view-row">
              <label>主管</label>
              <div class="form-view-row-content">
                <span>{{ teamLeadersName }}</span>
              </div>
            </div>

            <div class="form-view-row">
              <label>电话</label>
              <div class="form-view-row-content">{{ teamData.phone }}</div>
            </div>

            <div class="form-view-row">
              <label>负责区域</label>
              <div class="form-view-row-content">
                <p v-for="place in teamData.tagPlaceList" :key="`${place.id}_index`">
                  {{ place.province || '' }}
                  {{ place.city ? `- ${place.city}` : '' }}
                  {{ place.dist ? `- ${place.dist}` : '' }}
                </p>
              </div>
            </div>

            <div class="form-view-row">
              <label>位置</label>
              <div class="form-view-row-content" v-if="teamData.tagAddress">
                {{ teamData.tagAddress | fmt_address }}
                <i v-if="teamData.tagAddress.longitude && teamData.tagAddress.latitude" @click="openMap" class="iconfont icon-address team-address-icon link-text"></i>
              </div>
            </div>

            <div class="form-view-row" v-if="teamData.parent && showNewTeam">
              <label>主团队</label>
              <div class="form-view-row-content">
                <span @click="goTeamDetail(teamData.parent.id)" class="link-text">
                  {{ teamData.parent.tagName }}
                </span>
              </div>
            </div>

            <div class="form-view-row" v-else-if="!teamData.parent && showNewTeam">
              <label>子团队</label>
              <div class="form-view-row-content">
                <span @click="goTeamDetail(child.id)" v-for="(child, index) in teamData.children" :key="index + 'detail'" class="link-text">
                  {{ child.tagName }}
                  <span v-if="index <= teamData.children.length - 2" class="no-link">
                    ,
                  </span>
                </span>
              </div>
            </div>

            <!-- TODO: 暂时隐藏 团队技能 -->
            <!-- <div class="form-view-row">
              <label>团队技能：</label>
              <div class="form-view-row-content">传动机，发电机</div>
            </div> -->
          </div>
        </div>
        <!-- end  主体左侧 信息 -->
        <!-- start 主体右侧 表格-->
        <div class="team-detail-table">
          <el-table
            :data="page.list"
            stripe
            @select="selectionHandle"
            @select-all="selectionHandle"
            :highlight-current-row="false"
            header-row-class-name="team-detail-table-header"
            ref="multipleTable" class="team-table"
          >
            <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
            <el-table-column prop="displayName" label="姓名">
              <div style="display: flex" slot-scope="scope">
                <a :href="`/security/user/view/${scope.row.userId}`" :data-id="scope.row.userId" @click="goUserDetail" class="view-detail-btn">{{scope.row.displayName}}</a>
                <template v-if="scope.row.isTeamLeader">
                  <i class="iconfont icon-people"></i>主管
                </template>
              </div>
            </el-table-column>
            <el-table-column prop="loginName" label="账号" />
            <el-table-column prop="cellPhone" label="服务电话" />
            <el-table-column prop="enabled" label="状态">
              <template slot-scope="scope">
                {{scope.row.enabled == 1 ? '启用' : '禁用'}}
              </template>
            </el-table-column>
          </el-table>

          <!-- <div class="table-footer">
            FIXME: 不需要跨页选择
            <div class="list-info">
              共<span class="level-padding">{{page.total}}</span>记录，
              已选中<span class="selectedCount">{{multipleSelection.length}}</span>条
              <span class="selectedCount select-init-text" @click="selectionToggle()">清空</span>
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
              :total="page.total">
            </el-pagination>
          </div> -->
        </div>
        <!-- end 主体右侧 表格-->
      </div>
      <!-- end 主体内容 -->
    </div>
    <!-- end 详情内容 -->
  </section>
</template>

<script>
import _ from 'lodash';
import url from 'url';
import qs from 'qs';

import Page from '@model/Page';
import * as TeamApi from '@src/api/TeamApi'

export default {
  name: 'team-detail-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loadingPage: false,
      multipleSelection: [],
      page: new Page(),
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        total: 5,
      },
      team: {
        id: '',
        status: '' 
      },
      teamData: {
        teamLeaders: []
      }
    }
  },
  computed: {
    /* 主管名字 */
    teamLeadersName() {
      return this.teamData.teamLeaders.map(t => t.displayName).join('，')
    },
    urlParams() {
      return url.parse(window.location.href, true);
    },
    teamId() {
      return (this.initData && this.initData.tag && this.initData.tag.id) || '';
    },
    displayGoBackBtn() {
      return !this.urlParams.query.noHistory;
    },
    /* 编辑团队权限 */
    allowEditTeam() {
      return true
    },
    showNewTeam() {
      return this.initData.showNewTeam === true;
    }
  },
  mounted() {
    const localStoragePageSize = this.storageGetData();
    if (localStoragePageSize) {
      this.page.pageSize = Number(localStoragePageSize);
    }
    this.loadingPage = true;
    this.page.pageNum = 1;
    this.page.list = [];
    
    this.teamData = (this.initData && this.initData.tag) || {};
    // this.fetchTeamData();
    this.fetchTableData();
  },
  methods: {
    async fetchTeamData() {
      let params = {
        id: this.teamId
      };
      this.loadingPage = true;

      try {
        let result = await TeamApi.getTag(params);

        if (result.status) return this.$platform.notification({
          title: '失败',
          message: (h => <div>{result.message}</div>)(this.$createElement),
          type: 'error',
          duration: 0
        });

        this.teamData = result.data;
        this.fetchTableData();

      } catch (error) {
        console.log('error: ', error);
      } finally {
        this.loadingPage = false;
      }
    },
    async fetchTableData() {
      let params = {
        pageSize: 0,
        pageNum: this.page.pageNum,
        tagId: this.teamId,
      }
      this.loadingPage = true;
      try {
        let result = await TeamApi.userList(params);

        this.page.cover(result);

      } catch (e) {
        console.error('personAdd catch error', e);
      } finally {
        this.loadingPage = false;
      }
    },
    jump(pageNum) {
      this.page.pageNum = pageNum;
      this.page.list = [];

      this.fetchTableData();
    },
    goBack() {
      window.parent.frameHistoryBack(window);
    },
    goTeamDetail(id) {
      // TODO: 详情页
      window.location.href = `/security/tag/view/${id}`;
    },
    /* 跳转 用户详情页 */
    goUserDetail(event) {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;

      this.$platform.openTab({
        id: `tab_team_view_${el.dataset.id}`,
        title: '成员详情',
        close: true,
        reload: true,
        url: `/security/user/view/${el.dataset.id}`,
      });
    },
    /* 判断是否是主团队 */
    isParent(item) {
      return (
        !item.parent
        && Array.isArray(item.children)
      );
    },
    openMap() {
      this.$fast.map.display(this.teamData.tagAddress, {title: '团队位置'})
        .catch(err => console.error('openMap catch an err: ', err));
    },
    /** 缓存  get */
    storageGetData() {
      return localStorage.getItem('team_detail_page_size') || '10';
    },
    /** 缓存 set */
    storageSetData() {
      localStorage.setItem('team_detail_page_size', JSON.stringify(this.page.pageSize));
    },
    /** select person */ 
    selectionHandle(selection) {
      this.multipleSelection = selection.slice(0)
    },
    selectionToggle(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    handleSizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.page.pageNum = 1;
      this.page.list = [];

      this.fetchTableData();
      this.storageSetData();
    },
    /** 新建子团队 */
    teamChildCreate() {
      let parent = {
        pid: this.teamData.id,
        pname: this.teamData.tagName,
      }

      window.location.href = `/security/tag/createTag?${qs.stringify(parent)}`;
    },
    /** 删除团队 */
    async teamDelete() {
      let confirm = false;

      if(!this.teamData.parent && this.isParent(this.teamData) && this.showNewTeam) {
        confirm = await this.$platform.confirm('您删除的团队，如果包含子团队将会一并删除，是否继续？');
      } else {
        confirm = await this.$platform.confirm('您确定要删除该团队？');
      }

      try {
        if (!confirm) return;

        this.loadingPage = false;

        let ids = [];
        ids.push(this.teamData.id);

        let result = await TeamApi.deleteTag(ids);
        let isParent = this.isParent(this.teamData);

        this.$platform.notification({
          type: result.status == 0 ? 'success' : 'error',
          title: `团队删除${result.status == 0 ? '成功' : '失败'}`,
          message: result.status == 0 ? null : result.message
        })

        if (!result.status) {
          let id = window.frameElement.dataset.id;
          let fromId = window.frameElement.getAttribute('fromid');

          this.$platform.refreshTab(fromId);

          if(this.displayGoBackBtn && isParent) {
            this.goBack();
          } else {
            this.$platform.closeTab(id);
          }

        }
        this.loadingPage = false;
      } catch (e) {
        console.error('teamDelete catch error', e);
      }
    },
    /** 编辑团队 */
    teamEdit() {
      window.location.href = `/security/tag/editTag/${this.teamData.id}`
    },
    personAddChoose() {
      let options = {};
      
      options.selectedUser = this.page.list;
      options.max = -1;
      options.title = '请选择成员';
      options.selected = this.page.list;

      this.$fast.contact.choose('dept', options).then((res = {}) => {
        let data = res.data || {};
        let users = data.users || [];
        this.personAdd(users)
      })
        .catch(err => console.error(err))
    },
    /** 添加成员 */
    async personAdd(users) {
      let params = {
        tagId: this.teamData.id,
        userIds: users.map(user => user.userId)
      }
      try {
        this.loadingPage = true;
        let result = await TeamApi.addUser(params);

        this.$platform.notification({
          type: result.status == 0 ? 'success' : 'error',
          title: `添加成员${result.status == 0 ? '成功' : '失败'}`,
          message: result.status == 0 ? null : result.message
        })

        this.page.pageNum = 1;
        this.page.list = [];
        this.fetchTableData();
      } catch (error) {
        this.loadingPage = false;
        console.log('error: ', error);
      }
    },
    /** 移除成员 */
    async personDelete() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择您需要删除的成员');
      }
      try {
        const confirm = await this.$platform.confirm('您确定要删除选择的成员？');
        if (!confirm) return;

        let params = {
          tagId: this.teamData.id,
          userIds: this.multipleSelection.map(user => user.userId).join(',')
        };

        this.loadingPage = true;

        let result = await TeamApi.deleteUser(params);

        this.$platform.notification({
          type: result.status == 0 ? 'success' : 'error',
          title: `删除成员${result.status == 0 ? '成功' : '失败'}`,
          message: result.status == 0 ? null : result.message
        })
        // 判断删除的是否含有 主管
        let isHasLeader = this.multipleSelection.every(m => !m.isTeamLeader);
        this.multipleSelection = [];

        if(!isHasLeader) {
          this.fetchTeamData()
        } else {
          this.fetchTableData();
        }

      } catch (e) {
        this.loadingPage = false;
        console.error('deleteUser catch error', e);
      }
    },
  }
}
</script>

<style lang="scss">
  html, body {
    height: 100%;
  }
  .team-detail-view {
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 10px;
  }

  .team-detail-content {
    height: 100%;

    .team-tool-bar {
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: $text-color-regular;
      /*padding: 12px 20px;*/
      padding: 10px;
      border-bottom: 1px solid #f2f2f2;

      .text-button {
        padding: 10px 15px;
      }

      .func-btn {
        display: flex;
        align-items: center;
        .text-button {
          line-height: 22px;
          padding: 5px 12px;
        }
      }

      .action-btns {
        display: flex;
        justify-content: flex-start;
      }
      .action-btn {
        padding: 0 15px;
        line-height: 33px;
        display: inline-block;
        background: #eef8f8;
        color: #333;
        margin-left: 10px;

        &:hover {
          cursor: pointer;
          color: #fff;
          background: #55B7B4;
        }

      }

    }
  }

  .team-detail-main {
    display: flex;
    flex-flow: row nowrap;
    height: calc(100% - 64px);
    /*overflow: auto;*/
    position: relative;

    .team-detail-list {
      background: #fff;
      border-right: 1px solid #f2f2f2;

      height: 100%;
      width: 400px;
      padding-top: 55px;

      flex-shrink: 0;
      overflow-y: auto;
    }
    .team-detail-table {

      height: 100%;
      width: calc(100% - 400px);

      flex: 1;
      overflow-y: auto;

      background: #fff;
      border-radius: 2px;
      padding: 10px;

      .el-table {
        height: 100%;
      }
    }

  }

  .team-detail-list {
    
    h3{
      margin: 0;
      margin-bottom: 5px;
      padding: 10px 20px;
      line-height: 30px;
      font-size: 16px;
      color: #333;
      background: #eef8f8;
      font-weight: normal;
      top: 0;
      left: 0;
      width: 390px;
      position: absolute;
      padding-right: 28px;
      word-break: break-word;
      &:after {
        content: '';
        position: absolute;
        top: 0;
        right: -10px;
        height: 100%;
        width: 10px;
        background: #eef8f8;
      }
    }
    .team-detail-form-group {
      padding: 10px 0;
      overflow-y: auto;
    }
    .form-view-row-content {

      p {
        margin-bottom: 0px;
      }
      .link-text {
        color: $color-primary;
        cursor: pointer;
        margin-right: 10px;
      }
      .no-link {
        color: #333;
      }

    }

  }

  .team-detail-table {

    .view-detail-btn {
      color: #55B7B4;
      display: inline-block;
      min-width: 50px;
      max-width: 140px;
      @include text-ellipsis();
    }
    .table-footer {
      display: flex;
      justify-content: space-between;
      padding: 0px 10px 10px 10px;
      background: #fff;
      border-radius: 0 0 3px 3px;
      
      .list-info {
        font-size: 13px;
        line-height: 32px;
        margin: 0;
        color: #767e89;
      }
      .el-pagination {
        white-space: nowrap;
        padding: 2px 5px;
        color: #303133;
        font-weight: bold;
      }
      .selectedCount {
        color: $color-primary;
        padding: 0 3px;
        width: 15px;
        text-align: center;
      }
      .select-init-text:hover {
        cursor: pointer;
      }

    }
  }

  .team-table {
    /*padding: 0 10px;*/
    /*padding: 10px;*/
    overflow: auto;

    &:before {
      height: 0;
    }

    .team-detail-table-header th {
      background: #F5F5F5;
      color: $text-color-primary;
      font-weight: normal;
    }

    th {
      color: #606266;
      font-size: 14px;
    }
    td {
      color: #909399;
      font-size: 13px;
    }

    .view-detail-btn {
      color: $color-primary;
    }

    .select-column .el-checkbox {
      position: relative;
      top: 3px;
    }

  }

  .table-charge-view {
    color: #333;

    i {
      font-size: 14px;
      // margin: 0 5px;
    }

  }

  .team-address-icon {
    color: $color-primary;
  }
</style>
