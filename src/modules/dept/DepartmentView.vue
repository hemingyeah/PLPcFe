<template>
  <!-- start 选择组织架构页面 -->
  <div class="department-container" v-loading.fullscreen.lock="loading">
    <!-- start 主要内容 -->
    <div class="department-main">
      <div :class="{'department-left': true, 'department-state': isWeChat!=2}">
        <el-button
          type="primary"
          @click="synchronousWeChat"
          :loading="synchronousState"
          class="base-button"
          v-if="isWeChat==2"
        >{{synchronousState?'同步中':'同步企业微信通讯录'}}</el-button>
        <el-tabs type="card" v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="组织架构" name="tag">
            <!-- 部门搜索框 -->
            <div class="dept-search">
              <el-input
                v-model="deptKeyword"
                placeholder="请输入部门名称搜索"
                @input="debounce"
                @keyup.enter.native="debounce"
              >
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
            </div>
            <!-- start 左侧部门列表 -->
            <div class="department-main-left">
              <!-- start 部门列表树 -->
              <div class="department-tree-view">
                <div class="bc-dept" v-if="depts.length > 0">
                  <base-tree-dept
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

            <el-checkbox
              v-model="isSeeAllOrg"
              @change="setSeeAllOrg"
              class="dept-header-see"
            >选择时隐藏非本部门的人员</el-checkbox>
            <el-popover
              placement="bottom-end"
              width="300"
              trigger="hover"
              content="开启本选项后，在选择协同人等只可见自己所属部门的成员，管理员除外"
            >
              <i class="iconfont icon-help" slot="reference"></i>
            </el-popover>
          </el-tab-pane>

          <el-tab-pane label="角色管理" name="role">
            <div class="create-role">
              <el-button type="primary" @click="createRole">新建角色</el-button>
            </div>
            <div v-if="roles.length > 0" class="department-child-list">
              <div
                class="department-child-item dept-role-item"
                v-for="role in roles"
                :key="role.id"
                @click="chooseRole(role)"
                :class="{'department-role-selected': role.id == selectedRole.id}"
              >
                <span>
                  {{ role.text }} &nbsp;&nbsp;
                  <!-- ({{ deptUserCount[department.id] || 0 }}人) -->
                </span>
                <i class="iconfont icon-arrowright"></i>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div
          class="department-child-item dept-role-item dept-del-role-item"
          :class="{'department-role-selected': selectedRole.id == -1}"
          @click="chooseDelRole()"
        >
          <span>已删除账号 &nbsp;&nbsp;</span>
          <i class="iconfont icon-arrowright"></i>
        </div>
      </div>
      <!-- start 右侧角色列表 -->
      <div
        v-if="activeName === 'role' || selectedRole.id == -1"
        class="department-main-right"
        v-loading.fullscreen.lock="roleLoading"
      >
        <!-- start 角色人员 -->
        <div class="department-user-block">
          <div v-if="showRoleDesc" class="department-user-block-header dept-role-desc">
            <div class="department-user-block-header-text">
              <h4>
                角色名称：
                <a
                  :href="`/security/role/view/${selectedRole.id}`"
                  :data-id="selectedRole.id"
                  @click="goRoleDetail"
                  style="color:#55B7B4;"
                >{{selectedRole.text}}</a>
                <!-- <base-button style="margin-left:10px;" type="ghost" @event="openCreateUserPanel"> 查看 </base-button> -->
                <base-button
                  v-if="canEditSystemRole || isCustomeRole"
                  style="margin-left:10px;"
                  type="ghost"
                  @event="editRole(selectedRole.id)"
                >编辑</base-button>
                <base-button
                  v-if="selectedRole.custom"
                  style="margin-left:10px;"
                  type="ghost"
                  @event="resetRole(selectedRole.custom)"
                >重置权限</base-button>
                <base-button
                  v-if="selectedRole.isSys == 0"
                  style="margin-left:10px;"
                  type="danger"
                  @event="delRole(selectedRole.id)"
                >删除角色</base-button>
              </h4>
              <h4 class="role-desc">角色描述：{{roleDes}}</h4>
            </div>
          </div>

          <div class="dept-search-group">
            <el-input
              v-model="roleKeyword"
              placeholder="请输入成员名称搜索"
              style="width:200px;"
              @keyup.enter.native="searchRole"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" @event="searchRole()">搜索</base-button>
            <base-button
              v-if="isSystemRole || isCustomeRole"
              type="primary"
              @event="chooseUser('role')"
            >添加成员</base-button>
            <base-button
              v-if="(isSystemRole || isCustomeRole) && rolePage.list.length"
              type="primary"
              @event="roleDeleteConfirm()"
            >移除成员</base-button>
            <!-- <base-button v-if="isCustomeRole" type="primary" @event="createRole">新建角色</base-button> -->
            <base-button
              v-if="selectedRole.id == 0"
              type="primary"
              @event="roleDialogVisible = true"
            >自动分配角色</base-button>
          </div>

          <div class="department-user-table" v-if="rolePage.list.length > 0">
            <el-table
              :data="rolePage.list"
              stripe
              @select="roleSelectionHandle"
              @select-all="roleSelectionHandle"
              :highlight-current-row="false"
              show-overflow-tooltip
              header-row-class-name="team-detail-table-header"
              ref="roleMultipleTable"
              class="team-table"
            >
              <el-table-column
                type="selection"
                width="48"
                align="center"
                class-name="select-column"
              ></el-table-column>
              <el-table-column prop="displayName" label="姓名">
                <div style="display: flex" slot-scope="scope">
                  <a
                    :href="`/security/user/view/${scope.row.userId}`"
                    :data-id="scope.row.userId"
                    @click="goUserDetail"
                    class="view-detail-btn"
                  >{{scope.row.displayName}}</a>
                  <span v-if="scope.row.superAdmin == 2" class="super-admin-label">主管理员</span>
                </div>
              </el-table-column>
              <el-table-column prop="loginName" label="账号" />
              <template v-if="selectedRole.id == -1">
                <el-table-column label="删除时间" width="180px">
                  <template slot-scope="scope">{{scope.row.deleteTime | fmt_datetime}}</template>
                </el-table-column>
                <el-table-column label="未完成事件" width="120px">
                  <template v-if="scope.row.eventCount" slot-scope="scope">
                    <a
                      href
                      class="text-center"
                      @click.stop.prevent="createTransTab('event',scope.row.userId)"
                    >{{ scope.row.eventCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="未完成工单" width="120px">
                  <template v-if="scope.row.taskCount" slot-scope="scope">
                    <a
                      href
                      class="text-center"
                      @click.stop.prevent="createTransTab('task',scope.row.userId)"
                    >{{ scope.row.taskCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="负责客户数" width="120px">
                  <template v-if="scope.row.customerCount" slot-scope="scope">
                    <a
                      href
                      class="text-center"
                      @click.stop.prevent="createTransTab('customer',scope.row.userId)"
                    >{{ scope.row.customerCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="个人备件库" width="120px">
                  <template v-if="scope.row.spareCount" slot-scope="scope">
                    <a
                      href
                      class="text-center"
                      @click.stop.prevent="createTransTab('stock',scope.row.userId)"
                    >{{ scope.row.spareCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      v-if="scope.row.eventCount || scope.row.taskCount || scope.row.customerCount || scope.row.spareCount"
                      type="text"
                      @click="createTransTab('event', scope.row.userId)"
                    >去转交</el-button>
                    <el-button type="text" @click="resume(scope.row.userId)" v-if="isWeChat!=2">恢复</el-button>
                  </template>
                </el-table-column>
              </template>
              <template v-else>
                <el-table-column label="部门" show-overflow-tooltip>
                  <template
                    slot-scope="scope"
                  >{{scope.row.tagList && scope.row.tagList.map(i => (i && i.tagName) || '').join('，')}}</template>
                </el-table-column>
                <el-table-column prop="cellPhone" label="联系电话" />
                <el-table-column prop="enabled" label="状态">
                  <template slot-scope="scope">{{scope.row.enabled == 1 ? '启用' : '禁用'}}</template>
                </el-table-column>
              </template>
            </el-table>

            <div class="table-footer">
              <div class="list-info">
                共
                <span class="level-padding">{{rolePage.total}}</span>记录，
                已选中
                <span class="selectedCount">{{roleMultipleSelection.length}}</span>条
              </div>
              <el-pagination
                class="customer-table-pagination"
                background
                @current-change="roleJump"
                @size-change="roleHandleSizeChange"
                :page-sizes="[10, 20, 50]"
                :page-size="roleParams.pageSize"
                :current-page="roleParams.pageNum"
                layout="prev, pager, next, sizes, jumper"
                :total="rolePage.total"
              ></el-pagination>
            </div>
          </div>

          <div v-else class="no-data-block">
            当前角色暂无人员
            <span
              v-if="isSystemRole || isCustomeRole"
              class="active-btn"
              @click="chooseUser('role')"
            >添加成员</span>
          </div>
        </div>
        <!-- end 角色人员 -->
      </div>
      <!-- end 右侧角色列表 -->

      <!-- start 右侧子部门 人员列表 -->
      <div v-else class="department-main-right">
        <!-- start 部门 header -->
        <div class="department-detail-header">
          <div class="department-detail-header-title" v-if="Object.keys(selectedDept).length > 0">
            <span>{{ deptInfo.tagName }}</span>
            <div class="dept-edit-del">
              <base-button
                type="ghost"
                @event="openDepartmentEditPanel()"
                v-if="!isRootDepartment(selectedDept)"
              >编辑</base-button>
              <base-button
                type="danger"
                @event="delDepartment()"
                v-if="!isRootDepartment(selectedDept)"
              >删除</base-button>
            </div>
          </div>

          <div class="dept-info">
            <div class="form-view-row">
              <label>部门主管：</label>
              <div class="form-view-row-content">
                <span>{{ teamLeadersName }}</span>
              </div>
            </div>

            <div class="form-view-row">
              <label>负责区域：</label>
              <div
                v-if="deptInfo.tagPlaceList && deptInfo.tagPlaceList.length == 1"
                class="form-view-row-content"
              >
                <span>{{ deptArea }}</span>
              </div>
              <el-tooltip v-else placement="top">
                <div
                  slot="content"
                >{{deptInfo.tagPlaceList && deptInfo.tagPlaceList.map(p => p && `${p.province}${p.city ? `-${p.city}` : ''}${p.dist ? `-${p.dist}` : ''}`).join('，\n')}}</div>
                <a href="javascript:;" style="text-decoration: none;color: #333;">{{deptArea}}</a>
              </el-tooltip>
            </div>
            <div class="form-view-row">
              <label>部门描述：</label>
              <el-tooltip
                v-if="deptInfo.description && deptInfo.description.length > 10"
                placement="top"
              >
                <div slot="content">{{deptInfo.description}}</div>
                <a
                  href="javascript:;"
                  style="text-decoration: none;color: #333;"
                >{{deptDescription}}</a>
              </el-tooltip>
              <div v-else class="form-view-row-content">
                <span>{{ deptInfo.description }}</span>
              </div>
            </div>
          </div>
          <div class="dept-info">
            <div class="form-view-row">
              <label>联系电话：</label>
              <div class="form-view-row-content">{{ deptInfo.phone }}</div>
            </div>

            <div class="form-view-row">
              <label>部门位置：</label>
              <div class="form-view-row-content" v-if="deptInfo.tagAddress"> {{deptInfo.tagAddress | fmt_address }}<i v-if="deptInfo.tagAddress.longitude && deptInfo.tagAddress.latitude" @click="openMap" class="iconfont icon-address team-address-icon link-text"></i></div>
            </div>
          </div>
          <!-- TODO: 面包屑列表 -->
        </div>
        <!-- end 部门 header -->

        <!-- start 下级部门 -->
        <div class="department-child-block">
          <div class="department-child-block-header">
            <div class="department-child-block-header-text">
              <i class="iconfont icon-bumen"></i>
              <span>下级部门</span>
            </div>

            <div class="department-child-block-header-btn dept-edit-del">
              <base-button type="ghost" @event="addDepartment">添加子部门</base-button>
              <!-- <base-button type="danger" @event="delDepartment" v-if="subDepartments.length > 0"> 删除 </base-button> -->
            </div>
          </div>

          <!-- start 下级部门列表 -->
          <!-- <div v-if="subDepartments.length > 0" class="department-child-list">
            <div class="department-child-item" v-for="department in subDepartments" :key="department.id" @click="chooseChildDepartment(department)">
              <span>
                {{ department.name }} &nbsp;&nbsp;
                ({{ deptUserCount[department.id] || 0 }}人)
              </span>
              <i class="iconfont icon-arrowright"></i>
            </div>
          </div>-->

          <div class="department-user-table" v-if="subDepartments.length > 0">
            <el-table
              class="team-table"
              :data="subDepartments"
              stripe
              header-row-class-name="team-detail-table-header"
            >
              <el-table-column prop="tagName" label="部门名称" show-overflow-tooltip />
              <el-table-column label="部门主管" show-overflow-tooltip>
                <template
                  slot-scope="scope"
                >{{scope.row.teamLeaders.map(i => (i && i.displayName) || '').join('，')}}</template>
              </el-table-column>
              <el-table-column prop="phone" label="联系电话" />
              <el-table-column label="部门位置" show-overflow-tooltip>
                <template slot-scope="scope">{{scope.row.tagAddress | fmt_address}}</template>
              </el-table-column>
              <el-table-column label="负责区域" show-overflow-tooltip>
                <template
                  slot-scope="scope"
                >{{scope.row.tagPlaceList.map(p => p && `${p.province}${p.city ? `-${p.city}` : ''}${p.dist ? `-${p.dist}` : ''}`).join('，\n')}}</template>
              </el-table-column>

              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="openDepartmentEditPanel(scope.row.id)">编辑</el-button>
                  <el-button
                    type="text"
                    style="color:#FB602C"
                    @click="delDepartment(scope.row.id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="table-footer">
              <div class="list-info">
                共
                <span class="level-padding">{{subDepartments.length}}</span>记录
              </div>
            </div>
          </div>
          <!-- end 下级部门列表 -->

          <!-- <div class="no-data-block" v-else>
            当前部门不包含下级部门 <span class="active-btn" @click="addDepartment">添加子部门</span>
          </div>-->
        </div>
        <!-- end 下级部门 -->

        <!-- start 部门人员 -->
        <div class="department-user-block">
          <div class="department-user-block-header">
            <div class="department-user-block-header-text">
              <i class="iconfont icon-renyuan"></i>
              <span>成员信息</span>
            </div>
            <base-button type="primary" @event="openCreateUserPanel" v-if="isWeChat!=2">新建成员账号</base-button>
            <!-- <div class="department-user-block-header-btn">
              <base-button type="primary" @event="openCreateUserPanel" v-if="allowAddUser"> 添加成员 </base-button>
              <base-button type="primary" @event="chooseDepartmentMulti"> 调整部门 </base-button>
              <base-button type="danger" @event="userDeleteConfirm"> 批量删除 </base-button>
            </div>-->
          </div>

          <div class="dept-search-group">
            <el-input
              v-model="keyword"
              placeholder="请输入成员名称搜索"
              style="width:200px;"
              @keyup.enter.native="search"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" @event="search();">搜索</base-button>
            <!-- <base-button type="primary">导出动态</base-button> -->
            <el-dropdown trigger="click">
              <span class="el-dropdown-link el-dropdown-btn">导出动态</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <div @click="exportFeed()">导出</div>
                </el-dropdown-item>
                <el-dropdown-item>
                  <div @click="exportFeed('all')">导出全部</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <base-button type="primary" @event="chooseUser()">添加成员</base-button>
            <base-button v-if="canRemove" type="primary" @event="userDeleteConfirm('multiple')">移除成员</base-button>
            <!-- <base-button type="primary" @event="searchModel.pageNum=1;search();trackEventHandler('search')" native-type="submit">搜索</base-button> -->
          </div>

          <div class="department-user-table" v-if="userPage.list.length > 0">
            <el-table
              :data="userPage.list"
              stripe
              @select="selectionHandle"
              @select-all="selectionHandle"
              :highlight-current-row="false"
              header-row-class-name="team-detail-table-header"
              ref="multipleTable"
              class="team-table"
            >
              <el-table-column
                type="selection"
                width="48"
                align="center"
                class-name="select-column"
              ></el-table-column>
              <el-table-column prop="displayName" label="姓名">
                <div style="display: flex" slot-scope="scope">
                  <a
                    :href="`/security/user/view/${scope.row.userId}`"
                    :data-id="scope.row.userId"
                    @click="goUserDetail"
                    class="view-detail-btn"
                  >{{scope.row.displayName}}</a>
                  <i v-if="scope.row.superAdmin == 1" class="iconfont icon-people">主管</i>
                </div>
              </el-table-column>
              <el-table-column prop="loginName" label="账号" />

              <el-table-column label="角色" show-overflow-tooltip>
                <template
                  slot-scope="scope"
                >{{scope.row.roles && scope.row.roles.map(i => (i && i.name) || '').join('，')}}</template>
              </el-table-column>

              <el-table-column prop="cellPhone" label="联系电话" />
              <el-table-column prop="enabled" label="状态">
                <template slot-scope="scope">{{scope.row.enabled == 1 ? '启用' : '禁用'}}</template>
              </el-table-column>

              <el-table-column label="操作" width="150px">
                <template slot-scope="scope">
                  <el-button
                    :disabled="scope.row.pending"
                    v-if="scope.row.enabled == 1"
                    type="text"
                    style="color:#e6a23c"
                    @click="toggleEnable(scope.row)"
                  >停用</el-button>
                  <el-button
                    :disabled="scope.row.pending"
                    v-else
                    type="text"
                    @click="toggleEnable(scope.row)"
                  >启用</el-button>
                  <el-button
                    :disabled="scope.row.pending"
                    type="text"
                    style="color:#FB602C"
                    @click="deleteDeptUser(scope.row)"
                    v-if="isWeChat!=2"
                  >删除</el-button>
                  <el-button
                    type="text"
                    @click="userResetPwdConfirm(scope.row.userId)"
                    v-if="isWeChat!=2"
                  >重置密码</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="table-footer">
              <div class="list-info">
                共
                <span class="level-padding">{{userPage.total}}</span>记录，
                已选中
                <span class="selectedCount">{{multipleSelection.length}}</span>条
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
                :total="userPage.total"
              ></el-pagination>
            </div>
          </div>

          <div v-else class="no-data-block">
            当前部门暂无人员
            <span v-if="allowAddUser" class="active-btn" @click="chooseUser()">添加成员</span>
          </div>
        </div>
        <!-- end 部门人员 -->
      </div>
      <!-- end 右侧子部门 人员列表 -->
    </div>
    <!-- end 主要内容 -->

    <!-- start 新建/编辑 部门 面板 -->
    <department-edit-panel
      ref="departmentEditPanel"
      @create="departmentCreate"
      @edit="departmentEdit"
      @delete="departmentDelete"
    ></department-edit-panel>
    <!-- end 新建/编辑 部门 面板 -->

    <!-- start 新建人员 -->
    <create-user-panel ref="createUserPanel" @submit="userAdd"></create-user-panel>
    <!-- end 新建人员 -->

    <!-- 自动分配角色的对话框 -->
    <el-dialog
      title="自动分配账号"
      :visible.sync="roleDialogVisible"
      width="35%"
      @close="roleDialogClosed"
    >
      <el-form :model="roleForm" ref="roleFormRef">
        <el-form-item label="为新进入的用户选择一个默认角色或由管理员每次指定"></el-form-item>
        <el-select v-model="roleForm.roleId" placeholder="请选择角色" style="width:100%;">
          <el-option
            v-for="item in autoAuthRoles"
            :label="item.text"
            :value="item.id"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="pending" :loading="pending" @click="dispatchRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 导出动态的对话框 -->
    <el-dialog
      title="导出动态"
      :visible.sync="exportDialogvisible"
      width="600px"
      @close="exportDialogClosed"
    >
      <el-form ref="exportFormRef" label-width="120px">
        <el-form-item label="[可选]选择时间">
          <el-date-picker
            v-model="selectdatetime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogClosed">取 消</el-button>
        <el-button
          type="primary"
          :disabled="pending"
          :loading="pending"
          @click="exportData"
        >{{pending ? '正在导出' : '导出'}}</el-button>
      </span>
    </el-dialog>

    <!-- 重置密码的对话框 -->
    <el-dialog
      title="重置密码"
      :visible.sync="resetDialogvisible"
      width="400px"
      @close="resetDialogClosed"
    >
      <el-form ref="restFormRef" label-width="120px" class="reset-dialog-form">
        <label>确定将该成员的密码重置吗？</label>
        <el-form-item label="重置后密码：" required>
          <input type="password" style="position: fixed;left: -9999px;" />
          <el-input placeholder="请输入密码" v-model="resetForm.pwd" type="password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="resetDialogClosed">取 消</el-button>
        <el-button type="primary" :disabled="pending" :loading="pending" @click="resetUserPwd">确 定</el-button>
      </span>
    </el-dialog>
  </div>
  <!-- end 选择组织架构页面 -->
</template>

<script>
/* api */
import {
  getRoleUser,
  getDelUser,
  autoAuth,
  addRoleUser,
  delRoleUser,
  resetPwd,
  getDepartmentUserCount,
  addDepartmentUser,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  updateDepartmentUserBatch,
} from "@src/api/DepartmentApi";

import * as TeamApi from "@src/api/TeamApi";
import md5 from "js-md5";
/* components */
import CreateUserPanel from "./component/CreateUserPanel.vue";
import DepartmentEditPanel from "./component/DepartmentEditPanel.vue";
/* utils */
import _ from "lodash";
import http from "@src/util/http";
import Page from "@model/Page";
import platform from "@src/platform";
import qs from "qs";
import url from "url";
let export_state, timeStart, timeEnd;
export default {
  name: "department-view",
  inject: ["initData"],
  data() {
    return {
      deptKeyword: "",
      activeName: "tag",
      dept_role_data: [],
      roles: [],
      selectedRole: {},
      keyword: "",
      roleKeyword: "",
      roleLoading: false,
      roleDialogVisible: false,
      pending: false,
      autoAuthRoles: [],
      roleForm: {
        roleId: "0",
      },
      roleMultipleSelection: [],
      roleParams: {},
      exportDialogvisible: false,
      resetDialogvisible: false,
      resetForm: {
        userId: "",
        pwd: "",
      },

      selectdatetime: "",
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近半年",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一年",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      deptInfo: {},

      allowCheckDept: false,
      depts: [],
      deptUserCount: {}, // 部门人员数量统计
      isSeeAllOrg: false, // 是否开始降低组织架构人员可见性开关
      loading: false,
      multipleSelection: [],
      params: {},
      selectedDept: {}, // 选中的部门
      userPage: new Page(), // 用户列表
      rolePage: new Page(),
      synchronousState: false, //同步状态
    };
  },
  computed: {
    isWeChat() {
      return this.initData.tenantType;
    },
    authorities() {
      return this.initData.authorities || {};
    },
    allowAddUser() {
      return (
        this.authorities.AUTH_STAFF == 3 &&
        this.authorities.AUTH_ROLE == 3 &&
        this.authorities.AUTH_TAG == 3
      );
    },
    /* 子部门 */
    subDepartments() {
      return this.deptInfo.children || [];
    },
    showRoleDesc() {
      // 0  待分配账号
      // -1  已删除账号
      return this.selectedRole.id != 0 && this.selectedRole.id != -1;
    },
    isSystemRole() {
      // 系统内置角色id:1-10
      return this.selectedRole.id > 0 && this.selectedRole.id < 11;
    },
    canEditSystemRole() {
      // 系统管理员没有编辑和重置操作
      return this.selectedRole.id > 1 && this.selectedRole.id < 11;
    },
    isCustomeRole() {
      // 自定义角色id
      return this.selectedRole.id && this.selectedRole.id.length > 2;
    },
    roleDes() {
      if (this.selectedRole.id == 1)
        return "系统管理员拥有所有权限，不允许删除和编辑！";
      if (this.selectedRole.id >= 2 && this.selectedRole.id <= 10)
        return "系统内置的角色，支持编辑角色权限和重置权限";
      if (this.isCustomeRole) return "自定义角色，支持编辑角色权限和删除角色";
    },
    teamLeadersName() {
      return (
        this.deptInfo.teamLeaders &&
        this.deptInfo.teamLeaders
          .map((i) => (i && i.displayName) || "")
          .join("，")
      );
    },
    deptArea() {
      const tagPlaceList = this.deptInfo.tagPlaceList || [];
      if (!tagPlaceList.length) return "";
      const p = tagPlaceList[0] || {};
      let tagPlace = `${p.province ? `${p.province}` : ""}${
        p.city ? `-${p.city}` : ""
      }${p.dist ? `-${p.dist}` : ""}`;
      if (tagPlaceList.length > 1) tagPlace += "...";
      return tagPlace;
    },
    deptDescription() {
      const desc = this.deptInfo.description || "";
      return desc.length < 10 ? desc : `${desc.substring(0, 10)}...`;
    },
    canRemove() {
      // 主部门下面成员不能移除
      return this.selectedDept.parentId;
    },
  },
  mounted() {
    this.initialize();
    this.dept_role_data = this.initData.rolesJson || [];
    this.roles = [{ id: "0", text: "待分配" }].concat(this.dept_role_data);
    this.selectedRole = this.roles[0];
    // 自动分配角色
    this.autoAuthRoles = [{ id: "0", text: "由管理员每次指定" }].concat(
      this.dept_role_data
    );
    let href = url.parse(window.location.href, true) || {};
    if (href.query && href.query.from == "role") {
      // jsp新建角色后跳转过来的
      this.activeName = "role";
      this.chooseRole(this.selectedRole);
    }
  },
  methods: {
    //同步企业微信通讯录
    async synchronousWeChat() {
      try {
        this.synchronousState = true;
        //获取token
        const token = await this.$http.get("/account/synToken");

        let timeout = setTimeout(() => {
          this.$platform.alert("同步时间较长，系统将在后台继续为您尝试同步");
          this.synchronousState = false;
        }, 30000);
        this.$http
          .get("/login/synContact", { token: token })
          .then((res) => {
            this.synchronousState = false;
            
            clearTimeout(timeout);
            timeout = null;
            if (res.status == 0) {
              this.$platform.alert("同步成功！");
              window.location.reload(); 
            } else {
              this.$platform.alert("同步失败！");
            }
          })
          .catch((err) => {
            clearTimeout(timeout);
            timeout = null;
            this.synchronousState = false;
            console.error("toggleStatus catch err", err);
          });
      } catch (error) {
        clearTimeout(timeout);
        this.synchronousState = false;
        console.error(error);
      }
    },

    debounce: _.debounce(async function () {
      // 部门模糊搜索
      try {
        this.depts = await this.fetchDept();
        this.initDeptUser(this.depts[0]);
      } catch (error) {
        console.log(error);
      }
    }, 1000),
    toggleEnable(row) {
      row.pending = true;
      this.$http
        .post("/security/user/enable", { userId: row.userId }, false)
        .then((res) => {
          row.pending = false;
          if (res.status) return this.$platform.alert(res.message);
          this.initialize(false);
        })
        .catch((err) => {
          row.pending = false;
          console.error("toggleStatus catch err", err);
        });
    },
    async deleteDeptUser(row) {
      if (await this.$platform.confirm("确定要把选中成员从该部门中删除吗？")) {
        row.pending = true;
        this.$http
          .post("/security/user/delete", { userId: row.userId }, false)
          .then((res) => {
            row.pending = false;
            if (res.status) return this.$platform.alert(res.message);
            this.initialize(false);
          })
          .catch((err) => {
            row.pending = false;
            console.error("toggleStatus catch err", err);
          });
      }
    },
    openMap() {
      this.$fast.map
        .display(this.deptInfo.tagAddress, { title: "部门位置" })
        .catch((err) => console.error("openMap catch an err: ", err));
    },
    // 导出动态
    exportFeed(type) {
      if (!type && !this.multipleSelection.length)
        return this.$platform.alert("请至少选择一个用户！");
      export_state = type;
      this.exportDialogvisible = true;
    },
    exportData() {
      if (!this.selectdatetime) {
        timeStart = "";
        timeEnd = "";
      } else {
        timeStart = `${this.selectdatetime[0]} 00:00:00`;
        timeEnd = `${this.selectdatetime[1]} 23:59:59`;
      }
      if (export_state === "all") {
        // 导出全部
        window.location.href = `/security/user/workState/exportBatch?tagId=${this.selectedDept.id}&timeStart=${timeStart}&timeEnd=${timeEnd}`;
      } else {
        // 导出选中的
        let ids = [];
        for (const user of this.multipleSelection) {
          ids.push(user.userId);
        }
        ids = ids.join(",");
        // console.log('ids::', `/security/user/workState/exportBatch?userIdsStr=${ids}&timeStart=${timeStart}&timeEnd=${timeEnd}`)
        window.location.href = `/security/user/workState/exportBatch?userIdsStr=${ids}&timeStart=${timeStart}&timeEnd=${timeEnd}`;
      }
      export_state = "";
      this.selectionToggle();
      this.exportDialogClosed();
    },
    exportDialogClosed() {
      this.selectdatetime = "";
      this.exportDialogvisible = false;
    },
    userResetPwdConfirm(userId) {
      this.resetDialogvisible = true;
      this.resetForm.userId = userId;
    },
    resetDialogClosed() {
      this.resetForm.userId = "";
      this.resetForm.pwd = "";
      this.resetDialogvisible = false;
    },
    /* 是否开启 降低组织架构 */
    async setSeeAllOrg(state = false) {
      try {
        let params = {
          state,
        };
        let result = await TeamApi.saveSeeAllOrg(params);
        if (result.status != 0) {
          this.$platform.alert(result.message);
        } else {
          this.isSeeAllOrg = state;
        }
      } catch (error) {
        console.log("setUsedAllot error: ", error);
      }
    },
    roleDialogClosed() {
      this.$refs.roleFormRef.resetFields();
    },
    async dispatchRole() {
      try {
        this.pending = true;
        const params = { state: false, roleId: this.roleForm.roleId };
        const { status, message } = await autoAuth(params);
        if (status !== 0)
          return this.$platform.notification({
            title: "自动分配权限失败",
            message: message || "",
            type: "error",
          });
        this.pending = false;
        this.roleDialogVisible = false;
        this.roleDialogClosed();
        this.$platform.notification({
          title: "自动分配权限成功",
          type: "success",
        });
      } catch (error) {
        this.pending = false;
        console.error(error);
      }
    },
    goRoleDetail(event) {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `tab_role_view_${el.dataset.id}`,
        title: "角色详情",
        close: true,
        reload: true,
        url: `/security/role/view/${el.dataset.id}?`,
        fromId
      });
    },
    createRole() {
      let fromId = window.frameElement.getAttribute("id");
      this.$platform.openTab({
        id: "create_role",
        title: "新建角色",
        close: true,
        url: "/security/role/create",
        fromId,
      });
    },
    editRole(id) {
      let fromId = window.frameElement.getAttribute("id");
      this.$platform.openTab({
        id: "edit_role",
        title: "编辑角色",
        close: true,
        url: `/security/role/edit/${id}`,
        fromId,
      });
    },
    async resume(userId) {
      try {
        if (await this.$platform.confirm("确定要恢复该账号吗？")) {
          const { status, message } = await http.post(
            "/security/user/resume",
            { userId },
            false
          );
          // if(status !== 0) this.$message.error(message || '');
          let isSucc = status == 0;
          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "账号恢复成功" : message,
            type: isSucc ? "success" : "error",
          });
          isSucc && this.chooseRole(this.selectedRole);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async resetRole(id) {
      try {
        if (await this.$platform.confirm("确定要重置该角色权限吗？")) {
          const { status, message } = await http.post(
            `/security/role/delete/${id}`,
            { type: "post" },
            false
          );
          // if(status !== 0) return this.$message.error(message || '');
          let isSucc = status == 0;
          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "角色权限重置成功" : message,
            type: isSucc ? "success" : "error",
          });
          if (isSucc) {
            this.selectedRole.custom = null;
            let role = _.cloneDeep(this.selectedRole);
            role.custom = null;
            let index = this.roles.findIndex(
              (value) => value.id == this.selectedRole.id
            );
            this.$set(this.roles, index, role);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async delRole(id) {
      try {
        if (await this.$platform.confirm("确定要删除该角色权限吗？")) {
          const { status, message } = await http.post(
            `/security/role/delete/${id}`,
            { type: "post" },
            false
          );
          // if(status !== 0) this.$message.error(message || '');
          let isSucc = status == 0;
          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "角色权限删除成功" : message,
            type: isSucc ? "success" : "error",
          });
          isSucc && this.chooseRole(this.selectedRole);
        }
      } catch (error) {
        console.error(error);
      }
    },
    createTransTab(type, userId) {
      let fromId = window.frameElement.getAttribute("id");
      this.$platform.openTab({
        id: "M_JOBTRANSFER_DETAIL",
        title: "正在加载",
        close: true,
        url: `/jobtransfer/view?type=${type}&userId=${userId}`,
        fromId,
      });
    },
    async resetUserPwd() {
      if (!this.resetForm.pwd) return this.$platform.alert("重置密码不能为空");
      let params = {};
      params.userId = this.resetForm.userId;
      params.newPwd = md5(this.resetForm.pwd);
      params.confirmPwd = md5(this.resetForm.pwd);
      resetPwd(params)
        .then((result) => {
          let isSucc = result.status == 0;
          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "密码重置成功" : result.message,
            type: isSucc ? "success" : "error",
          });
          if (isSucc) this.resetDialogClosed();
        })
        .catch((err) => console.log(err));
    },

    search() {
      // 组织架构人员搜索
      this.initDeptUser(this.selectedDept);
    },
    searchRole() {
      // 角色人员搜索
      this.chooseRole(this.selectedRole);
    },
    chooseDelRole() {
      this.selectedDept = {};
      let role = { id: -1, text: "已删除账号" };
      this.chooseRole(role);
    },
    async chooseRole(role) {
      this.multipleSelection = [];
      this.roleMultipleSelection = [];
      if (this.selectedRole.id != role.id) {
        this.roleKeyword = "";
      }
      this.selectedRole = role;
      this.roleLoading = true;
      // 获取角色下面的人员
      this.roleParams.keyword = this.roleKeyword;
      this.roleParams.roleId = "";
      this.roleParams.roleType = "";
      this.roleParams.pageNum = 1;
      this.rolePage.list = [];
      if (role.id == 0) {
        // 待分配账号
        this.roleParams.roleType = "noauth";
      } else if (role.id == -1) {
        // 已删除账号
        this.roleParams.roleType = "delauth";
      } else {
        this.roleParams.roleId = role.id;
      }

      return this.getRoleUserList(this.roleParams)
        .then((rolePage) => {
          this.rolePage.merge(Page.as(rolePage));
        })
        .catch((err) => console.error("err", err))
        .finally(() => (this.roleLoading = false));
    },

    getRoleUserList(params) {
      if (this.selectedRole.id == -1) return getDelUser(params);
      return getRoleUser(params);
    },

    handleClick(tab, event) {
      if (tab.name === "role") {
        this.chooseRole(this.selectedRole);
      }
    },
    addDepartment() {
      // this.$refs.departmentEditPanel.open('create', {
      //   higherDepartment: this.selectedDept
      // });
      // 添加子部门就是之前新建子团队

      let parent = {
        pid: this.selectedDept.id,
        pname: this.selectedDept.tagName,
      };

      // window.location.href = `/security/tag/createTag?${qs.stringify(parent)}`;
      let fromId = window.frameElement.getAttribute('id');
      platform.openTab({
        id: "createTag",
        title: "新建部门",
        url: `/security/tag/createDept?${qs.stringify(parent)}`,
        reload: true,
        fromId
      });
    },
    async delDepartment(id) {
      // 您删除的团队，如果包含子团队将会一并删除，是否继续？
      try {
        if (
          await this.$platform.confirm(
            "您删除的部门，如果有子部门，也将一并删除，是否继续删除?"
          )
        ) {
          let ids = [this.selectedDept.id];
          if (id) ids = [id];

          let result = await TeamApi.deleteTag(ids);

          this.$platform.notification({
            type: result.status == 0 ? "success" : "error",
            title: `部门删除${result.status == 0 ? "成功" : "失败"}`,
            message: result.status == 0 ? null : result.message,
          });

          if (result.status == 0) {
            this.initialize(false);
          }
        }
      } catch (e) {
        console.error("teamDelete catch error", e);
      }
    },
    chooseChildDepartment(childDept) {
      this.selectedDept = childDept;
      this.initDeptUser(this.selectedDept);
    },
    /** 选择部门 */
    chooseDept(event) {
      let { node, value } = event;
    },
    chooseUser(type) {
      let options = {
        title: "请选择成员",
        seeAllOrg: true,
        max: -1,
        selectedUser: this.userPage.list,
        mountEl: this.$el,
      };

      this.$fast.contact
        .choose("team", options)
        .then((result) => {
          // console.log(result);
          if (result.status == 0) {
            let data = result.data || {};
            let users = data.users || [];
            // TODO 组织 角色批量添加成员
            if (type === "role") {
              this.addRoleUserList(users);
            } else {
              this.addDeptUser(users);
            }
          }
        })
        .catch((err) => console.error(err));
    },
    addDeptUser(users) {
      // 组织架构 添加成员
      let params = {
        tagId: this.selectedDept.id,
      };
      params.userIds = users.map((item) => item.userId);

      this.loading = true;

      TeamApi.addUser(params)
        .then((result) => {
          let isSucc = result.status == 0;
          if (isSucc) {
            // 刷新组织架构 成员列表
            this.initialize(false);
          }
          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "添加成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    // 角色 添加成员
    addRoleUserList(users) {
      let params = {
        roleId: this.selectedRole.id,
      };
      params.userIds = users.map((item) => item.userId);
      this.loading = true;

      addRoleUser(params)
        .then((result) => {
          let isSucc = result.status == 0;
          if (isSucc) {
            // 刷新列表
            this.chooseRole(this.selectedRole);
          }
          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "添加成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    /* 选择多个部门 / 调整部门 */
    chooseDepartmentMulti() {
      if (this.multipleSelection.length <= 0) {
        return this.$platform.alert("请先选择需要调整的成员");
      }

      if (this.multipleSelection.length > 1) {
        return this.$platform.alert("请先选择一个需要调整的成员");
      }

      let options = {
        title: "请选择部门",
        seeAllOrg: true,
        max: -1,
      };

      this.$fast.contact
        .choose("dept_only", options)
        .then((result) => {
          let data = result.data || {};
          if (result.status == 0) {
            this.updateDepartmentUserBatch(data.depts || {});
          }
        })
        .catch((err) => console.error(err));
    },
    /* 新建部门 */
    departmentCreate(form) {
      let { department } = form;
      let parent = this.getHigherDepartment(this, department);
      let params = {
        name: form.name,
        description: "自主新建",
        type: "app",
        parentId: parent.type == "ding" ? department.dingId : department.id,
      };

      this.loading = true;

      addDepartment(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.initialize(false);
            this.$refs.departmentEditPanel.close();
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "创建成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.error(err))
        .finally(() => (this.loading = false));
    },
    /* 编辑部门 */
    departmentEdit(form) {
      let { department } = form;
      let parent = this.getHigherDepartment(this, department);

      let params = {
        id: this.selectedDept.id,
        name: form.name,
        type: "app",
        parentId: parent.type == "ding" ? department.dingId : department.id,
      };
      this.loading = true;

      updateDepartment(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.$refs.departmentEditPanel.close();
            this.initialize();
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "更新成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.error(err))
        .finally(() => (this.loading = false));
    },
    /* 删除部门 */
    async departmentDelete() {
      if (!(await this.$platform.confirm("您确定要删除该部门吗？"))) return;

      let params = {
        id: this.selectedDept.id,
      };

      this.loading = true;

      deleteDepartment(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.$refs.departmentEditPanel.close();
            this.initialize();
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "删除成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    /** 抓取部门数据 */
    fetchDept() {
      let params = {
        seeAllOrg: this.isSeeAllOrg,
        keyword: this.deptKeyword,
      };

      return TeamApi.tagList(params)
        .then((result) => {
          return (result && result.list) || [];
        })
        .catch((err) => console.error("err", err));
    },
    /* 抓取部门 人员数量 */
    fetchDeptCount() {
      return getDepartmentUserCount();
    },
    /** 抓取用户数据 */
    fetchUser() {
      let params = this.params;
      return TeamApi.userList(params)
        .then((userPage) => {
          this.userPage.merge(Page.as(userPage));
        })
        .catch((err) => console.error("err", err));
    },
    /* 查询是否开启 降低组织架构的开关 */
    getSeeAllOrg() {
      return http.post("/setting/user/getSeeAllOrg").then((result) => {
        return result;
      });
    },
    /* 跳转 用户详情页 */
    goUserDetail(event) {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      let fromId = window.frameElement.getAttribute('id'); 
      this.$platform.openTab({
        id: `tab_department_view_${el.dataset.id}`,
        title: "成员详情",
        close: true,
        reload: true,
        url: `/security/user/view/${el.dataset.id}?from=department`,
        fromId
      });
    },
    getHigherDepartment(data, department) {
      let depts = data.depts;

      if (!Array.isArray(depts)) return {};

      let higherDepartment = depts.filter((dept) => dept.id == department.id);

      if (higherDepartment.length > 0) return data;

      for (let i = 0; i < depts.length; i++) {
        let dept = depts[i];
        let subDepartments = dept.subDepartments || [];
        dept.depts = subDepartments;

        let higherDepartment = this.getHigherDepartment(dept, department);

        if (Object.keys(higherDepartment).length > 0) {
          return higherDepartment;
        }
      }

      return {};
    },
    handleSizeChange(pageSize) {
      this.params.pageSize = pageSize;
      this.params.pageNum = 1;

      this.userPage.list = [];

      this.loading = true;

      this.fetchUser().finally(() => (this.loading = false));
    },
    roleHandleSizeChange(pageSize) {
      this.roleParams.pageSize = pageSize;
      this.roleParams.pageNum = 1;

      this.rolePage.list = [];

      this.roleLoading = true;

      // this.fetchUser().finally(() => this.loading = false);
      return this.getRoleUserList(this.roleParams)
        .then((rolePage) => {
          this.rolePage.merge(Page.as(rolePage));
        })
        .catch((err) => console.error("err", err))
        .finally(() => (this.roleLoading = false));
    },
    /** 初始化 */
    initialize(isInit = true) {
      this.initializeDept(isInit);
    },
    /** 初始化部门数据 */
    async initializeDept(isInit = true) {
      this.loading = true;
      this.isSeeAllOrg = false;

      try {
        /* 如果开启 查询按组织架构选项 */
        let result = await this.getSeeAllOrg();
        this.isSeeAllOrg = result.data;
      } catch (error) {
        console.log("error: ", error);
      }

      let subtask = [this.fetchDept(), this.fetchDeptCount()];

      Promise.all(subtask)
        .then((result) => {
          let depts = result[0] || [];
          let deptUserCount = result[1] || {};

          this.deptUserCount = deptUserCount.data || {};
          this.depts = depts;

          this.initDeptUser(
            isInit ? this.depts[0] : _.cloneDeep(this.selectedDept)
          );
        })
        .catch((err) => console.error(err));
    },
    /** 选中一个部门 */
    async initDeptUser(dept) {
      this.multipleSelection = [];
      this.roleMultipleSelection = [];
      if (this.activeName == "tag" && this.selectedRole.id == -1) {
        this.selectedRole = { id: "0", text: "待分配" };
      }
      try {
        if (this.selectedDept.id != dept.id) {
          this.keyword = "";
        }
        this.selectedDept = dept;

        this.userPage.list = [];
        this.loading = true;

        // 查询用户
        this.params.keyword = this.keyword;
        this.params.tagId = dept.id;
        // this.params.departmentId = dept.id;
        this.params.pageNum = 1;
        this.params.seeAllOrg = this.isSeeAllOrg;
        this.fetchTeamData();
        await this.fetchUser();
      } catch (error) {
        console.error(error);
      }

      this.loading = false;
    },
    async fetchTeamData() {
      let params = {
        id: this.selectedDept.id,
      };
      try {
        let result = await TeamApi.getTag(params);
        if (result.status)
          return this.$platform.notification({
            title: "失败",
            message: result.message,
            type: "error",
          });
        this.deptInfo = result.data;
      } catch (error) {
        console.log("error: ", error);
      }
    },
    isRootDepartment(department = {}) {
      return this.depts.some((dept) => dept.id == department.id);
    },
    jump(pageNum) {
      this.params.pageNum = pageNum;

      this.userPage.list = [];

      this.loading = true;

      this.fetchUser().finally(() => (this.loading = false));
    },
    roleJump(pageNum) {
      this.roleParams.pageNum = pageNum;

      this.rolePage.list = [];

      this.roleLoading = true;

      return this.getRoleUserList(this.roleParams)
        .then((rolePage) => {
          this.rolePage.merge(Page.as(rolePage));
        })
        .catch((err) => console.error("err", err))
        .finally(() => (this.roleLoading = false));
    },
    nodeRender(h, node) {
      let content = <span>{node.tagName}</span>;

      let count = this.deptUserCount[node.id] || 0;
      if (count <= 0) return content;

      return (
        <div class="dept-node-wrap">
          <span class="dept-node-name">{node.tagName}</span>
          <span class="dept-node-count">&nbsp;({count})人</span>
        </div>
      );
    },
    openCreateUserPanel() {
      this.$refs.createUserPanel.open({});
    },
    openDepartmentEditPanel(id) {
      // let data = {
      //   name: this.selectedDept.name,
      //   higherDepartment: this.getHigherDepartment(this, this.selectedDept)
      // }
      // this.$refs.departmentEditPanel.open('edit', data);
      // 部门编辑就是之前的团队编辑
      // window.location.href = `/security/tag/editTag/${this.selectedDept.id}`
      // id 有值说明是子部门编辑
      let fromId = window.frameElement.getAttribute('id');
      platform.openTab({
        id: "editTag",
        title: "编辑部门",
        url: id
          ? `/security/tag/editDept/${id}`
          : `/security/tag/editDept/${this.selectedDept.id}`,
        reload: true,
        fromId
      });
    },
    /** select dept person */
    selectionHandle(selection) {
      this.multipleSelection = selection.slice();
    },
    selectionToggle(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    /** select role person */
    roleSelectionHandle(selection) {
      this.roleMultipleSelection = selection.slice();
    },
    roleSelectionToggle(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.roleMultipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.roleMultipleTable.clearSelection();
        this.roleMultipleSelection = [];
      }
    },
    async roleDeleteConfirm() {
      // 角色 批量移除成员
      if (this.roleMultipleSelection.length <= 0) {
        return this.$platform.alert("请先选择需要移除的成员");
      }
      if (await this.$platform.confirm("确定要把选中成员从该角色中移除吗？")) {
        this.roleUserDelete();
      }
    },
    roleUserDelete() {
      let params = {
        userIds: this.roleMultipleSelection
          .map((item) => item.userId)
          .join(","),
        roleId: this.selectedRole.id,
      };

      this.loading = true;

      delRoleUser(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.chooseRole(this.selectedRole);
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "移除成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    async userDeleteConfirm(type) {
      // 批量删除
      if (type === "multiple" && this.multipleSelection.length <= 0) {
        return this.$platform.alert("请先选择需要移除的成员");
      }

      if (await this.$platform.confirm("确定要把选中成员从该部门中移除吗？")) {
        this.userDelete();
      }
    },
    userDelete() {
      let params = {
        userIds: this.multipleSelection.map((item) => item.userId).join(","),
        tagId: this.selectedDept.id,
      };

      this.loading = true;

      TeamApi.deleteUser(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.initialize(false);
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "移除成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    userAdd(form = {}) {
      console.log("hbc: userAdd -> form", form);
      let params = {
        loginUser: {
          loginName: form.phone,
          displayName: form.name,
          cellPhone: form.phone,
          // email: form.email,
          loginPassword: md5(form.pass),
          roles: form.role.map((r) => ({ id: r })) || [],
          // tagList: form.team.map(t => ({ id: t.id })) || [],
          tagList: [{ id: this.selectedDept.id }],
          // departments: form.department.map(d => ({ id: d.id })) || [],
        },
      };
      console.log("hbc: userAdd -> params", params);

      this.loading = true;

      addDepartmentUser(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.$refs.createUserPanel.close();
            this.initialize(false);
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "添加成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    updateDepartmentUserBatch(departments) {
      let params = {
        userId: this.multipleSelection[0].userId,
        departmentIds: departments.map((d) => d.id).join(","),
      };

      this.loading = true;

      updateDepartmentUserBatch(params)
        .then((result) => {
          let isSucc = result.status == 0;

          if (isSucc) {
            this.initialize(false);
          }

          this.$platform.notification({
            title: isSucc ? "成功" : "失败",
            message: isSucc ? "调整成功" : result.message,
            type: isSucc ? "success" : "error",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
  },
  components: {
    [CreateUserPanel.name]: CreateUserPanel,
    [DepartmentEditPanel.name]: DepartmentEditPanel,
  },
};
</script>

<style lang='scss'>
.el-tabs__header {
  margin-left: -1px;
}
.el-tabs__content {
  min-width: 320px;
  overflow-x: hidden;
  overflow-y: auto;
  // height: 740px;
  height: calc(100% - 105px);
}

.dept-search {
  display: flex;
  align-items: center;
  width: 100%;
  align-content: center;
  .el-input {
    margin: 0 20px;
  }
}

.dept-header-see {
  margin-top: 20px;
  margin-left: 10px;
}
.dept-role-item {
  &:hover,
  &.department-role-selected {
    background-color: $color-primary-hover !important;
    color: $color-primary;
  }
}
.dept-del-role-item {
  position: absolute;
  bottom: 0;
  min-width: 320px;
  margin-top: 10px;
  border: 1px solid #eee;
}
.dept-info {
  display: flex;
  .form-view-row label {
    width: auto;
  }
}
.text-center {
  display: block;
  text-align: center;
  color: #55b7b4;
}
.create-role {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  margin-right: 10px;
}

.dept-search-group {
  input {
    height: 34px;
    line-height: 34px;
  }
  button {
    margin-left: 8px;
  }
  .el-dropdown {
    padding: 5px 15px;
    background: #55b7b4;
    color: #fff;
    font-size: 14px;
    border: none;
    border-radius: 2px;
    outline: none;
    line-height: 24px;
    cursor: pointer;
  }
}

.dept-role-desc {
  .department-user-block-header-text {
    .role-desc {
      margin-top: 20px;
      margin-bottom: 30px;
    }
    button {
      padding: 2px 15px;
    }
  }
}

.dept-edit-del {
  button {
    padding: 4px 15px;
    margin-left: 8px;
  }
}

.super-admin-label {
  background-color: #ff9f0c;
  color: #ffffff;
  padding: 1px 2px;
  margin-left: 3px;
  font-size: 10px;
}

.reset-dialog-form {
  label {
    margin-bottom: 20px;
  }
  .el-form-item__label {
    text-align: left;
  }
}

html,
body,
.department-container {
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
  box-shadow: 0 1px 4px rgba(216, 216, 216, 0.65);

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

  min-width: 320px;
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
  min-width: 400px;
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
    display: flex;
    justify-content: space-between;
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

  &-header {
    margin-bottom: 10px;
  }
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
    color: #55b7b4;
    display: inline-block;
    min-width: 50px;
    max-width: 140px;
    @include text-ellipsis();
  }
  .icon-people {
    font-size: 14px;
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

.department-child-item {
  border-bottom: 1px solid #eee;
  cursor: pointer;

  display: flex;
  justify-content: space-between;

  line-height: 44px;
  padding: 0 20px;

  &:hover {
    background-color: #fafafa;
  }
}
.el-tabs {
  height: calc(100% - 50px);
}
.department-left {
  .base-button {
    margin: 10px 0 10px 20px;
    width: 280px;
  }
}
.department-state {
  .el-tabs__content {
    height: calc(100% - 50px);
  }
}
</style>