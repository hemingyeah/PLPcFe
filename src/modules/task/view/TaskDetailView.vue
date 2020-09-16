<template>
  <div class="task-detail-container" v-loading="loading">
    <!-- start 顶部操作区 -->
    <div class="task-detail-header">
      <div class="task-detail-header-top">
        <!-- start 折叠按钮 -->
        <div class="collapse-btn" @click="collapse = !collapse">
          <i class="iconfont icon-more" :class="{'active': !collapse}"></i>
        </div>
        <!-- end 折叠按钮 -->

        <!-- start 工单流程信息 -->
        <div class="progress-wrap" v-show="collapse">
          <biz-process :value="task.state" :data="task" :flow-setting="initData.taskType.flowSetting" @change="changeTaskProcessState"></biz-process>
        </div>
        <!-- end 工单流程信息 -->

        <!-- start 折叠时客户信息 -->
        <div class="customer-info-wrap" v-show="!collapse && customerField.id">
          <div :class="['customer-name', {'link-text': allowOpenCustomerView}]" @click="openCustomerView">{{ customer.name }}</div>
          
          <div class="linkman-info" v-if="customerOption.linkman">
            <div class="form-view-row linkman-name">
              <label>联系人：</label>
              <div class="form-view-row-content">{{ lmName }}</div>
            </div>
            <div class="form-view-row linkman-phone">
              <label>电话：</label>
              <div class="form-view-row-content call-phone" @click.stop="makePhoneCall">
                <span>{{ lmPhone }}</span>
                <el-tooltip content="拨打电话" placement="top" v-if="showCallPhone">
                  <i class="iconfont icon-dianhua1"></i>
                </el-tooltip>
              </div>
            </div>
          </div>
          
          <!-- TODO：工单状态 样式待修改 -->
          <div class="task-state" :style="{'background-color': getTaskStateColor()}">{{ getTaskStateName() }}</div>
        </div>
        <!-- end 折叠时客户信息 -->

        <!-- start 顶部按钮组 -->
        <div class="task-detail-header-top-btn">
          <template v-if="!isDelete">
            <!-- start 当前工单状态操作按钮 -->
            <div class="current-state-button" v-show="!collapse">
              <template v-for="(item, index) in stateButtonData">
                <el-button
                  :key="index"
                  :type="item.type"
                  @click="item.event"
                  :disabled="pending"
                  v-if="item.show"
                >{{ item.name }}</el-button>
              </template>
            </div>
            <!-- end 当前工单状态操作按钮 -->

            <!-- <base-button type="danger" @event="deleteTask" :disabled="pending" v-if="allowDeleteTask">删除</base-button> -->
            <el-button @click="openDialog('cancel')" :disabled="pending" size="mini" v-if="allowCancelTask">取消</el-button>
            <el-button @click="redeploy" :disabled="pending" size="mini" v-if="allowRedeployTask">转派</el-button>
            <el-button :class="{'once-printed': task.oncePrinted == 1}" @click="printTask" :disabled="pending" size="mini" v-if="allowPrintTask">打印</el-button>

            <!-- start 服务报告 -->
            <template v-if="allowServiceReport">
              <el-button @click="createReport(true)" :disabled="pending" v-if="srSysTemplate || srSysTemplate == null" size="mini">服务报告</el-button>

              <el-dropdown trigger="click" v-if="!srSysTemplate && srSysTemplate != null">
                <span class="el-dropdown-link el-dropdown-btn">服务报告</span>

                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <el-tooltip class="item" effect="dark" content="如果图片过多导致文件过大，将会返回Excel格式，需要您自行另存为PDF格式" placement="left-start">
                      <a class="link-of-dropdown" href="javascript:;" @click.prevent="createReport(true)">PDF格式</a>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <a class="link-of-dropdown" href="javascript:;" @click.prevent="createReport(false)">Excel格式</a>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <!-- end 服务报告 -->

            <el-button @click="ding" :disabled="pending" size="mini" v-if="allowDing">DING</el-button>
          </template>
        </div>
        <!-- end 顶部按钮组 -->
      </div>

      <div class="task-detail-header-bottom" :class="{'active': !collapse}">
        <div class="customer-info-wrap">
          <div :class="['customer-name', {'link-text': allowOpenCustomerView}]" @click="openCustomerView">{{ customer.name }}</div>
          <el-tooltip v-if="showCustomerRelationTaskCount" placement="top">
            <div slot="content" v-html="`未完成工单：${customerRelationTaskCountData.unfinished} </br> 全部工单：${customerRelationTaskCountData.all}`"></div>
            <div class="task-count-button" @click="openCustomerView">
              {{ `${customerRelationTaskCountData.unfinished}/${customerRelationTaskCountData.all}` }}
            </div>
          </el-tooltip>
        </div>

        <div class="task-detail-header-bottom-list">
          <!-- start 联系人信息 -->
          <div class="task-detail-header-bottom-list-item">
            <div class="linkman-info" v-if="customerOption.linkman">
              <div class="form-view-row linkman-name">
                <label>联系人：</label>
                <div class="form-view-row-content">{{ lmName }}</div>
              </div>
              <div class="form-view-row linkman-phone">
                <label>电话：</label>
                <div class="form-view-row-content call-phone" @click.stop="makePhoneCall">
                  <span>{{ lmPhone }}</span>
                  <el-tooltip content="拨打电话" placement="top" v-if="showCallPhone">
                    <i class="iconfont icon-dianhua1"></i>
                  </el-tooltip>
                </div>
              </div>
            </div>
            <div class="form-view-row address-info" v-if="customerOption.address">
              <label>地址：</label>
              <div class="form-view-row-content">
                {{ address }}
                <!-- <i v-if="showMap" class="iconfont icon-address" @click="openMap"></i> -->
              </div>
            </div>
          </div>
          <!-- end 联系人信息 -->

          <!-- start 已设置的显示项 -->
          <div class="task-detail-header-bottom-list-item">
            <div class="form-view-row">
              <label>工单类型：</label>
              <div class="form-view-row-content">{{ task.templateName }}</div>
            </div>
            <div class="form-view-row">
              <label>服务内容：</label>
              <div class="form-view-row-content">{{ task.serviceContent }}</div>
            </div>
          </div>
          <!-- end 已设置的显示项 -->

          <div class="task-detail-header-bottom-list-item">
            <biz-process-time :data="task" :state="taskState"></biz-process-time>

            <!-- start 当前工单状态操作按钮 -->
            <template v-if="!isDelete">
              <div class="state-button-group" v-show="taskState == task.state">
                <template v-for="(item, index) in stateButtonData">
                  <el-button
                    :key="index"
                    :type="item.type"
                    @click="item.event"
                    :disabled="pending"
                    v-if="item.show"
                  >{{ item.name }}</el-button>
                </template>
              </div>
            </template>
            <!-- end 当前工单状态操作按钮 -->
          </div>
        </div>
      </div>
    </div>

    <div class="task-detail-main-content">
      <div class="task-detail-main-content-left">  
        <el-tabs v-model="leftActiveTab">
          <el-tab-pane label="工单详情" name="task-view">
            <task-view
              :task="task"
              :fields="fields"
              :is-paused="isPaused"
              :task-edit-auth="editAuth"
              :finished-state="finishedState"
              :customer-option="customerOption"
              :can-see-customer="canSeeCustomer"
              :allow-modify-plan-time="allowModifyPlanTime"
            />
          </el-tab-pane>
          <el-tab-pane :label="finishedState?'回执信息':'完成回执'" name="receipt-view" v-if="viewReceiptTab">
            <task-receipt-detail-view :share-data="propsForSubComponents" />
          </el-tab-pane>
          <el-tab-pane label="动态信息" name="record">
            <task-info-record :share-data="propsForSubComponents" />
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="task-detail-main-content-right">
        <!-- start 关联数据 -->
        <div class="task-relation" v-if="task.id">
          <base-tabbar :tabs="tabs" v-model="currTab" ></base-tabbar>
          <div class="task-relation-content">
            <keep-alive>
              <component :is="currTab" :share-data="propsForSubComponents" :init-data="initData"></component>
            </keep-alive>
          </div>
        </div>
        <!-- end 关联数据 -->
      </div>
    </div>

    <!-- start 回退工单弹窗 -->
    <base-modal title="回退工单" :show.sync="backDialog.visible" width="700px" class="task-back-dialog">
      <div class="base-modal-content">
        <p v-if="task.state == 'finished'">回退工单将工单退回工单负责人，可以重新提交回执信息，原有回执信息将不再保存</p>
        <p v-else-if="task.state == 'costed'">回退工单将工单退回已完成状态，可以重新提交审核结算信息，原有审核结算信息将不再保存</p>
        <textarea v-model="backDialog.reason" placeholder="请输入回退说明[最多500字][必填]" rows="3" maxlength="500" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="backDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="back" :disabled="pending">确 定</el-button>
      </div>
    </base-modal>
    <!-- end 回退工单弹窗 -->

    <!-- start 暂停工单弹窗 -->
    <base-modal title="暂停工单" :show.sync="pauseDialog.visible" width="700px">
      <div class="base-modal-content">
        <textarea v-model="pauseDialog.reason" placeholder="请输入暂停原因[最多500字]" rows="3" maxlength="500" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pauseDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="pause" :disabled="pending">确 定</el-button>
      </div>
    </base-modal>
    <!-- end 暂停工单弹窗 -->

    <!-- start 拒绝工单弹窗 -->
    <base-modal title="拒绝工单" :show.sync="refuseDialog.visible" width="700px">
      <div class="base-modal-content">
        <textarea v-model="refuseDialog.reason" placeholder="请输入拒绝说明[最多500字][必填]" rows="3" maxlength="500" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refuseDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="refuse" :disabled="pending">确 定</el-button>
      </div>
    </base-modal>
    <!-- end 拒绝工单弹窗 -->

    <!-- start 取消工单弹窗 -->
    <cancel-task-dialog
      ref="cancelTaskDialog"
      :task-id="task.id"
    />
    <!-- end 取消工单弹窗 -->

    <!-- start 计划时间弹窗 -->
    <plantime-dialog
      ref="planTimeDialog"
      :task="task"
      :field="planTimeField"
      :modifiable="taskConfig.taskPlanTime"
    />
    <!-- end 计划时间弹窗 -->

    <!-- start 审批弹窗 -->
    <task-approve-dialog
      ref="approveTaskDialog"
      :approve-id="unFinishedAppr.id"
    />
    <!-- end 审批弹窗 -->

    <!-- start 工单发起审批弹窗 -->
    <propose-approve-dialog
      ref="proposeApprove"
      :remark-required="taskConfig.approveRemark"
    />
    <!-- end 工单发起审批弹窗 -->

    <!-- start 完成回执弹窗 -->
    <task-receipt-edit-view
      ref="taskReceiptEdit"
      :init-data="initData"
      :receipt-fields="receiptFields"
      @proposeApprove="proposeApprove"
    />
    <!-- end 完成回执弹窗 -->
  </div>
</template>

<script>
import TaskDetailView from './TaskDetailView';
export default TaskDetailView;
</script>

<style lang="scss">
@import './TaskDetailView.scss';
</style>