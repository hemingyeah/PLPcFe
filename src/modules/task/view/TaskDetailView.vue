<template>
  <div class="page-container task-detail-container">
    <!-- start 顶部操作区 -->
    <div class="task-tool-bar">
      <template v-if="!isDelete">
        <div class="task-toolbar-left">
          <button type="button" class="btn btn-text" @click="goEdit" v-if="allowEditTask">
            <i class="iconfont icon-edit"></i> 编辑
          </button>
          <button type="button" class="btn btn-text" @click="deleteTask" v-if="allowDeleteTask">
            <i class="iconfont icon-yemianshanchu"></i> 删除
          </button>
        </div>

        <div class="task-toolbar-right action-btn">
          <base-button type="ghost" @event="backTask" :disabled="pending" v-if="allowBackTask">回退工单</base-button>
          <base-button type="ghost" @event="openDialog('cancel')" :disabled="pending" v-if="allowCancelTask">取消工单</base-button>
          <base-button type="primary" @event="openDialog('acceptFromPool')" :disabled="pending" v-if="allowPoolTask">接单</base-button>
          <base-button type="primary" @event="openDialog('pause')" :disabled="pending" v-if="allowPauseTask">暂停</base-button>
          <base-button type="primary" @event="unpause" :disabled="pending" v-if="allowGoOnTask">继续</base-button>
          <base-button type="primary" @event="openDialog('accept')" :disabled="pending" v-if="allowAcceptTask">接受</base-button>
          <base-button type="danger" @event="openDialog('refuse')" :disabled="pending" v-if="allowRefuseTask">拒绝</base-button>
          <base-button type="primary" @event="start" :disabled="pending" v-if="allowStartTask">开始</base-button>
          <base-button type="primary" @event="openDialog('finish')" :disabled="pending" v-if="allowFinishTask">回执完成</base-button>
          <base-button type="primary" @event="allot" :disabled="pending" v-if="allowAllotTask">指派</base-button>
          <base-button type="primary" @event="redeploy" :disabled="pending" v-if="allowRedeployTask">转派</base-button>
          <base-button type="primary" :class="{'once-printed': task.oncePrinted == 1}" @event="printTask" :disabled="pending" v-if="allowPrintTask">打印工单</base-button>

          <!-- start 服务报告 -->
          <template v-if="allowServiceReport">
            <base-button type="primary" @event="createReport(true)" :disabled="pending" v-if="srSysTemplate || srSysTemplate == null">服务报告</base-button>

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

          <base-button type="primary" @event="openDialog('approve')" :disabled="pending" v-if="allowApprove">审批</base-button>
          <base-button type="primary" @event="offApprove" :disabled="pending" v-if="allowoffApprove">撤回审批</base-button>
          <base-button type="primary" @event="ding" :disabled="pending" v-if="allowDing">DING</base-button>
        </div>
      </template>
      <div class="task-isDelete" v-else>[已删除]</div>
    </div>
    <!-- end 顶部操作区 -->

    <div class="main-content" v-loading="loading">
      <!-- start 工单信息 -->
      <div class="task-detail">
        <form-view :fields="fields" :value="task">
          <template slot="taskNo" slot-scope="{ field, value }">
            <!-- 工单编号 -->
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{value}}</div>
            </div>
            <!-- 工单类型 -->
            <div class="form-view-row">
              <label>工单类型</label>
              <div class="form-view-row-content">{{task.templateName}}</div>
            </div>
          </template>

          <!-- start 客户字段 -->
          <template slot="customer" slot-scope="{ field }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{task.customer.name}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.linkman">
              <label>联系人</label>
              <div class="form-view-row-content">{{task.tlmName}} {{task.tlmPhone}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.address">
              <label>地址</label>
              <div class="form-view-row-content">{{prettyAddress(task.taddress)}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.product">
              <label>产品</label>
              <div class="form-view-row-content">
                <span class="row-item-margin" v-for="product in task.products" :key="product.id">{{product.name}}</span>
              </div>
            </div>
          </template>
          <!-- end 客户字段 -->

          <!-- start 计划时间 -->
          <template slot="planTime" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{ field.displayName }}</label>
              <div class="form-view-row-content form-view-row-plantime">
                {{ value }}
                <template v-if="allowModifyPlanTime">
                  <el-tooltip class="item" effect="dark" content="修改计划时间" placement="top">
                    <i class="iconfont icon-edit" @click="openDialog('modifyPlanTime')"></i>
                  </el-tooltip>
                </template>
              </div>
            </div>
          </template>
          <!-- end 计划时间 -->

          <!-- start 完成时间 -->
          <template slot="completeTime" slot-scope="{ field }" v-if="finishedState">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{ task.completeTime | fmt_datetime }}</div>
            </div>
          </template>
          <!-- end 完成时间 -->

          <!-- start 满意度 -->
          <template slot="degree" slot-scope="{ field }" v-if="task.isReview == 1">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{ task.degree }}</div>
            </div>
          </template>
          <!-- end 满意度 -->

          <!-- start 协同人 -->
          <template slot="synergies" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <span class="row-item-margin" v-for="item in value" :key="item.userId">{{item.displayName}}</span>
              </div>
            </div>
          </template>
          <!-- end 协同人 -->

          <!-- start 工单状态 -->
          <template slot="state" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{stateText[value]}}</div>
            </div>
          </template>
          <!-- end 工单状态 -->

        </form-view>
      </div>
      <!-- end 工单信息 -->

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
    <base-modal title="暂停工单" :show.sync="pauseDialog.visible" width="500px">
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
    <base-modal title="拒绝工单" :show.sync="refuseDialog.visible" width="500px">
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
    <task-receipt-edit-dialog
      ref="taskReceiptEdit"
      :init-data="initData"
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