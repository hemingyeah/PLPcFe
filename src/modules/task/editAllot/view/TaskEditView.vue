<template>
  <div class="task-container" v-loading.fullscreen.lock="loadingPage">
    <form class="base-form" v-if="init" novalidate>
      
      <div class="page-title">
        <div class="title">
          
          <!-- start 工单按钮组 -->
          
          <button type="button" class="btn-text btn-back" :disabled="disabled" @click="goBack" v-if="isShowBackButton">
            返回
          </button>
          
          <!-- start 新建按钮组 -->
          <template v-if="isShowTaskButtonGroup">
          
            <button type="button" class="btn btn-primary" :disabled="disabled" @click="submit(false)" v-if="isShowSaveButton">
              保存
            </button>
            
            <base-button type="primary" class="btn-text btn-back" :disabled="disabled" @event="submit(false)" v-if="isShowOnlySaveButton">
              提交
            </base-button>
            
            <span class="text" v-if="isShowSaveAndAllotButton"></span>
            
            <base-button type="primary" class="btn btn-primary" :disabled="disabled" @event="submit(true)" v-if="isShowSaveAndAllotButton">
              提交并派单
            </base-button>
            
          </template>
          <!-- end 新建按钮组 -->
          
          <!-- start 新建计划任务 -->
          <button type="button" class="btn btn-primary" :disabled="disabled" v-if="isFromPlan" @click="planTaskCreateDialogOpen">
            保存为计划任务
          </button>
          <!-- end 新建计划任务 -->
          
          <!-- start 编辑计划任务 -->
          <button type="button" class="btn btn-primary" :disabled="disabled" @click="planTaskEditDialogOpen" v-if="isPlanTaskEdit">
            保存计划任务
          </button>
          <!-- end 编辑计划任务 -->
          <!-- end 工单按钮组 -->
          
        </div>
        
      </div>
      
      <!-- start 工单流程步骤 -->
      <task-process-steps :template-id="currentTaskTemplateId" :state="currentTaskState"></task-process-steps>
      <!-- end 工单流程步骤 -->
      
      <task-edit-form :auth="auth" :task="task" :fields.sync="fields" :state="state" :types="types" :url-params="urlParams" :value.sync="form" ref="form" @updatetemplateId="updateTaskTemplateId"></task-edit-form>
    </form>
      
    <!-- start 新建/编辑 计划任务弹窗 -->
    <plan-task-edit-form :origin-form="form" :task-config="taskConfig" @loading="togglePending" @submit="submitWithPlanTask" ref="planTaskEditForm">
    
    </plan-task-edit-form>
    <!-- end 新建/编辑 计划任务弹窗 -->
    
    <!-- start 分配弹窗 -->
    <task-allot-modal v-if="Object.keys(allotTask).length > 0" ref="TaskAllotModal" :fields="fields" :task="allotTask" :login-user="initData.loginUser"></task-allot-modal>
    <!-- end 分配弹窗 -->
    
  </div>
</template>

<script>
import TaskEditView from './TaskEditView';
export default TaskEditView;
</script>

<style lang="scss">
  @import './TaskEditView.scss';
</style>
