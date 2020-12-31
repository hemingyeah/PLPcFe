<template>
  <div class="setting-hours-record" v-loading="loading">
    <!-- start 头部 -->
    <div class="setting-hours-record-header">
      <div class="setting-hours-left">
        <p class="setting-back-btn" @click="back">
          <i class="iconfont icon-arrow-left"></i> 返回
        </p>
        <p class="setting-back-name">{{cardName}}</p>
      </div>    
      <!-- <base-button
        type="primary"
        native-type="submit"
        :disabled="pending"
        @event="submit"
      >保存</base-button> -->
    </div>
    <!-- end 头部 -->
    
    <!-- start content-->
    <div class="setting-hours-record-content">
      <div class="setting-hours-li">
        <div class="mobile-limit">
          <div class="mobile-msg">
            <p>只允许在移动端填写</p>
            <p>开启后，工时记录只能在售后宝移动端填写，PC端不允许手动添加</p>
          </div>
          <el-switch v-model="cardConfig.isOnlyMobile" :active-text="cardConfig.isOnlyMobile?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
      </div>
      <div class="setting-hours-li">
        <p class="setting-title">工时记录字段设置</p> 
        <div class="setting-fields">
          <div v-for="(field,index) in fieldsList" :key="index">
            <div class="form-group" v-if="field.formType == 'datetime'">
              <label>{{field.displayName}}</label>
              <el-input :placeholder="'请选择'+field.displayName+''" disabled></el-input>
            </div>
            <div class="form-group" v-else-if="field.formType == 'number'">
              <label>{{field.displayName}}</label>
              <el-input placeholder="[结束时间]-[开始时间]" disabled></el-input>
            </div>
            <div class="form-group" v-else-if="field.formType == 'select'">
              <label>{{field.displayName}}</label>
              <el-input placeholder="请选择用时类别" disabled></el-input>
              <p class="set-btn" @click="onSet('dateSet',field)">设置</p>
            </div>
            <div class="form-group" v-else-if="field.formType == 'text'">
              <label>{{field.displayName}}</label>
              <el-input :placeholder="`请输入${field.displayName}`" disabled></el-input>
              <p class="set-btn" @click="onSet('noteSet',field)">设置</p>
              <el-switch v-model="field.enabled" :active-text="field.enabled==1?'启用':'禁用'" :active-value="1" :inactive-value="0" @change="onSetChange"></el-switch>    
            </div>
            <div class="form-group" v-else-if="field.formType == 'attachment'">
              <label>附件</label>
              <el-button type="primary" disabled>点击上传</el-button>
              <el-checkbox v-model="cardConfig.onlyPhoto" @change="onSetChange">附件只允许现场拍照上传</el-checkbox>
              <el-switch v-model="field.enabled" :active-text="field.enabled==1?'启用':'禁用'" class="open-attachment" :active-value="1" :inactive-value="0" @change="onSetChange"></el-switch>    
            </div>
          </div>
        </div>
      </div>
      <div class="setting-hours-li">
        <p class="setting-title">计时方法设置（仅移动端可配置）</p> 
        <div class="setting-hours-item">
          <p class="setting-hours-title">开始记录</p>
          <el-switch v-model="cardConfig.startTiming" :active-text="cardConfig.startTiming?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
        <div class="setting-hours-item">
          <div>
            <p class="setting-hours-title">结束计时</p>
            <el-checkbox v-model="cardConfig.endTiming" class="end-status" @change="onSetChange">完成工单时，自动结束计时</el-checkbox>
          </div>
          <el-switch v-model="cardConfig.isAutoEndTiming" :active-text="cardConfig.isAutoEndTiming?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
        <div class="setting-hours-item">
          <div>
            <p class="setting-hours-title">允许暂停计时</p>
            <p class="setting-hours-msg">适用于工作中有些时段不可以计入工作时长中，但又不适合直接结束计时的情况，暂停计时的时间段不计入用工时长</p>
          </div>
          <el-switch v-model="cardConfig.pause" :active-text="cardConfig.pause?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
        <div class="setting-hours-item">
          <div>
            <p class="setting-hours-title">允许标记中间点</p>
            <p class="setting-hours-msg">适用于精细化任务分工需要按不同细节记录工时，但又不适用直接结束计时的情况，记录中间点不会停止计时</p>
          </div>
          <el-switch v-model="cardConfig.centerPoint" :active-text="cardConfig.centerPoint?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
      </div>
      <div class="setting-hours-li">
        <p class="setting-title">其他设置</p> 
        <div class="setting-hours-item">
          <div>
            <p class="setting-hours-title">每次计时自动获取用户定位（仅移动端可配置）</p>
            <p class="setting-hours-msg">开启后，每次在移动端使用计时功能时，系统会自动获取用户所在位置</p>
          </div>
          <el-switch v-model="cardConfig.autoLocation" :active-text="cardConfig.autoLocation?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
        <div class="setting-hours-item">
          <div>
            <p class="setting-hours-title">开启行程距离统计</p>
            <p class="setting-hours-msg">开启后，每次在移动端使用计时功能时，会自动计算本次计时用户所在位置与上次计时所在位置的行驶距离；PC端由用户自行填写，非必填</p>
          </div>
          <el-switch v-model="cardConfig.distanceStatis" :active-text="cardConfig.distanceStatis?'启用':'禁用'" @change="onSetChange"></el-switch>    
        </div>
        <div class="setting-hours-item">
          <div class="setting-hours-box">
            <p class="setting-hours-title">单次工时记录最长不能超过</p>
            <el-input v-model="cardConfig.maxTime" type="number" maxlength="50"></el-input>
            <p class="setting-hours-title">小时，超过后自动结束计时</p>
          </div>
        </div>
      </div>
    </div>
    <!-- end content-->

    <!--start 用时类别设置弹窗 -->
    <date-set-dialog ref="dateSetDialog" @onSave="(value)=>onSaveSetSubmit(value,'dateSet')"></date-set-dialog>
    <!--end 用时类别设置弹窗 -->

    <!--start 备注设置弹窗 -->
    <note-set-dialog ref="noteSetDialog" @onSave="(value)=>onSaveSetSubmit(value,'noteSet')"></note-set-dialog>
    <!--end 备注设置弹窗 -->
  </div>
</template>

<script>
import TaskHoursRecordView from './TaskHoursRecordView';
export default TaskHoursRecordView;
</script>

<style lang="scss">
@import "./TaskHoursRecordView.scss";
</style>