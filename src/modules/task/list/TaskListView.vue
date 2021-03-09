<template>
  <div class="task-box">
    <div id="task-task-list-view"></div>
    <!-- s 列表展示 -->
    <div
      class="task-list-view common-list-container"
      ref="taskListPage"
      v-show="mapShow"
      v-loading.fullscreen.lock="loading"
    >
      <div class="task-list-header">
        <!-- 搜索 -->
        <div class="task-list-header-seach">
          <form onsubmit="return false;">
            <div class="seach task-span1 guide-box">
              <div style="position: relative;" >
                <div itemid="" @mouseenter="guideDropdownMenu_enter" class="task-flex task-ai task-jend">  
                  <el-dropdown id="v-task-step-3" >
                    <div
                      :class="['task-list-customize', 'task-font14', 'task-c3', 'task-flex', 'task-ai', 'task-pointer','bg-w']"
                    >
                      <img
                        src="../../../assets/img/customize.png"
                        class="task-ic19"
                      />
                      {{ otherText }}
                      <i class="iconfont icon-triangle-down task-icon"></i>
                    </div>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item class="task-view-customize">
                        <div
                          v-for="(item, index) in otherList"
                          :key="index"
                          class="task-flex task-ai task-pointer"
                        >
                          <span
                            class="task-list-dropdown-item"
                            @click="checkOther(item)"
                          >{{ item.name }}</span
                          >
                          <div class="task-list-dropdown-icon">
                            <el-tooltip content="查看筛选条件" placement="top">
                              <i
                                class="iconfont icon-yanjing task-font12"
                                @click="creatViewPanel(item, 'view')"
                              ></i>
                            </el-tooltip>
                            <el-tooltip content="编辑视图" placement="top">
                              <i
                                class="iconfont icon-bianji1 task-ml12 task-font12"
                                @click="creatViewPanel(item, 'edit')"
                                v-if="item.authEdit"
                              ></i>
                            </el-tooltip>
                            <el-tooltip content="删除视图" placement="top">
                              <i
                                class="iconfont icon-shanchu-copy task-ml12 task-font12"
                                @click.stop="delView(item)"
                                v-if="item.authEdit"
                              ></i
                              >{{ item.authEdit }}
                            </el-tooltip>
                          </div>
                        </div>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <div
                          class="task-flex task-ai task-cfa task-pointer task-list-wd252"
                          @click="creatViewPanel"
                        >
                          <i class="iconfont icon-add task-mr4 task-font12"></i>
                          新建视图
                        </div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>

                  <el-input
                    v-model="params.keyword"
                    v-trim:blur
                    :placeholder="
                      taskSearchInputPlaceholderMap[keyword_select] ||
                        taskSearchInputPlaceholderMap.default
                    "
                    class="task-with-input task-ml12"
                  >
                    <el-select
                      v-model="keyword_select"
                      slot="prepend"
                      placeholder="请选择"
                      class="task-with-select"
                    >
                      <el-option label="表单内容" value=""></el-option>
                      <el-option label="备注" value="按工单备注"></el-option>
                      <el-option label="附加组件" value="按附加组件"></el-option>
                    </el-select>
                  </el-input>

                  <base-button
                    type="primary"
                    @event="searchBefore"
                    native-type="submit"
                    class="task-ml12"
                  >
                    搜索
                  </base-button>
                  <base-button
                    type="ghost"
                    @event="resetParams"
                    class="task-ml12"
                  >
                    重置
                  </base-button>
                  <div class="guide-box">
                    <div
                      id="v-task-step-2"
                      :class="['advanced-search-visible-btn', 'task-ml12']"
                      @click.self="panelSearchAdvancedToggle"
                    >
                      <i
                        class="iconfont icon-gaojisousuo task-font12 task-mr4"
                      ></i>
                      高级搜索
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <!-- 筛选 -->
        <div class="task-list-header-nav">
          <div class="task-flex">
            <div class="task-font14 task-c6 state">工单状态：</div>
            <div class="list task-flex" :style="stateHeight">
              <div class="list-item task-flex task-ai">
                <!-- 全部工单 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '全部工单',
                      searchModel: item.searchModel,
                      title: 'all',
                    })
                  "
                  v-show="item.id === selectIds.allId"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `全部工单(${filterData.all || 0})` }}
                </div>
                <!-- 待指派 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '待指派工单',
                      searchModel: item.searchModel,
                      title: 'created',
                    })
                  "
                  v-show="item.id === selectIds.createdId"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `待指派(${filterData.created || 0})` }}
                </div>
                <!-- 已指派 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '已指派工单',
                      searchModel: item.searchModel,
                      title: 'allocated',
                    })
                  "
                  v-show="item.id === selectIds.allocatedId"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `已指派(${filterData.allocated || 0})` }}
                </div>
                <!-- 已接受 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '已接受工单',
                      searchModel: item.searchModel,
                      title: 'accepted',
                    })
                  "
                  v-show="item.id === selectIds.acceptedId"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `已接受(${filterData.accepted || 0})` }}
                </div>
                <!-- 进行中 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '进行中工单',
                      searchModel: item.searchModel,
                      title: 'processing',
                    })
                  "
                  v-show="item.id === selectIds.processingId"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `进行中(${filterData.processing || 0})` }}
                </div>
                <!-- 已完成工单 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '已完成工单',
                      searchModel: item.searchModel,
                      title: 'finished',
                    })
                  "
                  v-show="item.id === selectIds.finished"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `已完成(${filterData.finished || 0})` }}
                </div>
                <!-- 异常工单 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '异常工单',
                      searchModel: item.searchModel,
                      title: 'exception',
                    })
                  "
                  v-show="item.id === selectIds.exceptionId"
                  class="task-cef"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  <el-tooltip
                    :content="`当前已选择 ${abnormalData.hoverText}`"
                    placement="top"
                  >
                    <span> {{ `异常工单(${filterData.exception || 0})` }}</span>
                  </el-tooltip>
                </div>
                <!-- 未完成工单 -->
                <div
                  v-for="item in taskView"
                  :key="`${item.createTime}${Math.random() * 1000}`"
                  @click="
                    checkFilter({
                      id: item.id,
                      name: '未完成工单',
                      searchModel: item.searchModel,
                      title: 'unfinished',
                    })
                  "
                  v-show="item.id === selectIds.unfinishedId"
                  :class="{
                    'task-c2': item.id === filterId,
                  }"
                >
                  {{ `未完成(${filterData.unfinished || 0})` }}
                </div>

              </div>
            </div>
            <div
              class="element-icon"
              v-if="910 > navWidth"
              @click="
                stateHeight =
                  stateHeight === `height:30px` ? `height:auto` : `height:30px`
              "
            >
              <i
                class="el-icon-arrow-down task-icon"
                v-if="stateHeight === 'height:30px'"
              ></i>
              <i class="el-icon-arrow-up task-icon" v-else></i>
            </div>
          </div>
          <!-- 创建 -->
          <div class="task-flex">
            <div class="task-font14 task-c6 state">创建视角：</div>
            <div class="list list-crate" :style="`width: ${navWidth}px`">
              <div class="list-item task-flex task-ai">
                <div
                  v-for="(item, index) in selectList"
                  :key="index"
                  class="task-nav-create"
                  :class="{ 'task-c2': selectId === item.id }"
                  @click.stop="createPerspective(item)"
                >
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div>
          <!-- 工单类型 -->
          <div class="task-flex">
            <div class="task-font14 task-c6 state">工单类型：</div>
            <div class="list" :style="typeHeight">
              <div class="list-item task-flex task-ai">
                <div
                  v-for="item in taskTypes"
                  :key="item.id"
                  class="task-nav-create"
                  :class="{ 'task-c2': currentTaskType.id === item.id }"
                  @click="changeTaskType(item)"
                >
                  {{ item.name }}
                </div>
              </div>
            </div>
            <div
              class="element-icon"
              v-if="taskTypes.length * 130 > navWidth"
              @click="
                typeHeight =
                  typeHeight === `height:30px` ? `height:auto` : `height:30px`
              "
            >
              <i
                class="el-icon-arrow-down task-icon"
                v-if="typeHeight === 'height:30px'"
              ></i>
              <i class="el-icon-arrow-up task-icon" v-else></i>
            </div>
          </div>
          <!-- 异常节点 -->
          <div class="task-flex" v-show="selectColumnState === 'exception'">
            <div class="task-font14 task-c6 state">异常节点：</div>
            <div class="list" :style="typeHeight">
              <div class="list-item task-flex task-ai">
                <div
                  v-for="item in taskCustomExceptionNodeList"
                  :key="item.englishName"
                  @click="checkAbnormal(item)"
                  :class="{ 'task-c2': exceptionNodes === item.englishName }"
                  class="task-nav-create"
                >
                  {{ item.exceptionName }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- start header -->
      <!-- end header -->
      <!-- start 高级搜索 -->
      <task-search-panel
        :init-data="initData"
        :config="seoSetList"
        :search-params="searchParams"
        :task_view_list="task_view_list"
        :customize-list="[...taskFields, ...taskReceiptFields]"
        ref="searchPanel"
        @bj="showBj = false"
      >
        <div
          class="advanced-search-btn-group task-flex task-buttom"
          slot="footer"
        >
          <div class="task-span1"></div>
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <base-button
            type="primary"
            @event="advancedSearch"
            native-type="submit"
          >搜索</base-button
          >
        </div>
      </task-search-panel>
      <!-- end 高级搜索 -->

      <!-- S 新建视图 -->
      <task-view-panel
        :init-data="initData"
        :config="seoSetList"
        :search-params="searchParams"
        :task_view_list="task_view_list"
        :region="region"
        @bj="showBj = false"
        :customize-list="[...taskFields, ...taskReceiptFields]"
        ref="viewPanel"
      >
        <div
          class="advanced-search-btn-group task-flex task-buttom"
          slot="footer"
        >
          <div class="task-span1"></div>
          <base-button type="ghost" @event="$refs.viewPanel.hide()">{{
            viewType === "view" ? "关闭" : "取消"
          }}</base-button>
          <base-button
            v-if="viewType !== 'view'"
            type="primary"
            native-type="submit"
            @event="saveView"
          >保存视图</base-button
          >
        </div>
      </task-view-panel>
      <!-- E 新建视图 -->
      <div class="common-list-section">
        <!--operation bar start-->
        <div class="task-list-operation-bar-container task-flex task-ai">
          <div class="top-btn-group task-span1 task-flex task-ai">
            <!-- 新建 -->
            <el-dropdown v-if="auth.TASK_ADD">
              <base-button type="primary" icon="icon-add">新建</base-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in initData.tagTaskTypeList"
                  :key="index"
                >
                  <div @click="addView(item)">{{ item.name }}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <!-- 删除 -->
            <div
              class="task-list-del task-font14 task-c06"
              v-if="allowDelete"
              @click="delTask"
            >
              <i class="iconfont icon-shanchu1 task-icon"></i>
              删除
            </div>
            <!-- 批量编辑 -->
            <div
              class="task-list-del task-font14 task-c06"
              @click="Alledit"
              v-if="exportPermissionTaskEdit"
            >
              <i class="iconfont icon-bianji1 task-icon"></i>
              批量编辑
            </div>
          </div>

          <div class="action-button-group task-flex task-ai">
            <!-- 模式 -->
            <el-dropdown>
              <div class="task-ai task-flex task-font14 task-c6 task-pointer">
                <i
                  class="iconfont task-icon"
                  :class="{
                    'icon-liebiaoshitu': mapShow,
                    'icon-ditu': !mapShow,
                  }"
                ></i>
                <span class="task-mr4 task-ml4">{{
                  mapShow ? "列表模式" : "地图模式"
                }}</span>
                <i class="iconfont icon-triangle-down task-icon"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <div @click="taskMode('列表模式')">列表模式</div>
                </el-dropdown-item>
                <el-dropdown-item>
                  <div @click="taskMode('地图模式')">地图模式</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <!-- 选择列 -->
            <div class="guide-box">
              <div
                :class="['task-ai', 'task-flex', 'task-font14', 'task-c6', 'task-pointer', 'task-width103', 'bg-w' ]"
                id="v-task-step-1"
                @click="showAdvancedSetting"
              >
                <span class="task-mr4 task-ml4">选择列</span>
                <i class="iconfont icon-triangle-down task-icon"></i>
              </div>
            </div>

            <!-- start 更多操作 -->
            <!-- v-if="exportPermission" -->
            <el-dropdown v-if="exportPermission || exportPermissionTaskEdit">
              <div
                class="task-ai task-flex task-font14 task-c6 task-pointer"
                @click="trackEventHandler('moreAction')"
              >
                <span class="task-mr4 task-ml4">更多操作</span>
                <i class="iconfont icon-triangle-down task-icon"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="exportPermission && !isExperienceEdition">
                  <div class="import-task">
                    导入工单
                    <div class="import-task-item">
                      <div
                        v-for="(item, index) in taskTypeList"
                        :key="index"
                        @click="imporTask(item)"
                      >
                        {{ item.name }}
                      </div>
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item v-if="exportPermission">
                  <div @click="exportTask(false)">导出</div>
                </el-dropdown-item>
                <el-dropdown-item v-if="exportPermission">
                  <div @click="exportTask(true)">导出全部</div>
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="
                    exportPermissionTaskEdit &&
                      exportPermissionTaskBatchDispatch
                  "
                >
                  <div @click="reallotBatch">工单转派</div>
                </el-dropdown-item>
                <!-- start 批量生成服务报告 -->
                <el-dropdown-item v-if="isShowBatchCreateOrPrintReport">
                  <div @click="batchCreateServiceReport">批量生成服务报告</div>
                </el-dropdown-item>
                <!-- end 批量生成服务报告 -->
                <!-- start 批量打印工单 -->
                <el-dropdown-item v-if="isShowBatchCreateOrPrintReport">
                  <div @click="batchPrintServiceReport">批量打印工单</div>
                </el-dropdown-item>
                <!-- end 批量打印工单 -->
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <!-- 选中的条数 -->
        <div
          class="task-c6 task-font14 task-mt8"
          v-show="multipleSelection.length"
        >
          已选择
          <span class="task-c2" @click="openSelectionPanel">
            {{ multipleSelection.length }}
          </span>
          条
          <span class="task-c2 task-pointer" @click="toggleSelection"
          >清空</span
          >
        </div>
        <!-- start content 列表表格 -->
        <div class="guide-box" id="v-task-step-0">
          <div
            class="task-list-section common-list-table-view"
            v-if="columns.length"
          >
            <el-table
              stripe
              :data="taskPage.list"
              :highlight-current-row="false"
              :key="tableKey"
              :border="true"
              @select="handleSelection"
              @select-all="handleSelection"
              @sort-change="sortChange"
              @header-dragend="headerDragend"
              :class="['task-list-table', 'common-list-table']"
              header-row-class-name="common-list-table-header taks-list-table-header bg-w"
              ref="multipleTable"
            >
              <el-table-column
                type="selection"
                width="48"
                align="center"
                class-name="select-column"
              ></el-table-column>
              <el-table-column
                v-for="column in columns"
                v-if="column && column.show"
                :align="column.align"
                :class-name="
                  column.field == 'name'
                    ? 'common-list-table-name-superscript-td'
                    : ''
                "
                :key="column.field"
                :label="column.label"
                :min-width="column.minWidth"
                :prop="column.field"
                :sortable="column.sortable"
                :show-overflow-tooltip="column.field !== 'name' && column.field !== 'taskNo'"
                :width="column.width"
                :resizable="true"
              >
                <template slot-scope="scope">
                  <!-- 工单编号 -->
                  <div
                    v-if="column.field === 'taskNo'"
                    :class="{ superscript: scope.row.guideData }"
                  >
                    <a
                      href=""
                      class="view-detail-btn task-list-numbering"
                      @click.stop.prevent="
                        openTaskTab(scope.row.id, scope.row[column.field])
                      "
                    >
                      {{ scope.row[column.field] }}
                    </a>
                    <!-- TODO: 曾超时 审批中标签 -->
                    <!-- 暂停中 -->
                    <span
                      class="task-state-block task-state-block-approve task-font12"
                      v-if="scope.row.inApprove == 1"
                    >
                      审批中
                    </span>
                    <!-- 异常标签 -->
                    <span
                      class="task-state-block task-state-block-overtime task-font12"
                      :class="{'task-state-block-approve': v === '转派' || v === '回退', 'task-state-block-ff': v === '曾暂停' || v === '曾超时' || v === '曾拒绝'}"
                      v-for="(v, i) in abnormalHover(scope.row)"
                      :key="i"
                      v-show="i < 2"
                    >
                      {{v}}
                    </span>

                    

                    <el-tooltip
                      v-if="abnormalHover(scope.row).length > 2"
                      :content="abnormalHover(scope.row).join(',')"
                      placement="top"
                    >
                      <span class="task-ml4">...</span>
                  </el-tooltip></div>

                  <!-- 客户  TODO: 客户查看权限 -->
                  <template v-else-if="column.field === 'customer'">
                    <div
                      :class="{
                        'view-detail-btn task-client': scope.row.linkAuth,
                      }"
                      @click.stop="openClientTab(scope.row)"
                    >
                      {{
                        scope.row["customerEntity"] &&
                          scope.row["customerEntity"].name
                      }}
                    </div>
                  </template>
                  <!-- 创建方式 -->
                  <template v-else-if="column.field === 'source'">
                    <span>{{ scope.row["source"]}}</span>
                  </template>

                  <!-- 关联事件 -->
                  <template v-else-if="column.field === 'eventNo'">
                    <div class="view-detail-btn task-client"
                         @click.stop="openEventTab(scope.row)"
                    >
                      {{ scope.row["eventNo"]}}
                    </div>
                  </template>
                  <!-- 联系人 -->
                  <template v-else-if="column.field === 'tlmName'">
                    <div>
                      {{ scope.row["linkMan"] && scope.row["linkMan"].name }}
                    </div>
                  </template>
                  <!-- 电话 -->
                  <template v-else-if="column.field === 'tlmPhone'">
                    <div>
                      {{ scope.row["linkMan"] && scope.row["linkMan"].phone }}
                      <i v-if="customerSetting.linkmanOn" class="iconfont icon-fdn-phone" title="拨打电话" @click="makePhoneCall(scope.row['linkMan'].phone)"></i>
                    </div>
                  </template>
                  <!-- 自定义的选择类型字段显示， 与type 区别-->
                  <template
                    v-else-if="column.formType === 'select' && !column.isSystem"
                  >
                    {{ scope.row.attribute[column.field] | displaySelect }}
                  </template>

                  <!-- 更新时间 -->
                  <template v-else-if="column.field === 'updateTime'">
                    <template v-if="scope.row.latesetUpdateRecord">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="scope.row.latesetUpdateRecord"
                        placement="top"
                      >
                        <div @mouseover="showLatestUpdateRecord(scope.row)">
                          {{ scope.row.updateTime | fmt_datetime }}
                        </div>
                      </el-tooltip>
                    </template>
                    <template v-else>
                      <div @mouseover="showLatestUpdateRecord(scope.row)">
                        {{ scope.row.updateTime | fmt_datetime }}
                      </div>
                    </template>
                  </template>

                  <!-- 产品 -->
                  <template v-else-if="column.field === 'product'">
                    {{
                      scope.row.products &&
                        scope.row.products
                          .map((product) => product.name)
                          .join(", ")
                    }}
                  </template>

                  <!-- 创建人 和 负责人 、派单人 -->
                  <template
                    v-else-if="
                      column.field === 'createUserName' ||
                        column.field === 'executorName' ||
                        column.field === 'allotName'
                    "
                  >
                    <template v-if="permissionTaskView">
                      <a
                        href=""
                        class="view-detail-btn"
                        @click.stop.prevent="
                          openUserTab(
                            presonDisplayObj('userId', column.field, scope.row)
                          )
                        "
                      >
                        {{
                          presonDisplayObj(
                            "displayName",
                            column.field,
                            scope.row
                          )
                        }}
                      </a>
                    </template>
                    <template v-else>
                      {{
                        presonDisplayObj("displayName", column.field, scope.row)
                      }}
                    </template>
                  </template>

                  <!-- 协同人 -->
                  <template v-else-if="column.field === 'synergies'">
                    {{
                      scope.row[column.field] &&
                        scope.row[column.field]
                          .map((synergie) => synergie.displayName)
                          .join(", ")
                    }}
                  </template>

                  <!-- 派单方式 -->
                  <template v-else-if="column.field === 'allotTypeStr'">
                    {{ allotTypeText(scope.row.allotType) }}
                  </template>

                  <!-- 服务部门(负责人所在的部门) -->
                  <template v-else-if="column.field === 'executorTags'">
                    {{ formatExecutorTags(scope.row[column.field]) }}
                  </template>

                  <!-- 审批状态 -->
                  <template v-else-if="column.field === 'inApprove'">
                    {{ scope.row.inApprove | displayApprove }}
                  </template>
                  <!-- 工单状态 -->
                  <template v-else-if="column.field === 'state'">
                    <!-- 暂停中 -->
                    <div
                      class="task-state-block task-font12"
                      v-if="scope.row.isPaused == 1"
                      style="
                        color: rgba(153, 153, 153);
                        background-color: rgba(153, 153, 153, 0.2);
                      "
                    >
                      已暂停
                    </div>
                    <!-- 其他状态 -->
                    <div
                      v-else
                      class="task-state-block task-font12"
                      :style="{
                        backgroundColor: taskStateEnum.getBgColor(
                          scope.row[column.field],
                          0.2
                        ),
                        color: taskStateEnum.getColor(scope.row[column.field]),
                      }"
                    >
                      {{
                        scope.row[column.field] &&
                          taskStateEnum.getName(scope.row[column.field])
                      }}
                    </div>
                  </template>

                  <!-- 曾.. -->
                  <template
                    v-else-if="taskStatusFields.indexOf(column.field) > -1"
                  >
                    {{ Number(scope.row[column.field]) === 1 ? "是" : "否" }}
                  </template>

                  <!-- 地址 -->
                  <template v-else-if="column.formType === 'address'">
                    {{ formatCustomizeAddress(scope.row[column.formType]) }}
                  </template>

                  <!-- 表单设计器特殊控件 -->
                  <template v-else-if="['cascader', 'select', 'user', 'related_task','relationProduct','location'].includes(column.formType)">
                    {{ scope.row[column.field] | fmt_form_field(column.formType, column.fieldName, scope.row.attribute)}}
                  </template>

                  <!-- 用户 -->
                  <template
                    v-else-if="
                      column.formType === 'user' &&
                        scope.row.attribute[column.field]
                    "
                  >
                    {{
                      scope.row.attribute[column.field].displayName ||
                        scope.row.attribute[column.field].name
                    }}
                  </template>

                  <!-- 时间 -->
                  <template v-else-if="!column.isSystem">
                    {{
                      scope.row.attribute && scope.row.attribute[column.field]
                    }}
                  </template>

                  <!-- 时间 -->
                  <template v-else-if="column.formType === 'datetime'">
                    <template v-if="!column.isSystem">
                      {{
                        scope.row.attribute && scope.row.attribute[column.field]
                      }}
                    </template>
                    <template v-else>
                      {{ scope.row[column.field] | fmt_datetime }}
                    </template>
                  </template>

                  <div
                    v-else-if="column.formType === 'textarea'"
                    v-html="buildTextarea(scope.row.attribute[column.field])"
                    @click="openOutsideLink"
                  ></div>

                  <!-- 接单用时 -->
                  <template v-else-if="column.field === 'acceptUsedTimeStr'">
                    {{ scope.row.acceptUsedTime && scope.row.acceptUsedTime }}
                  </template>
                  <!-- 工单用时 -->
                  <template v-else-if="column.field === 'taskUsedTimeStr'">
                    {{ scope.row.taskUsedTime && scope.row.taskUsedTime }}
                  </template>
                  <!-- 工作用时 -->
                  <template v-else-if="column.field === 'workUsedTimeStr'">
                    {{ scope.row.workUsedTime && scope.row.workUsedTime }}
                  </template>
                  <!-- 响应用时 -->
                  <template v-else-if="column.field === 'taskResponseTimeStr'">
                    {{
                      scope.row.taskResponseTime && scope.row.taskResponseTime
                    }}
                  </template>
                  <!-- 支付方式 -->
                  <template
                    v-else-if="
                      column.field === 'paymentMethod' &&
                        initData.paymentConfig &&
                        initData.paymentConfig.version === 1
                    "
                  >
                    {{
                      scope.row.attribute && scope.row.attribute.paymentMethod
                    }}
                  </template>
                  <template v-else-if="!column.isSystem">
                    <template
                      v-if="
                        scope.row.attribute &&
                          Array.isArray(scope.row.attribute[column.field])
                      "
                    >
                      {{ scope.row.attribute[column.field].join(",") }}
                    </template>
                    <template v-else>
                      {{
                        scope.row.attribute && scope.row.attribute[column.field]
                      }}
                    </template>
                  </template>

                  <template v-else>
                    {{ Array.isArray(scope.row[column.field]) ? scope.row[column.field].join(',') : scope.row[column.field] }}
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-footer comment-list-table-footer">
            <div class="comment-list-table-footer-info task-flex task-ai">
              共<span class="level-padding">{{
                taskPage.totalElements || 0
              }}</span
              >条
              <div class="task-font14 task-c6 task-ml12">
                每页
                <el-select
                  v-model="params.pageSize"
                  placeholder="请选择"
                  @change="handleSizeChange(params.pageSize)"
                  class="table-footer-select"
                >
                  <el-option :label="10" :value="10"></el-option>
                  <el-option :label="20" :value="20"></el-option>
                  <el-option :label="50" :value="50"></el-option>
                </el-select>
                条
              </div>
            </div>
            <el-pagination
              v-if="this.taskPage.list.length"
              class="comment-list-table-footer-pagination"
              background
              @current-change="jump"
              @size-change="handleSizeChange"
              :page-size="taskPage.pageSize"
              :current-page="taskPage.pageNum"
              layout="prev, pager, next, jumper"
              :total="taskPage.totalElements"
            >
            </el-pagination>
          </div>
        </div>
        <!-- end content 列表表格 -->
      </div>

      <!-- <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="multipleSelection" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
    </div> -->

      <!-- start 选择列设置 -->
      <biz-select-column ref="advanced" @save="saveColumnStatus" />
      <!-- <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" /> -->
      <!-- end 选择列设置 -->

      <!-- start 已选择面板 -->
      <!-- <selection-panel
      ref="openSelectionPanel"
      title="工单"
      :columns="selectPanelColumns"
      :value="multipleSelection"
      @clear="toggleSelection"
      @input="selectionPanelInputChange"
      @remove="selectionPanelRemoveItem"
    >
    </selection-panel> -->
      <!-- ebd 已选择面板 -->

      <!-- start 导出工单 -->
      <base-export-group
        ref="exportPanel"
        :alert="exportAlert"
        :columns="exportColumnList.length ? exportColumnList : exportColumns"
        :build-params="buildExportParams"
        :group="true"
        :validate="checkExportCount"
        method="post"
        action="/excels/task/newExport"
      />
      <!-- end 导出工单 -->
      <!-- S 存为视图弹框 -->
      <view-model
        ref="viewModel"
        :region="region"
        :is-view-model="isViewModel"
        :other-text="otherText"
      />
      <!-- E 存为视图弹框 -->
      <!-- S 批量编辑 -->

      <batch-editing-customer-dialog
        ref="batchEditingCustomerDialog"
        :config="{
          fields: taskFields,
          currentTaskType: currentTaskType,
        }"
        :selected-ids="selectedIds"
        @update="updatEedit"
      ></batch-editing-customer-dialog>
      <!-- E 批量编辑 -->
      <!-- S 导入工单 -->
      <base-import
        :title="`导入工单-${checkImportTask.name}`"
        ref="importCustomerModal"
        :action="`/excels/task/import?typeId=${checkImportTask.id}`"
        :template-url="`/task/importTemplate?way=1&typeId=${checkImportTask.id}`"
      >
      </base-import>
      <!-- E 导入工单 -->
      <!-- S 工单转换 -->
      <task-transfer ref="TaskTransfer" :task-id-list="selectedIds" />
      <!-- E 工单转换 -->
    </div>
    <!-- E 列表展示 -->

    <!-- S 地图预览 -->
    <task-map
      :map-show="mapShow"
      @hide="mapShow = true"
      :config="{ selectedIds: selectedIds, searchParams: searchParams }"
    />
    <!-- E 地图预览 -->
    <!-- 视图展示 -->
    <task-view ref="taskView" @_searchModel="_searchModel" />

    <div class="task-bj" v-show="showBj"></div>

    
  </div>
</template>

<script>
import TaskList from './TaskList';
export default TaskList;
</script>
<style lang="scss">
// .biz-form-remote-select-clear {
//   i {
//     background-color: #f0f0f0;
//     width: 16px;
//     height: 16px;
//     border-radius: 16px;
//     &::before {
//       content: "x";
//     }
//   }
// }
</style>
<style lang="scss" scoped>
@import "./TaskList.scss";
</style>

<style lang="scss">
.task-box {
  .v-step[data-v-7c9c03f0] {
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
  .v-step .v-step__arrow[data-v-7c9c03f0] {
    border-color: #fff !important;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
  }
  .v-tour-content-box {
    position: relative;
    overflow: hidden;
    padding: 0 20px;
    border-radius: 4px;
    .v-tour-left-tips {
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
    .v-tour-content {
      .v-tour-content-head {
        padding-top: 16px;
        padding-bottom: 10px;
        justify-content: flex-end;
        .iconfont {
          font-size: 10px;
          margin-bottom: 2px;
          color: #999;
          cursor: pointer;
        }
      }
      .v-tour-content-con {
        text-align: start;
        padding-bottom: 12px;
      }
    }
  }

  .v-tour-bottom {
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
}
</style>