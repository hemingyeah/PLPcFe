<template>
  <div class="task-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>

      <div class="page-title">
        <div class="title">
          
          <!-- start 工单按钮组 -->

          <button type="button" class="btn-text btn-back" :disabled="disabled" @click="goBack" v-if="isShowBackButton">
            返回
          </button>

          <!-- start 新建按钮组 -->
          <template v-if="isShowTaskButtonGroup">

            <button type="button" class="btn btn-primary" :disabled="disabled" @click="submit" v-if="isShowSaveButton">
              保存
            </button>

            <button type="button" class="btn-text btn-back" :disabled="disabled" @click="submit(false)" v-if="isShowOnlySaveButton">
              只保存
            </button>

            <span class="text" v-if="isShowSaveAndAllotButton">|</span>
            
            <button type="button" class="btn btn-primary" :disabled="disabled" @click="submit(true)" v-if="isShowSaveAndAllotButton">
              保存并派单
            </button>

          </template>
          <!-- end 新建按钮组 -->

          <!-- start 新建计划任务 -->
          <button type="button" class="btn btn-primary" :disabled="disabled" v-if="isFromPlan">
            保存为计划任务
          </button>
          <!-- end 新建计划任务 -->

          <!-- start 编辑计划任务 -->
          <button type="button" class="btn btn-primary" :disabled="disabled" v-if="isPlanTaskEdit">
            保存为计划任务
          </button>
          <!-- end 编辑计划任务 -->

        </div>
        <!-- end 工单按钮组 -->

      </div>

      <task-edit-form :fields.sync="fields" :state="state" :types="types" :value.sync="form" ref="form" @updatetemplateId="updateTaskTemplateId"></task-edit-form>
    </form>
  </div>
</template>

<script>
import TaskEditView from './TaskEditView';
export default TaskEditView;
</script>

<style lang="scss">
  @import './TaskEditView.scss';
</style>
