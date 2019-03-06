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
          <div class="action-btn-view" v-show="team.status === 'parent'" @click="teamChildCreate">
            <span class="action-btn">
              <i class="iconfont icon-add">
              </i>
              新建子团队
            </span> 
          </div>
          <div class="action-btn-view" @click="personAddChoose">
            <span class="action-btn">
              <i class="iconfont icon-add">
              </i>
              添加成员
            </span> 
          </div>
          <div class="action-btn-view" @click="personDelete">
            <span class="action-btn">
              <i class="iconfont icon-fe-close">
              </i>
              删除成员
            </span> 
          </div>
        </div>
      </div>
      <!-- end 工具栏 -->
      <!-- start 主体内容 -->
      <div class="team-detail-main">
        <!-- start  主体左侧 信息 -->
        <div class="team-detail-list">
          <h3>
            {{ teamData.tagName }}
          </h3>
          <div class="team-detail-form-group">
            <div class="form-view-row">
              <label>团队描述：</label>
              <div class="form-view-row-content">
                {{ teamData.description }}
              </div>
            </div>
            <div class="form-view-row">
              <label>主管：</label>
              <div class="form-view-row-content">
                <span>
                  {{ teamLeadersName }}
                </span>
              </div>
            </div>
            <div class="form-view-row">
              <label>电话：</label>
              <div class="form-view-row-content">
                {{ teamData.phone }}
              </div>
            </div>
            <div class="form-view-row">
              <label>负责区域：</label>
              <div class="form-view-row-content">
                <p v-for="place in teamData.tagPlaceList" :key="`${place.id}_index`">
                  {{ place.province || '' }}
                  {{ place.city ? `-${place.city}` : '' }}
                  {{ place.dist ? `-${place.dist}` : '' }}
                </p>
              </div>
            </div>
            <div class="form-view-row">
              <label>位置：</label>
              <div class="form-view-row-content" v-if="teamData.tagAddress">
                {{ teamData.tagAddress.province }}-
                {{ teamData.tagAddress.city }}-
                {{ teamData.tagAddress.dist }}-
                {{ teamData.tagAddress.address }}
                <i @click="openMap" class="iconfont icon-address team-address-icon link-text"></i>
              </div>
              <!-- <i v-if="value.adLatitude && value.adLongitude" @click="openMap"
                class="iconfont icon-address customer-address-icon"></i> -->
            </div>
            <div class="form-view-row">
              <label>{{team.status == 'parent' ? '子团队：' : '主团队'}}</label>
              <!-- TODO: 主团队  显示子团队, 子团队 显示主团队-->
              <div class="form-view-row-content" v-show="team.status == 'child'">
                <span @click="goTeamDetail(teamData.parent)" class="link-text">
                  {{ teamData.tagName }}
                </span>
              </div>
              <div class="form-view-row-content" v-show="team.status == 'parent'">
                <!-- FIXME: map join -->
                <span @click="goTeamDetail(child.id)" v-for="(child, index) in teamData.children" :key="index + 'detail'" class="link-text">
                  {{ child.tagName }}
                  <span v-if="index <= teamData.children.length - 2">
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
            <el-table-column
              v-for="column in columns"
              v-if="column.show"
              :key="column.field + 'detail'"
              :label="column.label"
              :prop="column.field"
              :width="column.width"
              :min-width="column.minWidth || '120px'"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <template v-if="column.field === 'displayName'">
                  <!-- TODO: 跳转至个人信息页面 -->
                  <a :href="`/security/user/view/${scope.row.userId}`" class="view-detail-btn">{{scope.row[column.field]}}</a>
                  <span class="table-charge-view" v-if="scope.row.isTeamLeader == '1'">
                    <i class="iconfont icon-director"></i>
                    主管
                  </span>
                </template>
                <template v-else>
                  {{scope.row[column.field]}}
                </template>
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
      allowEditTeam: true,
      columns: this.buildColumns(),
      loadingPage: false,
      displayGoBackBtn: true,
      lists: [
        {
          name: '孙启豪',
          isCharge: true,
          account: '孙启豪',
          phone: '1757=61729980'
        },
        {
          name: '王臣',
          isCharge: false,
          account: '王臣',
          phone: '1757=61729980'
        },
        {
          name: '王臣',
          isCharge: false,
          account: '王臣',
          phone: '1757=61729980'
        },
        {
          name: '孙启豪',
          isCharge: true,
          account: '孙启豪',
          phone: '1757=61729980'
        },
        {
          name: '孙启豪',
          isCharge: true,
          account: '孙启豪',
          phone: '1757=61729980'
        },
      ],
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
      return this.teamData.teamLeaders.map(t => t.displayName).join(',')
    }
  },
  created() {
    this.lists = [];
    let urlParams = url.parse(window.location.href, true);

    this.team.id = urlParams.query.id || '';
    this.displayGoBackBtn = !urlParams.query.noHistory;

  },
  mounted() {
    const localStoragePageSize = this.storageGetData();
    if (localStoragePageSize) {
      this.page.pageSize = Number(localStoragePageSize);
    }
    this.loadingPage = true;
    this.page.pageNum = 1;
    this.page.list = [];

    this.fetchTeamData();
    // this.fetchTableData();
  },
  methods: {
    buildColumns() {
      return [{
        label: '名称',
        field: 'displayName',
        show: true,
        width: 160,
      }, {
        label: '账号',
        field: 'loginName',
        show: true,
        width: 120,
      }, {
        label: '服务电话',
        field: 'cellPhone',
        show: true,
      }]
    },
    async fetchTeamData() {
      let params = {
        id: this.team.id
      };

      try {
        let result = await TeamApi.getTag(params);

        if(result.status == 0) {
          this.teamData = result.data;

          let status = '';
          if(this.isParent(this.teamData)) {
            status = 'parent';
          } else {
            status = 'child'
          }
          this.team.status = status;

          this.fetchTableData();

        } else {
          this.$platform.alert(result.status);
        }
      } catch (error) {
        console.log('error: ', error);
      } finally {
        this.loadingPage = false;
      }
    },
    fetchData() {
      const params = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
      };

      this.$http.get('', params)
        .then(res => {
          this.paginationInfo.totalItems = res.total;
        })
    },
    async fetchTableData() {
      let params = {
        pageSize: 0,
        pageNum: this.page.pageNum,
        tagId: this.team.id, // TODO: 团队id
      }
      this.loadingPage = true;
      try {
        let result = await TeamApi.userList(params);

        this.page.merge(result);

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
      window.location.href = `/security/tag/view?id=${id}`
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
      // let tv = this.selectionCompute(selection);
      // let original = this.multipleSelection
      //   .filter(ms => this.customers.some(cs => cs.id === ms.id));
      // let unSelected = this.customers
      //   .filter(c => original.every(oc => oc.id !== c.id));

      // if (tv.length > this.selectedLimit) {
      //   unSelected.forEach(row => {
      //     this.$refs.multipleTable.toggleRowSelection(row, false);
      //   });
      //   return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      // }
      // this.multipleSelection = tv;
    },
    selectionCompute(selection) {
      // let tv = [];
      // tv = this.multipleSelection
      //   .filter(ms => this.customers.every(c => c.id !== ms.id));
      // tv = _.uniqWith([...tv, ...selection], _.isEqual);
      // return tv;
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
        action: 'create',
        id: this.teamData.id,
        tagName: this.teamData.tagName,
      }

      window.location.href = `/security/tag/createTag?${qs.stringify(parent)}`;
    },
    /** 删除团队 */
    async teamDelete() {
      if(this.teamData.parent && this.isParent(this.teamData)) {
        return this.$platform.confirm('您选择了主团队，将会级联删除子团队。');
      }
      try {
        const confirm = await this.$platform.confirm('您确定要删除该团队？');
        if (!confirm) return;

        this.loadingPage = false;

        let ids = [];
        ids.push(this.teamData.id);

        let result = await TeamApi.deleteTag(ids);

        if(result.status == 0) {
          this.goBack();
        } else {
          this.$platform.alert(result.message);
          this.loadingPage = false;
        }

      } catch (e) {
        console.error('teamDelete catch error', e);
      }
    },
    /** 编辑团队 */
    teamEdit() {
      // TODO: 编辑团队 
      let query = {
        action: 'edit',
        id: this.teamData.id,
      };
      let href = ''

      if(this.isParent(this.teamData)) {
        href = 'editTag';
      } else {
        href = 'editChildrenTag'
      }
      window.location.href = `/security/tag/${href}?${qs.stringify(query)}`;
      
    },
    personAddChoose() {
      let options = {};
      
      // TODO: select
      options.selectedUser = this.page.list;
      options.max = 0;
      options.title = '请选择成员';

      this.$fast.contact.choose('dept', options).then(res => {
        this.personAdd(res.data.users)
      })
    },
    /** 添加成员 */
    async personAdd(users) {
      let params = {
        tagId: this.teamData.id,
        userIds: users.map(user => user.userId)
      }
      try {
        let result = await TeamApi.addUser(params);
        if (result.status) return this.$platform.notification({
          title: '添加失败',
          message: (h => <div>{result.message}</div>)(this.$createElement),
          type: 'error',
          duration: 0
        });

        this.page.pageNum = 1;
        this.page.list = [];
        this.fetchTableData();
      } catch (error) {
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

        let result = await TeamApi.deleteUser(params);

        if (result.status) return this.$platform.notification({
          title: '删除成员失败',
          message: (h => <div>{result.message}</div>)(this.$createElement),
          type: 'error',
          duration: 0
        });

        // this.$platform.alert('删除成功');
        // 判断删除的是否含有 主管
        let isHasLeader = this.multipleSelection.every(m => {
          return m.isTeamLeader != 1
        })
        this.multipleSelection = [];

        if(isHasLeader) {
          this.fetchTeamData()
        } else {
          this.fetchTableData();
        }

      } catch (e) {
        console.error('personDelete catch error', e);
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
      width: 390px;
      border-right: 1px solid #f2f2f2;
      flex-shrink: 0;
      height: 100%;
      padding-top: 55px;
    }
    .team-detail-table {
      height: 100%;
      width: calc(100% - 390px);
      flex: 1;
      background: #fff;
      margin-left: 10px;
      border-radius: 2px;
      overflow-y: auto;
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

    }

  }

  .team-detail-table {

    .view-detail-btn {
      color: #55B7B4;
      display: inline-block;
      width: 50px;
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
