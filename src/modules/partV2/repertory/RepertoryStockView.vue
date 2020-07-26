<template>
  <div class="page">

    <div class="base-search-group-container">

      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group" style="width: auto;">
          <base-button type="primary" @event="openStock($event);trackEventHandler('stockTable')" v-if="viewReport" icon="icon-depot">
            仓库报表
          </base-button>

          <el-input style="margin-left:10px" v-model="model.keyWord" placeholder="根据备件信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button style="margin-left:10px" type="primary" @event="model.pageNum=1;search();trackEventHandler('search')" native-type="submit">
            搜索
          </base-button>
          <base-button style="margin-left:10px" type="ghost" @event="reset();trackEventHandler('reset')">
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
      <!--<div class="page-panel">-->
      <!--<div class="page-panel-body search-form-nano">-->
      <!--<a class="toStock" v-if="viewReport" :href="`/stats/sparepart/showStatistics?id=${repertoryName}&source=1`" @click.prevent="openStock($event);trackEventHandler('stockTable')"><i class="iconfont icon-depot"></i>仓库报表</a>-->
      <!--<el-input v-model="model.keyWord" placeholder="根据备件信息搜索"></el-input>-->
      <!--<el-button-group>-->
      <!--<el-button type="primary" native-type="submit">搜索</el-button>-->
      <!--<el-button @click="reset();trackEventHandler('reset');">重置</el-button>-->
      <!--</el-button-group>-->
      <!--<el-button type="text" @click="isExpand = !isExpand;trackEventHandler('advSearch')" :icon="isExpand ? 'el-icon-minus' : 'el-icon-plus'">高级搜索</el-button>-->
      <!--</div>-->
      <!--</div>-->

      <base-collapse-panel :value="isExpand" class="page-panel">
        <div class="page-panel-head">
          <h5>高级搜索</h5>
        </div>
        <div class="page-panel-body">
          <div class="form-row">
            <div class="form-item">
              <label>备件名称</label>
              <div class="form-item-content">
                <el-select popper-class="common-advance-popper" style="width: 100%;"
                           placeholder="选择备件"
                           :value="sparepart.sparepartId"   
                           @input="chooseSparepart"
                           filterable
                           clearable
                           remote
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
            <div class="form-item">
              <label>备件类别</label>
              <div class="form-item-content">
                <el-select placeholder="请选择备件类别" v-model="model.type">
                  <el-option label="全部" value=""></el-option>
                  <el-option :label="item" :value="item" v-for="item in types" :key="item"></el-option>
                </el-select>
              </div>
            </div>
            
          </div>
          <div class="form-row">
            <div class="text-right" style="width:100%;">
              <!--<el-button @click="reset">重置</el-button>-->
              <base-button type="ghost" @event="reset">重置</base-button>
              <base-button type="primary" native-type="submit">确定</base-button>
              <!--<el-button type="primary" native-type="submit">确定</el-button>-->
            </div>
          </div>
        </div>
      </base-collapse-panel>
    </form>


    <div class="base-operation-bar-container" style="border: none">

      <div class="top-btn-group">
        <!--<base-button type="primary" icon="el-icon-plus" @event="create" v-if="allowEdit">新建</base-button>-->
        <!--<base-button type="ghost" icon="el-icon-delete" v-if="allowEdit" @event="remove">删除</base-button>-->
        <el-select :value="repertoryName" @input="chooseRepertory($event);trackEventHandler('chooseRepertory')" class="srp-list-form-item" style="width: 150px;">
          <el-option value="" label="全部仓库"></el-option>
          <el-option v-for="item in visibleRepertories" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>

        <el-radio-group v-model="model.isMissingPart" @change="loadData('changeTab');trackEventHandler('switchPart')" v-if="manageRepertories" style="position: relative;top: -1px">
          <el-radio-button :label="0">全部备件</el-radio-button>
          <el-radio-button :label="1">库存提醒</el-radio-button>
        </el-radio-group>

        <base-button type="ghost" v-if="allowEdit" @event="removestockBatch($event);trackEventHandler('remove')">
          移除
        </base-button>


      </div>
      <div class="action-button-group">
        <base-button v-if="allowInout" type="primary" @event="outstockBatch();trackEventHandler('outStock')" native-type="submit">出库</base-button>
        <base-button v-if="allowInout" type="primary" @event="instockBatch($event);trackEventHandler('inStock')" native-type="submit">入库</base-button>
        <base-button v-if="allowInout" type="primary" @event="transferBatch($event);trackEventHandler('transfer')" native-type="submit">调拨</base-button>
        <base-button v-if="allowInout && isPersonalRepertory !== false" type="primary" @event="partSparesBatchDialog($event);trackEventHandler('spare')" native-type="submit">分配</base-button>
        <base-button v-if="allowInout" type="primary" @event="openDialogForSetSafetyStock(selected);trackEventHandler('setSafeStock')" native-type="submit">设置安全库存</base-button>

        <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150">
          <span class="el-dropdown-link el-dropdown-btn" >选择列<i class="iconfont icon-nav-down"></i></span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="column in filterColumns" :key="column.field">
              <el-checkbox :value="column.show" @input="chooseColnum(column)">{{column.label}}</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-dropdown trigger="click" :show-timeout="150" v-if="allowImportAndExport && allowEdit && allowInout && !model.isMissingPart">
          <span class="el-dropdown-link el-dropdown-btn">
            更多操作<i class="iconfont icon-nav-down"></i>
          </span>

          <el-dropdown-menu slot="dropdown" class="dropdown-more">
            <el-dropdown-item>
              <span class="dropdown-item" @click="importStock">导入</span>
            </el-dropdown-item>
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

    <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="selected" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
    </div>


    <div class="table-container">
      <el-table stripe ref="table"
                :data="page.list"
                header-row-class-name="base-table-header"
                @select="handleSelection"
                @select-all="handleSelection"
                @sort-change="sort">

        <el-table-column
          type="selection"
          width="44">
        </el-table-column>

        <el-table-column v-for="column in columns" :key="column.field"
                         v-if="column.show"
                         :label="column.label"
                         :width="column.width"
                         :prop="column.field"
                         :sortable="column.sortable"
                         :class-name="column.field == 'serialNumber' ? 'part-name-superscript-td' : ''"
                         :fixed="column.fixed"
                         :show-overflow-tooltip="column.tooltip && column.field !== 'serialNumber'">

          <template slot-scope="scope" style="position: relative;">

            <template v-if="column.field == 'serialNumber'">

              <template v-if="scope.row.sparepart">

                <sample-tooltip :row="scope.row">
                  <template slot="content" slot-scope="{isContentTooltip}">
                    <el-tooltip :content="scope.row.sparepart.serialNumber" placement="top" :disabled="!isContentTooltip">
                      <span
                        @click="openPartInfoDialog(scope.row.sparepart)"
                        type="text"
                        class="no-padding el-button no-padding el-button--text"
                        :class="scope.row.isGuideData ? column.className : ''"
                      >
                        {{scope.row.sparepart.serialNumber}}
                      </span>
                    </el-tooltip>
                  </template>
                </sample-tooltip>

              </template>

            </template>


            <template v-else-if="column.field == 'tag'">
              <el-tag v-if="(scope.row.safetyStock !== null) && scope.row.safetyStock >= scope.row.repertoryCount" size="mini" type="danger" class="tag-position">库存提醒</el-tag>
            </template>
            <template v-else-if="column.field == 'name'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart && scope.row.sparepart.name}}</template>
            </template>
            <template v-else-if="column.field == 'type'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart.type}}</template>
            </template>
            <template v-else-if="column.field == 'standard'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart.standard}}</template>
            </template>
            <template v-else-if="column.field == 'repertory'">
              <template v-if="scope.row.repertory">{{scope.row.repertory.name}}</template>
            </template>
            <template v-else-if="column.field == 'repertoryType'">
              <template v-if="scope.row.repertory">{{scope.row.repertory.type}}</template>
            </template>
            <template v-else-if="column.field == 'operate'" slot-scope="scope">
              <el-button type="text" class="no-padding" size="medium" @click="outstock(scope.row);tableTrackEventHandler('outStock')" v-if="isEnableSparePart(scope.row) && allowInout && allowInOutStore(scope.row)">出库</el-button>
              <el-button type="text" class="no-padding" size="medium" @click="instock(scope.row);tableTrackEventHandler('inStock')" v-if="isEnableSparePart(scope.row) && allowInout && allowInOutStore(scope.row)">入库</el-button>
              <el-button type="text" class="no-padding" size="medium" @click="allocation(scope.row);tableTrackEventHandler('allocation')" v-if="isEnableSparePart(scope.row) && allowInout && allowInOutStore(scope.row)">调拨</el-button>
              <el-button type="text" class="no-padding" size="medium" @click="partSparesDialog(scope.row);tableTrackEventHandler('spare')" v-if="isEnableSparePart(scope.row) && allowInout && allowInOutStore(scope.row) && isPersonalRepertory !== false">分配</el-button>
              <el-button type="text" class="no-padding" size="medium" @click="apply(scope.row);tableTrackEventHandler('apply')" v-if="isEnableSparePart(scope.row) && allowApply">申领</el-button>
            </template>
            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>

        </el-table-column>
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



    <div class="page-panel">

      <el-dialog title="入库操作" :visible.sync="instockDialog" width="600px">
        <part-instock-form v-if="instockDialog" ref="instockForm" :formdata="formdata" :sparepart-config="sparepartConfig"></part-instock-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="instockDialog = false" >取 消</base-button>
          <base-button type="primary" @event="instockSave" :disabled="pending" v-if="sparepartConfig">确 定</base-button>

          <!--<el-button @click="instockDialog = false">取 消</el-button>-->
          <!--<el-button v-if="sparepartConfig" type="primary" @click="instockSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>
      <el-dialog title="批量入库操作" :visible.sync="instockBatchDialog" width="940px">
        <part-instockBatch-form v-if="instockBatchDialog" ref="instockBatchForm" :repertory="manageRepertories" :sparepart-config="sparepartConfig"></part-instockBatch-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="instockBatchDialog = false" >取 消</base-button>
          <base-button type="primary" @event="instockBatchSave" :disabled="pending">确 定</base-button>

          <!--<el-button @click="instockBatchDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="instockBatchSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="出库操作" :visible.sync="outstockDialog" width="600px">
        <part-outstock-form v-if="outstockDialog" ref="outstockForm" :formdata="formdata" :sparepart-config="sparepartConfig"></part-outstock-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="outstockDialog = false" >取 消</base-button>
          <base-button type="primary" @event="outstockSave" :disabled="pending" v-if="sparepartConfig">确 定</base-button>

          <!--<el-button @click="outstockDialog = false">取 消</el-button>-->
          <!--<el-button v-if="sparepartConfig" type="primary" @click="outstockSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>
      <el-dialog title="批量出库操作" :visible.sync="outstockBatchDialog" width="940px">
        <part-outstock-batch-form v-if="outstockBatchDialog" ref="outstockBatchForm" :sparepart-config="sparepartConfig"></part-outstock-batch-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="outstockBatchDialog = false" >取 消</base-button>
          <base-button type="primary" @event="outstockBatchSave" :disabled="pending">确 定</base-button>
          <!--<el-button @click="outstockBatchDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="outstockBatchSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>
      <el-dialog title="批量调拨操作" :visible.sync="transferBatchDialog" width="940px">
        <part-batch-transfer v-if="transferBatchDialog" ref="transferBatchForm" :repertory="visibleRepertories" :sparepart-config="sparepartConfig"></part-batch-transfer>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="transferBatchDialog = false" >取 消</base-button>
          <base-button type="primary" @event="transferBatchSave" :disabled="pending" >确 定</base-button>

          <!--<el-button @click="transferBatchDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="transferBatchSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="申领备件" :visible.sync="applyDialog" width="600px">
        <part-apply-form v-if="applyDialog" ref="applyForm" :formdata="formdata" :sparepart-config="sparepartConfig"></part-apply-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="applyDialog = false" >取 消</base-button>
          <base-button type="primary" @event="applySave" :disabled="pending" >确 定</base-button>

          <!--<el-button @click="applyDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="applySave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog title="调拨备件" :visible.sync="allocationDialog" width="600px">
        <part-allocation-form v-if="allocationDialog" ref="allocationForm"></part-allocation-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="allocationDialog = false" >取 消</base-button>
          <base-button type="primary" @event="allocationSave" :disabled="pending" >确 定</base-button>

          <!--<el-button @click="allocationDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="allocationSave" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog :visible.sync="safetyStockDialog" width="900px">
        <div slot="title">
          <span class="el-dialog__title">设置安全库存</span>

          <el-tooltip class="item" effect="dark" content="只能为属于自己管理的仓库的备件设置安全库存值" placement="bottom-start">
            <span><i class="el-icon-question"></i></span>
          </el-tooltip>
        </div>
        <part-set-safety-stock-form v-if="safetyStockDialog" :formdata="formdata" ref="setSafetyStockForm"></part-set-safety-stock-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="safetyStockDialog = false" >取 消</base-button>
          <base-button type="primary" @event="updateSafetyStock" :disabled="pending" >确 定</base-button>

          <!--<el-button @click="safetyStockDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="updateSafetyStock" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <!-- 分配(单次) -->
      <el-dialog :visible.sync="isPartSparesDialog" width="500px">
        <div class="" slot="title">
          <span class="el-dialog__title">
            分配备件
          </span>
          <!-- <button type="button" aria-label="Close" class="el-dialog__headerbtn">
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button> -->
          <p class="dialog-title-tip">
            分配是指由仓库管理员向个人库出库备件，个人库收到后确认入库的操作方式
          </p>
        </div>
        <part-spares-form v-if="isPartSparesDialog" :repertories="repertories" :formdata="formdata" :repertory="manageRepertories" ref="partSparesForm"></part-spares-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="isPartSparesDialog = false" >取 消</base-button>
          <base-button type="primary" @event="partSpares" :disabled="pending" >确 定</base-button>

          <!--<el-button @click="isPartSparesDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="partSpares" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <!-- 分配 (批量） -->
      <el-dialog :visible.sync="isPartSparesBatchDialog" class="part-spares-batch-dialog">
        <div class="" slot="title">
          <span class="el-dialog__title">
            批量分配操作
          </span>
          <!-- <button type="button" aria-label="Close" class="el-dialog__headerbtn">
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button> -->
          <p class="dialog-title-tip">
            分配是指由仓库管理员向个人库出库备件，个人库收到后确认入库的操作方式
          </p>
        </div>
        <part-spares-batch-form v-if="isPartSparesBatchDialog" :repertories="repertories" :repertory="manageRepertories" ref="partSparesBatchForm"></part-spares-batch-form>
        <div slot="footer" class="dialog-footer">

          <base-button type="ghost" @event="isPartSparesBatchDialog = false" >取 消</base-button>
          <base-button type="primary" @event="partSparesBatch" :disabled="pending" >确 定</base-button>

          <!--<el-button @click="isPartSparesBatchDialog = false">取 消</el-button>-->
          <!--<el-button type="primary" @click="partSparesBatch" :disabled="pending">确 定</el-button>-->
        </div>
      </el-dialog>

      <el-dialog class="part-info-dialog" title="备件信息" :visible.sync="partInfoDialog" width="600px">
        <div class="part-info-panel">
          <div class="page-panel-body" v-if="partInfo">
            <div class="page-row">
              <div class="page-row-left">编号：</div>
              <div class="page-row-right">{{partInfo.serialNumber}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">名称：</div>
              <div class="page-row-right">{{partInfo.name}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">类别：</div>
              <div class="page-row-right">{{partInfo.type}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">规格：</div>
              <div class="page-row-right">{{partInfo.standard}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">单位：</div>
              <div class="page-row-right">{{partInfo.unit}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">销售价：</div>
              <div class="page-row-right">{{partInfo.salePrice}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">说明：</div>
              <div class="page-row-right">{{partInfo.description}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">图片：</div>
              <div class="page-row-right part-info-dialog-img">
                <template v-if="partInfo.image">
                  <!--<img class="part-image" :src="partInfo.image" @click="preview" alt="备件图片">-->
                  <img class="part-image" :src="partInfo.image" alt="备件图片">

                </template>
              </div>
            </div>
            <div class="page-row">
              <div class="page-row-left">状态：</div>
              <div class="page-row-right">{{partInfo.enable == 1 ? '启用' : '禁用'}}</div>
            </div>
            <div class="page-row">
              <div class="page-row-left">创建时间：</div>
              <div class="page-row-right">{{partInfo.createTime}}</div>
            </div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <!--<el-button @click="closePartInfoDialog">取 消</el-button>-->
          <!--<el-button type="primary" @click="partInfoDialog = false" :disabled="pending">确 定</el-button>-->
          <base-button type="primary" @event="partInfoDialog = false" :disabled="pending" >确 定</base-button>
        </div>
      </el-dialog>

      <base-import ref="importStock" 
                   v-if="allowImportAndExport"
                   action="/partV2/category/import/repertory" @success="importSucc">
        <div slot="tip">
          <div class="base-import-warn">
            请先下载<a :href="`/partV2/category/import/repertory/template?withSerialNumber=${withSerialNumber}`">导入模版 </a>
            <!--<span style="color: #9a9a9a">（ <el-checkbox label="附带备件品类编号" v-model="withSerialNumber"></el-checkbox> ）</span>-->
            ，填写完成后再上传导入。
          </div>
        </div>
      </base-import>

      <base-export ref="exportPanel" 
                   v-if="allowImportAndExport"
                   :columns="filterColumns"
                   action="/partV2/repertory/sparepartRepertory"
                   :method="'post'"></base-export>
    </div>


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
          <div class="part-selected-list">
            <div class="part-selected-row part-selected-head">
              <span class="part-selected-sn">编号</span>
              <span class="part-selected-name">备件</span>
            </div>
            <div class="part-selected-row" v-for="c in selected" :key="c.id">
              <span class="part-selected-sn">{{c.sparepart.serialNumber}}</span>
              <span class="part-selected-name">{{c.sparepart.name}}</span>
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
import qs from '@src/util/querystring2';
import Page from '@src/model/Page';
import PartOutStockForm from './form/PartOutStockForm.vue';
import PartInStockForm from './form/PartInStockForm.vue';
import PartOutStockBatchForm from './form/PartOutStockBatchForm.vue';
import PartInStockBatchForm from './form/PartInStockBatchForm.vue';
import PartApplyForm from './form/PartApplyForm.vue';
import PartAllocationForm from './form/PartAllocationForm.vue';
import PartSetSafetyStockForm from './form/PartSetSafetyStockForm.vue';
import PartSparesForm from './form/PartSparesForm.vue';
import PartSparesBatchForm from './form/PartSparesBatchForm.vue';
import PartBatchTransfer from './form/PartBatchTransfer.vue';
import SampleTooltip from 'packages/SampleTooltip/SampleTooltip'

import DateUtil from '@src/util/date'
import AuthUtil from '@src/util/auth';
import StorageUtil from '@src/util/storageUtil';


const STORAGE_COLNUM_KEY = 'repertory_list_column';
const STORAGE_PAGESIZE_KEY = 'repertory_list_pagesize';

export default {
  name: 'part-stock-view',
  inject: ['initData'],
  data(){
    let pageSize = StorageUtil.get(STORAGE_PAGESIZE_KEY) || 10;
    let originModel = {
      keyWord: '',
      type: '',
      enable: '',
      pageNum: 1,
      pageSize,
      sortBy: {},
      isMissingPart: 0,
    };

    return {
      multipleSelectionPanelShow: false,
      selectedLimit: 500,
      auths: {}, // 权限对象
      isPersonalRepertory: false, // 是否开启个人备件库
      userId: '', // 当前登录用户的Id
      tagIds: [], // 当前用户所属团队
      tagIdsWithChildTag: [],
      types: [],

      columns: this.buildColumns(),
      isExpand: false,
      pending: false,
      sparepart: {
        sparepartId: '',
        loading: false,
        options: []
      },
      
      
      originModel,
      model: _.assign({}, originModel),

      page: new Page(),
      selected: [],
      instockDialog: false,
      outstockDialog: false,
      instockBatchDialog: false,
      outstockBatchDialog: false,
      transferBatchDialog: false,
      applyDialog: false,
      allocationDialog: false,
      partInfoDialog: false,
      safetyStockDialog: false,
      repertory:[],
      repertorySelected:'',
      sparepartConfig:{},
      repertoryName:'',
      partInfo: null,
      dialogLoadingInstance: null,

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

      repertories: [], // 所有可见的仓库
      withSerialNumber: false,
      isManage: false, // 仓库报表按钮是否可见
      isPartSparesDialog: false, // 审批弹窗
      isPartSparesBatchDialog: false // 批量审批弹窗
    }
  },
  computed: {
    // 是否允许导入导出
    allowImportAndExport(){
      return AuthUtil.hasAuth(this.auths, 'EXPORT_IN')
    },
    // 是否有编辑权限
    allowEdit(){
      // return true;
      return AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_EDIT');
    },
    allowInout(){
      return AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_INOUT');
    },
    /**
     * 满足以下调价可申领备件
     * 
     * 1. 开启个人备件库
     * 2. 有备件查看权限
     */
    allowApply(){
      return this.isPersonalRepertory !== false && AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_VIEW');
    },

    /**
     * 所有可见的仓库
     * 
     * 满足以下条件可见：
     * 1. 仓库没有设置可见范围
     * 2. 仓库可见范围包括自己
     * 3. 是仓库管理员
     */
    visibleRepertories(){
      let arr = Array.isArray(this.repertories) ? this.repertories : [];
      return arr.filter(item => {
        return null == item.teamIds
          || !item.teamIds.length // 不限制团队
          || item.teamIds.some(team => this.tagIdsWithChildTag.indexOf(team.id) >= 0) // 团队一员
          || item.manager.some(m => m.userId === this.userId); // 仓库管理员
      });
    },
    /**
     * 所有可操作的仓库
     *  
     * 以下情况能够进行出入库操作
     * 1. 管理员为空
     * 2. 管理员中包含自己
     */
    manageRepertories(){
      let arr = Array.isArray(this.repertories) ? this.repertories : [];

      return arr.filter(item => {
        return null == item.manager 
          || item.manager.length == 0 
          || item.manager.some(item => item.userId == this.userId);
      })
    },
    /**
     * 查看仓库报表权限
     * */
    viewReport() {
      return this.allowInout && !!this.auths.VIP_REPORT_VIEW;
    },
    filterColumns() {
      return this.columns.filter(c => c.label);
    }
  },
  methods: {
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

    openStock(){

      this.$platform.openTab({
        id: `stats_part_${this.repertoryName}`,
        url: `/stats/sparepart/showStatistics?id=${this.repertoryName}&source=1`,
        title: '仓库报表',
        close: true,
        reload:true
      })
    },
    openDialogForSetSafetyStock(selected) {
      // permission granted
      if (!selected || !selected.length) {
        return this.$platform.alert('请先勾选要设置安全库存的的备件');
      }

      if (selected.length > 50) {
        return this.$platform.alert('单次最多为50个备件设置安全库存');
      }

      this.formdata = [];
      let repertoryNames = [];

      for(let i = 0; i < selected.length; i++) {
        let row = selected[i];
        let isManage = this.allowInOutStore(row);

        isManage
          ? this.formdata.push({
            ...row.sparepart,
            repertory: row.repertory.name,
            sparepartRepertoryId: row.id,
            safetyStock: row.safetyStock || '',
          })
          : repertoryNames.push(row.repertory.name);
      }
      // 仓库列表名字去重
      repertoryNames = [...new Set(repertoryNames)];

      if (!this.formdata || !this.formdata.length && repertoryNames.length > 0) {
        return this.$platform.alert(
          `尚未给您分配"${repertoryNames.join(' ,')}"的管理员权限，请联系管理员或到备件库管理中设置`
        );
      }

      this.safetyStockDialog = true;
    },
    async updateSafetyStock() {
      let form = this.$refs.setSafetyStockForm;
      if (!form) return;
      let safetyStock = await form.pack();
      if (!safetyStock) return;

      const updateSafetyStockParams = safetyStock
        .map(p => ({
          id: p.sparepartRepertoryId,
          safetyStock: p.safetyStock,
        }))
        .filter(part => part.safetyStock);

      const cancelSafetyStockParams = safetyStock
        .map(p => ({
          id: p.sparepartRepertoryId,
          safetyStock: p.safetyStock,
        }))
        .filter(part => !part.safetyStock)
        .map(p => {
          p.safetyStock = null;
          return p;
        });

      this.pending = true;
      try {
        let result, cancelResult;
        if (updateSafetyStockParams && updateSafetyStockParams.length) {
          result = await this.$http.post('/partV2/repertory/applyBatchSafetyStocks', updateSafetyStockParams);
        }

        if (cancelSafetyStockParams && cancelSafetyStockParams.length) {
          cancelResult = await this.$http.post('/partV2/repertory/cancelBatchSafetyStocks', cancelSafetyStockParams);
        }

        if((result && result.status === 0) || (cancelResult && cancelResult.status === 0)){
          this.$platform.toast('更新库存安全值成功');
          this.safetyStockDialog = false;
        }else{
          this.$platform.alert(result.message);
        }
      } catch (e) {
        console.warn(e);
      }
      this.pending = false;
      this.loadData();
    },
    openPartInfoDialog(part) {
      this.partInfoDialog = true;
      if (!this.partInfo || (this.partInfo && this.partInfo.id !== part.id)) {
        this.partInfo = null;
        this.loadPartInfo(part.id);
        this.$nextTick(() => {
          this.dialogLoadingInstance = this.$loading({
            target: '.part-info-panel',
          });
        });
      }
    },
    async loadPartInfo(partId) {
      try {
        let result = await this.$http.get(`/partV2/category/get?id=${partId}`);
        this.dialogLoadingInstance.close();
        this.partInfo = result;
      } catch (error) {
        console.log(error)
      }
    },
    // 导出库存记录
    exportData(exportAll){
      if(!this.allowImportAndExport || !this.allowEdit || !this.allowInout) return;
      let ids = [];

      if(!exportAll){
        if(this.selected.length == 0) return this.$platform.alert('请选择要导出的数据');
        ids = this.selected.map(item => item.id);
      }
      
      this.$refs.exportPanel.open(ids, `${DateUtil.format(new Date(), 'yyyy-MM-dd')}备件库存记录.xlsx`);
    },
    importSucc(){
      this.loadData();
    },
    importStock(){
      if(!this.allowImportAndExport || !this.allowEdit || !this.allowInout) return;
      let instance = this.$refs.importStock;
      instance.open();
    },
    isEnableSparePart(row){
      let part = row.sparepart || {};
      return part.enable == 1;
    },
    /**
     * 判断当前用户能够对指定库存进行出入库操作
     * 根据仓库的管理是否为当前用户判断
     *  
     * 以下情况能够进行出入库操作
     * 1. 管理员为空
     * 2. 管理员中包含自己
     * 
     * @author dongls
     */
    allowInOutStore(row){
      let repertory = row.repertory || {};
      let manager = repertory.manager || [];
      return null == manager || manager.length == 0 || manager.some(item => item.userId == this.userId);
    },
    chooseColnum(column){
      this.trackEventHandler('selectColumn');

      column.show = !column.show;

      let data = {};
      this.filterColumns.forEach(item => data[item.field] = item.show)
      StorageUtil.save(STORAGE_COLNUM_KEY, data);
    },
    seeTime(){
      this.model.timeStart = DateUtil.format(this.timeValue[0])
      this.model.timeEnd = DateUtil.format(this.timeValue[1])
    },
    openDetail(row){
      this.$platform.openTab({
        id: `partV2_detail_${row.id}`,
        url:`/partV2/detail?id=${row.id}`,
        title: '备件品类详情'
      })
    },
    select(data){
      this.selected = data;
    },
    create(){
      this.$platform.openTab({
        id: 'partV2_create',
        url: '/partV2/create',
        title: '创建备件品类'
      })
    },
    
    jump(pageNum){
      this.model.pageNum = pageNum;
      this.loadData();
    },
    pageSizeChange(pageSize){
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;
      
      this.loadData();

      // 存入localStorage
      StorageUtil.save(STORAGE_PAGESIZE_KEY, pageSize);
    },
    search(){
      this.model.pageNum = 1;
      this.loadData();
    },
    reset(){
      this.model = _.assign({}, this.originModel);
      this.sparepart.sparepartId = '';
      this.$refs.table.clearSort();
      this.loadData();
    },
    sort({column, prop, order}){
      let sortBy = {};

      if(prop){
        let tableName = 'repertorySparepart';
        let key = `${tableName}.${prop}`
        sortBy[key] = order == 'ascending';
      }
      
      this.model.sortBy = sortBy;
      this.loadData();
    },
    async loadData(msg){
      let loading = this.$loading();
      if(msg) this.model.pageNum = 1;
      try{
        this.page = await this.fetchData();
        this.model.pageNum = this.page.pageNum;
        this.model.pageSize = this.page.pageSize;

        this.matchSelected();
      }catch(error){
        console.log(error)
      }
      loading.close();
    },
    fetchData(){
      // 获取库存列表
      return this.$http.get('/partV2/repertory/list', this.model)
    },
    fetchSparepart(keyword){
      // 获取备件
      let model = {
        keyWord: keyword,
        enable: 1,
        pageSize: 50
      }
      this.sparepart.loading = true
      this.$http.get('/partV2/repertory/sparepart/list', model)
        .then(result => this.sparepart.options = result.list)
        .catch(err => console.log(err))
        .finally(() => this.sparepart.loading = false);
    },
    chooseRepertory(value){
      this.repertoryName = value;
      if(value){
        this.model.repertoryId = value
      }else{
        delete this.model.repertoryId
      }
      this.model.pageNum = 1;
      this.loadData();
      if(this.manageRepertories.length == 0) return this.isManage = false;
      let flag = this.manageRepertories.some(item => item.id == value);
      if(value && !flag) return this.isManage = false;
      this.isManage = true;
    },
    chooseSparepart(value){
      if(this.sparepart.sparepartId == value) return;
      this.sparepart.sparepartId = value;
      this.model.sparepartId = value;
    },
    // TODO: 不再异步获取，改为注入参数
    fecthSparepartConfig(){
      // 获取备件设置
      return this.$http.post('/partV2/repertory/sparepartConfig').then(result => {
        this.sparepartConfig = result
      })
    },
    // 出库（单次）
    outstock(value, num) {
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }
      this.outstockDialog = true;
      this.formdata = value;
    },
  
    // 入库（单次）
    instock(value, num) {
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }
      this.instockDialog = true;
      this.formdata = value
    },
    
    // allocation
    allocation(value) {
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }
      this.allocationDialog = true;
      this.$nextTick(() => this.$refs.allocationForm.init(value, this.visibleRepertories, this.sparepartConfig, this.userId))
    },
    // 调拨
    async allocationSave(){
      let form = this.$refs.allocationForm;
      if(null == form) return;
      let allocation = await form.pack();
      if(null == allocation) return;
      this.pending = true;
      try {
        let result = await this.$http.post('/partV2/approve/transfer/initiate', allocation);
        if(result.status == 0){
          this.$platform.toast(`${result.data ? '调拨成功，请等待备件库管理员处理' : '调拨成功'}`).then(() => location.reload());
          this.allocationDialog = false;
        }else{
          this.$platform.alert(result.message);
        }

      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    apply(value) {
      if(!this.allowApply) return;
      this.applyDialog = true;
      this.formdata = value
    },
    // 申领
    async applySave(){
      let form = this.$refs.applyForm;
      if(null == form) return;
      let apply = await form.pack();
      if(null == apply) return;
      this.pending = true;
      try {
        let result = await this.$http.post('/partV2/approve/apply', apply);
        if(result.status == 0){
          this.$platform.toast('申领成功，请等待备件库管理员处理').then(() => location.reload());
          this.applyDialog = false;
        }else{
          this.$platform.alert(result.message);
        }

      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    // 出库（单次）
    async outstockSave(){
      let form = this.$refs.outstockForm;
      if(null == form) return;
      let outstock = await form.pack();
      if(null == outstock) return;
      this.pending = true;
      try {
        let result = await this.$http.post('/partV2/repertory/stockInOut', outstock);
        if(result.status == 0){
          this.$platform.toast('出库成功').then(() => location.reload());
          this.outstockDialog = false;
        }else{
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    // 出库弹窗（批量）
    // 支持从列表选中数据
    outstockBatch(value) {
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }   
      let { status, message } = this.judgeSelectManager();
      let isSucc = (status == 0);

      if(!isSucc) {
        return this.$platform.alert(message);
      }

      let data = this.selected.filter(item => this.allowInOutStore(item));    
      this.outstockBatchDialog = true;

      this.$nextTick(() => {
        this.$refs.outstockBatchForm.receive(data, this.userId);
      });
    },
    async removestockBatch(value){
      // sparepart.name
      let val = this.selected;
      let remove = []
      let ids = []
      if(val.length > 0){
        let message = [];
        
        for(let i = 0;i < val.length;i++){
          let repe = val[i];
          // 确定该库存能否被删除
          let notAllow = true;
          // 判断仓库是否存在
          notAllow = notAllow && repe.repertory && repe.repertory.id && repe.repertory.name != null;
          // 判断备件是否存在
          notAllow = notAllow && repe.sparepart && repe.sparepart.id;
          // 判断是否有库存
          notAllow = notAllow && repe.repertoryCount > 0;

          if(notAllow){
            message.push(`备件 【${repe.sparepart.name }】 库存数量大于0，不能被移除，请重新勾选`);
            continue;
          }
          
          if(repe.sparepart && repe.sparepart.name) remove.push(`【${ repe.sparepart.name }】`)
          ids.push(repe.id);
        }

        if(message.length > 0){
          return this.$platform.alert(message.join('\n'));
        }

        try {
          if(!await this.$platform.confirm(`确定从仓库列表中移除备件${ remove }吗?`)) return;

          this.pending = true;
          let result = await this.$http.post('/partV2/repertory/batchRemove', ids)
          if(result.status == 0){
            this.$platform.toast('移除成功').then(() => location.reload());
          }else{
            this.$platform.alert(result.message);
          }
        } catch (error) {
          console.log(error)
        }
        this.pending = false;
      }else{
        this.$platform.alert('请先勾选要移除的备件');
      }
    },
    // 出库（批量）
    outstockBatchSave: _.debounce(async function(){
      let form = this.$refs.outstockBatchForm;

      if(null == form) return;

      let outstock = await form.pack();

      if(!Array.isArray(outstock) || outstock.length == 0) return;
        
      this.pending = true;

      try {
        let result = await this.$http.post('/partV2/repertory/stockInOutBach', outstock);
        if(result.status == 0){
          this.$platform.toast('批量出库成功').then(() => location.reload());
          this.outstockBatchDialog = false;
        } else{
          this.$platform.alert(result.message);
          this.pending = false;
        }
      } catch (error) {
        this.pending = false;
        console.log(error)
      }

    }, 1000),
    // 入库（单次）
    async instockSave(){
      let form = this.$refs.instockForm;
      if(null == form) return;
      let instock = await form.pack();
      if(null == instock) return;
      this.pending = true;
      try {
        let result = await this.$http.post('/partV2/repertory/stockInOut', instock);
        if(result.status == 0){
          this.$platform.toast('入库成功').then(() => location.reload());
          this.instockDialog = false;
        }else{
          this.$platform.alert(result.message);
        }

      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    // 批量调拨
    transferBatch() {
      // 权限判断
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }

      let { status, message } = this.judgeSelectManager();
      let isSucc = (status == 0);

      if(!isSucc) {
        return this.$platform.alert(message);
      }

      // 为仓库管理员或者管理员为空
      let data = this.selected
        .filter(item => item.repertoryCount && this.allowInOutStore(item))

      this.transferBatchDialog = true;
      this.$nextTick(() => {
        this.$refs.transferBatchForm.receive(data, this.userId);
      });
    },
    // 批量调拨 (保存)
    transferBatchSave: _.debounce(async function(){
      let form = this.$refs.transferBatchForm;
      if(null == form) return;
      let params = await form.pack();
      if(!Array.isArray(params) || params.length == 0) return;


      if (params.some(s => s.repertoryId === s.targetId)) {

        let message = `第${params.map((sr, index) => {
          if (sr.repertoryId === sr.targetId) {
            return index + 1;
          }
          return null
        }).filter(n => n).join('，')}行数据调入调出仓库为同一仓库已自动过滤，是否继续？`;

        if(!await this.$platform.confirm(message)) return;

        params = params.filter(row => row.repertoryId !== row.targetId);
      }

      this.pending = true;

      try {
        let result = await this.$http.post('/partV2/approve/transfer/initiate/batch', params);

        if(result.status == 0){
          this.$platform.toast('批量调拨成功').then(() => {
            location.reload();
          });
          this.transferBatchDialog = false;
        } else{
          this.$platform.alert(result.message);
          this.pending = false;
        }

      } catch (error) {
        this.pending = false;
        console.log(error)
      }

    }, 1000),
    // 入库弹窗（批量）
    // 支持从列表选中数据
    instockBatch() {
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }

      let { status, message } = this.judgeSelectManager();
      let isSucc = (status == 0);

      if(!isSucc) {
        return this.$platform.alert(message);
      }

      let data = this.selected.filter(item => this.allowInOutStore(item));
      this.instockBatchDialog = true;
      this.$nextTick(() => {
        console.log('334324')
        this.$refs.instockBatchForm.receive(data);
      });
    },
    // 入库（批量）
    instockBatchSave: _.debounce(async function(){
      let form = this.$refs.instockBatchForm;
      if(null == form) return;

      let instock = await form.pack();
      if(!Array.isArray(instock) || instock.length == 0) return;

      this.pending = true;

      try {
        let result = await this.$http.post('/partV2/repertory/stockInOutBach', instock);

        if (result.status == 0){
          this.$platform.toast('批量入库成功').then(() => location.reload());
          this.instockBatchDialog = false;
        } else{
          this.$platform.alert(result.message);
          this.pending = false;
        }

      } catch (error) {
        this.pending = false;
        console.log(error)
      }

    }, 1000),
    // 分配 （弹窗）
    partSparesDialog(val) {
      this.formdata = val;
      // 打开弹窗
      this.isPartSparesDialog = true;
      this.pending = false;
    },
    // 分配  (单次)
    async partSpares() {

      let form = this.$refs.partSparesForm;
      if (!form) return;

      let partSparesData = form.pack();
      if (!partSparesData) return;
      
      this.pending = true;

      let params = {
        repertoryId: partSparesData.repertoryId,
        sparepartId: partSparesData.sparepartId,
        variation: partSparesData.sparesNum,
        remark: partSparesData.remarks,
        targetId: partSparesData.repertory,
      }
      try {
        let result = await this.$http.post('/partV2/approve/allot/initiate', params);
  
        if((result && result.status === 0)){

          this.$platform.toast('分配成功').then(() => location.reload());
          this.isPartSparesDialog = false;

        }else{
          this.$platform.alert(result.message);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        this.pending = false;
      }
    },
    // 分配 批量 (弹窗)
    partSparesBatchDialog() {
      if(!this.allowInout){
        this.$platform.alert('对不起，您没有该操作权限');
        return
      }

      let { status, message } = this.judgeSelectManager();
      let isSucc = (status == 0);

      if(!isSucc) {
        return this.$platform.alert(message);
      }

      let data = this.selected.filter(item => this.allowInOutStore(item));
      this.isPartSparesBatchDialog = true; 
      this.$nextTick(() => {
        this.$refs.partSparesBatchForm.receive(data, this.userId);
      });
    },
    // 分配 (批量)
    partSparesBatch: _.debounce(async function() {
      let form = this.$refs.partSparesBatchForm;
      if (!form) return;
      this.pending = true;

      let partSparesData = await form.pack();
      if (!partSparesData) {
        this.pending = false;
        return
      }
      if(partSparesData.length < 1) {
        this.$platform.alert('请先添加数据');
        this.pending = false;
        return
      } 

      let remark = await form.remarkText();
      
      
      try {
        let result = await this.$http.post(`/partV2/approve/allot/initiate/batch?remark=${remark}`, partSparesData);
  
        if((result && result.status === 0)){
          
          this.$platform.toast('批量分配成功').then(() => {
            location.reload();
            this.isPartSparesDialog = false;
          });

        } else{
          this.$platform.alert(result.message);
          this.pending = false;
        }
      } catch (e) {
        console.warn(e);
        this.pending = false;
      }

    }, 1000),
    buildParams(pageNum, pageSize){
      return {
        ...this.model,
        pageNum,
        pageSize
      };
    },

    // 获取仓库列表
    fetchRepertory(){
      this.$http.get('/partV2/repertory/allRepertory')
        .then(result => {
          this.repertories = result || []
          if(this.manageRepertories.length > 0) this.isManage = true;
        })
        .catch(err => console.warn(err))
    },
    initialize(){      
      this.fetchRepertory();
      this.fecthSparepartConfig();
      this.fetchSparepart()
      this.loadData();
    },
    buildColumns(){
      let localData = StorageUtil.get(STORAGE_COLNUM_KEY) || {};

      let columns = [
        {
          label: '编号',
          field: 'serialNumber',
          show: true,
          width: '170px',
          exportAlias: 'sparepart.serialNumber',
          tooltip: true,
        },
        {
          label: '',
          field: 'tag', 
          show: true,
          width: '60px',
          tooltip: false,
        },
        {
          label: '名称',
          field: 'name',
          show: true,
          exportAlias: 'sparepart.name',
          tooltip: true,
        },
        {
          label: '备件类别',
          field: 'type',
          show: true,
          tooltip: true,
        },
        {
          label: '备件规格',
          field: 'standard',
          show: true,
          exportAlias: 'sparepart.standard',
          tooltip: true,
        },
        {
          label: '仓库',
          field: 'repertory',
          show: true,
          exportAlias: 'repertory.name',
          tooltip: true,
        },
        {
          label: '仓库分类',
          field: 'repertoryType',
          show: true,
          exportAlias: 'repertory.type',
          tooltip: true,
        },
        {
          label: '安全库存',
          field: 'safetyStock',
          show: false,
          exportAlias: 'safetyStock',
          tooltip: true,
        },
        {
          label: '库存数量',
          field: 'repertoryCount',
          show: true,
          sortable: 'custom',
          tooltip: true,
        },
        {
          label: '操作',
          field: 'operate',
          width: '230px',
          minWidth: '160px',
          show: true,
          export: false,
          fixed: 'right',
          tooltip: true,
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      return columns;
    },
    /**
     * 判断是否是管理员 并返回
    */
    judgeSelectManager() {
      let repertoryNames = [];
      let managers = [];

      for(let i = 0; i < this.selected.length; i++) {
        let row = this.selected[i];
        let isManage = this.allowInOutStore(row);

        isManage
          ? managers.push(row.repertory.name)
          : repertoryNames.push(row.repertory.name);
      }
      // 仓库列表名字去重
      repertoryNames = [...new Set(repertoryNames)];

      return (
        Array.isArray(repertoryNames) && repertoryNames.length > 0 && managers.length == 0
          ? {
            status: 1,
            succ: true,
            data: repertoryNames,
            message: `尚未给您分配"${repertoryNames.join(' ,')}"的管理员权限，请联系管理员或到备件库管理中设置`
          }
          : {status: 0}
      );
    },
    trackEventHandler(type) {
      switch (type) {
      case 'stockTable':
        this.$tdOnEvent('pc：备件库存-仓库报表事件');
        break;
      case 'search':
        this.$tdOnEvent('pc：备件库存-搜索事件');
        break;
      case 'reset':
        this.$tdOnEvent('pc：备件库存-重置事件');
        break;
      case 'advSearch':
        this.$tdOnEvent('pc：备件库存-高级搜索事件');
        break;
      case 'chooseRepertory':
        this.$tdOnEvent('pc：备件库存-仓库筛选下拉框事件');
        break;
      case 'switchPart':
        this.model && this.model.isMissingPart === 0 && this.$tdOnEvent('pc：备件库存-全部备件事件');
        this.model && this.model.isMissingPart === 1 && this.$tdOnEvent('pc：备件库存-库存提醒事件');
        break;
      case 'remove':
        this.$tdOnEvent('pc：备件库存-移除事件');
        break;
      case 'outStock':
        this.$tdOnEvent('pc：备件库存-出库事件');
        break;
      case 'inStock':
        this.$tdOnEvent('pc：备件库存-入库事件');
        break;
      case 'transfer':
        this.$tdOnEvent('pc：备件库存-调拨事件');
        break;
      case 'spare':
        this.$tdOnEvent('pc：备件库存-分配事件');
        break;
      case 'setSafeStock':
        this.$tdOnEvent('pc：备件库存-设置安全库存事件');
        break;
      case 'selectColumn':
        this.$tdOnEvent('pc：备件库存-选择列事件');
        break;
      default:
        break;
      }
    },
    tableTrackEventHandler (type) {
      switch (type) {
      case 'outStock':
        this.$tdOnEvent('pc：备件库存-列表出库事件');
        break;
      case 'inStock':
        this.$tdOnEvent('pc：备件库存-列表入库事件');
        break;
      case 'allocation':
        this.$tdOnEvent('pc：备件库存-列表调拨事件');
        break;
      case 'spare':
        this.$tdOnEvent('pc：备件库存-列表分配事件');
        break;
      case 'apply':
        this.$tdOnEvent('pc：备件库存-列表申领事件');
        break;
      default:
        break;
      }
    }
  },
  mounted(){
    let initData = _.cloneDeep(this.initData);

    this.types = _.cloneDeep(initData.sparepartType) || [];
    this.auths = _.cloneDeep(initData.auths) || {};
    this.isPersonalRepertory = _.cloneDeep(initData.isPersonalRepertory);
    this.userId = _.cloneDeep(initData.userId) || '';
    this.tagIds = _.cloneDeep(initData.tagIds) || [];
    this.tagIdsWithChildTag = _.cloneDeep(initData.tagIdsWithChildTag) || [];

    let urlParams = qs.parse(window.location.search);
    if(urlParams.id){
      this.repertoryName = urlParams.id;
      this.model.repertoryId = urlParams.id
    }else{
      delete this.model.repertoryId
    }
    if(urlParams.miss) {
      this.model.isMissingPart = 1;
    }

    this.initialize();
  },
  components: {
    [PartOutStockForm.name]: PartOutStockForm,
    [PartInStockForm.name]: PartInStockForm,
    [PartOutStockBatchForm.name]: PartOutStockBatchForm,
    [PartInStockBatchForm.name]: PartInStockBatchForm,
    [PartApplyForm.name]: PartApplyForm,
    [PartAllocationForm.name]: PartAllocationForm,
    [PartSetSafetyStockForm.name]: PartSetSafetyStockForm,
    [PartSparesForm.name]: PartSparesForm,
    [PartSparesBatchForm.name]: PartSparesBatchForm,
    // [PartBatchTransfer.name]: PartBatchTransfer,
    PartBatchTransfer,
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>

<style lang="scss">
.no-padding{
  padding:0;
}

.base-search-group-container-toStock{
  display:block;
  position:absolute;
  left:5px;
  background: #55B7B4;
  padding:6px 15px;
  color:#fff;
  text-decoration:none;
  .iconfont{
    font-size:14px;
    padding-right:5px;
  }
}

.has-tag {
  width: calc(100% - 60px);
  overflow: hidden;
}

.tag-position {
  position: absolute;
  top: 50%;
  right: 0px;
  transform: translateY(-50%);
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

  .part-info-panel {
    min-height: 360px;
  }
  .part-info-dialog {
    .part-info-panel {
      height: 400px;
      overflow: auto;
    }

    .part-info-dialog-img {
      width: 100%;
      img {
        width: inherit;
      }
    }
  }
  .part-spares-batch-dialog {
    .el-dialog {
      width: 85vw;
      min-width: 950px;
    }
  }

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

  .dialog-title-tip {
    color: #6c6c6c;
    margin: 5px 0 0 0;
    font-size: 12px;
  }

  // superscript
.part-name-superscript-td {
  padding: 0 !important;
  & > div {
    height: 43px;
    line-height: 43px !important;
    a,
    button {
      display: inline-block;
      height: 43px;
      line-height: 43px;
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
