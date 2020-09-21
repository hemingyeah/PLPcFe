<template>
  <div class="task-detail-container" v-loading="loading">
    <!-- start 顶部操作区 -->
    <div class="task-detail-header">
      <div class="task-detail-header-top" :class="{'active': !collapse}">
        <!-- start 折叠按钮 -->
        <div class="collapse-btn" @click="collapse = !collapse">
          <el-tooltip :content="collapse?'收起':'展开'" placement="top">
            <i class="iconfont icon-more"></i>
          </el-tooltip>
        </div>
        <!-- end 折叠按钮 -->

        <div class="task-delete-status" v-if="isDelete">已删除</div>

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
                  <i class="iconfont icon-dianhua2"></i>
                </el-tooltip>
              </div>
            </div>
          </div>
          
          <!-- 工单状态 -->
          <div class="task-state" v-if="!isDelete" :style="{'background-color': stateColor.bgColor, 'border-color': stateColor.bgColor, 'color': stateColor.color}">{{ stateText }}</div>
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

            <el-button @click="openDialog('cancel')" :disabled="pending" size="mini" v-if="allowCancelTask">取消</el-button>
            <el-button @click="redeploy" :disabled="pending" size="mini" v-if="allowRedeployTask">转派</el-button>
            <el-button :class="{'once-printed': task.oncePrinted == 1}" @click="printTask" :disabled="pending" size="mini" v-if="allowPrintTask">打印</el-button>

            <!-- start 服务报告 -->
            <template v-if="allowServiceReport">
              <el-button @click="createReport(true)" :disabled="pending" v-if="srSysTemplate || srSysTemplate == null" size="mini">服务报告</el-button>

              <el-dropdown trigger="click" v-if="!srSysTemplate && srSysTemplate != null">
                <el-button :disabled="pending" size="mini">服务报告</el-button>

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

      <!-- start 审批中icon -->
      <div class="approving-img" v-show="collapse && isApproving">
        <img src="../../../assets/img/task/approving.png" />
      </div>
      <!-- end 审批中icon -->

      <div class="task-detail-header-bottom" :class="{'active': !collapse}">
        <div class="customer-info-wrap">
          <div :class="['customer-name', {'link-text': allowOpenCustomerView}]" @click="openCustomerView">{{ customer.name }}</div>
          <el-tooltip v-if="showCustomerRelationTaskCount" placement="top">
            <div slot="content" v-html="`未完成工单：${customerRelationTaskCountData.unfinished} </br> 全部工单：${customerRelationTaskCountData.all}`"></div>
            <div class="relation-count-button" @click="openCustomerView">
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
                    <i class="iconfont icon-dianhua2"></i>
                  </el-tooltip>
                </div>
              </div>
            </div>
            <div class="form-view-row address-info" v-if="customerOption.address">
              <label>地址：</label>
              <div class="form-view-row-content">
                <i v-if="showMap" class="iconfont icon-address" @click="openMap"></i>
                {{ address }}
              </div>
            </div>
          </div>
          <!-- end 联系人信息 -->

          <!-- start 默认显示项：工单类型、计划时间、服务内容 -->
          <div class="task-detail-header-bottom-list-item">
            <div class="form-view-row">
              <label>工单类型：</label>
              <div class="form-view-row-content">{{ task.templateName }}</div>
            </div>
            <div class="form-view-row" v-if="serviceContentField">
              <label>{{ serviceContentField.displayName }}：</label>
              <div class="form-view-row-content">{{ task.serviceContent }}</div>
            </div>
            <div class="form-view-row" v-if="planTimeField">
              <label>{{ planTimeField.displayName }}：</label>
              <div class="form-view-row-content form-view-row-plantime">
                {{ planTime }}
                <template v-if="allowModifyPlanTime">
                  <el-tooltip class="item" effect="dark" content="修改计划时间" placement="top">
                    <i class="iconfont icon-bianji1" @click="openDialog('modifyPlanTime')"></i>
                  </el-tooltip>
                </template>
              </div>
            </div>
          </div>
          <!-- end 默认显示项：工单类型、计划时间、服务内容 -->

          <div class="task-detail-header-bottom-list-item">
            <biz-process-time :data="task" :state="taskState"></biz-process-time>

            <!-- start 当前工单状态操作按钮 -->
            <template v-if="!isDelete">
              <div class="state-button-group" v-show="taskState.value == task.state || (Array.isArray(taskState.value) && taskState.value.indexOf(task.state) > -1) ">
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
    <!-- end 顶部操作区 -->

    <!-- start 工单详情折叠面板 -->
    <base-collapse
      class="task-detail-main-content"
      :show-collapse="showCollapse"
      :direction.sync="collapseDirection">

      <!-- start 工单详情 -->
      <template slot="left">
        <div class="task-detail-main-content-left" v-show="collapseDirection != 'left'">
          <div class="task-detail-btn-group">
            <el-tooltip :popper-options="popperOptions" content="编辑工单" placement="top" v-if="allowEditTask">
              <i class="iconfont icon-bianji1" @click="goEdit"></i>
            </el-tooltip>
            <el-tooltip :popper-options="popperOptions" content="复制工单" placement="top" v-if="allowCopyTask">
              <i class="iconfont icon-fuzhi" @click="goCopyTask"></i>
            </el-tooltip>
            <el-tooltip :popper-options="popperOptions" content="删除工单" placement="top" v-if="allowDeleteTask">
              <i class="iconfont icon-shanchu-copy" @click="deleteTask"></i>
            </el-tooltip>
          </div>

          <el-tabs v-model="leftActiveTab">
            <el-tab-pane label="工单详情" name="task-view">
              <task-view
                :task="task"
                :fields="fields"
                :plan-time="planTime"
                :is-paused="isPaused"
                :state-text="stateText"
                :state-color="stateColor"
                :task-edit-auth="editAuth"
                :finished-state="finishedState"
                :customer-option="customerOption"
                :can-see-customer="canSeeCustomer"
                :allow-modify-plan-time="allowModifyPlanTime"
                @modifyPlanTime="openDialog('modifyPlanTime')"
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

        <div class="collapse-left" v-show="collapseDirection == 'left'">工单详情</div>
      </template>
      <!-- end 工单详情 -->

      <!-- start 附加组件 -->
      <template slot="right">
        <div class="task-detail-main-content-right" v-show="collapseDirection != 'right'">
          <el-tabs v-model="rightActiveTab">
            <el-tab-pane label="审核结算" name="balance-tab" v-if="viewBalanceTab">
              <task-account
                ref="taskAccount"
                :share-data="propsForSubComponents"
                @back="openDialog('back')"
                @proposeApprove="proposeApprove"
              />
            </el-tab-pane>
            <el-tab-pane label="客户评价" name="feedback-tab" v-if="viewFeedbackTab">
              <task-feedback
                ref="taskFeedback"
                :share-data="propsForSubComponents"
                @proposeApprove="proposeApprove"
              />
            </el-tab-pane>
            <el-tab-pane label="附加组件" name="card-tab" v-if="viewTaskCardTab">
              <task-detail-card :share-data="propsForSubComponents" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="collapse-right" v-show="collapseDirection == 'right'">
          {{ viewBalanceTab ? '审核结算' : viewFeedbackTab ? '客户评价' : '附加组件' }}
        </div>
      </template>
      <!-- end 附加组件 -->
    </base-collapse>
    <!-- end 工单详情折叠面板 -->

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
      @proposeApprove="proposeApprove"
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