<template>
  <!-- start 选择组织架构页面 -->
  <div class="department-container" v-loading.fullscreen.lock="loading">
    <div class="guide-model-box" v-if="nowGuideStep < 4"></div>
    <!-- start 主要内容 -->
    <div class="department-main">
      <div :class="{'department-left': true, 'department-state': tenantType!=2 && tenantType!=3}">
        <el-button type="primary" @click="synchronousWeChat" :loading="synchronousState" class="base-button" :class="{'sync-button': !collapse}" v-if="tenantType==2 || tenantType==3">
          {{ synchronousState ? '同步中': '同步企业微信通讯录' }}
        </el-button>

        <!-- start 同步钉钉通讯录 -->
        <el-button v-if="tenantType==0" class="base-button" :class="{'sync-button': !collapse}" type="primary" :loading="synchronousState" @click="syncDingTalkAddressBook">
          {{ synchronousState ? '同步中': '同步钉钉通讯录' }}
        </el-button>
        <!-- end 同步钉钉通讯录 -->

        <el-tabs type="card" v-model="activeName" @tab-click="handleClick" :class="{'el-tabs-expand': !collapse}">
          <el-tab-pane v-if="hasTagAuth" label="组织架构" name="tag">
            <!-- 部门搜索框 -->
            <div class="dept-search">
              <el-input v-model="deptKeyword" placeholder="请输入部门名称搜索" @input="debounce" @keyup.enter.native="debounce">
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
            </div>
            <!-- start 左侧部门列表 -->
            <div class="department-main-left">
              <!-- start 部门列表树 -->
              <div class="department-tree-view">
                <div class="bc-dept" v-if="depts.length > 0">
                  <base-tree-dept expand :data="depts" :selected="selectedDept" :show-checkbox="allowCheckDept" @node-selected="initDeptUser" @node-check="chooseDept" :node-render="nodeRender" />
                </div>
              </div>
              <!-- end 部门列表树 -->
            </div>
            <!-- end 左侧部门列表 -->

            <div v-if="tenantType == 0">
              <el-checkbox v-model="isAllotByDept" @change="setUsedAllot" class="dept-header-see">按钉钉组织架构选择</el-checkbox>
              <el-popover placement="bottom-end" width="300" trigger="hover" content="勾选后，在选人界面时，将通过钉钉的组织架构进行人员选择。">
                <i class="iconfont icon-help" slot="reference"></i>
              </el-popover>
            </div>
            <div>
              <el-checkbox v-model="isSeeAllOrg" @change="setSeeAllOrg" :disabled="tenantType==0 && isAllotByDept" class="dept-header-see">选择时隐藏非本部门的人员</el-checkbox>
              <el-popover placement="bottom-end" width="300" trigger="hover" content="开启本选项后，在选择协同人等只可见自己所属部门的成员，管理员除外">
                <i class="iconfont icon-help" slot="reference"></i>
              </el-popover>  
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="hasStaffAuth || hasRoleAuth" label="角色管理" name="role">

            <div v-if="hasRoleAuth" class="create-role">
              <el-button type="primary" @click="createRole">新建角色</el-button>
            </div>
            <div v-if="roles.length > 0" class="department-child-list">
              <div class="department-child-item dept-role-item" v-for="role in roles" :key="role.id" @click="chooseRole(role)" :class="{'department-role-selected': role.id == selectedRole.id}">
                <span>
                  {{ role.text }} &nbsp;&nbsp;
                  <!-- ({{ deptUserCount[department.id] || 0 }}人) -->
                </span>
                <i class="iconfont icon-arrowright"></i>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <div class="dept-step-1-box" :style="nowGuideStep == 0 ? 'width: 120px;height: 100px;' : ''" id="v-dept-step-0">
          <div v-if="nowGuideStep == 0" style="position: relative;">
            <div class="guide-disable-cover"></div>
          </div>
        </div>
        
        <div class="dept-step-1-box" :style="nowGuideStep == 4 ? 'width: 280px;height: 100px;' : ''" id="v-dept-step-4">
          <div v-if="nowGuideStep == 4" style="position: relative;">
            <div class="guide-disable-cover"></div>
          </div>
        </div>

        <div v-if="hasStaffAuth" class="department-child-item dept-role-item dept-del-role-item" :class="{'department-role-selected': selectedRole.id == -1, 'dept-del-role-item-expand': !collapse}" @click="chooseDelRole()">
          <span>已删除账号 &nbsp;&nbsp;</span>
          <i class="iconfont icon-arrowright"></i>
        </div>
      </div>

      <!-- 组织架构伸缩 -->
      <div class="collapse">
        <div @click="btnCollapse('left')" v-show="collapseLeft" class="base-collapse-btn-left"><i class="iconfont icon-mianbanjiantou"></i></div>
        <div @click="btnCollapse('rigth')" v-show="collapseRight" class="base-collapse-btn-right"><i class="iconfont icon-mianbanjiantou"></i></div>
      </div>
      
      <!-- start 右侧角色列表 -->
      <div v-if="activeName === 'role' || selectedRole.id == -1" class="department-main-right" v-loading.fullscreen.lock="roleLoading">
        <!-- start 角色人员 -->
        <div class="department-user-block">
          <div v-if="showRoleDesc" class="department-user-block-header dept-role-desc">
            <div class="department-user-block-header-text">
              <h4>
                角色名称：
                <a :href="`/security/role/view/${selectedRole.id}`" :data-id="selectedRole.id" @click="goRoleDetail" style="color:#13c2c2;">{{selectedRole.text}}</a>
                <!-- <base-button style="margin-left:10px;" type="ghost" @event="openCreateUserPanel"> 查看 </base-button> -->
                <base-button v-if="hasRoleAuth && (canEditSystemRole || isCustomeRole) " style="margin-left:10px;" type="ghost" @event="editRole(selectedRole.id)">编辑角色权限</base-button>
                <base-button v-if="hasRoleAuth && selectedRole.custom" style="margin-left:10px;" type="ghost" @event="resetRole(selectedRole.custom)">重置权限</base-button>
                <base-button v-if="hasRoleAuth && selectedRole.isSys == 0" style="margin-left:10px;" type="danger" @event="delRole(selectedRole.id)">删除角色</base-button>
              </h4>
              <h4 class="role-desc">角色描述：{{roleDes}}</h4>
            </div>
          </div>

          <div class="dept-search-group">
            <el-input v-model="roleKeyword" placeholder="请输入成员名称搜索" style="width:200px;" @keyup.enter.native="searchRole">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" @event="searchRole()">搜索</base-button>
            <base-button v-if="hasStaffAuth && (isSystemRole || isCustomeRole)" type="primary" @event="chooseUser('role')">添加成员</base-button>
            <base-button v-if="hasStaffAuth && (isSystemRole || isCustomeRole) && rolePage.list.length" type="primary" @event="roleDeleteConfirm()">移除成员</base-button>
            <!-- <base-button v-if="isCustomeRole" type="primary" @event="createRole">新建角色</base-button> -->
            <base-button v-if="hasStaffAuth && selectedRole.id == 0 && tenantType == 0" type="primary" @event="roleDialogVisible = true">自动分配角色</base-button>
          </div>

          <div class="department-user-table" v-if="rolePage.list.length > 0">
            <el-table :data="rolePage.list" stripe @select="roleSelectionHandle" @select-all="roleSelectionHandle" :highlight-current-row="false" show-overflow-tooltip header-row-class-name="team-detail-table-header"
                      ref="roleMultipleTable" class="team-table">
              <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
              <el-table-column prop="displayName" label="姓名" width="180px">
                <div style="display: flex" slot-scope="scope">
                  <a :href="`/security/user/view/${scope.row.userId}`" :data-id="scope.row.userId" @click="goUserDetail" class="view-detail-btn">{{scope.row.displayName}}</a>
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
                    <a href class="text-center" @click.stop.prevent="createTransTab('event',scope.row.userId)">{{ scope.row.eventCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="未完成工单" width="120px">
                  <template v-if="scope.row.taskCount" slot-scope="scope">
                    <a href class="text-center" @click.stop.prevent="createTransTab('task',scope.row.userId)">{{ scope.row.taskCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="负责客户数" width="120px">
                  <template v-if="scope.row.customerCount" slot-scope="scope">
                    <a href class="text-center" @click.stop.prevent="createTransTab('customer',scope.row.userId)">{{ scope.row.customerCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="个人备件库" width="120px">
                  <template v-if="scope.row.spareCount" slot-scope="scope">
                    <a href class="text-center" @click.stop.prevent="createTransTab('stock',scope.row.userId)">{{ scope.row.spareCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="待审批事项" width="120px">
                  <template v-if="scope.row.unApproveCount" slot-scope="scope">
                    <a href class="text-center" @click.stop.prevent="createTransTab('approve',scope.row.userId)">{{ scope.row.unApproveCount }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button v-if="scope.row.eventCount || scope.row.taskCount || scope.row.customerCount || scope.row.spareCount" type="text" @click="createTransTab('event', scope.row.userId)">去转交</el-button>
                    <el-button type="text" @click="resume(scope.row.userId)" v-if="tenantType!=2 && tenantType!=3">恢复</el-button>
                  </template>
                </el-table-column>
              </template>
              <template v-else>
                <el-table-column label="部门" show-overflow-tooltip>
                  <template slot-scope="scope">{{scope.row.tagList && scope.row.tagList.map(i => (i && i.tagName) || '').join('，')}}</template>
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
              <el-pagination class="customer-table-pagination" background @current-change="roleJump" @size-change="roleHandleSizeChange" :page-sizes="[10, 20, 50]" :page-size="roleParams.pageSize"
                             :current-page="roleParams.pageNum" layout="prev, pager, next, sizes, jumper" :total="rolePage.total"></el-pagination>
            </div>
          </div>

          <div v-else class="no-data-block">
            当前角色暂无人员
            <span v-if="isSystemRole || isCustomeRole" class="active-btn" @click="chooseUser('role')">添加成员</span>
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
            <div class="dept-edit-del" id="v-dept-step-1">
              <div class="guide-disable-cover" v-if="nowGuideStep == 1"></div>
              <base-button type="ghost" @event="openDepartmentEditPanel()">编辑</base-button>
              <base-button type="danger" @event="delDepartment()" v-if="!isRootDepartment(selectedDept)">删除</base-button>
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
              <div v-if="deptInfo.tagPlaceList && deptInfo.tagPlaceList.length == 1" class="form-view-row-content">
                <span>{{ deptArea }}</span>
              </div>
              <el-tooltip v-else placement="top">
                <div slot="content">{{deptInfo.tagPlaceList && deptInfo.tagPlaceList.map(p => p && `${p.province}${p.city ? `-${p.city}` : ''}${p.dist ? `-${p.dist}` : ''}`).join('，\n')}}</div>
                <a href="javascript:;" style="text-decoration: none;color: #333;">{{deptArea}}</a>
              </el-tooltip>
            </div>
            <div class="form-view-row">
              <label>部门描述：</label>
              <el-tooltip v-if="deptInfo.description && deptInfo.description.length > 10" placement="top">
                <div slot="content">{{deptInfo.description}}</div>
                <a href="javascript:;" style="text-decoration: none;color: #333;">{{deptDescription}}</a>
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
              <div class="form-view-row-content" v-if="deptInfo.tagAddress"> 
                {{deptInfo.tagAddress | fmt_address }}
                <i v-if="deptInfo.tagAddress.longitude && deptInfo.tagAddress.latitude" @click="openMap"
                   class="iconfont icon-address team-address-icon link-text"></i></div>
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
              <base-button type="ghost" @event="addDepartment" id="v-dept-step-3">添加子部门</base-button>
              <div class="guide-disable-cover" v-if="nowGuideStep == 3"></div>
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
          <el-input v-model="subDeptKeyword" placeholder="请输入下级部门名称搜索" style="width:200px;" @input="subDeptSearch" @keyup.enter.native="subDeptSearch">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <div class="department-user-table" v-if="subDepartments.length > 0">
            <el-table class="team-table" :data="subDepartments" stripe header-row-class-name="team-detail-table-header">
              <el-table-column prop="tagName" label="部门名称" show-overflow-tooltip />
              <el-table-column label="部门主管" show-overflow-tooltip>
                <template slot-scope="scope" v-if="scope.row.teamLeaders">{{scope.row.teamLeaders.map(i => (i && i.displayName) || '').join('，')}}</template>
              </el-table-column>
              <el-table-column prop="phone" label="联系电话" />
              <el-table-column label="部门位置" show-overflow-tooltip>
                <template slot-scope="scope" v-if="scope.row.tagAddress">{{scope.row.tagAddress | fmt_address}}</template>
              </el-table-column>
              <el-table-column label="负责区域" show-overflow-tooltip>
                <template slot-scope="scope" v-if="scope.row.tagPlaceList">{{scope.row.tagPlaceList.map(p => p && `${p.province}${p.city ? `-${p.city}` : ''}${p.dist ? `-${p.dist}` : ''}`).join('，\n')}}</template>
              </el-table-column>

              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="openDepartmentEditPanel(scope.row.id)">编辑</el-button>
                  <el-button type="text" style="color:#FB602C" @click="delDepartment(scope.row.id)">删除</el-button>
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
              <span id="v-dept-step-2">成员信息</span>
              <div class="guide-disable-cover" v-if="nowGuideStep == 2"></div>
            </div>
            <base-button type="primary" @event="openCreateUserPanel" v-if="tenantType==1">新建成员账号</base-button>
            <!-- <div class="department-user-block-header-btn">
              <base-button type="primary" @event="openCreateUserPanel" v-if="allowAddUser"> 添加成员 </base-button>
              <base-button type="primary" @event="chooseDepartmentMulti"> 调整部门 </base-button>
              <base-button type="danger" @event="userDeleteConfirm"> 批量删除 </base-button>
            </div>-->
          </div>

          <div class="dept-search-group">
            <el-input v-model="keyword" placeholder="请输入成员名称搜索" style="width:200px;" @keyup.enter.native="search">
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
            <el-dropdown trigger="click">
              <span class="el-dropdown-link el-dropdown-btn">更多操作</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <div @click="exportAccount()">导出账号</div>
                </el-dropdown-item>
                <el-dropdown-item>
                  <div @click="exportAccount('all')">导出全部</div>
                </el-dropdown-item>
                <el-dropdown-item v-if="productV2Gray">
                  <div @click="openWxDialog">维护服务微信</div>
                </el-dropdown-item>
                <el-dropdown-item>
                  <div @click="openTelDialog">维护服务电话</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <!-- <base-button type="primary" @event="searchModel.pageNum=1;search();trackEventHandler('search')" native-type="submit">搜索</base-button> -->
          </div>

          <div class="department-user-table" v-if="userPage.list.length > 0">
            <el-table :data="userPage.list" stripe @select="selectionHandle" @select-all="selectionHandle" :highlight-current-row="false" header-row-class-name="team-detail-table-header" ref="multipleTable"
                      class="team-table">
              <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
              <el-table-column prop="displayName" label="姓名">
                <div style="display: flex" slot-scope="scope">
                  <a :href="`/security/user/view/${scope.row.userId}`" :data-id="scope.row.userId" @click="goUserDetail" class="view-detail-btn">{{scope.row.displayName}}</a>
                  <i v-if="scope.row.superAdmin == 1" class="iconfont icon-people">主管</i>
                </div>
              </el-table-column>
              <el-table-column prop="loginName" label="账号" />

              <el-table-column label="角色" show-overflow-tooltip>
                <template slot-scope="scope">{{scope.row.roles && scope.row.roles.map(i => (i && i.name) || '').join('，')}}</template>
              </el-table-column>

              <el-table-column prop="cellPhone" label="联系电话" />
              <el-table-column prop="enabled" label="状态">
                <template slot-scope="scope">{{scope.row.enabled == 1 ? '启用' : '禁用'}}</template>
              </el-table-column>
              <template v-if="tenantType == 1">
                <!-- 多端操作按钮 -->
                <el-table-column label="操作" width="210px">
                  <template slot-scope="scope">
                    <el-button :disabled="scope.row.pending" type="text" @click="toggleEditor(scope.row)">编辑</el-button>
                    <el-button :disabled="scope.row.pending" v-if="scope.row.enabled == 1" type="text" style="color:#e6a23c" @click="toggleEnable(scope.row)">停用</el-button>
                    <el-button :disabled="scope.row.pending" v-else type="text" @click="toggleEnable(scope.row)">启用</el-button>
                    <el-button :disabled="scope.row.pending" type="text" style="color:#FB602C" @click="deleteDeptUser(scope.row)">删除</el-button>
                    <el-button type="text" @click="userResetPwdConfirm(scope.row.userId)">重置密码</el-button>
                  </template>
                </el-table-column>
              </template>
              <template v-if="tenantType == 0">
                <!-- 钉钉端操作按钮 -->
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button :disabled="scope.row.pending" type="text" style="color:#FB602C" @click="deleteDeptUser(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </template>
              
            </el-table>

            <div class="table-footer">
              <div class="list-info">
                共
                <span class="level-padding">{{userPage.total}}</span>记录，
                已选中
                <span class="selectedCount">{{multipleSelection.length}}</span>条
                <span class="selectedCount select-init-text" @click="selectionToggle()">清空</span>
              </div>
              <el-pagination class="customer-table-pagination" background @current-change="jump" @size-change="handleSizeChange" :page-sizes="[10, 20, 50]" :page-size="params.pageSize" :current-page="params.pageNum"
                             layout="prev, pager, next, sizes, jumper" :total="userPage.total"></el-pagination>
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

    <!-- start 新建/编辑 部门 面板 @deprecated 已废弃 -->
    <department-edit-panel ref="departmentEditPanel" @create="departmentCreate" @edit="departmentEdit" @delete="departmentDelete"></department-edit-panel>
    <!-- end 新建/编辑 部门 面板 -->

    <!-- start 新建人员 -->
    <create-user-panel ref="createUserPanel" @submit="userAdd"></create-user-panel>
    <!-- end 新建人员 -->

    <!-- 自动分配角色的对话框 -->
    <el-dialog title="自动分配账号" :visible.sync="roleDialogVisible" width="35%" @close="roleDialogClosed">
      <el-form :model="roleForm" ref="roleFormRef">
        <el-form-item label="为新进入的用户选择一个默认角色或由管理员每次指定"></el-form-item>
        <el-select v-model="roleForm.roleId" placeholder="请选择角色" style="width:100%;">
          <el-option v-for="item in autoAuthRoles" :label="item.text" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="pending" :loading="pending" @click="dispatchRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 导出动态的对话框 -->
    <el-dialog title="导出动态" :visible.sync="exportDialogvisible" width="600px" @close="exportDialogClosed">
      <el-form ref="exportFormRef" label-width="120px">
        <el-form-item label="[可选]选择时间">
          <el-date-picker v-model="selectdatetime" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"
                          :picker-options="pickerOptions"></el-date-picker>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogClosed">取 消</el-button>
        <el-button type="primary" :disabled="pending" :loading="pending" @click="exportData">{{pending ? '正在导出' : '导出'}}</el-button>
      </span>
    </el-dialog>

    <!-- 重置密码的对话框 -->
    <el-dialog title="重置密码" :visible.sync="resetDialogvisible" width="400px" @close="resetDialogClosed">
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

    <!--start 编辑账号名称 -->
    <modifyname-dialog ref="ModifyNameToast" @handleClose="handleClose" v-if="showModifynameDialog" @refresh="refresh"></modifyname-dialog>
    <!--end 编辑账号名称 -->

    <!-- tour start -->
    <v-tour name="myTour" :steps="deptSteps" :options="deptOptions" :callbacks="myCallbacks">
      <template slot-scope="tour">
        <transition name="fade">
          <template v-for="(step, index) of tour.steps">
            <v-step v-if="tour.currentStep === index" :key="index" :step="step" :previous-step="tour.previousStep" :next-step="tour.nextStep" :stop="tour.stop" :is-first="tour.isFirst" :is-last="tour.isLast"
                    :labels="tour.labels">
              <template>
                <div slot="content" class="tour-content-box">
                  <div class="tour-left-tips">
                    {{ `${index + 1}/${deptSteps.length}` }}
                  </div>
                  <div class="tour-content">
                    <div class="flex-x tour-content-head">
                      {{deptSteps[index].title}}
                    </div>
                    <div class="tour-content-con">
                      {{ deptSteps[index].content }}
                    </div>
                  </div>
                </div>
                <div slot="actions" class="tour-bottom">
                  <!-- <div class="text" v-if="index > 0" @click="tour.previousStep">
                    上一步
                  </div> -->
                  <div class="btns" v-if="index < deptSteps.length - 1" @click="tour.nextStep">
                    下一步
                  </div>
                  <div v-if="index == deptSteps.length - 1" class="btns" @click="tour.stop">
                    知道啦
                  </div>
                </div>
              </template>
            </v-step>
          </template>
        </transition>
      </template>
    </v-tour>
    <!-- tour end -->
     
    <el-dialog
      :visible.sync="guideDialogVisible"
      width="300px"
      top="38vh"
      :show-close="false">
      <span>售后宝账号权限功能更新啦！</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleGuideClose">确 定</el-button>
      </span>
    </el-dialog> 

    <!-- start 导入服务微信 -->
    <base-import title="维护服务微信"
                 ref="serviceWxModal"
                 :is-import-now="true"
                 @success="importServiceSuccess"
                 action="/security/user/import/importWeChat">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载<a :href="`/security/user/import/weChatTemplate?tagId=${selectedDept.id}`">导入模版 </a>，填写完成后再上传导入。<br>
          微信号仅用于客户联系服务人员；<br>
          如果微信号未填写，客户将无法获取服务人员微信号；<br>
          此数据为非必填项。<br>
        </div>
      </div>
    </base-import>
    <!-- end 导入服务微信 -->

    <!-- start 导入服务电话 -->
    <base-import title="维护服务电话"
                 ref="serviceTelModal"
                 :is-import-now="true"
                 @success="importServiceSuccess"
                 action="/security/user/import/cellPhone">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载<a :href="`/security/user/import/template?tagId=${selectedDept.id}`">导入模版 </a>，填写完成后再上传导入。<br>
          这里维护服务电话仅用于给客户发送预约短信时显示服务人员电话；<br>
          如果没有维护服务人员电话将会发送短信设置中统一服务电话；<br>
          此数据为非必填项。 <br>
          <br>
          短信示例<br>
          <br>
          【售后宝】尊敬的客户您好，{公司名称}{计划时间}安排{服务人员姓名}{服务电话}为您提供服务，请安排好您的时间，{客服电话}，谢谢
        </div>
      </div>
    </base-import>
    <!-- end 导入服务电话 -->

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
} from '@src/api/DepartmentApi'

import * as TeamApi from '@src/api/TeamApi'
import md5 from 'js-md5'

/* components */
import CreateUserPanel from './component/CreateUserPanel.vue'
import DepartmentEditPanel from './component/DepartmentEditPanel.vue'
import ModifyName from './component/ModifyName'

/* utils */
import _ from 'lodash'
import http from '@src/util/http'
import Page from '@model/Page'
import platform from '@src/platform'
import qs from 'qs'
import url from 'url'
import Platform from '@src/util/Platform'
import tourGuide from '@src/mixins/tourGuide'
import { storageGet, storageSet } from '@src/util/storage'
const DEPT_GUIDE = 'dept_guide', DEPT_GUIDE_DIALOG = 'dept_guide_dialog'
let export_state, timeStart, timeEnd, mainTagId;
export default {
  name: 'department-view',
  inject: ['initData'],
  mixins: [tourGuide],
  data() {
    return {
      subDeptKeyword:'',
      guideDialogVisible: false,
      isAllotByDept: false,
      nowGuideStep: 5,
      collapse: false,
      collapseLeft: true,
      collapseRight: true,
      showModifynameDialog: false,
      deptKeyword: '',
      activeName: 'tag',
      dept_role_data: [],
      roles: [],
      selectedRole: {},
      keyword: '',
      roleKeyword: '',
      roleLoading: false,
      roleDialogVisible: false,
      pending: false,
      autoAuthRoles: [],
      roleForm: {
        roleId: '0',
      },
      roleMultipleSelection: [],
      roleParams: {},
      exportDialogvisible: false,
      resetDialogvisible: false,
      resetForm: {
        userId: '',
        pwd: '',
      },

      selectdatetime: '',
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近半年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
              picker.$emit('pick', [start, end])
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
      synchronousState: false, // 同步状态
      subDepartments:[], // 子部门
    }
  },
  computed: {
    corpId() {
      return this.initData.corpId || ''
    },
    tenantType() {
      return this.initData.tenantType
    },
    authorities() {
      return this.initData.authorities || {}
    },
    allowAddUser() {
      return (
        this.authorities.AUTH_STAFF == 3
        && this.authorities.AUTH_ROLE == 3
        && this.authorities.AUTH_TAG == 3
      )
    },
    // 查看组织架构权限对应之前的团队权限
    hasTagAuth(){
      return 'AUTH_TAG' in this.authorities
    },
    // 账号权限
    hasStaffAuth(){
      return 'AUTH_STAFF' in this.authorities
    },
    // 角色权限
    hasRoleAuth(){
      return 'AUTH_ROLE' in this.authorities
    },
    showRoleDesc() {
      // 0  待分配账号
      // -1  已删除账号
      return this.selectedRole.id != 0 && this.selectedRole.id != -1
    },
    isSystemRole() {
      // 系统内置角色id:1-10
      return this.selectedRole.id > 0 && this.selectedRole.id < 11
    },
    canEditSystemRole() {
      // 系统管理员没有编辑和重置操作
      return this.selectedRole.id > 1 && this.selectedRole.id < 11
    },
    isCustomeRole() {
      // 自定义角色id
      return this.selectedRole.id && this.selectedRole.id.length > 2
    },
    roleDes() {
      if (this.selectedRole.id == 1)
        return '系统管理员拥有所有权限，不允许删除和编辑！'
      if (this.selectedRole.id >= 2 && this.selectedRole.id <= 10)
        return '系统内置的角色，支持编辑角色权限和重置权限'
      if (this.isCustomeRole) return '自定义角色，支持编辑角色权限和删除角色'
    },
    teamLeadersName() {
      return (
        this.deptInfo.teamLeaders
        && this.deptInfo.teamLeaders
          .map((i) => (i && i.displayName) || '')
          .join('，')
      )
    },
    deptArea() {
      const tagPlaceList = this.deptInfo.tagPlaceList || []
      if (!tagPlaceList.length) return ''
      const p = tagPlaceList[0] || {}
      let tagPlace = `${p.province ? `${p.province}` : ''}${
        p.city ? `-${p.city}` : ''
      }${p.dist ? `-${p.dist}` : ''}`
      if (tagPlaceList.length > 1) tagPlace += '...'
      return tagPlace
    },
    deptDescription() {
      const desc = this.deptInfo.description || ''
      return desc.length < 10 ? desc : `${desc.substring(0, 10)}...`
    },
    canRemove() {
      // 主部门下面成员不能移除
      return this.selectedDept.parentId
    },
    // 是否在钉钉环境
    isDingTalk() {
      return Platform.isDingTalk()
    },
    productV2Gray(){
      return this.initData.openSuperCode;
    }
  },
  mounted() {
    // isAllotByDept对应钉钉端是否按照钉钉通讯录选人 如果钉钉端之前勾选了按服务团队派单isAllotByDept为false, 
    // 去掉引导页面
    // if(this.tenantType == 0) {
    //   // 钉钉端
    //   this.isAllotByDept = !this.initData.allotByTag;
    //   setTimeout(()=>{
    //     if (storageGet(DEPT_GUIDE_DIALOG) != 1) {
    //       this.guideDialogVisible = true;
    //     }
    //     if (storageGet(DEPT_GUIDE_DIALOG) == 1 && storageGet(DEPT_GUIDE) < this.deptSteps.length) {
    //       this.$tours['myTour'].start()
    //       this.nowGuideStep = 0
    //     } 
    //   }, 100)
    // }
    if(this.hasTagAuth) {
      this.initialize()
    }
    if(this.hasStaffAuth || this.hasRoleAuth) {
      this.dept_role_data = this.initData.rolesJson || []
      this.roles = [{ id: '0', text: '待分配人员' }].concat(this.dept_role_data)
      this.selectedRole = this.roles[0]
      if(!this.hasTagAuth) {
        this.activeName = 'role';
        this.chooseRole(this.selectedRole);
      }
      // 自动分配角色
      this.autoAuthRoles = [{ id: '0', text: '由管理员每次指定' }].concat(
        this.dept_role_data
      )
    }
    let href = url.parse(window.location.href, true) || {}
    if (href.query && href.query.from == 'role') {
      // jsp新建角色后跳转过来的
      this.activeName = 'role'
      this.chooseRole(this.selectedRole)
    }
    window.__exports__refresh = this.refreshDept;
  },
  methods: {
    /* 打开服务电话弹出框 */
    openTelDialog () {
      this.$refs.serviceTelModal.open();
    },
    openWxDialog () {
      this.$refs.serviceWxModal.open();
    },
    /* 导入维护服务电话成功 */
    importServiceSuccess () {
      // 
    },
    subDeptSearch: _.debounce(function () {
      // 下级部门模糊搜索
      let data = this.deptInfo.children || [];
      let _subDepartments = _.cloneDeep(data);
      this.subDepartments = this.subDeptKeyword ? _subDepartments.filter(dept=> dept.tagName.indexOf(this.subDeptKeyword) > -1) : data;
    }, 500),
    handleGuideClose(){
      this.guideDialogVisible = false;
      storageSet(DEPT_GUIDE_DIALOG, 1)
      if (!storageGet(DEPT_GUIDE) || storageGet(DEPT_GUIDE) < this.deptSteps.length) {
        this.$tours['myTour'].start()
        this.nowGuideStep = 0
      } 
    },
    btnCollapse(dir){
      if (dir === 'left') {
        this.collapse = true;
        this.collapseLeft = !this.collapseLeft;
        this.collapseRight = true;
      } else {
        this.collapse = false;
        this.collapseRight = !this.collapseRight;
        this.collapseLeft = true;
      }
    },
    async refreshDept(){
      try {
        if(localStorage.getItem('dept-need-refresh') == 1) {
          // 刷新整个tab
          await this.initialize()
          localStorage.setItem('dept-need-refresh', 0);
        } else {
          // 只刷新当前部门信息
          await this.initDeptUser(_.cloneDeep(this.selectedDept));
        }
      } catch (error) {
        console.log(error);
      }
      return new Promise((resolve, reject)=>{
        resolve();
      });
    },
    nextStep() {
      this.nowGuideStep++
    },
    stopStep() {
      this.nowGuideStep = this.deptSteps.length
      storageSet(DEPT_GUIDE, this.deptSteps.length)
    },
    // 编辑账号名称功能
    toggleEditor(row) {
      this.showModifynameDialog = true
      this.$nextTick(() => {
        this.$refs.ModifyNameToast.form.userId = row.userId
        this.$refs.ModifyNameToast.form.name = row.displayName
        this.$refs.ModifyNameToast.openDialog()
      })
    },
    handleClose() {
      this.showModifynameDialog = false
    },
    refresh() {
      this.initialize(false)
    },
    // 同步企业微信通讯录
    async synchronousWeChat() {
      let timeout
      try {
        this.synchronousState = true
        // 获取token
        const token = await this.$http.get('/account/synToken')

        timeout = setTimeout(() => {
          this.$platform.alert('同步时间较长，系统将在后台继续为您尝试同步')
          this.synchronousState = false
        }, 30000)
        this.$http.get('/login/synContact', { token })
          .then((res) => {
            this.synchronousState = false

            timeout && clearTimeout(timeout)
            timeout = null
            if (res.status == 0) {
              this.$platform.alert('同步成功！')
              window.location.reload()
            } else {
              this.$platform.alert('同步失败！')
            }
          })
          .catch((err) => {
            timeout && clearTimeout(timeout)
            timeout = null
            this.synchronousState = false
            console.error('toggleStatus catch err', err)
          })
      } catch (error) {
        timeout && clearTimeout(timeout)
        this.synchronousState = false
        console.error(error)
      }
    },
    // 同步钉钉通讯录
    async syncDingTalkAddressBook() {
      let timeout
      try {
        this.synchronousState = true
        timeout = setTimeout(() => {
          this.$platform.alert('同步时间较长，系统将在后台继续为您尝试同步')
          this.synchronousState = false
        }, 30000)
        //  parent.httpGet("/dd/synAddressBook?corpId="+$("#corpId").val(),{},false,function(data){
        let res = await this.$http.get(`/dd/synAddressBook?corpId=${this.corpId}`, {})
        this.synchronousState = false
        timeout && clearTimeout(timeout)
        timeout = null
        if (res.status == 0) {
          this.$platform.alert('同步成功！')
          window.location.reload()
        } else {
          this.$platform.alert('同步失败！')
        }
      } catch (error) {
        timeout && clearTimeout(timeout)
        this.synchronousState = false
        console.error(error)
      }
    },

    debounce: _.debounce(async function () {
      // 部门模糊搜索
      try {
        this.depts = await this.fetchDept();
        this.initDeptUser(this.depts[0]);
      } catch (error) {
        console.log(error)
      }
    }, 1000),
    toggleEnable(row) {
      row.pending = true
      this.$http
        .post('/security/user/enable', { userId: row.userId }, false)
        .then((res) => {
          row.pending = false
          if (res.status) return this.$platform.alert(res.message)
          this.initialize(false)
        })
        .catch((err) => {
          row.pending = false
          console.error('toggleStatus catch err', err)
        })
    },
    async deleteDeptUser(row) {
      if (await this.$platform.confirm('确定要把选中成员从该部门中删除吗？')) {
        row.pending = true
        this.$http
          .post('/security/user/delete', { userId: row.userId }, false)
          .then((res) => {
            row.pending = false
            if (res.status) return this.$platform.alert(res.message)
            this.initialize(false)
          })
          .catch((err) => {
            row.pending = false
            console.error('toggleStatus catch err', err)
          })
      }
    },
    openMap() {
      this.$fast.map
        .display(this.deptInfo.tagAddress, { title: '部门位置' })
        .catch((err) => console.error('openMap catch an err: ', err))
    },
    // 导出动态
    exportFeed(type) {
      if (!type && !this.multipleSelection.length)
        return this.$platform.alert('请至少选择一个用户！')
      export_state = type
      this.exportDialogvisible = true
    },
    // 导出账号
    exportAccount(type) {
      if (!type && !this.multipleSelection.length) return this.$platform.alert('请至少选择一个用户！')
      export_state = type
      if (export_state === 'all') {
        // 导出全部        
        window.location.href = this.selectedDept.id == mainTagId ? '/security/user/tag/exportBatch' : `/security/user/tag/exportBatch?tagId=${this.selectedDept.id}`
      } else {
        // 导出选中的
        let ids = []
        for (const user of this.multipleSelection) {
          ids.push(user.userId)
        }
        ids = ids.join(',')
        window.location.href = `/security/user/tag/exportBatch?userIdsStr=${ids}`
      }
      export_state = ''
    },
    exportData() {
      if (!this.selectdatetime) {
        timeStart = ''
        timeEnd = ''
      } else {
        timeStart = `${this.selectdatetime[0]} 00:00:00`
        timeEnd = `${this.selectdatetime[1]} 23:59:59`
      }
      if (export_state === 'all') {
        // 导出全部
        window.location.href = this.selectedDept.id == mainTagId ? `/security/user/workState/exportBatch?timeStart=${timeStart}&timeEnd=${timeEnd}` : `/security/user/workState/exportBatch?tagId=${this.selectedDept.id}&timeStart=${timeStart}&timeEnd=${timeEnd}`
      } else {
        // 导出选中的
        let ids = []
        for (const user of this.multipleSelection) {
          ids.push(user.userId)
        }
        ids = ids.join(',')
        // console.log('ids::', `/security/user/workState/exportBatch?userIdsStr=${ids}&timeStart=${timeStart}&timeEnd=${timeEnd}`)
        window.location.href = `/security/user/workState/exportBatch?userIdsStr=${ids}&timeStart=${timeStart}&timeEnd=${timeEnd}`
      }
      export_state = ''
      this.selectionToggle()
      this.exportDialogClosed()
    },
    exportDialogClosed() {
      this.selectdatetime = ''
      this.exportDialogvisible = false
    },
    userResetPwdConfirm(userId) {
      this.resetDialogvisible = true
      this.resetForm.userId = userId
    },
    resetDialogClosed() {
      this.resetForm.userId = ''
      this.resetForm.pwd = ''
      this.resetDialogvisible = false
    },
    /* 钉钉端设置是否按 服务团队 还是钉钉通讯录 派单 */
    async setUsedAllot (setTag) {
      // setTag为true按通讯录 false按团队
      try {
        let params = {
          set: setTag ? 'dept' : 'tag'
        }
        let result = await TeamApi.usedAllot(params);

        if (setTag) {
          this.setSeeAllOrg();
        }

        if (result.status != 0) {
          return this.$platform.alert(result.message);
        }
        localStorage.setItem('allotByTag', setTag ? 0 : 1)
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
        let result = await TeamApi.saveSeeAllOrg(params)
        if (result.status != 0) {
          this.$platform.alert(result.message)
        } else {
          this.isSeeAllOrg = state
        }
      } catch (error) {
        console.log('setUsedAllot error: ', error)
      }
    },
    roleDialogClosed() {
      this.$refs.roleFormRef.resetFields()
    },
    async dispatchRole() {
      try {
        this.pending = true
        const params = { state: this.roleForm.roleId != 0, roleId: this.roleForm.roleId }
        const { status, message } = await autoAuth(params)
        if (status !== 0)
          return this.$platform.notification({
            title: '自动分配权限失败',
            message: message || '',
            type: 'error',
          })
        this.pending = false
        this.roleDialogVisible = false
        this.roleDialogClosed()
        this.$platform.notification({
          title: '自动分配权限成功',
          type: 'success',
        })
      } catch (error) {
        this.pending = false
        console.error(error)
      }
    },
    goRoleDetail(event) {
      event.preventDefault()
      if (!window.frameElement) return

      let el = event.target
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: `tab_role_view_${el.dataset.id}`,
        title: '角色详情',
        close: true,
        reload: true,
        url: `/security/role/view/${el.dataset.id}?`,
        fromId,
      })
    },
    createRole() {
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: 'create_role',
        title: '新建角色',
        close: true,
        url: '/security/role/create',
        fromId,
      })
    },
    editRole(id) {
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: 'edit_role',
        title: '编辑角色',
        close: true,
        url: `/security/role/edit/${id}`,
        fromId,
      })
    },
    async resume(userId) {
      try {
        if (await this.$platform.confirm('确定要恢复该账号吗？')) {
          const { status, message } = await http.post(
            '/security/user/resume',
            { userId },
            false
          )
          // if(status !== 0) this.$message.error(message || '');
          let isSucc = status == 0
          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '账号恢复成功' : message,
            type: isSucc ? 'success' : 'error',
          })
          isSucc && this.chooseRole(this.selectedRole)
        }
      } catch (error) {
        console.error(error)
      }
    },
    async resetRole(id) {
      try {
        if (await this.$platform.confirm('确定要重置该角色权限吗？')) {
          const { status, message } = await http.post(
            `/security/role/delete/${id}`,
            { type: 'post' },
            false
          )
          // if(status !== 0) return this.$message.error(message || '');
          let isSucc = status == 0
          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '角色权限重置成功' : message,
            type: isSucc ? 'success' : 'error',
          })
          if (isSucc) {
            this.selectedRole.custom = null
            let role = _.cloneDeep(this.selectedRole)
            role.custom = null
            let index = this.roles.findIndex(
              (value) => value.id == this.selectedRole.id
            )
            this.$set(this.roles, index, role)
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    async delRole(id) {
      try {
        if (await this.$platform.confirm('确定要删除该角色权限吗？')) {
          const { status, message } = await http.post(`/security/role/delete/${id}`, { type: 'post' }, false)
          // if(status !== 0) this.$message.error(message || '');
          let isSucc = status == 0
          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '角色权限删除成功' : message,
            type: isSucc ? 'success' : 'error',
          })
          if(isSucc) {
            // 角色删除成功后需要刷新角色列表
            let index = this.roles.findIndex(v => v.id === id); 
            this.roles.splice(index, 1);
            this.selectedRole = this.roles[index - 1]
            this.chooseRole(this.selectedRole)
          } 
        }
      } catch (error) {
        console.error(error)
      }
    },
    createTransTab(type, userId) {
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: 'M_JOBTRANSFER_DETAIL',
        title: '正在加载',
        close: true,
        url: `/jobtransfer/view?type=${type}&userId=${userId}`,
        fromId,
      })
    },
    async resetUserPwd() {
      if (!this.resetForm.pwd) return this.$platform.alert('重置密码不能为空')
      let params = {}
      params.userId = this.resetForm.userId
      params.newPwd = md5(this.resetForm.pwd)
      params.confirmPwd = md5(this.resetForm.pwd)
      resetPwd(params)
        .then((result) => {
          let isSucc = result.status == 0
          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '密码重置成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
          if (isSucc) this.resetDialogClosed()
        })
        .catch((err) => console.log(err))
    },

    search() {
      // 组织架构人员搜索
      this.initDeptUser(this.selectedDept)
    },
    searchRole() {
      // 角色人员搜索
      this.chooseRole(this.selectedRole)
    },
    chooseDelRole() {
      this.selectedDept = {}
      let role = { id: -1, text: '已删除账号' }
      this.chooseRole(role)
    },
    async chooseRole(role) {
      this.multipleSelection = []
      this.roleMultipleSelection = []
      if (this.selectedRole.id != role.id) {
        this.roleKeyword = ''
      }
      this.selectedRole = role
      this.roleLoading = true
      // 获取角色下面的人员
      this.roleParams.keyword = this.roleKeyword
      this.roleParams.roleId = ''
      this.roleParams.roleType = ''
      this.roleParams.pageNum = 1
      this.rolePage.list = []
      if (role.id == 0) {
        // 待分配账号
        this.roleParams.roleType = 'noauth'
      } else if (role.id == -1) {
        // 已删除账号
        this.roleParams.roleType = 'delauth'
      } else {
        this.roleParams.roleId = role.id
      }

      return this.getRoleUserList(this.roleParams)
        .then((rolePage) => {
          this.rolePage.merge(Page.as(rolePage))
        })
        .catch((err) => console.error('err', err))
        .finally(() => (this.roleLoading = false))
    },

    getRoleUserList(params) {
      if (this.selectedRole.id == -1) return getDelUser(params)
      return getRoleUser(params)
    },

    handleClick(tab, event) {
      if (tab.name === 'role') {
        this.chooseRole(this.selectedRole)
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
      }

      // window.location.href = `/security/tag/createTag?${qs.stringify(parent)}`;
      let fromId = window.frameElement.getAttribute('id')
      platform.openTab({
        id: 'createTag',
        title: '新建部门',
        url: `/security/tag/createDept?${qs.stringify(parent)}`,
        reload: true,
        fromId,
      })
    },
    async delDepartment(id) {
      // 您删除的团队，如果包含子团队将会一并删除，是否继续？
      try {
        if (
          await this.$platform.confirm(
            '您删除的部门，如果有子部门，也将一并删除，是否继续删除?'
          )
        ) {
          let ids = [this.selectedDept.id]
          if (id) ids = [id]

          let result = await TeamApi.deleteTag(ids)

          this.$platform.notification({
            type: result.status == 0 ? 'success' : 'error',
            title: `部门删除${result.status == 0 ? '成功' : '失败'}`,
            message: result.status == 0 ? null : result.message,
          })

          if (result.status == 0) {
            this.initialize(true)
          }
        }
      } catch (e) {
        console.error('teamDelete catch error', e)
      }
    },
    chooseChildDepartment(childDept) {
      this.selectedDept = childDept
      this.initDeptUser(this.selectedDept)
    },
    /** 选择部门 */
    chooseDept(event) {
      console.log('chooseDept event');
      let { node, value } = event
    },
    chooseUser(type) {
      let options = {
        title: '请选择成员',
        seeAllOrg: true,
        max: -1,
        selectedUser: this.userPage.list,
        mountEl: this.$el,
      }

      this.$fast.contact
        .choose('team', options)
        .then((result) => {
          // console.log(result);
          if (result.status == 0) {
            let data = result.data || {}
            let users = data.users || []
            // TODO 组织 角色批量添加成员
            if (type === 'role') {
              this.addRoleUserList(users)
            } else {
              this.addDeptUser(users)
            }
          }
        })
        .catch((err) => console.error(err))
    },
    addDeptUser(users) {
      // 组织架构 添加成员
      let params = {
        tagId: this.selectedDept.id,
      }
      params.userIds = users.map((item) => item.userId)

      this.loading = true

      TeamApi.addUser(params)
        .then((result) => {
          let isSucc = result.status == 0
          if (isSucc) {
            // 刷新组织架构 成员列表
            this.initialize(false)
          }
          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '添加成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
    // 角色 添加成员
    addRoleUserList(users) {
      let params = {
        roleId: this.selectedRole.id,
      }
      params.userIds = users.map((item) => item.userId)
      this.loading = true

      addRoleUser(params)
        .then((result) => {
          let isSucc = result.status == 0
          if (isSucc) {
            // 刷新列表
            this.chooseRole(this.selectedRole)
          }
          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '添加成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
    /* 选择多个部门 / 调整部门 */
    chooseDepartmentMulti() {
      if (this.multipleSelection.length <= 0) {
        return this.$platform.alert('请先选择需要调整的成员')
      }

      if (this.multipleSelection.length > 1) {
        return this.$platform.alert('请先选择一个需要调整的成员')
      }

      let options = {
        title: '请选择部门',
        seeAllOrg: true,
        max: -1,
      }

      this.$fast.contact
        .choose('dept_only', options)
        .then((result) => {
          let data = result.data || {}
          if (result.status == 0) {
            this.updateDepartmentUserBatch(data.depts || {})
          }
        })
        .catch((err) => console.error(err))
    },
    /* 新建部门 */
    departmentCreate(form) {
      let { department } = form
      let parent = this.getHigherDepartment(this, department)
      let params = {
        name: form.name,
        description: '自主新建',
        type: 'app',
        parentId: parent.type == 'ding' ? department.dingId : department.id,
      }

      this.loading = true

      addDepartment(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.initialize(false)
            this.$refs.departmentEditPanel.close()
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '创建成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.error(err))
        .finally(() => (this.loading = false))
    },
    /* 编辑部门 */
    departmentEdit(form) {
      let { department } = form
      let parent = this.getHigherDepartment(this, department)

      let params = {
        id: this.selectedDept.id,
        name: form.name,
        type: 'app',
        parentId: parent.type == 'ding' ? department.dingId : department.id,
      }
      this.loading = true

      updateDepartment(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.$refs.departmentEditPanel.close()
            this.initialize()
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '更新成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.error(err))
        .finally(() => (this.loading = false))
    },
    /* 删除部门 */
    async departmentDelete() {
      if (!(await this.$platform.confirm('您确定要删除该部门吗？'))) return

      let params = {
        id: this.selectedDept.id,
      }

      this.loading = true

      deleteDepartment(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.$refs.departmentEditPanel.close()
            this.initialize()
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '删除成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
    /** 抓取部门数据 */
    fetchDept() {
      let params = {
        seeAllOrg: this.isSeeAllOrg,
        keyword: this.deptKeyword,
      }

      return TeamApi.tagList(params)
        .then((result) => {
          return (result && result.list) || []
        })
        .catch((err) => console.error('err', err))
    },
    /* 抓取部门 人员数量 */
    fetchDeptCount() {
      return getDepartmentUserCount()
    },
    /** 抓取用户数据 */
    fetchUser() {
      let params = this.params
      return TeamApi.userList(params)
        .then((userPage) => {
          this.userPage.merge(Page.as(userPage))
        })
        .catch((err) => console.error('err', err))
    },
    /* 查询是否开启 降低组织架构的开关 */
    getSeeAllOrg() {
      return http.post('/setting/user/getSeeAllOrg').then((result) => {
        return result
      })
    },
    /* 跳转 用户详情页 */
    goUserDetail(event) {
      event.preventDefault()
      if (!window.frameElement) return

      let el = event.target
      let fromId = window.frameElement.getAttribute('id')
      this.$platform.openTab({
        id: `tab_department_view_${el.dataset.id}`,
        title: '成员详情',
        close: true,
        reload: true,
        url: `/security/user/view/${el.dataset.id}?from=department`,
        fromId,
      })
    },
    getHigherDepartment(data, department) {
      let depts = data.depts

      if (!Array.isArray(depts)) return {}

      let higherDepartment = depts.filter((dept) => dept.id == department.id)

      if (higherDepartment.length > 0) return data

      for (let i = 0; i < depts.length; i++) {
        let dept = depts[i]
        let subDepartments = dept.subDepartments || []
        dept.depts = subDepartments

        let higherDepartment = this.getHigherDepartment(dept, department)

        if (Object.keys(higherDepartment).length > 0) {
          return higherDepartment
        }
      }

      return {}
    },
    handleSizeChange(pageSize) {
      this.params.pageSize = pageSize
      this.params.pageNum = 1

      this.userPage.list = []

      this.loading = true

      this.fetchUser().finally(() => (this.loading = false))
    },
    roleHandleSizeChange(pageSize) {
      this.roleParams.pageSize = pageSize
      this.roleParams.pageNum = 1

      this.rolePage.list = []

      this.roleLoading = true

      // this.fetchUser().finally(() => this.loading = false);
      return this.getRoleUserList(this.roleParams)
        .then((rolePage) => {
          this.rolePage.merge(Page.as(rolePage))
        })
        .catch((err) => console.error('err', err))
        .finally(() => (this.roleLoading = false))
    },
    /** 初始化 */
    initialize(isInit = true) {
      this.initializeDept(isInit)
    },
    /** 初始化部门数据 */
    async initializeDept(isInit = true) {
      this.loading = true
      this.isSeeAllOrg = false

      try {
        /* 如果开启 查询按组织架构选项 */
        let result = await this.getSeeAllOrg()
        this.isSeeAllOrg = result.data
      } catch (error) {
        console.log('error: ', error)
      }

      let subtask = [this.fetchDept(), this.fetchDeptCount()]

      Promise.all(subtask)
        .then((result) => {
          let depts = result[0] || []
          let deptUserCount = result[1] || {}

          this.deptUserCount = deptUserCount.data || {}
          this.depts = depts
          // 主tag的id
          mainTagId = this.depts[0].id;
          this.initDeptUser(
            isInit ? this.depts[0] : _.cloneDeep(this.selectedDept)
          )
        })
        .catch((err) => console.error(err))
    },
    /** 选中一个部门 */
    async initDeptUser(dept) {
      this.multipleSelection = []
      this.roleMultipleSelection = []
      if (this.activeName == 'tag' && this.selectedRole.id == -1) {
        this.selectedRole = { id: '0', text: '待分配人员' }
      }
      try {
        if (this.selectedDept.id != dept.id) {
          this.keyword = ''
        }
        this.selectedDept = dept

        this.userPage.list = []
        this.loading = true

        // 查询用户
        this.params.keyword = this.keyword
        // 只有选择的不是主tag 搜索人员就不传tagid
        if(dept.id != mainTagId) {
          this.params.tagId = dept.id
        }else {
          this.params.tagId = ''
        }
        // this.params.departmentId = dept.id;
        this.params.pageNum = 1
        this.params.seeAllOrg = this.isSeeAllOrg
        this.fetchTeamData()
        await this.fetchUser()
      } catch (error) {
        console.error(error)
      }

      this.loading = false
    },
    async fetchTeamData() {
      let params = {
        id: this.selectedDept.id,
      }
      try {
        let result = await TeamApi.getTag(params)
        if (result.status)
          return this.$platform.notification({
            title: '失败',
            message: result.message,
            type: 'error',
          })
        this.deptInfo = result.data
        this.subDepartments = this.deptInfo.children || []
      } catch (error) {
        console.log('error: ', error)
      }
    },
    isRootDepartment(department = {}) {
      return this.depts.some((dept) => dept.id == department.id)
    },
    jump(pageNum) {
      this.params.pageNum = pageNum

      this.userPage.list = []

      this.loading = true

      this.fetchUser().finally(() => (this.loading = false))
    },
    roleJump(pageNum) {
      this.roleParams.pageNum = pageNum

      this.rolePage.list = []

      this.roleLoading = true

      return this.getRoleUserList(this.roleParams)
        .then((rolePage) => {
          this.rolePage.merge(Page.as(rolePage))
        })
        .catch((err) => console.error('err', err))
        .finally(() => (this.roleLoading = false))
    },
    nodeRender(h, node) {
      let content = <span>{node.tagName}</span>

      let count = this.deptUserCount[node.id] || 0
      if (count <= 0) return content

      return (
        <div class="dept-node-wrap">
          <span class="dept-node-name">{node.tagName}</span>
          <span class="dept-node-count">&nbsp;({count})人</span>
        </div>
      )
    },
    openCreateUserPanel() {
      this.$refs.createUserPanel.open({})
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
      let fromId = window.frameElement.getAttribute('id')
      let isRoot = this.selectedDept.id == mainTagId // 判断是不是根部门，根部门编辑不能修改名称
      platform.openTab({
        id: 'editTag',
        title: '编辑部门',
        url: id
          ? `/security/tag/editDept/${id}`
          : `/security/tag/editDept/${this.selectedDept.id}?isRoot=${isRoot}`,
        reload: true,
        fromId,
      })
    },
    /** select dept person */
    selectionHandle(selection) {
      this.multipleSelection = selection.slice()
    },
    selectionToggle(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
        this.multipleSelection = []
      }
    },
    /** select role person */
    roleSelectionHandle(selection) {
      this.roleMultipleSelection = selection.slice()
    },
    roleSelectionToggle(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.roleMultipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.roleMultipleTable.clearSelection()
        this.roleMultipleSelection = []
      }
    },
    async roleDeleteConfirm() {
      // 角色 批量移除成员
      if (this.roleMultipleSelection.length <= 0) {
        return this.$platform.alert('请先选择需要移除的成员')
      }
      let hasSuperAdmin = this.roleMultipleSelection.some((user)=> {
        return user.superAdmin == 2
      });
      if (hasSuperAdmin) {
        return this.$platform.alert('移除失败！主管理员不允许移除系统管理员角色')
      }
      if (await this.$platform.confirm('确定要把选中成员从该角色中移除吗？')) {
        this.roleUserDelete()
      }
    },
    roleUserDelete() {
      let params = {
        userIds: this.roleMultipleSelection
          .map((item) => item.userId)
          .join(','),
        roleId: this.selectedRole.id,
      }

      this.loading = true

      delRoleUser(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.chooseRole(this.selectedRole)
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '移除成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
    async userDeleteConfirm(type) {
      // 批量删除
      if (type === 'multiple' && this.multipleSelection.length <= 0) {
        return this.$platform.alert('请先选择需要移除的成员')
      }

      if (await this.$platform.confirm('确定要把选中成员从该部门中移除吗？')) {
        this.userDelete()
      }
    },
    userDelete() {
      let params = {
        userIds: this.multipleSelection.map((item) => item.userId).join(','),
        tagId: this.selectedDept.id,
      }

      this.loading = true

      TeamApi.deleteUser(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.initialize(false)
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '移除成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
    userAdd(form = {}) {
      console.log('hbc: userAdd -> form', form)
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
      }
      console.log('hbc: userAdd -> params', params)

      this.loading = true

      addDepartmentUser(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.$refs.createUserPanel.close()
            this.initialize(false)
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '添加成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
    updateDepartmentUserBatch(departments) {
      let params = {
        userId: this.multipleSelection[0].userId,
        departmentIds: departments.map((d) => d.id).join(','),
      }

      this.loading = true

      updateDepartmentUserBatch(params)
        .then((result) => {
          let isSucc = result.status == 0

          if (isSucc) {
            this.initialize(false)
          }

          this.$platform.notification({
            title: isSucc ? '成功' : '失败',
            message: isSucc ? '调整成功' : result.message,
            type: isSucc ? 'success' : 'error',
          })
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false))
    },
  },
  components: {
    [CreateUserPanel.name]: CreateUserPanel,
    [DepartmentEditPanel.name]: DepartmentEditPanel,
    [ModifyName.name]: ModifyName,
  },
}
</script>

<style lang='scss'>
.el-tabs__header {
  margin-left: -1px;
}
.el-tabs__content {
  min-width: 300px;
  overflow-x: hidden;
  overflow-y: auto;
}

.collapse {
  display: flex;
  flex-direction: column;
  justify-content: center;
  span {
    padding: 5px;
    cursor: pointer;
    color: #666;
  }
}

.el-tabs-expand .el-tabs__content {
  width: 400px;
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
  flex: 1;
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-top: 10px;
  border-top: 1px solid #eee;
}
.dept-del-role-item-expand {
  min-width: 400px;
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
  color: #13c2c2;
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
    padding: 4px 15px;
    margin-left: 8px;
    background: #13c2c2;
    color: #fff;
    font-size: 14px;
    border-radius: 4px;
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

  min-width: 300px;
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

  flex: 1;

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
    color: #13c2c2;
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
  height: calc(100% - 105px);
}
.department-left {
  position: relative;
  border-right: 1px solid #f2f2f2;
  .base-button {
    margin: 10px 20px;
    width: 260px;
  }
  .sync-button {
    width: 360px;
  }
}
.department-state {
  .el-tabs__content {
    height: calc(100% - 50px);
  }
}
</style>
<style lang="scss" scoped>
.department-container {
   /deep/ .v-step[data-v-7c9c03f0] {
    background: #fff !important;
    color: #333 !important;
    -webkit-filter: drop-shadow(
      0px 9px 28px 8px rgba(0, 0, 0, 0.05)
    ) !important;
    filter: drop-shadow(0px 9px 28px 8px rgba(0, 0, 0, 0.05)) !important;
    padding: 0 !important;
    min-width: 240px !important;
    max-width: 350px !important;
  }

   /deep/ .v-step .v-step__arrow[data-v-7c9c03f0] {
    border-color: #fff;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
  }

  .tour-content-box {
    position: relative;
    overflow: hidden;
    padding: 0 20px;
    border-radius: 4px;

    .tour-left-tips {
      width: 80px;
      height: 32px;
      background: $color-primary;
      color: #fff;
      position: absolute;
      left: -40px;
      top: 0px;
      line-height: 40px;
      font-size: 12px;
      transform-origin: center top;
      transform: rotateZ(-45deg);
      text-align: center;
    }

    .tour-content {
      .tour-content-head {
        padding-top: 32px;
        padding-bottom: 10px;

        .iconfont {
          font-size: 10px;
          margin-bottom: 2px;
          color: #999;
          cursor: pointer;
        }
      }

      .tour-content-con {
        text-align: start;
        padding-bottom: 12px;
        color: #666;
      }
    }
  }

  .tour-bottom {
    height: 52px;
    padding: 0 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .btns {
      width: 60px;
      height: 28px;
      background: $color-primary;
      color: #fff;
      text-align: center;
      line-height: 28px;
      border-radius: 4px;
    }

    .text {
      color: $color-primary;
    }

    :nth-child(n) {
      cursor: pointer;
    }

    :not(:last-child) {
      margin-right: 12px;
    }
  }

  /* 向上的箭头 */

  .normal-arrow-top {
    font-size: 0;
    line-height: 0;
    border-width: 0.5rem;
    border-color: #fff;
    width: 0;
    border-top-width: 0;
    border-style: dashed;
    border-bottom-style: solid;
    border-left-color: transparent;
    border-right-color: transparent;
    position: absolute;
    top: -0.5rem;
  }

  .guide-model-box {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 996;
  }

  .guide-point {
    z-index: 997;
    position: sticky;
  }

  .bg-w {
    background: #fff;
  }

  .dept-step-1-box {
    position: absolute;
    top: 0;
    z-index: 997;
  }
}
</style>