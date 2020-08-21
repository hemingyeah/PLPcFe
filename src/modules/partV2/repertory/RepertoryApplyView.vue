<template>
  <div class="page">
    <div class="base-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="model.keyWord" placeholder="根据备件信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button
            type="primary"
            @event="model.pageNum=1;search();trackEventhandler('search')"
            native-type="submit"
          >搜索</base-button>
          <base-button type="ghost" @event="resetAll();trackEventhandler('reset')">重置</base-button>
        </div>
        <span
          class="advanced-search-visible-btn"
          @click="isExpand = !isExpand;trackEventhandler('advSearch')"
        >
          <i :class="`iconfont ${isExpand ? 'el-icon-minus' : 'el-icon-plus'}`"></i>
          高级搜索
        </span>
      </form>
    </div>

    <form @submit.prevent="search();trackEventhandler('advSearch')">
      <!--<div class="page-panel">-->
      <!--<div class="page-panel-body search-form-nano">-->
      <!--<el-input v-model="model.keyWord" placeholder="根据备件信息搜索"></el-input>-->
      <!--<el-button-group>-->
      <!--<el-button type="primary" native-type="submit">搜索</el-button>-->
      <!--<el-button @click="reset();trackEventhandler('reset')">重置</el-button>-->
      <!--</el-button-group>-->
      <!--<el-button type="text" @click="isExpand = !isExpand;trackEventhandler('advSearch')" :icon="isExpand ? 'el-icon-minus' : 'el-icon-plus'">高级搜索</el-button>-->
      <!--</div>-->
      <!--</div>-->

      <base-collapse-panel :value="isExpand" class="page-panel">
        <div class="page-panel-head">
          <h5>高级搜索</h5>
        </div>
        <div class="page-panel-body">
          <!-- 第一行高级搜索  start-->
          <div class="form-row">
            <!-- <div class="form-item">
              <label>类别</label>
              <div class="form-item-content">
                <el-select placeholder="请选择备件类别" v-model="model.type">
                  <el-option label="全部" value></el-option>
                  <el-option label="申领" value="申领"></el-option>
                  <el-option label="退回" value="退回"></el-option>
                  <el-option label="分配" value="分配"></el-option>
                  <el-option label="调拨" value="调拨"></el-option>
                </el-select>
              </div>
            </div>-->

            <!-- <div class="form-item">
              <label>是否启用</label>
              <div class="form-item-content">
                <el-select placeholder="请选择备件类别" v-model="model.enable">
                  <el-option label="全部" value></el-option>
                  <el-option label="启用" value="1"></el-option>
                  <el-option label="禁用" value="0"></el-option>
                </el-select>
              </div>
            </div>-->
            <div class="form-item">
              <label>目标仓库</label>
              <div class="form-item-content flex-x">
                <el-select
                  v-model="sourceType"
                  @change="chooseTargetType"
                  class="srp-list-form-item"
                  style="width: 120px;"
                >
                  <el-option key="0" value="备件库" :label="'备件库'"></el-option>
                  <el-option key="1" value="个人备件库" :label="'个人备件库'"></el-option>
                </el-select>
                <el-select
                  v-model="model.targetIds"
                  class="srp-list-form-item flex-1"
                  style="margin-left:1px;"
                  multiple
                  collapse-tags
                  placeholder="目标仓库"
                >
                  <el-option
                    v-for="item in repertory_2"
                    :key="item.id"
                    :value="item.id"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </div>
            </div>

            <div class="form-item">
              <div class="form-item">
                <label>备件名称</label>
                <div class="form-item-content">
                  <el-select
                    popper-class="common-advance-popper"
                    style="width: 100%;"
                    :value="sparepart.sparepartName"
                    @input="chooseSparepart"
                    filterable
                    clearable
                    remote
                    placeholder="选择备件"
                    :remote-method="fetchSparepart"
                    :loading="sparepart.loading"
                  >
                    <el-option
                      v-for="item in sparepart.options"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    >
                      <div class="part-option">
                        <p>编号：{{item.serialNumber}}</p>
                        <p>名称：{{item.name}}</p>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </div>
          <!-- 第一行高级搜索  end-->
          <!-- 第2行高级搜索  start-->
          <!-- <div class="form-row">
            <div class="form-item">
              <label>备件类别</label>
              <div class="form-item-content">
                <el-select
                  popper-class="common-advance-popper"
                  style="width: 100%;"
                  :value="sparepart.sparepartType"
                  @input="hooseSparepartType"
                  filterable
                  clearable
                  remote
                  placeholder="选择备件类别"
                >
                  <el-option v-for="item in types" :key="item" :label="item" :value="item">
                    <div class="part-option">
                      <p>{{item}}</p>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>


            
          </div>-->
          <!-- 第2行高级搜索  end-->
          <!-- 第3行高级搜索  start-->
          <div class="form-row">
            <!-- <div class="form-item">
              <label>发起人</label>
              <div class="form-item-content">
                <el-select
                  class="srp-list-form-item"
                  style="width: 100%;"
                  :value="userApply.userId"
                  @input="chooseUserApply"
                  filterable
                  clearable
                  remote
                  placeholder="选择人员"
                  :remote-method="fetchUserApply"
                  :loading="userApply.loading"
                >
                  <el-option
                    v-for="item in userApply.options"
                    :key="item.userId"
                    :label="item.displayName"
                    :value="item.userId"
                  >
                    <div class="srp-user-item">
                      <img :src="item.head || '/resource/images/account_userhead.png'" />
                      <p>{{item.displayName}}</p>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>-->

            <div class="form-item">
              <label>办理人</label>
              <div class="form-item-content">
                <el-select
                  class="srp-list-form-item"
                  style="width: 100%;"
                  v-model="userApprove.approveId"
                  @change="chooseUserApprove"
                  filterable
                  clearable
                  remote
                  reserve-keyword
                  placeholder="选择人员"
                  :filter-method="fetchUserApprove"
                  @visible-change="visibleUserApprove"
                  :loading="userApprove.loading"
                >
                  <el-option
                    v-for="item in userApprove.options"
                    :key="item.userId"
                    :label="item.displayName"
                    :value="item.userId"
                  >
                    <div class="srp-user-item">
                      <img :src="item.head || '/resource/images/account_userhead.png'" />
                      <p>{{item.displayName}}</p>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>

            <div class="form-item">
              <label>申请日期</label>
              <div class="form-item-content">
                <el-date-picker
                  @change="seeTime"
                  style="width:100%"
                  v-model="timeValue"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="pickerOptions2"
                ></el-date-picker>
              </div>
            </div>
          </div>
          <!-- 第3行高级搜索  end-->
          <!-- 第4行高级搜索  start-->
          <div class="form-row">
            <div class="form-item">
              <label>办理日期</label>
              <div class="form-item-content">
                <el-date-picker
                  @change="seeUpdateTime"
                  style="width:100%"
                  v-model="updateTimeValue"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="pickerOptions2"
                ></el-date-picker>
              </div>
            </div>
            <div class="form-item"></div>
          </div>
          <!-- 第4行高级搜索  end-->
          <!-- 第5行高级搜索  start-->
          <div class="form-row">
            <div class="text-right" style="width:100%;">
              <!--<el-button @click="reset">重置</el-button>-->
              <base-button type="ghost" @event="resetAll">重置</base-button>
              <base-button type="primary" native-type="submit">确定</base-button>
              <!--<el-button type="primary" native-type="submit">确定</el-button>-->
            </div>
          </div>
          <!-- 第5行高级搜索  end-->
        </div>
      </base-collapse-panel>
    </form>

    <div class="page-panel" style="margin: 0;">
      <div class="page-panel-body">
        <!-- 选择仓库（默认全部） -->
        <el-row class="block-col-2">
          <!-- <el-select
            :value="repertoryName"
            @input="chooseRepertory"
            class="srp-list-form-item"
            style="width: 150px;"
          >
            <el-option value label="全部仓库"></el-option>
            <el-option v-for="item in repertory" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>-->
          <el-select
            v-model="model.state"
            @change="chooseState"
            class="srp-list-form-item"
            style="width: 150px;"
            multiple
            collapse-tags
            placeholder="状态"
          >
            <el-option
              v-for="item in stateArr"
              :value="item.value"
              :label="item.label" 
              :key="item.key"
            ></el-option>
          </el-select>

          <el-select
            v-model="model.type"
            @change="chooseApplyType"
            class="srp-list-form-item"
            style="width: 150px;"
            multiple
            collapse-tags
            placeholder="申请类型"
          >
            <el-option
              v-for="item in typeArr"
              :value="item.value"
              :label="item.label"
              :key="item.key"
            ></el-option>
            <!-- <el-option value label="全部(状态)"></el-option> -->
            <!-- <el-option value="suspending" label="申领" :key="'suspending'"></el-option>
            <el-option value="solved" label="调拨" :key></el-option>
            <el-option value="solved" label="退回" :key="item.value"></el-option>
            <el-option value="solved" label="分配" :key="item.value"></el-option>-->
          </el-select>

          <el-select
            class="srp-list-form-item"
            style="width: 180px;"
            v-model="userApply.prosperId"
            @change="chooseUserApply"
            filterable
            clearable
            remote
            placeholder="发起人"
            :filter-method="fetchUserApply"
            @visible-change="visibleUserApply"
            :loading="userApply.loading"
          >
            <el-option
              v-for="item in userApply.options"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId"
            >
              <div class="srp-user-item">
                <img :src="item.head || '/resource/images/account_userhead.png'" />
                <p>{{item.displayName}}</p>
              </div>
            </el-option>
          </el-select>

          <div class="flex-x group-select">
            <el-select
              v-model="targetType"
              @change="chooseSourceType"
              class="srp-list-form-item"
              style="width: 120px;"
            >
              <el-option key="0" value="备件库" :label="'备件库'"></el-option>
              <el-option key="1" value="个人备件库" :label="'个人备件库'"></el-option>
            </el-select>
            <el-select
              v-model="model.sourceIds"
              @change="chooseRepertory"
              class="srp-list-form-item"
              style="width: 180px;margin-left:-3px;"
              multiple
              collapse-tags
              placeholder="原始仓库"
            >
              <el-option
                v-for="item in repertory_1"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              ></el-option>
            </el-select>
          </div>

          <div class="pull-right">
            <el-button-group>
              <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150">
                <!--<el-button>选择列 <i class="el-icon-arrow-down el-icon&#45;&#45;right"></i></el-button>-->
                <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn">
                  选择列
                  <i class="iconfont icon-nav-down"></i>
                </span>

                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(column,index) in columns" :key="column.field">
                    <el-checkbox
                      :value="column.show"
                      @input="chooseColnum(column,index)"
                    >{{column.label}}</el-checkbox>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>

              <!-- <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150"> 
            <el-button>
              更多操作 <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item> 
                <span class="dropdown-item" @click="exportData">导出</span>
              </el-dropdown-item>
            </el-dropdown-menu>
              </el-dropdown>-->
            </el-button-group>
          </div>

          <div class="pull-right" v-if="allowInout">
            <!--<el-button class="el-button el-button&#45;&#45;primary" @click="outstockBatch(selected);trackEventhandler('batch-stock-out')">批量出库</el-button>-->
            <!--<base-button type="plain" @event="outstockBatch(selected);trackEventhandler('batch-stock-out')">批量出库</base-button>-->
            <!--<base-button type="plain" @event="instockBatch(selected);trackEventhandler('batch-stock-in')">批量入库</base-button>-->

            <!--<el-button class="el-button el-button&#45;&#45;primary" @click="instockBatch(selected);trackEventhandler('batch-stock-in')">批量入库</el-button>-->

            <el-dropdown trigger="click" :show-timeout="150">
              <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn">
                更多操作
                <i class="iconfont icon-nav-down"></i>
              </span>

              <el-dropdown-menu slot="dropdown" class="dropdown-more">
                <!-- <el-dropdown-item>
                  <span
                    class="dropdown-item"
                    @click="outstockBatch(selected);trackEventhandler('batch-stock-out')"
                  >批量出库</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <span
                    class="dropdown-item"
                    @click="instockBatch(selected);trackEventhandler('batch-stock-in')"
                  >批量入库</span>
                </el-dropdown-item>-->
                <el-dropdown-item>
                  <span
                    class="dropdown-item"
                    @click="exportPart(false)"
                    v-if="allowImportAndExport"
                  >导出</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <span
                    class="dropdown-item"
                    @click="exportPart(true)"
                    v-if="allowImportAndExport"
                  >导出全部</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <span
                    class="dropdown-item"
                    @click="mulHandle(selected)"
                  >批量办理</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-row>
      </div>
    </div>

    <div style="background: #fff;padding: 0 10px">
      <div class="tooltipWrapper" v-show="selected.length">您已选择
        <el-tooltip class="item" content="可点击查看详情" placement="top">
          <span class="toolText" @click="multipleSelectionPanelShow = true">{{selected.length}}</span>
        </el-tooltip>
        条数据
        <span class="toolText" @click="toggleSelection()">清空</span>
      </div>
    </div>

    <div class="table-container">
      <el-table
        stripe
        :data="page.list"
        ref="table"
        @select="handleSelection"
        @select-all="handleSelection"
        header-row-class-name="base-table-header"
        @sort-change="sortChange"
        @header-click="headerClick"
      >
        <el-table-column type="selection" width="44"></el-table-column>

        <el-table-column
          v-for="column in columns.filter(item=>item.show)"
          :key="column.field"
          :prop="column.field"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :show-overflow-tooltip="column.overflow"
          :sortable="column.sortable"
        >
          <template slot-scope="scope">
            <!-- <a :href="`/partV2/detail?id=${scope.row.id}`" @click.prevent="openDetail(scope.row)"
            v-if="column.field == 'serialNumber'">{{scope.row.serialNumber}}</a>-->
            <template v-if="column.field == 'propserName'">
              <template>{{scope.row.propserName}}</template>
            </template>
            <!-- <template
              v-else-if="column.field =='prosperTime'"
            >{{scope.row.prosperTime}}</template>

            <template
              v-else-if="column.field =='approveTime'"
            >{{scope.row.approveTime}}</template>-->

            <template v-else-if="column.field == 'type'">
              <template>{{scope.row && scope.row.type}}</template>
            </template>
            <template v-else-if="column.field == 'propserTime'">
              <template>{{scope.row.propserTime}}</template>
            </template>
            <template v-else-if="column.field == 'name'">
              <template
                v-if="scope.row.sparepartRepertory"
              >{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.name}}</template>
            </template>
            <template v-else-if="column.field == 'serialNumber'">
              <template
                v-if="scope.row.sparepartRepertory"
              >{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.serialNumber}}</template>
            </template>
            <template v-else-if="column.field == 'sparepart.type'">
              <template
                v-if="scope.row.sparepartRepertory"
              >{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.type}}</template>
            </template>
            <template v-else-if="column.field == 'standard'">
              <template
                v-if="scope.row.sparepartRepertory"
              >{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.standard}}</template>
            </template>
            <template v-else-if="column.field == 'repertory'">
              <template
                v-if="scope.row.sparepartRepertory"
              >{{scope.row.sparepartRepertory.repertory&&scope.row.sparepartRepertory.repertory.name}}</template>
            </template>
            <template v-else-if="column.field == 'safetyStock'">
              <template
                v-if="scope.row.sparepartRepertory"
              >{{scope.row.sparepartRepertory.safetyStock || ''}}</template>
            </template>
            <template v-else-if="column.field == 'updateTime'">
              <el-tooltip
                placement="top"
                popper-class="common-tooltip"
                :disabled="scope.row.disabled"
              >
                <div slot="content" class="pre">{{scope.row.approveTimeArr}}</div>
                <div
                  @mouseover="getApproveTimeArr(scope.$index, scope.row.id)"
                >{{scope.row.updateTime || ''}}</div>
              </el-tooltip>
            </template>
            <template v-else-if="column.field == 'recordNo'">
              <el-tooltip
                placement="top"
                popper-class="common-tooltip"
                :disabled="scope.row.disabled"
              >
                <div slot="content" class="pre">{{scope.row.recordNoArr}}</div>
                <div
                  @mouseover="getRecordNoArr(scope.$index, scope.row.id)"
                >{{scope.row.recordNo || ''}}</div>
              </el-tooltip>
            </template>
            <template v-else-if="column.field ==='approveNo'">
              <!-- 所有状态都可以查看审批单 -->
              <!-- v-if="scope.row.approved || scope.row.cancel || scope.row.isreject" -->
              <a
                class="view-detail-btn el-tooltip"
                @click="column.clickFnc(scope.row)"
              >
                {{scope.row.approveNo}}
              </a>
              <!-- <div class="el-tooltip" v-else>{{scope.row.approveNo}}</div> -->
            </template>
            <template v-else-if="column.field == 'variation'">
              <!-- <template v-if="scope.row.variation == scope.row.solvedVariation">{{scope.row.variation}}</template> -->
              {{variationNum(scope.row.variation, scope.row.solvedVariation)}}
            </template>
            <template v-else-if="column.field == 'variation_'">{{scope.row.solvedVariation}}</template>
            <template v-else-if="column.field =='enable' && (scope.row.state === 'suspending' || scope.row.state === 'dealing')">
              <el-button
                @click="showPartDealDetail(scope.row),tableTrackEventHandler('done')"
                type="text"
                size
                class="no-padding"
                v-if="scope.row.approved"
              >办理</el-button>
              <el-button
                @click="partDealData['data']['approveNo']=scope.row.approveNo,backstockDialog=true,cancelType=0,tableTrackEventHandler('reject')"
                type="text"
                size
                class="no-padding"
                v-if="scope.row.isreject"
              >拒绝</el-button>
              <el-button
                @click="partDealData['data']['approveNo']=scope.row.approveNo,backstockDialog=true,cancelType=1,tableTrackEventHandler('recall'),backstock_type=scope.row.type"
                type="text"
                size
                class="no-padding"
                v-if="scope.row.cancel"
              >撤销</el-button>
            </template>
            <!-- 操作 -->
            <template v-else-if="column.field == 'enable2222'" slot-scope="scope">
              <template v-if="scope.row.type !== '调拨'">
                <template v-if="scope.row.state == 'solved' && scope.row.type !='分配'">
                  <el-button
                    v-if="scope.row.type === '申领'"
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="0"
                  >已出库</el-button>
                  <el-button
                    v-else-if="scope.row.type === '退回'"
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="0"
                  >已入库</el-button>
                  <el-button
                    v-else
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="0"
                  >已办理</el-button>
                </template>
                <template v-if="scope.row.state == 'cancel' && scope.row.type !='分配'">
                  <el-button
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="1"
                  >已拒绝</el-button>
                </template>

                <template
                  v-if="allowInout && scope.row.state == 'suspending' && scope.row.type !='分配'"
                >
                  <template v-if="scope.row.type == '申领' ">
                    <el-button
                      @click="outstock(scope.row);tableTrackEventHandler('stock-out')"
                      type="text"
                      size
                      class="no-padding"
                      key="2"
                    >办理出库</el-button>
                  </template>
                  <template v-if="scope.row.type == '退回' || scope.row.type == '调拨'">
                    <el-button
                      @click="instock(scope.row)"
                      type="text"
                      size
                      class="no-padding"
                      key="3"
                    >办理入库</el-button>
                  </template>
                  <template>
                    <el-button
                      @click="backstock(scope.row);tableTrackEventHandler('reject')"
                      type="text"
                      size
                      class="no-padding"
                      key="4"
                    >拒绝</el-button>
                  </template>
                </template>
                <!-- 分配 -->
                <template v-if="scope.row.state == 'suspending' && scope.row.type =='分配'">
                  <el-tooltip class="item" effect="dark" content="当前状态为个人库未接受状态" placement="bottom">
                    <el-button
                      type="text"
                      size
                      class="no-padding"
                      style="color:#333;cursor: text;"
                      key="5"
                    >待入库</el-button>
                  </el-tooltip>
                  <el-button
                    @click="reStockOpenDialog(scope.row)"
                    type="text"
                    size
                    class="no-padding"
                    key="6"
                  >撤回</el-button>
                </template>
                <template v-if="scope.row.state == 'solved' && scope.row.type =='分配'">
                  <el-button
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="7"
                  >已入库</el-button>
                </template>
                <template
                  v-if="scope.row.state == 'revoked' && (scope.row.type =='分配' || scope.row.type =='申领')"
                >
                  <el-button
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="8"
                  >已撤回</el-button>
                </template>
                <template v-if="scope.row.state == 'rejected' && scope.row.type =='分配'">
                  <el-button
                    type="text"
                    size
                    class="no-padding"
                    style="color:#333;cursor: text;"
                    key="9"
                  >已退回</el-button>
                </template>
              </template>
              <!-- 调拨 -->
              <template v-if="scope.row.type === '调拨'">
                <template v-if="scope.row.state === 'suspending'">
                  <template v-if="scope.row.isOriginalRepertoryManager">
                    <el-button type="text" @click="openCancelTransferDialog(scope.row)">撤回</el-button>
                  </template>
                  <template v-if="scope.row.isTargetRepertoryManager">
                    <el-button type="text" @click="openTransferDialog(scope.row, 0)">拒绝</el-button>
                    <el-button type="text" @click="openTransferDialog(scope.row, 1)">接收</el-button>
                  </template>
                </template>
                <template v-if="scope.row.state === 'revoked'">
                  <span style="color:#333;cursor: text;">调出已撤回</span>
                </template>
                <template v-if="scope.row.state === 'rejected'">
                  <span style="color:#333;cursor: text;">调入已拒绝</span>
                </template>
                <template v-if="scope.row.state === 'solved'">
                  <span style="color:#333;cursor: text;">调入已接收</span>
                </template>
                <!--<button @click="logRow(scope.row)">test</button>-->
              </template>
            </template>
            <template v-else-if="column.field == 'state'">
              <div :class='`state-text state-${scope.row[column.field]}`'>{{scope.row[column.field] | state}}</div>
            </template>
            <template v-else-if="column.field == 'showNum'">{{Number(scope.row[column.field])}}</template>
            <template
              v-else-if="column.field === 'applyCount'"
            >{{`${scope.row['unsolved'] || 0}/${scope.row['solved'] || 0}`}}</template>
            <template v-else-if="column.field == 'sparepartIds'">
              <div>
                <span v-if="scope.row.showState==='close'">
                  <span v-for="(item,index) in scope.row[column.field].slice(0,3)" :key='index'><img v-if="scope.row.targetId[index]==='true'" style="display:inline-block;width:13px;" src="../../../assets/img/partGou.png" alt="" title='该备件已完成办理'> {{item}}<br></span>
                </span>
                <span v-else>
                  <span v-for="(item,index) in scope.row[column.field]" :key='index'><img v-if="scope.row.targetId[index]==='true'" style="display:inline-block;width:13px;" src="../../../assets/img/partGou.png" alt="" title='该备件已完成办理'> {{item}}<br></span>
                </span>
                <span v-if="scope.row[column.field].length>3 && scope.row.showState==='close'">等{{scope.row[column.field].length}}个</span>
                <i v-if="scope.row.showState" :class="scope.row.showState==='close'?'el-icon-arrow-down showMore':'el-icon-arrow-up showMore'" @click="showMore(scope.$index)"></i>
              </div>
            </template>
            <template v-else-if="column.field == 'remark'">
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                @show='remarkShow(scope.row.approveNo,scope.$index)'
              >
                <span v-html='scope.row.remarkDetail'></span>
                <span slot="reference" style='overflow: hidden;text-overflow:ellipsis;white-space: nowrap;display:inline-block;min-width:50px;min-height:16px;'>{{scope.row.remark}}</span>
              </el-popover>
            </template>
            
            <template v-else>{{scope.row[column.field]}}</template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="table-footer">
      <div class="list-info">
        共
        <span class="level-padding">{{page.total}}</span>记录，
        已选中
        <span
          class="base-table-selected-count"
          @click="multipleSelectionPanelShow = true"
        >{{selected.length}}</span>条
        <span class="base-table-selected-count" @click="toggleSelection()">清空</span>
      </div>
      <el-pagination
        class="customer-table-pagination"
        background
        @current-change="jump"
        @size-change="pageSizeChange"
        :page-sizes="[10, 20, 50]"
        :page-size="model.pageSize"
        :current-page="model.pageNum"
        layout="prev, pager, next, sizes, jumper"
        :total="page.total"
      ></el-pagination>
    </div>

    <div class="page-panel">
      <el-dialog title="入库操作" :visible.sync="instockDialog" width="600px">
        <!-- <part-instock-form
          v-if="instockDialog"
          ref="instockForm"
          :formdata="formdata"
          :repertory="repertory"
          :sparepartConfig="sparepartConfig"
          :initData="initData"
        ></part-instock-form>-->

        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="instockDialog = false">取 消</base-button>
          <base-button type="primary" @event="instockSave" :disabled="pending">确 定</base-button>
        </div>
      </el-dialog>

      <el-dialog
        :title="partDealTitle"
        :visible.sync="partDealDialog"
        width="90%"
        @open='partDearOpen'
        :close-on-click-modal="false"
      >
        <part-deal-with-form ref="partDealWithForm" :partDealKey='partDealKey' :prop-data="partDealData"></part-deal-with-form>

        <div
          slot="footer"
          class="dialog-footer flex-x"
          v-if="partDealData.data.state === 'suspending' || partDealData.data.state === 'dealing'"
        >
          <div class="ding-btn" v-if="partDealData.data.cancel" @click="dingMessage">
            <i class="iconfont icon-Ding"></i>
            DING
          </div>
          <!-- <base-button
            v-if="partDealData.data.state === 'suspending' && partDealData.data.cancel"
            type="primary"
            @event="dingMessage"
            :disabled="pending"
          >DING</base-button>-->

          <div class="flex-1"></div>

          <base-button
            class="mar-r-15"
            type="ghost"
            v-if="partDealData.data.cancel"
            @event="cancelType=1,backstockDialog = true,backstock_type=partDealData.data.type"
          >撤销</base-button>
          <base-button
            class="mar-r-15"
            type="danger"
            v-if="partDealData.data.isreject"
            @event="cancelType=0,backstockDialog = true"
          >拒绝</base-button>
          <base-button
            type="primary"
            v-if="partDealData.data.approved "
            @event="partDealDataDone"
            :disabled="pending"
          >办理</base-button>
        </div>
      </el-dialog>

      <el-dialog
        title='批量办理'
        :visible.sync="mulHandleDialog"
        width='90%'
      >
        <mul-handle-form ref='mulHandleForm' :formdata='formdata' :mulHandleKey='mulHandleKey'></mul-handle-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="mulHandleDialog = false">取 消</base-button>
          <base-button type="primary" @event="mulHandleSave" :disabled="pending">确 定</base-button>
        </div>
      </el-dialog>

      <el-dialog
        :title="`${cancelType==0?'拒绝':'撤销'}`"
        :modal="false"
        :visible.sync="backstockDialog"
        width="600px"
      >
        <!-- <part-backstock-form
          v-if="backstockDialog"
          ref="backstockForm"
          :formdata="formdata"
          :repertory="repertory"
          :sparepartConfig="sparepartConfig"
          :userId="userId"
          :userName="userName"
        ></part-backstock-form>-->
        <p v-if="cancelType===1">{{`确定要撤销「${backstock_type}」审批吗？撤销后，已办理的数量不受影响`}}</p>
        <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm" class="mar-b-15">
          <el-form-item v-if="cancelType===0" prop="reason">
            <el-input
              type="textarea"
              resize="none"
              style="width:580px;"
              maxlength="500"
              :autosize="{ minRows: 2, maxRows: 6 }"
              :placeholder="'请填写拒绝理由[500个字以内]'"
              v-model="rejectForm.reason"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="cancelType===1" prop="reasons">
            <el-input
              type="textarea"
              resize="none"
              style="width:580px;"
              maxlength="500"
              :autosize="{ minRows: 2, maxRows: 6 }"
              :placeholder="'请填写撤销理由[500个字以内]'"
              v-model="rejectForm.reasons"
            ></el-input>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="backstockDialog = false,rest_rejectForm()">取 消</base-button>
          <base-button
            v-if="cancelType===0"
            type="primary"
            @event="partDealDataCancel(partDealData.data.approveNo)"
            :disabled="pending"
          >确 定</base-button>
          <base-button
            v-if="cancelType===1"
            type="primary"
            @event="partDealDataReset(partDealData.data.approveNo)"
            :disabled="pending"
          >确 定</base-button>
        </div>
      </el-dialog>

      <el-dialog title="出库操作" :visible.sync="outstockDialog" width="900px">
        <part-outstock-form
          v-if="outstockDialog"
          ref="outstockForm"
          :formdata="formdata"
          :sparepart-config="sparepartConfig"
          :init-data="initData"
        ></part-outstock-form>

        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="outstockDialog = false">取 消</base-button>
          <base-button type="primary" @event="outstockSave" :disabled="pending">确 定</base-button>

          <!--<el-button @click="outstockDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="outstockSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="批量操作" :visible.sync="outstockBatchDialog" width="900px">
        <part-applybatchout-form
          v-if="outstockBatchDialog"
          ref="outstockBatchForm"
          :formdata="formdata"
          :repertory="repertory"
          :sparepart-config="sparepartConfig"
        ></part-applybatchout-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="outstockBatchDialog = false">取 消</base-button>
          <base-button type="primary" @event="outstockBatchSave" :disabled="pending">确 定</base-button>

          <!--<el-button @click="outstockBatchDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="outstockBatchSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="批量操作" :visible.sync="instockBatchDialog" width="900px">
        <part-applybatchin-form
          v-if="instockBatchDialog"
          ref="instockBatchForm"
          :formdata="formdata"
          :repertory="repertory"
          :sparepart-config="sparepartConfig"
        ></part-applybatchin-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="instockBatchDialog = false">取 消</base-button>
          <base-button type="primary" @event="instockBatchSave" :disabled="pending">确 定</base-button>

          <!--<el-button @click="instockBatchDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="instockBatchSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="备件分配撤回操作" :visible.sync="reStockDialog" width="600px">
        <part-re-stock-form v-if="reStockDialog" ref="reStockForm" :formdata="formdata"></part-re-stock-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="reStockDialog = false">取 消</base-button>
          <base-button type="primary" @event="reStock" :disabled="pending">确 定</base-button>

          <!--<el-button @click="reStockDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="reStock" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="备件调拨撤回操作" :visible.sync="cancelTransferDialog" width="600px">
        <part-cancel-transfer-form
          v-if="cancelTransferDialog"
          ref="cancelTransferForm"
          :formdata="formdata"
        ></part-cancel-transfer-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="cancelTransferDialog = false">取 消</base-button>
          <base-button type="primary" @event="cancelTransfer" :disabled="pending">确 定</base-button>

          <!--<el-button @click="cancelTransferDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="cancelTransfer" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="调拨入库操作" :visible.sync="transferDialog" width="600px">
        <part-transfer-form v-if="transferDialog" ref="transferForm" :formdata="formdata"></part-transfer-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="transferDialog = false">取 消</base-button>
          <base-button type="primary" @event="transfer" :disabled="pending">确 定</base-button>

          <!--<el-button @click="transferDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="transfer" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <base-export
        ref="exportPanel"
        v-if="allowImportAndExport"
        :columns="exportColumns"
        :validate="checkExportCount"
        action="/excels/approveExport"
        :method="'post'"
        :needObjReq='true'
      ></base-export>
    </div>

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title" style="display: flex;justify-content: space-between;align-items: center">
        <span>已选中数据({{selected.length}})</span>
        <span
          v-if="selected.length"
          class="part-panel-btn"
          @click="toggleSelection()"
          title="清空已选中数据"
          data-placement="right"
          v-tooltip
        ></span>
      </h3>

      <div class="part-selected-panel">
        <div class="part-selected-tip" v-if="!selected.length">
          <img src="../../../assets/img/no-data.png" />
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="part-selected-list">
            <div class="part-selected-row part-selected-head">
              <span class="part-selected-sn">类别</span>
              <span class="part-selected-name">发起人</span>
              <span class="part-selected-name">发起时间</span>
            </div>
            <div class="part-selected-row" v-for="c in selected" :key="c.id">
              <span class="part-selected-sn">{{c.type}}</span>
              <span class="part-selected-name">{{c.prosperName}}</span>
              <span class="part-selected-name">{{c.prosperTime}}</span>
              <button type="button" class="part-selected-delete" @click="cancelSelectPart(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>
  </div>
</template>

<script>
import _ from 'lodash';
import Page from '@src/model/Page';
import PartBackStockForm from './form/PartBackStockForm.vue';
import PartOutStockForm from './form/PartAPPlyOutStockForm.vue';
import PartInStockForm from './form/PartApplyInStockForm.vue';
import PartApplyFormBatchOut from './form/PartApplyFormBatchOut.vue';
import PartApplyFormBatchIn from './form/PartApplyFormBatchIn.vue';
import PartReStockForm from './form/PartReStockForm.vue';
import PartCancelTransferForm from './form/PartCancelTransferForm.vue';
import PartTransferForm from './form/PartTransferForm.vue';
import PartDealWithForm from './form/PartDealWithForm.vue';
import MulHandleForm from './form/MulHandleForm';

import DateUtil from '@src/util/date';
import AuthUtil from '@src/util/auth';
import { getRootWindow } from '@src/util/dom';
import {
  rejectBatch,
  revokeBatch,
  approveBatch,
  getRelationListByApproveNo,
  getProgress,
  getRelationsByApproveNos,
  approveBatchByApproveNos
} from '@src/api/SparePart';
import StorageUtil from '@src/util/storageUtil';

let allPerson = [];

const STORAGE_COLNUM_KEY = 'shb_repe_apply_list_column';
const STORAGE_PAGESIZE_KEY = 'repe_apply_list_pagesize';

export default {
  name: 'part-apply-view',
  inject: ['initData'],
  data() {
    let pageSize = StorageUtil.get(STORAGE_PAGESIZE_KEY) || 10;

    let originModel = {
      keyWord: '',
      type: [],
      // enable: "",
      pageNum: 1,
      pageSize,
      sparepartType: '',
      targetIds: [],
      sourceIds: [],
      state: ['suspending']
    };

    return {
      stateArr: [
        { value: '', label: '状态：全部', key: 'all' },
        { value: 'suspending', label: '待办理', key: 'suspending' },
        { value: 'dealing', label: '办理中', key: 'dealing' },
        { value: 'solved', label: '已办理', key: 'solved' },
        { value: 'rejected', label: '已拒绝', key: 'rejected' },
        { value: 'cancel', label: '已取消', key: 'cancel' },
        { value: 'revoked', label: '已撤回', key: 'revoked' }
      ],
      selectedLimit: 500,
      auths: {},
      columns: this.buildColumns(),
      exportColumns:this.builcExportColumns(),  // 先不导出备注，后面后台实现删除，用回 columns
      isExpand: false,
      pending: false,
      userName: '',
      userId: '',

      types: [],
      userApply: {
        prosperId: '',
        loading: false,
        options: []
      },
      userApprove: {
        approveId: '',
        loading: false,
        options: []
      },
      sparepart: {
        sparepartType: '',
        sparepartName: '',
        loading: false,
        options: []
      },

      originModel,
      multipleSelectionPanelShow: false,
      model: _.assign({}, originModel),

      page: new Page(),
      selected: [],
      backstockDialog: false,
      backstock_type: '',
      instockDialog: false,
      outstockDialog: false,
      outstockBatchDialog: false,
      instockBatchDialog: false,
      cancelTransferDialog: false,
      transferDialog: false,
      reStockDialog: false,
      mulHandleDialog:false,
      partDealDialog: false, // 新处理弹窗显隐判断条件
      partDealData: {
        data: {},
        arr: [],
        progress:[]
      }, // 新处理弹窗需要的数据
      partDealTitle:'', // 新处理弹窗标题
      repertory: [], // 所有原始仓库
      repertories: [], // 所有仓库
      repertory_1: [],
      repertory_2: [],
      sourceType: '备件库',
      targetType: '备件库',
      repertorySelected: '',
      sparepartConfig: {},
      repertoryName: '',
      state: '',
      pickerOptions2: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      },
      timeValue: '',
      updateTimeValue: '',
      isPersonalRepertory: false,
      rejectForm: {
        reason: '',
        reasons: ''
      },
      rejectRules: {
        reason: [
          { required: true, message: '请填写拒绝理由', trigger: 'change' }
        ]
      },
      cancelType: 0, // 0 拒绝 1 撤销
      partDealKey:1,
      formdata:[],
      mulHandleKey:1
    };
  },
  computed: {
    allowInout() {
      return AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_INOUT');
    },
    // 是否允许导入导出
    allowImportAndExport() {
      return AuthUtil.hasAuth(this.auths, 'EXPORT_IN');
    },
    typeArr() {
      return this.isPersonalRepertory
        ? [
          { value: '出库', label: '出库', key: '0' },
          { value: '入库', label: '入库', key: '1' },
          { value: '调拨', label: '调拨', key: '2' },
          { value: '分配', label: '分配', key: '3' },
          { value: '申领', label: '申领 ', key: '4' },
          { value: '退回', label: '退回', key: '5' }
        ]
        : [
          { value: '出库', label: '出库', key: '0' },
          { value: '入库', label: '入库', key: '1' },
          { value: '调拨', label: '调拨', key: '2' }
        ];
    }
  },
  watch: {
    backstockDialog(newVal) {
      this.rest_rejectForm();
    }
  },
  filters: {
    state(s) {
      if (s === 'solved') return '已办理';
      if (s === 'suspending') return '待办理';
      if (s === 'dealing') return '办理中';
      if (s === 'cancel') return '已取消';
      if (s === 'rejected') return '已拒绝';
      if (s === 'revoked') return '已撤回';
      return s;
    }
  },
  methods: {
    // 批量办理
    mulHandle(value){
      if(value.length===0){
        this.$platform.alert('请至少选择1条数据');
        return;
      }
      if(value.length>20){
        this.$platform.alert('单次选择不能超过20个申请单');
        return;
      }
      // 只能选择可办理的数据
      const cannotApprove=value.filter(item=>!item.approved);
      if(cannotApprove.length>0){
        this.$platform.alert('有'+cannotApprove.length+'条数据，您无办理权限');
        return;
      }
      // 只能选择状态为"待办理"，申请类别为 申领、调拨、退回、分配 的数据
      const allSuspending=value.every(item=>item.state==='suspending' || item.state==='dealing');
      const allSL=value.every(item=>item.type==='申领');
      const allDB=value.every(item=>item.type==='调拨');
      const allTH=value.every(item=>item.type==='退回');
      const allFP=value.every(item=>item.type==='分配');
      if(!allSuspending || (!allSL && !allDB && !allTH && !allFP)){
        this.$platform.alert('单次办理请选择同一申请类别的数据，且状态为【待办理】或【办理中】的申请单进行批量入库办理');
        return;
      }
      const params={
        ids:value.map(item=>item.id),
        type:value[0].type
      }
      getRelationsByApproveNos(params).then(res=>{
        if(!res.success){
          this.$message({
            showClose: true,
            message: res.message || 'http error',
            type: 'error'
          });
          return
        }
        const result=res.result.data;
        this.formdata=result.map(item=>{
          return {
            id:item.id,
            solvedVariation:item.solvedVariation,
            variation:item.variation,
            targetName:item.targetName,
            propserName:item.propserName,
            approveNo:item.approveNo,
            type:item.type,
            name:item.sparepart.name,
            serialNumber:item.sparepart.serialNumber,
            standard:item.sparepart.standard,
            unit:item.sparepart.unit,
            sourceName:item.sourceName,
            sType:item.sparepart.type,
            propserTime:this.formmatTime(item.propserTime),
            repertoryCount:item.repertoryCount,
            handleNum:null,
            checked:false,
            max:''
          }
        });
        this.mulHandleKey++;
        this.mulHandleDialog=true;
      });
    },
    // 批量办理-保存
    mulHandleSave(){
      let form=this.$refs.mulHandleForm;
      if(form.selected.length===0){
        this.$platform.alert('请选择要办理的数据');
        return
      }
      if(form.remark.length>500){
        this.$platform.alert('办理意见不能超过500字');
        return
      }

      if(this.pending) return;

      this.pending = true;
      const params=form.selected.map(item=>{
        return {
          approveNo:item.approveNo,
          id:item.id,
          remark:form.remark,
          solvedVariation:item.handleNum,
          type:item.type
        }
      });
      approveBatchByApproveNos(params).then(res=>{
        this.mulHandleDialog=false;
        this.pending = false;
        if(res.success){
          this.$message({
            showClose: true,
            message: res.message || '办理成功',
            type: 'success'
          });
        }else{
          this.$message({
            showClose: true,
            message: res.message,
            type: 'error'
          });
        }
      }).catch(err=>{
        this.pending = false;
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error'
        });
      })
    },
    formmatTime(time){
      const t=new Date(time);
      const year=t.getFullYear();
      const month=(t.getMonth()+1).toString().padStart(2,'0');
      const day=(t.getDate()).toString().padStart(2,'0');
      const hour=(t.getHours()).toString().padStart(2,'0');
      const minute=(t.getMinutes()).toString().padStart(2,'0');
      const second=(t.getSeconds()).toString().padStart(2,'0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    // 打开详情弹窗
    partDearOpen(){
      this.partDealKey++;
      if(this.$refs.partDealWithForm){
        this.$refs.partDealWithForm.suggestion='';
      }
    },
    // 显示详细备注
    remarkShow(approveNo,index){
      if(!this.page.list[index].remarkReq){
        getProgress({approveNo}).then(res=>{
          if(res.success){
            const result=res.result.data;
            this.page.list[index].remarkReq=true;
            let content='';
            let applyRemark='';
            const applyItem=result.find(item=>item.state===0);
            if(applyItem){
              applyRemark=`申请人：${applyItem.remark}`;
            }
            let handleRemark='';
            const handleItems=result.filter(item=>item.state!==0);
            if(handleItems.length>0){
              handleRemark='办理人：';
              handleItems.forEach(item=>{
                handleRemark+=item.remark+'；';
              });
              handleRemark=handleRemark.slice(0,-1);
            }
            if(handleRemark && applyRemark){
              content=`${applyRemark}<br>------------------------------------------<br>${handleRemark}`;
            }else if(!applyRemark){
              content=handleRemark;
            }else if(!handleRemark){
              content=applyRemark;
            }
            this.page.list[index].remarkDetail=content;
          }else{
            this.$platform.toast(res.message, 'error');
          }
        }).catch(err=>{});
      }
    },
    // 显示剩余备件信息
    showMore(index){
      if(this.page.list[index].showState==='close'){
        this.page.list[index].showState='open';
      }else{
        this.page.list[index].showState='close';
      }
    },
    rest_rejectForm() {
      if (this.$refs['rejectForm']) {
        this.$refs['rejectForm'].resetFields();
      }
    },
    /** 检测导出条数 */
    checkExportCount(ids, max) {
      let exportAll = !ids || !ids.length;
      return exportAll && this.page.total > max
        ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。'
        : null;
    },
    exportPart(exportAll = false) {
      if (!this.allowImportAndExport || !this.allowInout) return;

      let ids = [];
      let fileName = `${DateUtil.format(
        new Date(),
        'yyyy-MM-dd'
      )}备件办理出入库数据.xlsx`;

      if (!exportAll) {
        if (this.selected.length == 0)
          return this.$platform.alert('请选择要导出的数据');
        ids = this.selected.map(item => item.id);
      }

      this.$refs.exportPanel.open(ids, fileName);
    },
    cancelSelectPart(part) {
      if (!part || !part.id) return;
      this.selected = this.selected.filter(ms => ms.id !== part.id);
      this.toggleSelection([part]);
    },
    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (rows) {
        for (let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach(row => {
          this.$refs.table.toggleRowSelection(row);
        });
      } else {
        this.$refs.table.clearSelection();
        this.selected = [];
      }
    },

    getApproveTimeArr(i, id) {
      if (this.page.list[i].isApproveTimeArr) return;

      this.$set(this.page.list[i], 'disabled', false);
      this.$set(this.page.list[i], 'approveTimeArr', '加载中...');
      try {
        this.$http
          .get('/partV2/repertory/diposal/time', { approveId: id })
          .then(res => {
            this.$set(this.page.list[i], 'approveTimeArr', res.data.join('\n'));
            this.$set(this.page.list[i], 'isApproveTimeArr', true);
            if (res.data.length == 0)
              this.$set(this.page.list[i], 'disabled', true);
          });
      } catch (error) {
        console.log(error);
      }
    },
    getRecordNoArr(i, id) {
      if (this.page.list[i].isRecordNoArr) return;
      this.$set(this.page.list[i], 'disabled', false);
      this.$set(this.page.list[i], 'recordNoArr', '加载中...');
      try {
        this.$http
          .get('/partV2/repertory/diposal/recordNo', { approveId: id })
          .then(res => {
            this.$set(this.page.list[i], 'recordNoArr', res.data.join('\n'));
            this.$set(this.page.list[i], 'isRecordNoArr', true);
            if (res.data.length == 0)
              this.$set(this.page.list[i], 'disabled', true);
          });
      } catch (error) {
        console.log(error, 'getRecordNoArr');
      }
    },
    chooseColnum(column, index) {
      this.trackEventhandler('selectColumn');
      column.show = !column.show;

      let data = {};
      this.columns.forEach(item => (data[item.field] = item.show));
      StorageUtil.save(STORAGE_COLNUM_KEY, data);
    },
    seeTime() {
      if (!this.timeValue) {
        delete this.model.prosperTimeStart;
        delete this.model.prosperTimeEnd;
      } else {
        this.model.prosperTimeStart = DateUtil.format(this.timeValue[0]);
        this.model.prosperTimeEnd = DateUtil.format(
          this.timeValue[1],
          'yyyy-MM-dd 23:59:59'
        );
      }
    },
    seeUpdateTime() {
      if (!this.updateTimeValue) {
        delete this.model.approveTimeStart;
        delete this.model.approveTimeEnd;
      } else {
        this.model.approveTimeStart = DateUtil.format(this.updateTimeValue[0]);
        this.model.approveTimeEnd = DateUtil.format(
          this.updateTimeValue[1],
          'yyyy-MM-dd 23:59:59'
        );
      }
    },
    openDetail(row) {
      this.$platform.openTab({
        id: `partV2_detail_${row.id}`,
        url: `/partV2/detail?id=${row.id}`,
        title: '备件品类详情'
      });
    },
    exportData() {
      this.$platform.alert('export');
    },
    // select part
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      // 在需要限制最多选择500个备件时，取消function内部全部注释即可
      let original = this.selected.filter(ms =>
        this.page.list.some(cs => cs.id === ms.id)
      );
      let unSelected = this.page.list.filter(c =>
        original.every(oc => oc.id !== c.id)
      );

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.table.toggleRowSelection(row, false);
            })
            : this.$refs.table.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.selected = tv;

      // this.$refs.baseSelectionBar.openTooltip();
    },
    computeSelection(selection) {
      let tv = [];
      tv = this.selected.filter(ms =>
        this.page.list.every(c => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    matchSelected() {
      if (!this.selected.length) return;
      const selected = this.page.list.filter(c => {
        if (this.selected.some(sc => sc.id === c.id)) {
          this.selected = this.selected.filter(sc => sc.id !== c.id);
          this.selected.push(c);
          return c;
        }
      }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    create() {
      this.$platform.openTab({
        id: 'partV2_create',
        url: '/partV2/create',
        title: '创建备件品类'
      });
    },
    initialize() {
      Promise.all([
        this.fetchAllRepertory(), // 所有仓库
        this.loadData(),
        this.fecthSparepartConfig(),
        this.fetchUserApply(), // 所有管理人员
        this.fetchUserApprove(), // 所有管理人员
        this.fetchSparepart()
      ])
        .then(res => {
          let allRepertory = res[1];
          let list = res[2];
          allPerson = this.userApply.options;

          this.page.list = list.map(item => {
            let tv = allRepertory.filter(r => r.id === item.targetId);
            if (item.type === '调拨' && tv && tv[0]) {
              item.targetName = tv[0].name;
              item.targetRepertory = tv[0] || {};
            }

            item = this.judgeRelationshipBetweenUserAndRepertory(item);
            return item;
          });
        })
        .catch(e => console.log('initialize', e));
    },
    jump(pageNum) {
      this.model.pageNum = pageNum;
      this.loadData();
    },
    pageSizeChange(pageSize) {
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;

      this.loadData();
      StorageUtil.save(STORAGE_PAGESIZE_KEY, pageSize);
    },
    search() {
      this.model.pageNum = 1;
      this.loadData();
    },
    reset() {
      this.model = _.assign({}, this.originModel);
      this.timeValue = [];
      this.updateTimeValue = [];
      this.sparepart.sparepartName = '';
      this.userApply.userId = '';
      this.userApprove.userId = '';
      this.state = '';
      this.repertoryName = '';
      this.loadData();
    },
    resetAll() {
      // 搜索条件初始化
      this.model = _.assign({}, this.originModel);
      this.userApply.prosperId = '';
      this.userApprove.approveId = '';
      this.targetType = '备件库';
      this.userApprove.options = _.cloneDeep(allPerson);
      // this.sparepart.options = _.cloneDeep(allPerson);
      this.sparepart.sparepartName='';
      this.repertory_1 = this.repertories;
      this.repertory_2 = this.repertories;
      this.timeValue = [];
      this.updateTimeValue = [];
      this.loadData();
    },
    async loadData() {
      let loading = this.$loading();
      try {
        this.page = await this.fetchData();
        // this.model.pageNum = this.page.pageNum;
        // this.model.pageSize = this.page.pageSize; list 接口返回 pageSize异常 不由后端刷新

        this.matchSelected();
      } catch (error) {
        console.log(error, 'loadData');
      }
      loading.close();
      return this.page.list;
    },
    fetchUserApply(keyword) {
      // 获取用户
      let model = {
        keyword,
        pageSize: 50
      };
      this.userApply.loading = true;
      this.$http
        .get('/partV2/repertory/users', model)
        .then(result => (this.userApply.options = result))
        .catch(err => console.log(err, 'fetchUserApply'))
        .finally(() => (this.userApply.loading = false));
    },
    visibleUserApply(e) {
      if (this.userApply.prosperId === '') {
        setTimeout(() => {
          this.userApply.loading = false;
          this.userApply.options = _.cloneDeep(allPerson);
        }, 500);
      }
    },
    fetchUserApprove(keyword) {
      // 获取用户
      let model = {
        keyword,
        pageSize: 50
      };
      this.userApply.loading = true;
      this.$http
        .get('/partV2/repertory/users', model)
        .then(
          result => (
            (this.userApprove.options = result),
            (this.repertory = result.map(item => {
              item = {
                id: item.userId || '',
                name: item.displayName || ''
              };
              return item;
            }))
          )
        )

        .catch(err => console.log(err, 'fetchUserApprove'))
        .finally(() => (this.userApprove.loading = false));
    },
    visibleUserApprove(e) {
      if (this.userApprove.approveId === '') {
        setTimeout(() => {
          this.userApprove.loading = false;
          this.userApprove.options = _.cloneDeep(allPerson);
        }, 500);
      }
    },
    fetchSparepart(keyword) {
      // 获取备件
      let model = {
        keyWord: keyword,
        // enable: 1,
        pageSize: 50
      };
      this.sparepart.loading = true;
      this.$http
        .get('/partV2/repertory/sparepart/list', model)
        .then(result => (this.sparepart.options = result.list))
        .catch(err => console.log(err, 'fetchSparepart'))
        .finally(() => (this.sparepart.loading = false));
    },

    chooseUserApply(value) {
      console.log(value, 'asdadas')
      if (this.model.prosperId === value) {
        this.model.prosperId = '';
        return
      }
      this.model.prosperId = value;
      this.model.pageNum = 1;
      this.loadData();
    },
    chooseUserApprove(value) {
      this.model.approveId = value;
    },
    chooseSparepart(value) {
      if (this.sparepart.sparepartName == value) return;
      this.sparepart.sparepartName = value;
      this.model.sparepartName = value;
    },
    hooseSparepartType(value) {
      if (this.sparepart.sparepartType == value) return;
      this.sparepart.sparepartType = value;
      this.model.sparepartType = value;
    },
    fetchData() {
      // 获取申请列表
      return this.$http
        .get('/partV2/approve/approveList/list', this.model)
        .then(result => {
          // repertory
          let list = (result.data.list || []).map(item => {
            item.approveTime = item.approveTime
              ? DateUtil.format(
                new Date(item.approveTime),
                'yyyy-MM-dd HH:mm:ss'
              )
              : '';
            item.prosperTime = item.prosperTime
              ? DateUtil.format(
                new Date(item.prosperTime),
                'yyyy-MM-dd HH:mm:ss'
              )
              : '';
            let tv = this.repertories.filter(r => r.id === item.targetId);
            if (item.type === '调拨' && tv && tv[0]) {
              item.targetName = tv[0].name;
              item.targetRepertory = tv[0] || {};
            }

            item.disabled = false;

            item = this.judgeRelationshipBetweenUserAndRepertory(item);
            return item;
          });
          list.forEach(item=>{
            if(item.sparepartIds.length>3){
              item.showState='close';
            }
            item.remarkDetail='';   // 备注详情
            item.remarkReq=false;   // 是否已请求过备注详情
          })
          return {
            ...result.data,
            list
          };
        });
    },
    judgeRelationshipBetweenUserAndRepertory(row) {
      const userId = this.userId;

      if (!row || !row.sparepartRepertory || !row.targetRepertory) return row;

      if (
        row.sparepartRepertory.repertory.manager.some(m => m.userId === userId)
      ) {
        row.isOriginalRepertoryManager = true;
      }

      if (row.targetRepertory.manager.some(m => m.userId === userId)) {
        row.isTargetRepertoryManager = true;
      }
      return row;
    },
    fetchRepertory() {
      // 获取仓库类型
      return this.$http.get('/partV2/approve/repertory').then(result => {
        this.repertory = result || [];
      });
    },

    // 获取全部仓库列表
    fetchAllRepertory() {
      return this.$http
        .get('/partV2/repertory/allRepertory')
        .then(result => {
          this.repertory_1 = result || [];
          this.repertory_2 = result || [];
          return (this.repertories = result || []);
        })
        .catch(err => console.warn(err));
    },
    chooseSourceType(e) {
      if (e === '个人备件库') {
        this.repertory_1 = this.repertory;
      } else {
        this.repertory_1 = this.repertories;
      }
      this.model.sourceIds = [];
      console.log(e, '原始');
    },
    chooseTargetType(e) {
      if (e === '个人备件库') {
        this.repertory_2 = this.repertory;
      } else {
        this.repertory_2 = this.repertories;
      }
      this.model.targetIds = [];
      this.trackEventhandler('chooseTargetType');
      console.log(e, '目标');
    },
    chooseRepertory(value) {
      this.trackEventhandler('chooseRepertory');

      // this.repertoryName = value;
      // if(value){
      //   this.model.repertoryId = value
      // }else{
      //   delete this.model.repertoryId
      // }
      this.model.pageNum = 1;
      this.loadData();
    },
    chooseState(value) {
      this.stateTrackEventHandler(value);

      if(value.length && value[value.length-1]===''){
        this.model.state=[''];
      }else if(value.length && value[value.length-1]){
        this.model.state=this.model.state.filter(item=>item);
      }

      this.model.pageNum = 1;
      this.loadData();
    },
    chooseApplyType(value){
      this.model.pageNum = 1;
      this.loadData();
    },
    fecthSparepartConfig() {
      // 获取备件设置
      return this.$http
        .post('/partV2/repertory/sparepartConfig')
        .then(result => {
          this.sparepartConfig = result;
        });
    },
    /** 办理出库 */
    outstock(value) {
      if (!this.isPersonalRepertory) {
        return this.personalRepertoryNotMeaage();
      }
      this.outstockDialog = true;
      this.formdata = value;
    },
    /** 入库 */
    instock(value) {
      if (!this.isPersonalRepertory) {
        return this.personalRepertoryNotMeaage();
      }
      this.instockDialog = true;
      this.formdata = value;
    },
    /** 取消 */
    backstock(value) {
      if (!this.isPersonalRepertory) {
        return this.personalRepertoryNotMeaage();
      }
      this.backstockDialog = true;
      this.formdata = value;
      //
    },
    openTransferDialog(value, action) {
      this.transferDialog = true;
      this.formdata = {
        ...value,
        action
      };
    },
    transfer() {
      const form = this.$refs.transferForm.pack();
      const action = form.action;
      const params = {
        id: form.applayId,
        solvedVariation: form.sparesNum,
        remark: form.remarks
      };
      this.pending = true;
      const actionName = action ? '接收调入' : '拒绝调入';
      const url = action
        ? '/partV2/approve/transfer/accept'
        : '/partV2/approve/transfer/reject';

      this.$http
        .post(url, params)
        .then(res => {
          if (!res.status) {
            this.$platform.toast(`${actionName}成功`);
            this.transferDialog = false;
            this.pending = false;
            this.loadData();
            return;
          }

          this.$platform.toast(res.message, 'warning');
          this.pending = false;
        })
        .catch(error => {
          this.$platform.toast(`${actionName}失败`, 'error');
          console.log('transfer', error);
        });
    },

    /** 调拨撤回（弹窗） **/
    openCancelTransferDialog(value) {
      this.tableTrackEventHandler('recall');

      this.cancelTransferDialog = true;
      this.formdata = value;
    },
    cancelTransfer() {
      const form = this.$refs.cancelTransferForm.pack();
      const params = {
        id: form.applayId,
        solvedVariation: form.sparesNum,
        remark: form.remarks
      };
      this.pending = true;

      this.$http
        .post('/partV2/approve/transfer/revoke', params)
        .then(res => {
          if (!res.status) {
            this.$platform.toast('撤回调拨成功');
            this.loadData();
            this.cancelTransferDialog = false;
            this.pending = false;
            return;
          }

          this.$platform.toast(res.message, 'warning');
          this.pending = false;
        })
        .catch(error => {
          this.$platform.toast('撤回调拨失败', 'error');
          console.log('cancelTransfer', error);
        });
    },
    /** 分配撤回 (弹窗) */
    reStockOpenDialog(value) {
      this.tableTrackEventHandler('recall');

      if (!this.isPersonalRepertory) {
        return this.personalRepertoryNotMeaage();
      }
      this.reStockDialog = true;
      this.formdata = value;
    },
    /** 分配撤回 */
    async reStock() {
      let form = this.$refs.reStockForm;
      if (null == form) return;

      let reStockForm = await form.pack();
      if (!reStockForm) return;

      this.pending = true;
      let params = {
        id: reStockForm.applayId,
        solvedVariation: Number(reStockForm.sparesNum),
        remark: reStockForm.remarks
      };
      try {
        let result = await this.$http.post(
          '/partV2/approve/allot/revoke',
          params
        );
        if (result.status == 0) {
          this.$platform.toast('撤回成功');
          this.reStockDialog = false;
          this.loadData();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error, 'reStock');
      }
      this.pending = false;
    },
    // 出库
    async outstockSave() {
      let form = this.$refs.outstockForm;
      if (null == form) return;
      let outstock = await form.pack();
      if (null == outstock) return;
      this.pending = true;
      try {
        let result = await this.$http.get(
          '/partV2/approve/inOutStore',
          outstock
        );
        if (result.status == 0) {
          this.$platform.toast('出库办理成功');
          this.outstockDialog = false;
          this.loadData();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error, 'outstockSave');
      }
      this.pending = false;
    },
    async backstockSave() {
      let form = this.$refs.backstockForm;
      if (null == form) return;
      let backstock = await form.pack();
      if (null == backstock) return;
      this.pending = true;
      try {
        let result = await this.$http.get(
          '/partV2/approve/cancelApply',
          backstock
        );
        if (result.status == 0) {
          this.$platform.toast('取消成功');
          this.backstockDialog = false;
          this.loadData();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error, 'backstockSave');
      }
      this.pending = false;
    },
    // 入库
    async instockSave() {
      let form = this.$refs.instockForm;
      if (null == form) return;
      let instock = await form.pack();
      if (null == instock) return;
      this.pending = true;
      try {
        let result = await this.$http.get(
          '/partV2/approve/inOutStore',
          instock
        );
        if (result.status == 0) {
          this.$platform.toast('入库办理成功');
          this.instockDialog = false;
          this.loadData();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error, 'instockSave');
      }
      this.pending = false;
    },
    async outstockBatchSave() {
      let form = this.$refs.outstockBatchForm;
      if (null == form) return;
      let outstock = await form.pack();
      if (null == outstock) return;
      this.pending = true;
      try {
        let result = await this.$http.post(
          '/partV2/approve/applyOutBach',
          outstock
        );
        if (result.status == 0) {
          this.$platform.toast('批量出库办理成功');
          this.outstockBatchDialog = false;
          this.loadData();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error, 'outstockBatchSave');
      }
      this.pending = false;
    },
    async instockBatchSave() {
      let form = this.$refs.instockBatchForm;
      if (null == form) return;
      let instock = await form.pack();
      if (null == instock) return;
      this.pending = true;
      try {
        let result = await this.$http.post(
          '/partV2/approve/applyInBach',
          instock
        );
        if (result.status == 0) {
          this.$platform.toast('批量入库办理成功');
          this.instockBatchDialog = false;
          this.loadData();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error, 'instockBatchSave');
      }
      this.pending = false;
    },
    // 出库（批量）
    outstockBatch(value) {
      if (!this.allowInout) {
        this.$platform.alert('对不起，您没有该操作权限');
        return;
      }
      if (value.length < 1) {
        this.$platform.alert('请先勾选要批量操作的备件');
        return;
      }
      if (value.length > 5) {
        this.$platform.alert('批量操作数量最多只支持5个');
        return;
      }

      if (!this.isPersonalRepertory) {
        return this.personalRepertoryNotMeaage();
      }

      for (let i = 0; i < value.length; i++) {
        if (
          value[i].type == '退回'
          || value[i].type == '分配'
          || value[i].state != 'suspending'
        ) {
          this.$platform.alert(
            '请先结合高级搜索中筛选条件确保已勾选备件类别为【申领】且状态为【待办理】，再进行批量操作'
          );
          return;
        }
      }
      this.outstockBatchDialog = true;
      this.formdata = value;
    },
    // 入库（批量）
    instockBatch(value) {
      if (!this.allowInout) {
        this.$platform.alert('对不起，您没有该操作权限');
        return;
      }
      if (value.length < 1) {
        this.$platform.alert('请先勾选要批量操作的备件');
        return;
      }
      if (value.length > 5) {
        this.$platform.alert('批量操作数量最多只支持5个');
        return;
      }
      if (!this.isPersonalRepertory) {
        return this.personalRepertoryNotMeaage();
      }
      for (let i = 0; i < value.length; i++) {
        if (
          value[i].type == '申领'
          || value[i].type == '分配'
          || value[i].state != 'suspending'
        ) {
          this.$platform.alert(
            '请先结合高级搜索中筛选条件确保已勾选备件类别为【退回】且状态为【待办理】，再进行批量操作'
          );
          return;
        }
      }
      this.instockBatchDialog = true;
      this.formdata = value;
    },
    partDealDataCancel(approveNo) {
      // 拒绝
      this.$refs['rejectForm'].validate((valid, obj) => {
        if (valid) {
          // 拒绝
          rejectBatch({
            approveNo,
            remark: this.rejectForm.reason
          }).then(res => {
            if (res.code == 0) {
              this.partDealDialog = false;
              this.backstockDialog = false;
              this.$message({
                showClose: true,
                message: res.message,
                type: 'success'
              });
              this.loadData();
            } else {
              this.$message({
                showClose: true,
                message: res.message || 'http error',
                type: 'error'
              });
            }
          });
        }
      });
    },
    partDealDataReset(approveNo) {
      // 撤销
      revokeBatch({
        approveNo,
        remark: this.rejectForm.reasons
      }).then(res => {
        if (res.code == 0) {
          this.partDealDialog = false;
          this.backstockDialog = false;
          this.$message({
            showClose: true,
            message: res.message,
            type: 'success'
          });
          this.loadData();
        } else {
          this.$message({
            showClose: true,
            message: res.message || 'http error',
            type: 'error'
          });
        }
      });
    },

    partDealDataDone: _.debounce(async function(){
      if(this.pending) return;

      this.pending = true;

      // 办理
      let data = this.$refs.partDealWithForm
        .getData()
        .then(res => {
          let arr = [];
          res.propData.arr.forEach(item => {
            if (item.handleNum > 0) {
              arr.push({
                approveNo: res.propData.data.approveNo,
                id: item.id,
                remark: res.suggestion,
                solvedVariation: item.handleNum,
                type: res.propData.data.type
              });
            }
          });

          if (arr.length <= 0) {
            this.pending = false;
            return this.$message({
              showClose: true,
              message: '没有可以办理的备件！',
              type: 'warning'
            });
          }
          approveBatch(arr)
            .then(res_ => {
              if (res_.code == 0) {
                this.$refs.partDealWithForm.resetData();
                this.partDealDialog = false;
                this.$message({
                  showClose: true,
                  message: res_.message,
                  type: 'success'
                });
                this.loadData();
              } else {
                this.$message({
                  showClose: true,
                  message: res_.message || 'http error',
                  type: 'error'
                });
              }
            })
            .catch(err => {

            })
            .finally(() => {
              this.pending = false;
            });
        })
        .catch(err => {
          this.pending = false;
          this.$message({
            showClose: true,
            message: err.message,
            type: 'error'
          });
        });
        
    }, 1000),
    buildParams(pageNum, pageSize) {
      return {
        ...this.model,
        pageNum,
        pageSize
      };
    },
    buildColumns() {
      let localData = StorageUtil.get(STORAGE_COLNUM_KEY) || {};

      let columns = [
        {
          label: '申请日期',
          field: 'prosperTime',
          exportAlias: 'proposeTime',
          show: true,
          // sortable: "custom",
          width: 160
        },
        {
          label: '申请编号',
          exportAlias: 'approveNo',
          field: 'approveNo',
          overflow: true,
          show: true,
          width: 160,
          clickFnc: obj => {
            this.showPartDealDetail(obj);
          }
        },
        {
          label: '状态',
          exportAlias: 'state',
          field: 'state',
          // sortable: "state",
          width: 90,
          overflow: true,
          show: true
        },
        {
          label: '申请类别',
          exportAlias: 'type',
          field: 'type',
          width: 90,
          overflow: true,
          show: true
        },
        {
          label: '备件名称/编号/规格',
          field: 'sparepartIds',
          exportAlias: 'sparepartName',
          show: true,
          minWidth: 350,
          overflow: false,
        },
        {
          label: '申请数量',
          exportAlias: 'variation',
          field: 'showNum',
          width: 90,
          overflow: true,
          show: true
        },
        {
          label: '待办数/已办数',
          field: 'applyCount',
          exportAlias: 'pendingVariation,solvedVariation',
          show: true,
          width: 110
        },
        {
          label: '金额(¥)',
          exportAlias: 'price',
          field: 'showPrice',
          width: 100,
          overflow: true,
          show: true
        },
        {
          label: '目标仓库',
          field: 'targetName',
          exportAlias: 'targetName',
          show: true,
          minWidth: 120,
          overflow: true
        },
        {
          label: '原始仓库',
          field: 'sourceTargetName',
          exportAlias: 'sourceName',
          show: true,
          minWidth: 120,
          overflow: true
        },
        {
          label: '申请人',
          field: 'prosperName',
          exportAlias: 'prosperName',
          width: 90,
          overflow: true,
          show: true
        },
        {
          label: '备注',
          field: 'remark',
          exportAlias: 'remark',
          show: true,
          minWidth: 100,
          overflow: false,
        },
        
        {
          field: 'approveName',
          label: '办理人',
          exportAlias: 'executorName',
          show: true,
          width: 100,
          overflow: true
        },
        {
          field: 'approveTime',
          label: '办理时间',
          exportAlias: 'updateTime',
          show: true,
          width: 160,
          overflow: false
          // sortable: "approveTime"
        },
        {
          label: '操作',
          field: 'enable',
          width: '150px',
          show: true,
          fixed: 'right',
          export: false
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if (typeof isShow == 'boolean') column.show = isShow;
      });

      return columns;
    },
    // 暂时，备注&备件信息不导出，后台实现后删除
    builcExportColumns(){
      let localData = StorageUtil.get(STORAGE_COLNUM_KEY) || {};

      let columns = [
        {
          label: '申请日期',
          field: 'prosperTime',
          exportAlias: 'proposeTime',
          show: true,
          export: true,
          // sortable: "custom",
          width: 160
        },
        {
          label: '申请编号',
          exportAlias: 'approveNo',
          field: 'approveNo',
          overflow: true,
          show: true,
          export: true,
          width: 200,
          clickFnc: obj => {
            this.showPartDealDetail(obj);
          }
        },
        {
          label: '状态',
          exportAlias: 'state',
          field: 'state',
          // sortable: "state",
          width: 100,
          export: true,
          overflow: true,
          show: true
        },
        {
          label: '申请类别',
          exportAlias: 'type',
          field: 'type',
          width: 100,
          export: true,
          overflow: true,
          show: true
        },
        {
          label: '备件名称/编号/规格',
          field: 'sparepartIds',
          exportAlias: 'sparepartName',
          show: true,
          export: true,
          minWidth: 170,
          overflow: false,
        },
        {
          label: '申请数量',
          exportAlias: 'variation',
          field: 'showNum',
          width: 100,
          export: true,
          overflow: true,
          show: true
        },
        {
          label: '金额(¥)',
          exportAlias: 'price',
          field: 'showPrice',
          width: 100,
          export: true,
          overflow: true,
          show: true
        },
        {
          label: '目标仓库',
          field: 'targetName',
          exportAlias: 'targetName',
          show: true,
          export: true,
          minWidth: 120,
          overflow: true
        },
        {
          label: '原始仓库',
          field: 'sourceTargetName',
          exportAlias: 'sourceName',
          show: true,
          export: true,
          minWidth: 120,
          overflow: true
        },
        {
          label: '申请人',
          field: 'prosperName',
          exportAlias: 'prosperName',
          width: 100,
          export: true,
          overflow: true,
          show: true
        },
        {
          label: '待办数/已办数',
          field: 'applyCount',
          exportAlias: 'pendingVariation,solvedVariation',
          show: true,
          export: true,
          width: 160
        },
        {
          field: 'approveName',
          label: '办理人',
          export: true,
          exportAlias: 'executorName',
          show: true,
          width: 100,
          overflow: true
        },
        {
          field: 'approveTime',
          label: '办理时间',
          export: true,
          exportAlias: 'updateTime',
          show: true,
          width: 160,
          overflow: false
          // sortable: "approveTime"
        },
        {
          label: '操作',
          field: 'enable',
          width: '150px',
          export: true,
          show: true,
          fixed: 'right',
          export: false
        },
        {
          label: '备注',
          field: 'remark',
          exportAlias: 'remark',
          export: true,
          show: true,
          minWidth: 100,
          overflow: false,
        },
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if (typeof isShow == 'boolean') column.show = isShow;
      });

      return columns;
    },
    personalRepertoryNotMeaage() {
      return this.$platform.alert(
        '个人备件库功能已经关闭，需系统管理员开启个人备件库功能(系统管理-备件库管理)后继续操作。'
      );
    },
    // TalkingData事件埋点
    trackEventhandler(type) {
      switch (type) {
      case 'search':
        this.$tdOnEvent('pc：办理出入库-搜索事件');
        break;
      case 'reset':
        this.$tdOnEvent('pc：办理出入库-重置事件');
        break;
      case 'advSearch':
        this.$tdOnEvent('pc：办理出入库-高级搜索事件');
        break;
      case 'chooseRepertory':
        this.$tdOnEvent('pc：办理出入库-原始仓库筛选下拉框事件');
        break;
      case 'chooseSourceType':
        this.$tdOnEvent('pc：办理出入库-目标仓库筛选下拉框事件');
        break;
      case 'batch-stock-out':
        this.$tdOnEvent('pc：办理出入库-批量出库事件');
        break;
      case 'batch-stock-in':
        this.$tdOnEvent('pc：办理出入库-批量入库事件');
        break;
      case 'selectColumn':
        this.$tdOnEvent('pc：办理出入库-选择列事件');
        break;
      default:
        break;
      }
    },
    // state (selector) TalingData事件埋点
    stateTrackEventHandler(type) {
      switch (type) {
      case '':
        this.$tdOnEvent('pc：办理出入库-全部事件');
        break;
      case 'suspending':
        this.$tdOnEvent('pc：办理出入库-待办理事件');
        break;
      case 'dealing':
        this.$tdOnEvent('pc：办理出入库-办理中事件');
        break;
      case 'solved':
        this.$tdOnEvent('pc：办理出入库-已办理事件');
        break;
      case 'rejected':
        this.$tdOnEvent('pc：办理出入库-已拒绝事件');
        break;
      case 'cancel':
        this.$tdOnEvent('pc：办理出入库-已取消事件');
        break;
      case 'revoked':
        this.$tdOnEvent('pc：办理出入库-已撤回事件');
        break;
      default:
        break;
      }
    },
    // table TalkingData事件埋点
    tableTrackEventHandler(type) {
      switch (type) {
      case 'done':
        this.$tdOnEvent('pc：办理出入库-列表办理事件');
        break;
      case 'reject':
        this.$tdOnEvent('pc：办理出入库-列表拒绝事件');
        break;
      case 'recall':
        this.$tdOnEvent('pc：办理出入库-列表撤回事件');
        break;
      default:
        break;
      }
    },
    variationNum(num1, num2) {
      return this.$math.format(
        this.$math.subtract(
          this.$math.bignumber(num1),
          this.$math.bignumber(num2)
        )
      );
    },
    headerClick(option) {
      if (option.order == null) {
        this.model[option.property] = option.order ? option.order : '';
        this.loadData();
      }
    },
    sortChange(option) {
      // TO DO 表单排序
      console.log(option);
    },
    dingMessage() {
      let rootWindow = getRootWindow(window);
      rootWindow.send_ding_part_message(
        this.partDealData.data.staffs,
        this.partDealData.data.approveNo
      );
    },
    showPartDealDetail(obj) {
      console.log('hbc: showPartDealDetail -> obj', obj)
      getRelationListByApproveNo({
        approveNo: obj.approveNo
      }).then(res => {
        if (res.code != 0) {
          return this.$message({
            showClose: true,
            message: res.message || 'http error',
            type: 'error'
          });
        }
        let result = res.result;
        let {
          prosperTime,
          approveNo,
          type,
          prosperName,
          targetName,
          sourceTargetName,
          state,
          cancel,
          isreject,
          suggestion,
          approved
        } = obj;
        
        if (result.relations.length > 0) {
          result.relations = result.relations.map(item => {
            item.handleNum='';
            item.checked=false;
            item.variation = Math.abs(item.variation);
            item.solvedVariation = Math.abs(item.solvedVariation);
            if(item.variation===item.solvedVariation){
              item.disabled=true;
            }else{
              item.disabled=false;
            }
            item['number'] = Math.abs(item.variation) - (Math.abs(item.solvedVariation) || 0);
            return item;
          });
        }

        this.partDealData = {
          arr: result.relations || [],
          data: {
            prosperTime,
            approveNo,
            type,
            prosperName,
            targetName,
            sourceTargetName,
            state,
            cancel,
            isreject,
            approved,
            suggestion,
            remark: result.list.remark || '',
            staffs: result.staffs
          },
          progress:result.progress
        };
        if(this.partDealData.data.state==='suspending' || this.partDealData.data.state==='dealing'){
          this.partDealTitle=`申请单-${this.partDealData.data.type}`;
        }else{
          this.partDealTitle='出入库单详情';
        }
        this.partDealDialog = true;
      });
    },
  },
  mounted() {
    let initData = this.initData;
    if(window.location.search==='?fromId=1'){
      this.model.type='分配';
    }

    this.types = initData.sparepartType || [];
    this.auths = initData.auths || {};
    this.userId = initData.userId || '';
    this.userName = initData.userName || '';
    this.isPersonalRepertory = initData.isPersonalRepertory || false;
    if(location.search && this.isPersonalRepertory){
      this.model.type=['分配'];
    }

    this.initialize();
  },
  components: {
    PartCancelTransferForm,
    [PartBackStockForm.name]: PartBackStockForm,
    [PartOutStockForm.name]: PartOutStockForm,
    [PartInStockForm.name]: PartInStockForm,
    [PartApplyFormBatchOut.name]: PartApplyFormBatchOut,
    [PartApplyFormBatchIn.name]: PartApplyFormBatchIn,
    [PartReStockForm.name]: PartReStockForm,
    [PartCancelTransferForm.name]: PartCancelTransferForm,
    [PartTransferForm.name]: PartTransferForm,
    [PartDealWithForm.name]: PartDealWithForm,
    MulHandleForm
  }
};
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
.no-padding {
  padding: 0;
}
.srp-user-item {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 2px 0;
  justify-content: space-between;

  &:last-child {
    margin: 0;
  }

  img {
    display: block;
    width: 28px;
    height: 28px;
    border-radius: 2px;
  }

  p {
    flex: 1;
    margin: 0;
    margin-left: 10px;
    font-weight: 500;
    font-size: 14px;
    overflow: hidden;
    line-height: 28px;
    width: 0;
  }
}

.customize-el-dropdown-btn {
  padding: 0 15px;
  line-height: 32px;
  display: inline-block;
  background: $color-primary-light-9;
  color: $text-color-primary;
  outline: none;
  margin-left: 5px;
  .iconfont {
    margin-left: 5px;
    font-size: 12px;
  }

  &:hover {
    cursor: pointer;
    color: #fff;
    background: $color-primary;
  }
}

.part-option {
  margin: 5px 0;

  p {
    overflow: hidden;
    margin: 0;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.part-selected-panel {
  font-size: 14px;
  height: calc(100% - 51px);

  .part-selected-tip {
    padding-top: 80px;

    img {
      display: block;
      width: 240px;
      margin: 0 auto;
    }

    p {
      text-align: center;
      color: #9a9a9a;
      margin: 30px 0 0 0;
      line-height: 20px;
    }
  }

  .part-selected-list {
    height: 100%;
    padding: 10px;
    overflow-y: auto;

    .part-selected-row {
      display: flex;
      flex-flow: row nowrap;
      line-height: 36px;
      border-bottom: 1px solid #ebeef5;
      font-size: 13px;

      &:hover {
        background-color: #f5f7fa;

        .part-selected-delete {
          visibility: visible;
        }
      }
    }

    .part-selected-head {
      background-color: #f0f5f5;
      color: #333;
      font-size: 14px;
    }

    .part-selected-sn {
      padding-left: 10px;
      width: 70px;
      @include text-ellipsis;
    }

    .part-selected-name {
      padding-left: 10px;
      flex: 1;
      @include text-ellipsis;
    }

    .part-selected-delete {
      width: 36px;
    }

    .part-selected-row button.part-selected-delete {
      padding: 0;
      width: 36px;
      height: 36px;
      border: none;
      background-color: transparent;
      outline: none;
      color: #646b78;
      visibility: hidden;

      i {
        font-size: 14px;
      }

      &:hover {
        color: #e84040;
      }
    }
  }
}

.part-panel-btn {
  float: right;
  cursor: pointer;
  width: 16px;
  height: 16px;
  background: url("../../../assets/img/clear.png") no-repeat center;
  background-size: cover;

  &:hover {
    background: url("../../../assets/img/clear-hover.png") no-repeat center;
    background-size: cover;
  }
}

.flex-x {
  display: flex;
  align-items: center;
}
.flex-1 {
  flex: 1;
}

a {
  cursor: pointer;
}
.group-select {
  display: inline-block;
}
.mar-b-15 {
  margin-bottom: 15px;
}
.mar-r-15 {
  margin-right: 15px;
}
.ding-btn {
  color: $color-ding-blue;
  cursor: pointer;
}

.showMore{
  color:$color-primary;
  cursor:pointer;
}
</style>

<style lang='scss' scoped>
.tooltipWrapper{
  background: #fe8b2514;
  font-size: 12px;
  padding: 0 7px;
  line-height: 28px;

  .toolText{
    cursor: pointer;
    color:$color-primary;
  }
}

.state-text{
  border-radius: 11px;
  text-align: center;
  width: 54px;
  height: 22px;
  font-size: 12px;
  box-sizing: border-box;
  line-height: 20px;
}
// 已办理
.state-solved{
  color:#67C23A;
  background: rgba(103,194,58,.2);
  border:1px solid rgba(103,194,58,.16);
}
// 待办理，办理中
.state-suspending,.state-dealing{
  color:#FAAE14;
  background: rgba(250,174,20,.2);
  border:1px solid rgba(250,174,20,.16);
}
// 已取消,已撤回
.state-cancel,.state-revoked{
  color:#999999;
  background: rgba(153,153,153,.2);
  border:1px solid rgba(153,153,153,.16);
}
// 已拒绝
.state-rejected{
  color:#F56C6C;
  background: rgba(245,108,108,.2);
  border:1px solid rgba(245,108,108,.16);
}
</style>