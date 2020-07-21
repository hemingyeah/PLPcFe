<template>
  <div class="page">

    <div class="base-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="model.keyWord" placeholder="根据备件信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="model.pageNum=1;search()" native-type="submit">
            搜索
          </base-button>
          <base-button type="ghost" @event="reset();trackEventHandler('reset')">
            重置
          </base-button>
        </div>
        <span class="advanced-search-visible-btn" @click="isExpand = !isExpand;trackEventHandler('advSearch')">
          <i :class="`iconfont ${isExpand ? 'el-icon-minus' : 'el-icon-plus'}`" ></i>
          高级搜索
        </span>
      </form>
    </div>

    <form @submit.prevent="search();trackEventHandler('search')">
      <!--<div class="page-panel">  -->
      <!--<div class="page-panel-body search-form-nano">-->
      <!--<el-input v-model="model.keyWord" placeholder="根据备件信息搜索"></el-input>-->
      <!--<el-button-group>-->
      <!--<el-button type="primary" native-type="submit">搜索</el-button>-->
      <!--<el-button @click="reset();trackEventHandler('reset')">重置</el-button>-->
      <!--</el-button-group>-->
      <!--<el-button type="text" @click="isExpand = !isExpand;trackEventHandler('advSearch')" :icon="isExpand ? 'el-icon-minus' : 'el-icon-plus'">高级搜索</el-button>-->
      <!--</div>-->
      <!--</div>-->
      <!-- 高级搜索  -->
      <base-collapse-panel :value="isExpand" class="page-panel">
        <div class="page-panel-head">
          <h5>高级搜索</h5>
        </div>
        <div class="page-panel-body">
          <div v-if="listType != 'personProcess'">
            <div class="form-row">
              <div class="form-item">
                <label>备件名称</label>
                <div class="form-item-content">
                  <el-select popper-class="common-advance-popper" style="width:100%;"
                             :value="partData.id"   
                             @input="chooseSparepart"
                             filterable
                             clearable
                             remote
                             placeholder="搜索备件"
                             :remote-method="fetchSparepart"
                             :loading="partData.loading">

                    <el-option
                      v-for="item in partData.options"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                      <div class="part-option">
                        <p>编号：{{item.serialNumber}}</p>
                        <p>名称：{{item.name}}</p>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>
              <div class="form-item">
                <template v-if="listType == 'part'">
                  <label>备件类别</label>
                  <div class="form-item-content">
                    <el-select placeholder="请选择备件类别" v-model="model.type">
                      <el-option label="全部" value=""></el-option>
                      <el-option :label="item" :value="item" v-for="item in types" :key="item"></el-option>
                    </el-select>
                  </div>
                </template>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <template v-if="personDataLevel > 1">
                  <label>服务团队</label>
                  <div class="form-item-content">
                    <biz-team-select :value="tag" @input="chooseTeam"/>
                    <!-- <el-select placeholder="请选择备件类别" v-model="model.teamId" @change="chooseTeam">
                      <el-option label="全部" :value="null"></el-option>
                      <el-option :label="item.name" :value="item.id" v-for="item in filteredTeams" :key="item.id"></el-option>
                    </el-select> -->
                  </div>
                </template>
              </div>
              <div class="form-item"></div>
            </div>
          </div>
          <!-- 个人处理 -->
          <div v-else>
            <div class="form-row">
              <div class="form-item">
                <label>类型</label>
                <div class="form-item-content">
                  <el-select placeholder="请选择备件类别" v-model="modelOther.typeSpec">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="分配" value="分配"></el-option>
                  </el-select>
                </div>
              </div>
              <div class="form-item">
                <label>是否启用</label>
                <div class="form-item-content">
                  <el-select placeholder="是否启用" v-model="modelOther.enable">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="启用" value="1"></el-option>
                    <el-option label="禁用" value="0"></el-option>
                  </el-select>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-item">
                <label>备件类别</label>
                <div class="form-item-content">
                  <el-select popper-class="common-advance-popper" style="width: 100%;"
                             :value="modelOther.sparepartType"
                             @input="hooseSparepartType"
                             filterable
                             clearable
                             remote
                             placeholder="选择备件类别">
                    <el-option
                      v-for="item in types"
                      :key="item"
                      :label="item"
                      :value="item">
                      <div class="part-option">
                        <p>{{item}}</p>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="form-item">
                <div class="form-item">
                  <label>备件名称</label>
                  <div class="form-item-content">
                    <el-select popper-class="common-advance-popper" style="width: 100%;"
                               :value="modelOther.sparepartId"
                               @input="chooseSparepart"
                               filterable
                               clearable
                               remote
                               placeholder="选择备件"
                               :remote-method="fetchSparepart"
                               :loading="sparepart.loading">

                      <el-option
                        v-for="item in sparepart.options"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
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

            <div class="form-row">  
              <div class="form-item">
                <label>发起人</label>
                <div class="form-item-content">
                  <el-select class="srp-list-form-item" style="width: 100%;"
                             :value="modelOther.propser"   
                             @input="chooseUserApply"
                             filterable
                             clearable
                             remote
                             placeholder="选择人员"
                             :remote-method="fetchUserApply"
                             :loading="userApply.loading">

                    <el-option
                      v-for="item in userApply.options"
                      :key="item.userId"
                      :label="item.displayName"
                      :value="item.userId">

                      <div class="srp-user-item">
                        <img :src="item.head || '/resource/images/account_userhead.png'">
                        <p>{{item.displayName}}</p>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>
              <div class="form-item">
                <div class="form-item">
                  <label>状态</label>
                  <div class="form-item-content">
                    <el-select v-if="listType == 'personProcess'" :value="state" @input="chooseState" class="srp-list-form-item">
                      <el-option value="" label="全部"></el-option>
                      <el-option value="suspending" label="待办理"></el-option>
                      <el-option value="solved" label="已办理"></el-option>
                    </el-select>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>发起日期</label>
                <div class="form-item-content">
                  <el-date-picker @change="seeTime" style="width:100%"
                                  v-model="timeValue"
                                  type="daterange"
                                  align="right"
                                  unlink-panels
                                  range-separator="至"
                                  start-placeholder="开始日期"
                                  end-placeholder="结束日期"
                                  :picker-options="pickerOptions2">
                  </el-date-picker>
                </div>
              </div>
              <div class="form-item">
                <label>办理日期</label>
                <div class="form-item-content">
                  <el-date-picker @change="seeUpdateTime" style="width:100%"
                                  v-model="updateTimeValue"
                                  type="daterange"
                                  align="right"
                                  unlink-panels
                                  range-separator="至"
                                  start-placeholder="开始日期"
                                  end-placeholder="结束日期"
                                  :picker-options="pickerOptions2">
                  </el-date-picker>
                </div>
              </div>
            </div>
          </div>
          <!--  重置 确定 -->
          <div class="form-row" style="margin-top: 10px">
            <div class="text-right" style="width:100%;">
              <!--<el-button @click="reset">重置</el-button>-->
              <base-button type="ghost" @event="reset">重置</base-button>
              <base-button type="primary" native-type="submit">确定</base-button>
              <!--<el-button type="primary" native-type="submit">确定</el-button>-->
            </div>
          </div>
        </div>
      </base-collapse-panel>
      <!--  -->
    </form>

    <div class="page-panel" style="margin: 0">
      <div class="page-panel-body srp-list-form">
        <div>
          <el-select class="srp-list-form-item" style="width: 180px;"
                     v-if="personDataLevel > 1"
                     :value="user.userId"   
                     @input="chooseUser"
                     filterable
                     clearable
                     remote
                     placeholder="搜索人员"
                     :remote-method="fetchUser"
                     :loading="user.loading">

            <el-option
              v-for="item in user.options"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId">

              <div class="srp-user-item">
                <img :src="item.head || '/resource/images/account_userhead.png'">
                <p>{{item.displayName}}</p>
              </div>
            </el-option>
          </el-select>

          <el-select placeholder="要展示的数据" :value="listType" @input="chooseType" class="srp-list-form-item" style="width: 120px;">
            <el-option label="持有备件" value="part"></el-option>
            <el-option label="库存记录" value="stockRecord"></el-option>
            <el-option label="使用记录" value="useRecord"></el-option>
            <el-option label="个人库办理" value="personProcess"></el-option>
          </el-select>
          <el-date-picker class="srp-list-form-item" style="width:350px;"
                          v-if="listType != 'part' && listType != 'personProcess'"
                          :value="dateRange"
                          @input="chooseDate"
                          type="daterange"
                          align="right"
                          unlink-panels
                          range-separator="-"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期">
          </el-date-picker>
          <span v-if="listType === 'part' && this.user.userId" style="margin-left: 10px">个人库存品类：{{sparepartStatistics.sparepartNumTotal}}</span>
          <span v-if="listType === 'part'" style="margin-left: 10px">个人库存数量：{{Number(sparepartStatistics.sparepartCountTotal)}} </span>
        </div>

        <div>
          <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150"> 
            <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn" >选择列<i class="iconfont icon-nav-down"></i></span>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="column in columns" :key="column.field"> 
                <el-checkbox class="dropdown-item" :value="column.show" @input="chooseColnum(column, listType)">{{column.label}}</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> 

          <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150" v-if="allowImportAndExport && listType != 'personProcess'" @command="trackEventHandler('moreAction')">
            <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn">
              更多操作<i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item> 
                <span class="dropdown-item" @click="exportData(false)">导出</span>
              </el-dropdown-item>
              <el-dropdown-item> 
                <span class="dropdown-item" @click="exportData(true)">导出全部</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> 
        </div>
      </div>
    </div>

    <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="selected" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
    </div>

    <div class="table-container">
      <el-table :data="page.list" ref="table"
                @sort-change="sort"
                key="pageListTable"
                header-row-class-name="base-table-header"
                @select="handleSelection"
                @select-all="handleSelection" stripe >
        <el-table-column
          type="selection"
          width="44">
        </el-table-column>

        <template v-if="listType == 'part'">
          <template v-for="column in showColumns">
            <el-table-column
              v-if="column.field == 'operate'"
              :key="column.field"
              :label="column.label"
              :width="column.width">

              <template slot-scope="scope" v-if="scope.row.userId == userId && (scope.row.repertoryCount - scope.row.occupyNum) > 0 ">
                <el-button type="text" class="no-padding" @click="partBack(scope.row)">退回</el-button>
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="column.field == 'repertoryCount'"
              :key="column.field"
              :label="column.label"
              :width="column.width"
            >
              <template slot-scope="scope" >{{repertoryCount(scope.row.repertoryCount, scope.row.applyBacking)}} </template>
            </el-table-column>

            <!-- 不可用数量 -->
            <el-table-column
              v-else-if="column.field == 'unavailableNum'"
              :key="column.field"
              :label="column.label"
              :width="column.width"
            >
              <template slot-scope="scope">
                <el-popover
                  placement="top-start"
                  width="250"
                  trigger="hover"
                  @after-leave="isTooltipShow = false">
                  <div class="unavailable-content">
                    <p>{{scope.row.occupyNum}}个备件由工单占用 <span class="unavailable-content-btn" v-if="scope.row.occupyNum" @click="getApplyBackingTask(scope.row)">查看</span></p>
                    <p>{{scope.row.applyBacking}}个备件正在退回仓库</p>
                    <div class="unavailable-content-box" v-if="isTooltipShow">
                      <p class="title">
                        <span>占用工单</span>
                        <i class="el-dialog__close el-icon el-icon-close" @click="isTooltipShow = false"></i>
                      </p>
                      <a
                        class="task-link"
                        v-for="item in applyBackingTask"
                        :key="item.taskNo"
                        :href="`/task/view/${item.id}`"
                        :data-id="item.id"
                        @click.prevent="openTaskDetail(item)">
                        {{item.taskNo}}
                      </a>
                      <!-- <a class="task-link" href="http://www.baidu.com" target="_blank">TUY5119090052</a>
                      <a class="task-link" href="http://www.baidu.com" target="_blank">TUY5119090052</a> -->
                    </div>
                  </div>
                  <span slot="reference">{{scope.row.unavailableNum}}</span>
                </el-popover>
              </template>
            </el-table-column>

            <el-table-column
              v-else
              :key="column.field"
              :label="column.label"
              :width="column.width"
              :prop="column.field"
              :sortable="column.sortable"
              show-overflow-tooltip>
            </el-table-column>
          </template>
        </template>

        <template v-else-if="listType == 'stockRecord'">
          <template v-for="column in showColumns">
            <el-table-column v-if="column.field == 'remark'"
                             :key="column.field"
                             :label="column.label"
                             :width="column.width"
                             :min-width="column.minWidth"
                             :prop="column.field">

              <template slot-scope="scope">
                <el-tooltip class="item" placement="top" popper-class="common-tooltip">
                  <div slot="content" class="pre">{{scope.row[column.field]}}</div>
                  <div class="text-overflow-hidden">{{scope.row[column.field]}}</div>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column v-else
                             :key="column.field"
                             :label="column.label"
                             :width="column.width"
                             :min-width="column.minWidth"
                             :prop="column.field"
                             show-overflow-tooltip>
            </el-table-column>
          </template>
        </template>

        <template v-else-if="listType == 'useRecord'">
          <template v-for="column in showColumns">
            <el-table-column
              :key="column.field"
              :label="column.label"
              :width="column.width"
              :min-width="column.minWidth"
              :prop="column.field"
              show-overflow-tooltip>

            </el-table-column>
          </template>
        </template>

        <template v-else-if="listType == 'personProcess'">
          <template v-for="(column, index) in showColumns">

            <el-table-column v-if="column.field == 'variation'" :key="index + '123'" slot-scope="scope">
              {{scope.row.variation - scope.row.solvedVariation}}111
            </el-table-column>
            <el-table-column
              v-if="column.field == 'operate'"
              :key="index + '123'"
              :fixed="column.fixed || ''"
              :label="column.label"
              :width="column.width">

              <template slot-scope="scope">
                <!-- 分配 -->
                <template v-if="scope.row.state == 'suspending' && scope.row.type =='分配'">
                  <el-tooltip class="item" effect="dark" content="当前状态为个人库未接受状态" placement="bottom">
                    <el-button type="text" size="medium" class="no-padding" style="color:#333;cursor: text;" key="00"> 待入库</el-button>
                  </el-tooltip>
                  <!-- 当前用户与目标库用户 一直 并且 待办理数大于0 -->
                  <el-button key="11" v-if="userId == scope.row.targetId && scope.row._variation > 0" type="text" class="no-padding" @click="receiveAndRejectDialog(scope.row, '0')">接收</el-button>
                  <el-button key="22" v-if="userId == scope.row.targetId && scope.row._variation > 0" type="text" class="no-padding" @click="receiveAndRejectDialog(scope.row, '1')" style="margin-left: 15px">拒收</el-button>
                </template>
                <template v-if="scope.row.state == 'solved' && scope.row.type =='分配'">
                  <el-button type="text" size="medium" class="no-padding" style="color:#333;cursor: text;" key="33"> 已入库</el-button>
                </template>
                <template v-if="scope.row.state == 'revoked' && scope.row.type =='分配'">
                  <el-button type="text" size="medium" class="no-padding" style="color:#333;cursor: text;" key="44"> 已撤回</el-button>
                </template>
                <template v-if="scope.row.state == 'rejected' && scope.row.type =='分配'">
                  <el-button type="text" size="medium" class="no-padding" style="color:#333;cursor: text;" key="55"> 已退回</el-button>
                </template>
              </template>
            </el-table-column>

            <el-table-column
              v-else
              :key="index"
              :label="column.label"
              :width="column.width"
              :min-width="column.minWidth"
              :prop="column.field"
              :sortable="column.sortable"
              show-overflow-tooltip>
            </el-table-column>
          </template>
        </template>

      </el-table>

    </div>

    <div class="table-footer">
      <div class="list-info">
        共<span class="level-padding">{{page.total}}</span>记录，
        已选中<span class="base-table-selected-count" @click="multipleSelectionPanelShow = true">{{selected.length}}</span>条
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
        :total="page.total">
      </el-pagination>
    </div>

    <el-dialog title="备件分配操作" :visible.sync="isReceiveAndRejectDialog" width="600px">
      <part-receive-reject-form v-if="isReceiveAndRejectDialog" ref="partReceiveRejectFom" :formdata="formdata" :receive-or-reject="receiveOrReject"></part-receive-reject-form>
      <div slot="footer" class="dialog-footer">

        <base-button type="ghost" @event="isReceiveAndRejectDialog = false" >取 消</base-button>
        <base-button type="primary" @event="receiveAndReject" >确 定</base-button>

        <!--<el-button @click="isReceiveAndRejectDialog = false">取 消</el-button>-->
        <!--<el-button type="primary" @click="receiveAndReject">确 定</el-button>-->
      </div>
    </el-dialog>

    <base-export ref="exportPanel" 
                 v-if="allowImportAndExport"
                 :columns="columns"
                 :action="exportAction"
                 :method="'post'"></base-export>

    <part-back-form ref="partBackForm" @success="loadData" :repertory="repertory" ></part-back-form>

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title" style="display: flex;justify-content: space-between;align-items: center">
        <span>已选中数据({{selected.length}})</span>
        <span v-if="selected.length" class="part-panel-btn" @click="toggleSelection()" title="清空已选中数据" data-placement="right" v-tooltip></span>
      </h3>

      <div class="part-selected-panel">
        <div class="part-selected-tip" v-if="!selected.length">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>

          <div class="part-selected-list" v-if="listType === 'part' || listType === 'stockRecord' || listType === 'useRecord'">
            <div class="part-selected-row part-selected-head">
              <span class="part-selected-sn">编号</span>
              <span class="part-selected-name">名称</span>
            </div>
            <div class="part-selected-row" v-for="c in selected" :key="c.id">
              <span class="part-selected-sn">{{c.sparepart.serialNumber}}</span>
              <span class="part-selected-name">{{c.sparepart.name}}</span>
              <button type="button" class="part-selected-delete" @click="cancelSelectPart(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>

          <div class="part-selected-list" v-if="listType === 'personProcess'">
            <div class="part-selected-row part-selected-head">
              <span class="part-selected-sn">发起时间</span>
              <span class="part-selected-name">发起人</span>
            </div>
            <div class="part-selected-row" v-for="c in selected" :key="c.id">
              <span class="part-selected-sn">{{c.propserTime}}</span>
              <span class="part-selected-name">{{c.targetName}}</span>
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
import DateUtil from '@src/util/date'
import AuthUtil from '@src/util/auth';
import StorageUtil from '@src/util/storageUtil';

import PartBackForm from './form/PartBackForm.vue';  
import PartReceiveRejectFom from './form/PartReceiveRejectFom.vue';

const STORAGE_PART_COLNUM_KEY = 'repe_person_part_list_column';
const STORAGE_STOCK_COLNUM_KEY = 'repe_person_stock_list_column';
const STORAGE_USE_COLNUM_KEY = 'repe_person_use_list_column';
const STORAGE_PROCESS_COLNUM_KEY = 'repe_person_process_list_column';

const STORAGE_PART_PAGESIZE_KEY = 'repe_person_list_part_pagesize';
const STORAGE_STOCK_PAGESIZE_KEY = 'repe_person_list_stock_pagesize';
const STORAGE_USE_PAGESIZE_KEY = 'repe_person_list_use_pagesize';
const STORAGE_PROCESS_PAGESIZE_KEY = 'repe_person_list_process_pagesize';

export default {
  name: 'sparepart-repertory-person-view',
  inject: ['initData'],
  data(){
    let pageSize = StorageUtil.get(STORAGE_PART_PAGESIZE_KEY) || 10;

    let originModel = {
      pageNum: 1,
      pageSize,
      type: '',
      keyWord: '',
      sortBy: {},
      teamId: null,
    };
    let processModel = {
      enable: '',
      sparepartType: '',
      sparepartId: '',
      propser: '',
      approver: '',
      timeEnd: '',
      timeStart: '',
      updateTimeEnd: '',
      updateTimeStart: '',
      typeSpec: ''
    }
    return {
      multipleSelectionPanelShow: false,
      selectedLimit: 500,
      tag: [],
      auths: {},
      tab: '', // 页签展示
      userId: '', // 当前用户的Id
      tagIds: [], // 当前用户的团队
      tagIdsWithChildTag: [], // 包含子团队
      isExpand: false,
      columns: this.buildColumns(),
      types: [],
      sparepartStatistics:{
        sparepartNumTotal: 0,
        sparepartCountTotal: 0,
      },

      listType: 'part',
      user: {
        userId: null,
        loading: false,
        options: []
      },
      dateRange: [],

      originModel,
      processModel,
      model: _.assign({}, originModel),
      page: new Page(),
      selected: [],

      partData: {
        id: '',
        loading: false,
        options: []
      },
      userApply: {
        userId: '',
        loading: false,
        options: []
      },
      userApprove: {
        userId: '',
        loading: false,
        options: []
      },
      sparepart: {
        sparepartType: '',
        sparepartId: '',
        loading: false,
        options: []
      },
      
      repertory:[],
      // teams: [],
      formdata: {},
      receiveOrReject: '0',
      isReceiveAndRejectDialog: false,
      state: '', // 状态
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      timeValue: '', 
      updateTimeValue:'',
      modelOther: _.assign({}, processModel),
      isTooltipShow: false,
      applyBackingTask: {}
    }
  },
  computed: {
    // 是否允许导入导出
    allowImportAndExport(){
      return AuthUtil.hasAuth(this.auths, 'EXPORT_IN')
    },
    showColumns(){
      return this.columns.filter(col => col.show);
    },
    /**
     * 个人备件库权限下的数据权限
     * 全部权限 - 值为3，能够查询所有人的数据
     * 团队权限 - 值为2，能够查看所属团队人员的数据 
     * 个人权限 - 值为1，能够查看自己的数据
     */
    personDataLevel(){
      return this.auths.VIP_SPAREPART_PERSION || 0;
    },
    exportAction(){
      let action = '/partV2/repertory/person/exportStockRecord';
      if(this.listType == 'useRecord') action = '/partV2/repertory/person/exportUseRecord';
      if(this.listType == 'part') action = '/partV2/repertory/person/exportSparepartUser';
      return action;
    },
    // filteredTeams() {
    //   if (this.personDataLevel <= 1) return [];
    //   if (this.personDataLevel === 2) {
    //     return this.teams.filter(team => this.tagIds.some(tagId => tagId === team.id)) || [];
    //   }
    //   return this.teams || [];
    // },
  },
  methods: {
    repertoryCount(num1, num2) {
      return this.$math.format(this.$math.add(this.$math.bignumber(num1), this.$math.bignumber(num2)))
    },

    async getApplyBackingTask (row) {
      let params = {
        sparepartUserId: row.id
      }
      let result = await this.$http.get('/partV2/repertory/getTaskBySparepartId', params);
      if(result.status == 0){
        this.applyBackingTask = result.data;
        this.isTooltipShow = true;
      }else{
        this.$platform.alert(result.message);
      }
    },

    openTaskDetail(item){
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `taskView_${item.id}`,
        url:`/task/view/${item.id}`,
        title: '正在加载',
        close: true,
        fromId
      })
    },

    //
    cancelSelectPart(part) {
      if (!part || !part.id) return;
      this.selected = this.selected.filter(ms => ms.id !== part.id);
      this.toggleSelection([part]);
    },
    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (rows) {
        for(let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
            return item.id !== row.id;
          })
          if(isNotOnCurrentPage) return
        }
        rows.forEach(row => {
          this.$refs.table.toggleRowSelection(row);
        });
      } else {
        this.$refs.table.clearSelection();
        this.selected = [];
      }
    },
    // select part
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      // 在需要限制最多选择500个备件时，取消function内部全部注释即可
      let original = this.selected
        .filter(ms => this.page.list.some(cs => cs.id === ms.id));
      let unSelected = this.page.list
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.table.toggleRowSelection(row, false);
            })
            : this.$refs.table.clearSelection();
        })
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.selected = tv;

      this.$refs.baseSelectionBar.openTooltip();
    },
    computeSelection(selection) {
      let tv = [];
      tv = this.selected
        .filter(ms => this.page.list.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    matchSelected() {
      if (!this.selected.length) return;
      const selected = this.page.list
        .filter(c => {
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
    seeTime(){
      if(!this.timeValue) {
        delete this.modelOther.timeStart;
        delete this.modelOther.timeEnd;
      } else {
        this.modelOther.timeStart = DateUtil.format(this.timeValue[0])
        this.modelOther.timeEnd = DateUtil.format(this.timeValue[1], 'yyyy-MM-dd 23:59:59')
      }
    },
    seeUpdateTime(){
      if(!this.updateTimeValue) {
        delete this.modelOther.updateTimeStart;
        delete this.modelOther.updateTimeEnd;
      } else {
        this.modelOther.updateTimeStart = DateUtil.format(this.updateTimeValue[0])
        this.modelOther.updateTimeEnd = DateUtil.format(this.updateTimeValue[1], 'yyyy-MM-dd 23:59:59')
      }
    },
    chooseTeam(value) {
      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.model.teamId = tag.id;

      this.user.userId = null;
      this.fetchUser();
    },
    exportData(exportAll = false){
      if(!this.allowImportAndExport) return;

      let ids = [];
      let title = '库存记录';
      if(this.listType == 'useRecord') title = '使用记录';
      if(this.listType == 'part') title = '持有备件';
      let fileName = `${DateUtil.format(new Date(), 'yyyy-MM-dd')}个人备件库${title}.xlsx`;

      if(!exportAll){
        if(this.selected.length == 0) return this.$platform.alert('请选择要导出的数据');
        ids = this.selected.map(item => item.id);
      }

      let params = {};  
      if(exportAll && this.personDataLevel == 1) params.userId = this.userId;

      this.$refs.exportPanel.open(ids, fileName, params);
    },
    chooseSparepart(value){
      if(this.listType != 'personProcess') {
        this.partData.id = value;
      } else {
        this.modelOther.sparepartId = value;
      }
    },
    chooseColnum(column, type){
      this.trackEventHandler('selectColumn');

      column.show = !column.show;

      let key = STORAGE_PART_COLNUM_KEY;
      if(type == 'stockRecord') key = STORAGE_STOCK_COLNUM_KEY;
      if(type == 'useRecord') key = STORAGE_USE_COLNUM_KEY;
      if(type == 'personProcess') key = STORAGE_PROCESS_COLNUM_KEY;

      let data = {};
      this.columns.forEach(item => data[item.field] = item.show)
      StorageUtil.save(key, data);
    },
    async partBack(stock){
      this.trackEventHandler('listBack');

      this.$refs.partBackForm.open(stock)
    },
    chooseType(value){
      this.trackEventHandler('chooseType')

      if(this.listType == value) return;

      this.$set(this, 'listType', value);
      let columns = this.buildColumns();

      if(value == 'stockRecord') columns = this.buildStockColumns();
      if(value == 'useRecord') columns = this.buildUseColumns();
      if(value == 'personProcess') columns = this.buildProcessColums();
      
      this.$set(this, 'columns', columns);
      this.model.pageNum = 1;

      this.page.list = [];
      this.selected = [];

      let key = STORAGE_PART_PAGESIZE_KEY;
      if(this.listType == 'stockRecord') key = STORAGE_STOCK_PAGESIZE_KEY;
      if(this.listType == 'useRecord') key = STORAGE_USE_PAGESIZE_KEY;
      if(this.listType == 'personProcess') key = STORAGE_PROCESS_PAGESIZE_KEY;

      let pageSize = StorageUtil.get(key) || 10;
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;

      this.loadData();
    },
    chooseDate(range){
      this.dateRange = range;
      this.loadData();
    },
    chooseUser(value){
      this.trackEventHandler('choosePerson');

      if(this.user.userId == value) return;

      this.user.userId = value;
      this.model.pageNum = 1;
      this.loadData();
    },
    // 改变状态
    chooseState(value) {
      this.state = value;
      this.loadData();
    },
    chooseUserApply(value){
      if(this.modelOther.propser == value) return;
      // this.userApply.userId = value;
      this.modelOther.propser = value;
    },
    chooseUserApprove(value){
      if(this.modelOther.approver == value) return;
      this.modelOther.approver = value;
    },
    hooseSparepartType(value) {
      this.modelOther.sparepartType = value;
    },
    fetchUser(keyword){
      if(this.personDataLevel == 1) return;

      let model = {
        keyword,
        pageSize: 50
      }

      if(this.personDataLevel == 2) {
        // model.tagIds = this.tagIds;
        model.tagIds = this.tagIdsWithChildTag
      }

      // 如果选择了服务团队，限定搜索人员只能返回该团队的人
      if (this.model.teamId) {
        model.tagIds = [this.model.teamId];
      }

      this.user.loading = true
      this.$http.get('/partV2/repertory/users', model)
        .then(result => this.user.options = result)
        .catch(err => console.warn(err))
        .finally(() => this.user.loading = false);
    },
    select(data){
      this.selected = data;
    },
    jump(pageNum){
      this.model.pageNum = pageNum;
      this.loadData();
    },
    pageSizeChange(pageSize){
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;

      this.loadData();

      let key = STORAGE_PART_PAGESIZE_KEY;
      if(this.listType == 'stockRecord') key = STORAGE_STOCK_PAGESIZE_KEY;
      if(this.listType == 'useRecord') key = STORAGE_USE_PAGESIZE_KEY;
      if(this.listType == 'useRecord') key = STORAGE_USE_PAGESIZE_KEY;
      if(this.listType == 'personProcess') key = STORAGE_PROCESS_PAGESIZE_KEY;

      StorageUtil.save(key, pageSize);
    },
    search(){
      this.model.pageNum = 1;
      this.loadData();
    },
    reset(){
      this.model = _.assign({}, this.originModel);
      this.partData.id = '';
      this.$refs.table.clearSort();

      this.timeValue = [];
      this.updateTimeValue = [];
      this.state = '';
      this.modelOther = _.assign({}, this.processModel);
      
      this.loadData();
    },
    sort({column, prop, order}){
      let sortBy = {};
      
      if(prop && this.listType == 'part'){
        let tableName = 'userSparepart';
        let key = `${tableName}.${prop}`
        sortBy[key] = order == 'ascending';
      }

      this.model.sortBy = sortBy;
      this.loadData();
    },
    async loadData(){
      let loading = this.$loading();
      try{
        let listType = this.listType;
        let fn = this.fetchData;
        if(listType == 'stockRecord') fn = this.fetchStockRecord;
        if(listType == 'useRecord') fn = this.fetchUseRecord;
        if(listType == 'personProcess') fn = this.fetchProcessRecord;
        if(this.listType != 'part') this.model.sortBy = {};

        if(listType != 'personProcess') {
          this.page = await fn();
        } else {
          let result = await fn();
          this.$set(this, 'page', result.data);
          this.page.list.forEach(item => {
            this.$set(item, '_variation', item.variation - item.solvedVariation)
          })
        }
        this.model.pageNum = this.page.pageNum;
        this.model.pageSize = this.page.pageSize;

        this.matchSelected();
      }catch(error){
        console.warn(error)
      }
      this.$nextTick(() => loading.close());
    },
    fetchUserApply(keyword){
      // 获取用户
      let model = {
        keyword,
        pageSize: 50
      }
      this.userApply.loading = true
      this.$http.get('/partV2/repertory/user/list', model)
        .then(result => this.userApply.options = result.list)
        .catch(err => console.log(err))
        .finally(() => this.userApply.loading = false);
    },
    fetchUserApprove(keyword){
      // 获取用户
      let model = {
        keyword,
        pageSize: 50
      }
      this.userApply.loading = true
      this.$http.get('/partV2/repertory/user/list', model)
        .then(result => this.userApprove.options = result.list)
        .catch(err => console.log(err))
        .finally(() => this.userApprove.loading = false);
    },
    fetchData(){
      let userId = this.userId;

      // 如果是管理员可查看他人数据
      if(this.personDataLevel > 1){
        userId = this.user.userId;
      }

      let params = {
        userId,
        ...this.model,
        sparepartId: this.partData.id
      }

      return this.$http.get('/partV2/repertory/person/list', params).then(result => {
        let list = result.list || [];
        list.forEach(item => item.disabled = false);

        this.sparepartStatistics.sparepartNumTotal = result.sparepartNumTotal || 0;
        this.sparepartStatistics.sparepartCountTotal = result.sparepartCountTotal || 0;
        return result;
      })
    },
    fetchStockRecord(){
      let userId = this.userId;
      // 如果是管理员可查看他人数据
      if(this.personDataLevel > 1){
        userId = this.user.userId;
      }

      let params = {
        ...this.model,
        userId,
        sparepartId: this.partData.id
      };

      if(Array.isArray(this.dateRange)){
        let [start, end] = this.dateRange;
      
        if(start && end){
          params.timeStart = DateUtil.format(start, 'yyyy-MM-dd 00:00:00');
          params.timeEnd = DateUtil.format(end, 'yyyy-MM-dd 23:59:59');
        }
      }
      
      // 删除type字段，备件type和记录type冲突
      delete params.type;

      return this.$http.get('/partV2/repertory/person/stockRecord', params)
    },
    fetchUseRecord(){
      let userId = this.userId;
      // 如果是管理员可查看他人数据
      if(this.personDataLevel > 1){
        userId = this.user.userId;
      }

      let params = {
        ...this.model,
        userId,
        sparepartId: this.partData.id
      };

      if(Array.isArray(this.dateRange)){
        let [start, end] = this.dateRange;
      
        if(start && end){
          params.timeStart = DateUtil.format(start, 'yyyy-MM-dd 00:00:00');
          params.timeEnd = DateUtil.format(end, 'yyyy-MM-dd 23:59:59');
        }
      }

      // 删除type字段，备件type和记录type冲突
      delete params.type;

      return this.$http.get('/partV2/repertory/person/useRecord', params)
    },
    // 个人处理 
    fetchProcessRecord() {
      let targetId = '';
      // 如果是管理员可查看他人数据
      if(this.personDataLevel > 1){
        targetId = this.user.userId;
      }      
      let params = {
        ...this.model,
        ...this.modelOther,
        state: this.state,
        targetId
      };
      if(Array.isArray(this.dateRange)){
        let [start, end] = this.dateRange;
      
        if(start && end){
          params.timeStart = DateUtil.format(start, 'yyyy-MM-dd 00:00:00');
          params.timeEnd = DateUtil.format(end, 'yyyy-MM-dd 23:59:59');
        }
      }
      
      // 删除type字段，备件type和记录type冲突
      delete params.type;

      return this.$http.get('/partV2/approve/list/allApprove/person', params)
    },
    buildColumns(){
      let localData = StorageUtil.get(STORAGE_PART_COLNUM_KEY) || {};

      let columns = [
        {
          label: '编号',
          field: 'sparepart.serialNumber',
          show: true
        },
        {
          label: '名称',
          field: 'sparepart.name',
          show: true
        },
        {
          label: '备件类别',
          field: 'sparepart.type',
          show: true,
          width: 150
        },
        {
          label: '备件规格',
          field: 'sparepart.standard',
          show: true,
          width: 150
        },
        {
          label: '数量',
          field: 'repertoryCount',
          show: true,
          sortable: 'custom',
          width: 120
        },
        {
          label: '不可用数量',
          field: 'unavailableNum',
          show: true,
          width: 120
        },
        {
          field: 'userName',
          label: '个人库',
          show: true,
          width: 120
        },
        {
          label: '操作',
          field: 'operate',
          width: 80,
          show: true,
          export: false
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      return columns;
    },
    buildStockColumns(){
      let localData = StorageUtil.get(STORAGE_STOCK_COLNUM_KEY) || {}
      let columns = [
        {
          field: 'sparepart.serialNumber',
          label: '备件编号',
          show: true,
          minWidth: 120
        },
        {
          field: 'sparepart.name',
          label: '备件名称',
          show: true,
          minWidth: 120
        },
        {
          label: '备件类别',
          field: 'sparepart.type',
          show: true,
          width: 150
        },
        {
          label: '备件规格',
          field: 'sparepart.standard',
          show: true,
          width: 150
        },
        {
          field: 'item',
          label: '类型',
          show: true,
          width: 100
        },
        {
          field: 'variation',
          label: '变化',
          show: true,
          width: 80
        },
        {
          field: 'number',
          label: '结余',
          show: true,
          width: 80
        },
        {
          field: 'userName',
          label: '个人库',
          show: true,
          width: 120
        },
        {
          field: 'propserName',
          label: '发起人',
          show: true,
          width: 120
        },
        {
          field: 'executorName',
          label: '办理人',
          show: true,
          width: 120
        },
        {
          field: 'remark',
          label: '备注',
          show: true,
          minWidth: 150,
          showTip: false
        },
        {
          field: 'recordNo',
          label: '出入库编号',
          show: true,
          minWidth: 200
        },
        {
          field: 'createTime',
          label: '时间',
          show: true,
          width: 180
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      return columns;
    },
    buildUseColumns(){
      let localData = StorageUtil.get(STORAGE_USE_COLNUM_KEY) || {}
      let columns = [
        {
          field: 'sparepart.serialNumber',
          label: '备件编号',
          show: true,
          minWidth: 120
        },
        {
          field: 'sparepart.name',
          label: '备件名称',
          show: true,
          minWidth: 120
        },
        {
          label: '备件类别',
          field: 'sparepart.type',
          show: true,
          width: 150
        },
        {
          label: '备件规格',
          field: 'sparepart.standard',
          show: true,
          width: 150
        },
        {
          field: 'item',
          label: '类型',
          show: true,
          width: 100
        },
        {
          field: 'variation',
          label: '变化',
          show: true,
          width: 80
        },
        {
          field: 'number',
          label: '结余',
          show: true,
          width: 80
        },
        {
          field: 'taskNo',
          label: '工单号',
          show: true,
          width: 150
        },
        {
          field: 'customerName',
          label: '客户名称',
          show: true,
          width: 150
        },
        {
          field: 'customerNumber',
          label: '客户编号',
          show: true,
          width: 150
        },
        {
          field: 'userName',
          label: '个人库',
          show: true,
          width: 120
        },
        {
          field: 'createTime',
          label: '时间',
          show: true,
          width: 180
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      return columns;
    },
    buildProcessColums() {
      let localData = StorageUtil.get(STORAGE_PROCESS_COLNUM_KEY) || {}
      let columns = [
        {
          field: 'propserName',
          label: '发起人',
          show: true,
          minWidth: 120
        },
        {
          field: 'propserTime',
          label: '发起时间',
          show: true,
          minWidth: 180,
          overflow: false
        },
        {
          field: 'sparepartRepertory.sparepart.serialNumber',
          label: '备件编号',
          show: true,
          minWidth: 120
        },
        {
          field: 'sparepartRepertory.sparepart.name',
          label: '备件名称',
          show: true,
          minWidth: 120
        },
        {
          label: '备件类别',
          field: 'sparepartRepertory.sparepart.type',
          show: true,
          minWidth: 120
        },
        {
          label: '备件规格',
          field: 'sparepartRepertory.sparepart.standard',
          show: true,
          minWidth: 120
        },
        {
          field: 'type',
          label: '类型',
          show: true,
          minWidth: 100
        },
        {
          field: 'sparepartRepertory.repertory.name',
          label: '仓库',
          show: true,
          minWidth: 100
        },
        {
          field: 'targetName',
          label: '个人库',
          show: true,
          minWidth: 100
        },
        {
          field: '_variation',
          label: '待办理数',
          show: true,
          minWidth: 80
        },
        {
          field: 'solvedVariation',
          label: '已办理数',
          show: true,
          minWidth: 80
        },
        {
          label: '办理人',
          field: 'executorName',
          show: true,
          minWidth: 120
        },
        {
          label: '办理时间',
          field: 'updateTime',
          show: true,
          minWidth: 180
        },
        {
          field: 'operate',
          label: '操作',
          show: true,
          width: 180,
          minWidth: 160,
          fixed: 'right'
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      return columns;
    },
    /**
     * @param {object} data 数据
     * @param {string} 0 接收 1 拒收
     */
    receiveAndRejectDialog(val, str) {
      this.formdata = val;
      this.receiveOrReject = str;
      this.isReceiveAndRejectDialog = true;
    },
    async receiveAndReject(data) {
      let form = this.$refs.partReceiveRejectFom;
      if(null == form) return;

      let partReceiveRejectFom = await form.pack();
      if(!partReceiveRejectFom) return;

      let loading = this.$loading();
      let params = {
        id: partReceiveRejectFom.applayId,
        solvedVariation: Number(partReceiveRejectFom.sparesNum),
        remark: partReceiveRejectFom.remarks
      };
      try {
        let result;
        let str;
        if(partReceiveRejectFom.operate == 'yes') {
          result = await this.$http.post('/partV2/approve/allot/accept', params);
          str = '接收成功';
        } else {
          result = await this.$http.post('/partV2/approve/allot/reject', params);
          str = '拒收成功'
        }
        if(result.status == 0){

          this.$platform.toast(str);
          this.isReceiveAndRejectDialog = false;
          this.loadData();

        }else{
          this.$platform.alert(result.message);
        }

      } catch (error) {
        console.log(error)
      } finally {
        this.$nextTick(() => loading.close());
      }
    },
    initialize(){
      this.loadData();
      this.fetchRepertory();
      this.fetchUser();
      this.fetchSparepart();
      this.fetchUserApply();
      this.fetchUserApprove();      
    },
    fetchSparepart(keyword){
      let model = {
        keyWord: keyword,
        enable: 1,
        pageSize: 50
      };

      this.partData.loading = true;
      this.sparepart.loading = true;
      this.$http.get('/partV2/repertory/sparepart/list', model)
        .then(result => {
          this.partData.options = result.list;
          this.sparepart.options = result.list;
        })
        .catch(err => console.warn(err))
        .finally(() => {
          this.partData.loading = false;
          this.sparepart.loading = false;
        });
    },
    fetchRepertory(){
      // 获取仓库类型
      return this.$http.get('/partV2/repertory/listForTeam').then(result => {
        this.repertory = result || [];
      })
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      switch (type) {
      case 'search':
        this.$tdOnEvent('pc：个人备件库-搜索事件');
        break;
      case 'reset':
        this.$tdOnEvent('pc：个人备件库-重置事件');
        break;
      case 'advSearch':
        this.$tdOnEvent('pc：个人备件库-高级搜索事件');
        break;
      case 'choosePerson':
        this.$tdOnEvent('pc：个人备件库-搜索人员出入框事件');
        break;
      case 'chooseType':
        this.$tdOnEvent('pc：个人备件库-备件状态下拉框事件');
        break;
      case 'selectColumn':
        this.$tdOnEvent('pc：个人备件库-选择列事件');
        break;
      case 'moreAction':
        this.$tdOnEvent('pc：个人备件库-更多操作事件');
        break;
      case 'listBack':
        this.$tdOnEvent('pc：个人备件库-列表退回事件');
        break;                                                                      
      default:
        break;
      }
    }
  },
  created(){
    let initData = this.initData;
    this.types = initData.sparepartType || [];
    this.auths = initData.auths || {};
    this.userId = initData.userId;
    this.tagIds = initData.tagIds || [];
    this.tagIdsWithChildTag = initData.tagIdsWithChildTag || []
    // this.teams = initData.teams || [];
    this.tab = initData.tab || '0'
    let select = '';
    if(this.tab == '0') select = 'part'
    else if(this.tab == '1') select = 'stockRecord'
    else if(this.tab == '2') select = 'useRecord'
    else if(this.tab == '3') select = 'personProcess'
    this.listType = select;

    let columns = this.buildColumns();

    if(select == 'stockRecord') columns = this.buildStockColumns();
    if(select == 'useRecord') columns = this.buildUseColumns();
    if(select == 'personProcess') columns = this.buildProcessColums();
    
    this.$set(this, 'columns', columns);


    let key = STORAGE_PART_PAGESIZE_KEY;
    if(this.listType == 'stockRecord') key = STORAGE_STOCK_PAGESIZE_KEY;
    if(this.listType == 'useRecord') key = STORAGE_USE_PAGESIZE_KEY;
    if(this.listType == 'useRecord') key = STORAGE_USE_PAGESIZE_KEY;
    if(this.listType == 'personProcess') key = STORAGE_PROCESS_PAGESIZE_KEY;



    this.model.pageSize = StorageUtil.get(key) || 10;

    this.initialize()
  },
  components: {
    [PartBackForm.name]: PartBackForm,
    [PartReceiveRejectFom.name]: PartReceiveRejectFom
  }
}
</script>

<style lang="scss">
 $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
.srp-user-item{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 4px 0;

  &:last-child{
    margin: 0;
  }

  img{
    display: block;
    width: 28px;
    height: 28px;
    border-radius: 2px;
  }

  p{
    flex: 1;
    margin: 0;
    margin-left: 10px;
    font-weight: 500;
    font-size: 14px;
    overflow: hidden;
    line-height: 28px;
  }
}

.srp-list-form{ 
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

  .srp-list-form-item{
    margin-right: 5px;
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


.part-option{
  margin: 5px 0;

  p{
    overflow: hidden;
    margin: 0;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.unavailable-content {
  position: relative;

  p{
    margin: 0;
    // line-height: 25px;
    font-size: 13px;
  }

  .unavailable-content-btn {
    display: inline-block;
    padding: 5px 10px;
    font-size: 12px;
    color: #55B7B4;
    cursor: pointer;
  }

  .unavailable-content-box {
    position: absolute;
    top: 20px;
    right: -80px;
    padding: 0 10px 5px;

    line-height: 20px;

    width: 130px;

    background: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .title {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;

      i{
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .task-link {
      display: block;
      font-size: 13px;
      color: #55B7B4;
    }
  }
}

// -------- part selected panel --------
.part-selected-count {
  color: $color-primary;
  padding: 0 3px;
  width: 15px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
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
      background-color: #F0F5F5;
      color: #333;
      font-size: 14px;
    }

    .part-selected-sn {
      padding-left: 10px;
      width: 150px;
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
      color: #646B78;
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

</style>
