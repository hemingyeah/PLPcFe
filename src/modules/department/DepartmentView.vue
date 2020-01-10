<template>
  <!-- start 选择组织架构页面 -->
  <div class="department-container" v-loading.fullscreen.lock="loading">
    
    <!-- start 主要内容 -->
    <div class="department-main">

      <!-- start 左侧部门列表 -->
      <div class="department-main-left">
        <!-- start 部门列表树 -->
        <div class="department-tree-view">
          <div class="bc-dept" v-if="depts.length > 0">
            <base-tree
              :data="depts" 
              :selected="selectedDept" 
              :show-checkbox="allowCheckDept"
              @node-selected="initDeptUser" 
              @node-check="chooseDept" 
              :node-render="nodeRender"
            />
          </div>
        </div>
        <!-- end 部门列表树 -->
      </div>
      <!-- end 左侧部门列表 -->

      <!-- start 右侧子部门 人员列表 -->
      <div class="department-main-right">

        <!-- start 部门 header -->
        <div class="department-detail-header">

          <div class="department-detail-header-title" v-if="Object.keys(selectedDept).length > 0">
            <span> {{ selectedDept.name }} </span>
            <base-button type="ghost"> 编辑 </base-button>
          </div>

          <!-- TODO: 面包屑列表 -->

        </div>
        <!-- end 部门 header -->

        <!-- start 下级部门 -->
        <div class="department-child-block">
          
          <div class="department-child-block-header">

            <div class="department-child-block-header-text">
              <i class="iconfont icon-bumen"></i>
              <span> 下级部门 </span>
            </div>

            <div class="department-child-block-header-btn">
              <base-button type="ghost"> 添加子部门 </base-button>
            </div>

          </div>

          <div class="no-data-block">
            当前部门不包含下级部门 <span class="active-btn">添加子部门</span>
          </div>

        </div>
        <!-- end 下级部门 -->

        <!-- start 部门人员 -->
        <div class="department-user-block">

          <div class="department-user-block-header">

            <div class="department-user-block-header-text">
              <i class="iconfont icon-renyuan"></i>
              <span> 部门人员 </span>
            </div>
            
            <div class="department-user-block-header-btn">
              <base-button type="primary" @event="chooseUser"> 添加成员 </base-button>
              <base-button type="primary"> 调整部门 </base-button>
              <base-button type="danger" @event="userDeleteConfirm"> 批量删除 </base-button>
            </div>
          </div>

          <div class="department-user-table" v-if="userPage.list.length > 0">
            <el-table
              :data="userPage.list"
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
                  <a :href="`/security/user/view/${scope.row.userId}`" :data-id="scope.row.userId" @click="goUserDetail" class="view-detail-btn">
                    {{scope.row.displayName}}
                  </a>
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

            <div class="table-footer">
              <div class="list-info">
                共<span class="level-padding">{{userPage.total}}</span>记录，
                已选中<span class="selectedCount">{{multipleSelection.length}}</span>条
                <span class="selectedCount select-init-text" @click="selectionToggle()">清空</span>
              </div>
              <el-pagination
                class="customer-table-pagination"
                background
                @current-change="jump"
                @size-change="handleSizeChange"
                :page-sizes="[10, 20, 50]"
                :page-size="params.pageSize"
                :current-page="params.pageNum"
                layout="prev, pager, next, sizes, jumper"
                :total="userPage.total">
              </el-pagination>
            </div>

          </div>

          <div v-else class="no-data-block">
            当前部门暂无人员 <span class="active-btn">添加成员</span>
          </div>

        </div>
        <!-- end 部门人员 -->

      </div>
      <!-- end 右侧子部门 人员列表 -->

    </div>
    <!-- end 主要内容 -->

  </div>
  <!-- end 选择组织架构页面 -->
</template>

<script>
/* api */
import { 
  getDepartmentTree, 
  getDepartmentUserCount, 
  getDepartmentUser, 
  deleteDepartmentUser,
  addDepartmentUser,
} from '@src/api/DepartmentApi';
/* utils */
import http from '@src/util/http';
import Page from '@model/Page';

export default {
  name: 'department-view',
  data(){
    return {
      allowCheckDept: false,
      depts: [],
      deptUserCount: {}, // 部门人员数量统计
      isSeeAllOrg: false, // 是否开始降低组织架构人员可见性开关
      loading: false,
      multipleSelection: [],
      params: {},
      selectedDept: {}, // 选中的部门
      userPage: new Page(), // 用户列表
    }
  },
  computed: {
  },
  mounted() {
    this.initialize();
  },
  methods: {
    /** 选择部门 */
    chooseDept(event){
      let {node, value} = event;
    },
    chooseUser() {      
      let options = {
        title: '请选择成员',
        seeAllOrg: true,
        max: -1,
      };

      this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0){
          let data = result.data || {};
          let users = data.users || [];

          this.userAdd(users)
        }
      })
        .catch(err => console.error(err))
    },
    /** 抓取部门数据 */
    fetchDept(){
      let params = {
        seeAllOrg: this.isSeeAllOrg
      };

      return getDepartmentTree(params).then(result => {
        if(result.status == 1) return [];

        let depts = result.data || [];
        let index = -1;

        for(let i = 0; i < depts.length; i++){
          if(depts[i].name == '单独授权人员'){
            index = i;
            break;
          }
        }

        // 将单独授权人员放在最后
        if(index >= 0){
          let arr = depts.splice(index, 1);
          depts.push(arr[0]); 
        }
        
        return depts;
      })
        .catch(err => console.error('err', err));
    },
    fetchDeptCount(){
      return getDepartmentUserCount();
    },
    /** 抓取用户数据 */
    fetchUser(){      
      let params = this.params;

      getDepartmentUser(params).then(userPage => {
        this.userPage.merge(Page.as(userPage));
      })
        .catch(err => console.error('err', err));

    },
    /* 查询是否开启 降低组织架构的开关 */
    getSeeAllOrg() {
      return http.post('/setting/user/getSeeAllOrg').then(result => { 
        return result
      })
    },
    /* 跳转 用户详情页 */
    goUserDetail(event) {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;

      this.$platform.openTab({
        id: `tab_department_view_${el.dataset.id}`,
        title: '成员详情',
        close: true,
        reload: true,
        url: `/security/user/view/${el.dataset.id}`,
      });
    },
    handleSizeChange(pageSize) {
      this.params.pageSize = pageSize;
      this.params.pageNum = 1;

      this.userPage.list = [];

      this.fetchUser();
    },
    /** 初始化 */
    initialize(){
      this.initializeDept();
    },
    /** 初始化部门数据 */
    async initializeDept(){
      this.isSeeAllOrg = false;

      try {
        /* 如果开启 查询按组织架构选项 */
        let result = await this.getSeeAllOrg();
        this.isSeeAllOrg = result.data;
        
      } catch (error) {
        console.log('error: ', error);
      }

      let subtask = [
        this.fetchDept(),
        this.fetchDeptCount()
      ];

      Promise.all(subtask)
        .then(result => {
          let depts = result[0] || [];
          let deptUserCount = result[1] || {};

          this.deptUserCount = deptUserCount.data || {};
          this.depts = depts;

          this.initDeptUser(this.depts[0]); // 默认选中第一个
        })
        .catch(err => console.error(err))
    },
    /** 选中一个部门 */
    async initDeptUser(dept){
      try {
        this.selectedDept = dept;
        this.userPage.list = [];
        this.loading = true;

        // 查询用户
        this.params.keyword = '';
        this.params.deptId = this.selectedDept.id;
        this.params.departmentId = this.selectedDept.id;
        this.params.pageNum = 1;
        this.params.seeAllOrg = this.isSeeAllOrg;

        this.fetchUser();

      } catch (error) {
        console.error(error)
      }

      this.loading = false;
    },
    jump(pageNum) {
      this.params.pageNum = pageNum;

      this.userPage.list = [];

      this.fetchUser();
    },
    nodeRender(h, node){
      let content = <span>{node.name}</span>;
      
      let count = this.deptUserCount[node.id] || 0
      if(count <= 0) return content;

      return (
        <div class="dept-node-wrap">
          <span class="dept-node-name">{node.name}</span>
          <span class="dept-node-count">&nbsp;({count})人</span>
        </div>
      )
    },
    /** select person */ 
    selectionHandle(selection) {
      this.multipleSelection = selection.slice();
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
    async userDeleteConfirm() {
      if(this.multipleSelection.length <= 0) {
        return this.$platform.alert('请先选择需要删除的成员');
      }

      if(await this.$platform.confirm('确定要删除选中的成员？')){
        this.userDelete();
      }
    },
    userDelete() {
      let params = {
        userIdList: this.multipleSelection.map(item => item.userId),
        departmentId: this.selectedDept.id
      }

      this.pending = true;

      deleteDepartmentUser(params).then(result => {
        let isSucc = result.status == 0;

        if(isSucc) {
          this.fetchUser();
        }

        this.$platform.notification({
          title: isSucc ? '' : '失败',
          message: isSucc ? '删除成功' : result.message,
          type: isSucc ? 'success' : 'error',
        });

      })
        .catch(err => console.log(err))
        .finally(() => this.pending = false)
    },
    userAdd(users) {
      let params = {
        departmentId: this.selectedDept.id,
        userIdList: users.map(user => user.userId)
      }

      this.pending = true;

      addDepartmentUser(params).then(result => {
        let isSucc = result.status == 0;

        if(isSucc) {
          this.fetchUser();
        }

        this.$platform.notification({
          title: isSucc ? '' : '失败',
          message: isSucc ? '添加成功' : result.message,
          type: isSucc ? 'success' : 'error',
        });

      })
        .catch(err => console.log(err))
        .finally(() => this.pending = false)
    }
  },
}
</script>

<style lang='scss'>
  html, body, .department-container {
    height: 100%;
  }
  body {
    padding: 10px;
    min-width: 1100px;
    overflow-x: auto;
  }

  .department-container {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0 1px 4px rgba(216, 216, 216, .65);

    display: flex;
    flex-flow: column nowrap;
  }

  .department-main {
    display: flex;
    flex-flow: row nowrap;
    flex: 1;

    height: 100%;
    position: relative;
  }

  .department-main-left {
    display: flex;
    flex: 2;
    flex-flow: column nowrap;

    min-width: 420px;
    height: 100%;

    .bc-dept {
      width: 100%;
    }

    .base-tree-node-content {
      line-height: 32px;
    }

    .base-tree-node-arrow {
      width: 35px;
    }

  }

  .department-main-right {
    background: #fff;
    border-radius: 2px;

    flex: 8;

    height: 100%;
    min-width: 500px;
    padding: 20px;

    overflow-y: auto;
  }

  .department-tree-view {
    border-right: 1px solid #f2f2f2;
    flex: 1;
    padding-top: 5px;
    overflow-y: auto;
  }

  .department-detail-header {
    border-bottom: 1px solid #eee;
    padding: 10px 0;

    &-title {
      line-height: 34px;

      span {
        font-size: 18px;
        font-weight: bold;

        margin-right: 30px;
      }

    }

  }

  .department-child-block {
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .department-child-block,
  .department-user-block {
    margin-top: 30px;

    &-header {
      display: flex;
      justify-content: space-between;

      &-text {
        i {
          font-size: 20px;
        }
        span {
          font-size: 18px;
          font-weight: bold;
        }
      }

      &-btn {

      }

    }

  }

  .active-btn {
    cursor: pointer;
    color: rgb(15, 118, 139);
  }

  .department-user-table {
    margin-top: 10px;

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

      padding: 10px;

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

  .no-data-block {
    line-height: 30px;
    margin-top: 10px;
    text-align: center;
  }
</style>