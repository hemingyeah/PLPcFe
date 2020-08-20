<template>
  <div
    class="task-list-view common-list-container"
    ref="taskListPage"
    @click="allEvent"
    v-loading.fullscreen.lock="loading"
  >
    <!-- S 顶部筛选 -->
    <div class="common-list-filter">
      <div class="common-list-header-search">
        <div class="common-list-filter-flow common-list-filter-span1">
          <!-- 待指派 -->
          <div
            v-for="(item, index) in taskView"
            :key="index"
            @click="checkFilter({ id: item.id, name: '待指派工单' })"
            class="common-list-filter-span1 common-list-filter-flow-item"
            v-if="item.id === selectIds.createdId"
            :class="{
              'common-list-filter-flow-active': item.id === filterId,
            }"
          >
            {{ `待指派(${filterData.created || 0})` }}
          </div>
          <!-- 已指派 -->
          <div
            v-for="(item, index) in taskView"
            :key="index"
            @click="checkFilter({ id: item.id, name: '已指派工单' })"
            class="common-list-filter-span1 common-list-filter-flow-item"
            v-if="item.id === selectIds.allocatedId"
            :class="{
              'common-list-filter-flow-active': item.id === filterId,
            }"
          >
            {{ `已指派(${filterData.allocated || 0})` }}
          </div>
          <!-- 已接受 -->
          <div
            v-for="(item, index) in taskView"
            :key="index"
            @click="checkFilter({ id: item.id, name: '已接受工单' })"
            class="common-list-filter-span1 common-list-filter-flow-item"
            v-if="item.id === selectIds.acceptedId"
            :class="{
              'common-list-filter-flow-active': item.id === filterId,
            }"
          >
            {{ `已接受(${filterData.accepted || 0})` }}
          </div>
          <!-- 进行中 -->
          <div
            v-for="(item, index) in taskView"
            :key="index"
            @click="checkFilter({ id: item.id, name: '进行中工单' })"
            class="common-list-filter-span1 common-list-filter-flow-item"
            v-if="item.id === selectIds.processingId"
            :class="{
              'common-list-filter-flow-active': item.id === filterId,
            }"
          >
            {{ `进行中(${filterData.processing || 0})` }}
          </div>
          <!-- 异常工单 -->
          <div
            v-for="(item, index) in taskView"
            :key="index"
            @click="checkFilter({ id: item.id, name: '异常工单' })"
            class="common-list-filter-span1 common-list-filter-flow-item ce6"
            v-if="
              item.id === selectIds.exceptionId && initData.tenantVersion === 2
            "
            :class="{
              'common-list-filter-flow-active': item.id === filterId,
            }"
          >
            {{ `异常工单(${filterData.exception || 0})` }}
          </div>
          <!-- 全部工单 -->
          <div
            @click="checkFilter({ id: selectIds.allId, name: '全部工单' })"
            class="common-list-filter-span1 common-list-filter-flow-item"
            :class="{
              'common-list-filter-flow-active': selectIds.allId === filterId,
            }"
          >
            {{ initData.allDropdownView && initData.allDropdownView.name }}({{
              filterData.all || 0
            }})
          </div>

          <!--  -->
          <div
            class="common-list-filter-flow-dropdown"
            @click.stop="
              allShow = true;
              otherShow = false;
            "
            :class="{ 'common-list-filter-flow-active': allShow }"
          >
            <i class="icon-down"></i>
          </div>
          <!-- 其他筛选列表 -->
          <TaskSelect
            :list="[
              { name: `全部完工(${filterData.all || 0})` },
              { name: `未完成工单(${filterData.unfinished || 0})` },
              { name: `已完成工单(${filterData.finished || 0})` },
            ]"
            :show="allShow"
            @checkOther="checkAll"
          />
        </div>
        <div class="common-list-filter-other">
          <div
            class="common-list-filter-other-item"
            @click.stop="
              otherShow = true;
              allShow = false;
            "
            :class="{
              'common-list-filter-flow-active':
                otherShow || otherText !== '其他',
            }"
          >
            {{ otherText }}
            <i class="iconfont icon-more"></i>
          </div>
          <!-- 其他筛选列表 -->
          <TaskSelect
            :show="otherShow"
            :list="otherList"
            @checkOther="checkOther"
          />
        </div>
      </div>
    </div>
    <!-- E 顶部筛选 -->

    <!-- start header -->
    <div class="common-list-header">
      <form class="common-list-header-search" onsubmit="return false;">
        <div class="common-list-header-search-group">
          <el-input
            v-model="params.keyword"
            placeholder="请输入工单编号或工单信息"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>

          <base-button
            type="primary"
            @event="searchBefore"
            native-type="submit"
          >
            搜索
          </base-button>
          <base-button type="ghost" @event="resetParams">
            重置
          </base-button>
        </div>
        <span
          class="advanced-search-visible-btn"
          @click.self="panelSearchAdvancedToggle"
        >
          <i class="iconfont icon-add"></i>
          高级搜索
        </span>
      </form>
    </div>
    <!-- end header -->

    <!-- start 高级搜索 -->
    <task-search-panel
      :init-data="initData"
      :config="advanceds"
      ref="searchPanel"
      v-if="advanceds.length"
    >
      <div class="advanced-search-btn-group" slot="footer">
        <base-button type="primary" @event="editView">{{
          isViewModel === "默认" ? "存为视图" : "编辑视图"
        }}</base-button>
        <base-button type="primary" @event="advancedSearch" native-type="submit"
          >搜索</base-button
        >
        <base-button type="ghost" @event="resetParams">重置</base-button>
      </div>
    </task-search-panel>
    <!-- end 高级搜索 -->
    <div class="common-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container task-list-operation-bar-container">
        <div class="action-button-group">
          <!-- start 工单类型 -->
          <el-dropdown trigger="click">
            <span
              class="el-dropdown-link el-dropdown-btn"
              @click="trackEventHandler('moreAction')"
            >
              工单类型：{{ currentTaskType.name }}
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="type in taskTypes" :key="type.id">
                <div @click="changeTaskType(type)">
                  {{ type.name }}
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- end 工单类型 -->

          <!-- start 更多操作 -->
          <el-dropdown trigger="click" v-if="exportPermission">
            <span
              class="el-dropdown-link el-dropdown-btn"
              @click="trackEventHandler('moreAction')"
            >
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="exportTask(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportTask(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- end 更多操作 -->

          <span
            class="el-dropdown-link el-dropdown-btn"
            @click="showAdvancedSetting"
            >选择列 <i class="iconfont icon-nav-down"></i
          ></span>
        </div>
      </div>
    </div>

    <!-- <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="multipleSelection" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
    </div> -->

    <!-- start content 列表表格 -->
    <div class="task-list-section common-list-table-view">
      <el-table
        stripe
        :data="taskPage.list"
        :highlight-current-row="false"
        :key="tableKey"
        :row-key="getRowKey"
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        class="task-list-table common-list-table"
        header-row-class-name="common-list-table-header taks-list-table-header"
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
          v-show="column.show"
          :align="column.align"
          :class-name="
            column.field == 'name'
              ? 'common-list-table-name-superscript-td'
              : ''
          "
          :key="column.field"
          :label="column.label"
          :min-width="column.minWidth || '120px'"
          :prop="column.field"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.field !== 'name'"
          :width="column.width"
        >
          <template slot-scope="scope">
            <!-- 工单编号 -->
            <template v-if="column.field === 'taskNo'">
              <a
                href=""
                class="view-detail-btn"
                @click.stop.prevent="openTaskTab(scope.row.id)"
              >
                {{ scope.row[column.field] }}
              </a>
              <!-- TODO: 曾超时 审批中标签 -->
              <!-- 暂停中 -->
              <div
                class="task-state-block task-state-block--approve"
                v-if="scope.row.inApprove == 1"
              >
                审批中
              </div>
              <!-- 暂停中 -->
              <div
                class="task-state-block task-state-block--overtime"
                v-if="scope.row.isOverTime == 1"
              >
                超时
              </div>
            </template>

            <!-- 客户  TODO: 客户查看权限 -->
            <template v-else-if="column.field === 'customer'">
              <div>
                {{ scope.row[column.field] && scope.row[column.field] }}
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
                  scope.row.products.map((product) => product.name).join(", ")
              }}
            </template>

            <!-- 创建人 和 负责人 -->
            <template
              v-else-if="
                column.field === 'createUserName' ||
                  column.field === 'executorName'
              "
            >
              <template v-if="permissionTaskView">
                <a
                  href=""
                  class="view-detail-btn"
                  @click.stop.prevent="
                    openUserTab(
                      column.field === 'createUserName'
                        ? scope.row.createUser
                        : scope.row.executor
                    )
                  "
                >
                  {{ scope.row[column.field] }}
                </a>
              </template>
              <template v-else>{{ scope.row[column.field] }}</template>
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

            <!-- 工单状态 -->
            <template v-else-if="column.field === 'state'">
              <!-- 暂停中 -->
              <div
                class="task-state-block"
                v-if="scope.row.isPaused == 1"
                style="background-color: #ef6b6b"
              >
                已暂停
              </div>
              <!-- 其他状态 -->
              <div
                v-else
                class="task-state-block"
                :style="{
                  backgroundColor: taskStateEnum.getColor(
                    scope.row[column.field]
                  ),
                }"
              >
                {{
                  scope.row[column.field] &&
                    taskStateEnum.getName(scope.row[column.field])
                }}
              </div>
            </template>

            <!-- 曾.. -->
            <template v-else-if="taskStatusFields.indexOf(column.field) > -1">
              {{ Number(scope.row[column.field]) === 1 ? "是" : "否" }}
            </template>

            <!-- 地址 -->
            <template v-else-if="column.formType === 'address'">
              {{ formatCustomizeAddress(scope.row[column.field]) }}
            </template>

            <!-- 用户 -->
            <template
              v-else-if="
                column.formType === 'user' && scope.row.attribute[column.field]
              "
            >
              {{
                scope.row.attribute[column.field].displayName ||
                  scope.row.attribute[column.field].name
              }}
            </template>

            <!-- 位置 -->
            <template v-else-if="column.formType === 'location'">
              {{
                scope.row.attribute[column.field] &&
                  scope.row.attribute[column.field].address
              }}
            </template>

            <!-- 时间 -->
            <template v-else-if="column.formType === 'datetime'">
              {{ scope.row[column.field] | fmt_datetime }}
            </template>

            <div
              v-else-if="column.formType === 'textarea'"
              v-html="buildTextarea(scope.row.attribute[column.field])"
              @click="openOutsideLink"
            ></div>

            <template v-else-if="!column.isSystem">
              {{ scope.row.attribute[column.field] }}
            </template>

            <template v-else>
              {{ scope.row[column.field] }}
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer comment-list-table-footer">
        <div class="comment-list-table-footer-info">
          共<span class="level-padding">{{ taskPage.total }}</span
          >记录， 已选中
          <span
            class="task-list-selected-count common-selected-count"
            @click="openSelectionPanel"
          >
            {{ multipleSelection.length }}
          </span>
          条
          <span
            class="task-list-selected-count common-selected-count"
            @click="toggleSelection"
            >清空</span
          >
        </div>
        <el-pagination
          class="comment-list-table-footer-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="taskPage.pageSize"
          :current-page="taskPage.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="taskPage.total"
        >
        </el-pagination>
      </div>
    </div>
    <!-- end content 列表表格 -->

    <!-- start 选择列设置 -->
    <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" />
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
      :columns="exportColumns"
      :build-params="buildExportParams"
      :group="true"
      :validate="checkExportCount"
      method="post"
      action="/excels/task/export"
    />
    <!-- end 导出工单 -->
    <!-- S 存为视图弹框 -->
    <view-model ref="viewModel" :region="region" :isViewModel="isViewModel" :otherText="otherText" />
    <!-- E 存为视图弹框 -->
  </div>
</template>

<script>
import TaskList from "./TaskList";
export default TaskList;
</script>

<style lang="scss">
@import "./TaskList.scss";
</style>
