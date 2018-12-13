<template>
  <section class="team-detail-view" v-loading.fullscreen.lock="loadingPage">
    <!-- start 详情内容 -->
    <div class="team-detail-content">
      <!-- start 工具栏 -->
      <div class="team-tool-bar">
        <div>
          <base-button type="only-text" icon="icon-arrow-left" @event="goBack">返回</base-button>
          <!-- TODO: 编辑 需要权限 控制 -->
          <base-button type="only-text" icon="icon-edit" @event="teamEdit" v-if="allowEditTeam">编辑</base-button>
        </div>
        <div class="action-btns">
          <!-- TODO: 新建子团队 需要权限控制 -->
          <div class="action-btn-view" v-show="team.status == 'parent'" @click="teamChildCreate">
            <span class="action-btn">
              <i class="iconfont icon-add1">
              </i>
              新建子团队
            </span> 
          </div>
          <div class="action-btn-view" @click="teamDelete">
            <span class="action-btn">
              <i class="iconfont icon-fe-close">
              </i>
              删除团队
            </span> 
          </div>
          <div class="action-btn-view" @click="personAdd">
            <span class="action-btn">
              <i class="iconfont icon-add1">
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
            北京团队
          </h3>
          <div class="team-detail-form-group">
            <div class="form-view-row">
              <label>团队描述：</label>
              <div class="form-view-row-content">负责北京市区空调制冷器的维修以及更换氟利昂</div>
            </div>
            <div class="form-view-row">
              <label>主管：</label>
              <div class="form-view-row-content">孙启豪</div>
            </div>
            <div class="form-view-row">
              <label>电话：</label>
              <div class="form-view-row-content">123123123123</div>
            </div>
            <div class="form-view-row">
              <label>负责区域：</label>
              <div class="form-view-row-content">
                <p>北京市-市辖区0朝阳区</p>
                <p>北京市-市辖区0朝阳区</p>
                <p>北京市-市辖区0朝阳区</p>
              </div>
            </div>
            <div class="form-view-row">
              <label>位置：</label>
              <div class="form-view-row-content">
                望京172号
                <i @click="openMap" class="iconfont icon-address team-address-icon"></i>
              </div>
              <!-- <i v-if="value.adLatitude && value.adLongitude" @click="openMap"
                 class="iconfont icon-address customer-address-icon"></i> -->
            </div>
            <div class="form-view-row">
              <label>{{team.status == 'parent' ? '子团队：' : '主团队：'}}</label>
              <!-- TODO: 主团队  显示子团队 子团队 显示主团队-->
              <div class="form-view-row-content" v-show="team.status == 'child'">
                <span @click="goTeamDetail('parent')" v-for="(item, index) in 2" :key="index + 'detail'" class="link-text">
                  北京东辰团队
                </span>
              </div>
              <div class="form-view-row-content" v-show="team.status == 'parent'">
                <span @click="goTeamDetail('child')" v-for="(item, index) in 3" :key="index + 'detail'" class="link-text">
                  南京东辰团队
                </span>
              </div>
            </div>
            <div class="form-view-row">
              <label>团队技能：</label>
              <div class="form-view-row-content">传动机，发电机</div>
            </div>
          </div>
        </div>
        <!-- end  主体左侧 信息 -->
        <!-- start 主体右侧 表格-->
        <div class="team-detail-table">
          <el-table
            :data="lists"
            stripe
            @select="selectionHandle"
            @select-all="selectionHandle"
            :highlight-current-row="false"
            header-row-class-name="team-detail-table-header"
            ref="multipleTable" class="team-table">

            <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
            <el-table-column
              v-for="column in columns"
              v-if="column.show"
              :key="column.field + 'detail'"
              :label="column.label"
              :prop="column.field"
              :width="column.width"
              :min-width="column.minWidth || '120px'"
              show-overflow-tooltip>

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

          <div class="table-footer">
            <div class="list-info">
              共<span class="level-padding">{{paginationInfo.totalItems}}</span>记录，
              已选中<span class="selectedCount">{{multipleSelection.length}}</span>条
              <span class="selectedCount select-init-text" @click="selectionToggle()">清空</span>
            </div>
            <el-pagination
              class="customer-table-pagination"
              background
              @current-change="jump"
              @size-change="handleSizeChange"
              :page-sizes="[10, 20, 50]"
              :page-size="paginationInfo.pageSize"
              :current-page="paginationInfo.pageNum"
              layout="prev, pager, next, sizes, jumper"
              :total="paginationInfo.totalItems">
            </el-pagination>
          </div>
        </div>
        <!-- end 主体右侧 表格-->
      </div>
      <!-- end 主体内容 -->
    </div>
    <!-- end 详情内容 -->
  </section>
</template>

<script>
import _ from "lodash";
import url from "url";
export default {
  name: 'team-detail-view',
  data() {
    return {
      allowEditTeam: true,
      columns: this.buildColumns(),
      loadingPage: false,
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
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        total: 5,
      },
      team: {
        id: '',
        status: '' 
      }
    }
  },
  created() {
    this.lists = [];
    let urlParams = url.parse(window.location.href, true);
    this.team.id = urlParams.query.id || '';
    this.team.status = urlParams.query.status || 'parent';

  },
  mounted() {
    let initData = JSON.parse(window._init) || {};
    const localStoragePageSize = this.storageGetData();
    if (localStoragePageSize) {
      this.paginationInfo.pageSize = Number(localStoragePageSize);
    }
    this.loadingPage = true;
    this.fetchTableData();
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
    fetchData() {
      const params = {
        pageNum: this.paginationInfo.pageNum,
        pageSize: this.paginationInfo.pageSize,
      };

      this.$http.get('', params)
        .then(res => {
          this.paginationInfo.totalItems = res.total;
        })
    },
    fetchTableData() {
      let params = {
        pageSize: this.paginationInfo.pageSize,
        pageNum: this.paginationInfo.pageNum,
        tagId: this.team.id, // TODO: 团队id
      }
      try {
        this.$http.post('/security/tag/userList', params, false)
          .then(res => {
            this.lists = this.lists.concat(res.list);
            this.paginationInfo = res;
            this.loadingPage = false;
          })
          .catch(err => console.error('personAdd err', err));
      } catch (e) {
        console.error('personAdd catch error', e);
      }
    },
    jump(pageNum) {
      this.paginationInfo.pageNum = pageNum;
      // this.fetchData();
    },
    goBack() {
      window.parent.frameHistoryBack(window);
    },
    goTeamDetail(str) {
      window.location.href += `&status=${str}`;
    },
    openMap() {
      // this.$fast.map.display(this.customer.customerAddress, {title: this.customer.name,})
      //   .catch(err => console.error('openMap catch an err: ', err));
    },
    /** 缓存  get */
    storageGetData() {
      const dataStr = localStorage.getItem('team_detail_page_size') || '10';
      return dataStr;
    },
    /** 缓存 set */
    storageSetData() {
      localStorage.setItem('team_detail_page_size', JSON.stringify(this.paginationInfo.pageSize));
    },
    /** select person */ 
    selectionHandle(selection) {
      this.multipleSelection = selection.slice(0)
      console.log(selection)
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
      this.paginationInfo.pageSize = pageSize;
      this.storageSetData();
    },
    /** 新建子团队 */
    teamChildCreate() {
      // 
    },
    /** 删除团队 */
    async teamDelete() {
      try {
        const result = await this.$platform.confirm('您确定要删除该团队？');
        if (!result) return;

        this.$http.post(``)
          .then(res => {
            this.goBack();
          })
          .catch(err => console.error('teamDelete err', err));
      } catch (e) {
        console.error('teamDelete catch error', e);
      }
    },
    /** 编辑团队 */
    teamEdit() {
      // TODO: 标题修改
      // window.location.href = '/team/create'
      this.$platform.openTab({
        id: "team",
        title: "编辑团队",
        url: "/team/create",
        reload: true
      });
    },
    /** 添加成员 */
    personAdd() {
      // 
    },
    /** 移除成员 */
    async personDelete() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择您需要删除的成员');
      }
      try {
        const result = await this.$platform.confirm('您确定要删除选择的成员？');
        if (!result) return;

        this.$http.post(``)
          .then(res => {
            this.multipleSelection = [];

          })
          .catch(err => console.error('personDelete err', err));
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
      justify-content: flex-start;
      font-size: 14px;
      color: $text-color-regular;
      padding: 12px 20px;
      border-bottom: 1px solid #f2f2f2;

      .text-button {
        padding: 10px 15px;
      }

      .action-btns {
        line-height: 39px;
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
    overflow: auto;
    position: relative;

    .team-detail-list {
      background: #fff;
      width: 390px;
      border-right: 1px solid #f2f2f2;
      flex-shrink: 0;
      height: 100%;
      overflow-y: auto;
      padding-top: 55px;
    }
    .team-detail-table {
      height: 100%;
      width: calc(100% - 400px);
      flex: 1;
      background: #fff;
      margin-left: 10px;
      border-radius: 2px;
      max-height: 600px;
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
    }
    .team-detail-form-group {
      padding: 10px 0;
    }
    .form-view-row-content {
      display: flex;
      flex-wrap: wrap;

      p {
        margin-bottom: 10px;
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
    padding: 0 10px;
    padding: 10px;

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
