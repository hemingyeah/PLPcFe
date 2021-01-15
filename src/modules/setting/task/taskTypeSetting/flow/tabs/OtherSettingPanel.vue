<template>
  <div class="other-setting-panel">
    <div class="other-setting-main">
      <!--S 工单费用折扣 -->
      <div class="setting-service-price">
        <h2 style="margin-top: 0">允许修改工单费用折扣</h2>
        如果启用该选项，允许工单负责人修改工单折扣费
        <div class="mt-12">
          <el-checkbox v-model="taskFlowData.taskTypeConfig.options.editUnitPrice">修改单品价格</el-checkbox>
          <el-checkbox v-model="taskFlowData.taskTypeConfig.options.showDiscountCost">修改工单总折扣价</el-checkbox>
        </div>
      </div>
      <!--E 工单费用折扣 -->
      <!--S 生成服务报告 -->
      <div class="setting-service-report">
        <h2>
          发送服务报告
          <el-switch class="ml-16" v-model="taskFlowData.taskTypeConfig.options.serviceReport"/>
        </h2>
        可在PC端或移动端针对完成的工单生成电子服务报告
        <div class="mt-12">
          <el-radio-group v-model="taskFlowData.taskTypeConfig.options.srSysTemplate">
            <el-radio :label="true" class="mr-50">
              使用系统模板
              <el-button
                :disabled="!taskFlowData.taskTypeConfig.options.srSysTemplate"
                :type="taskFlowData.taskTypeConfig.options.srSysTemplate ? 'primary': 'default'" 
                plain 
                size="small"
                @click="openTemplateDialog('reportSetting')">
                设置
              </el-button>
            </el-radio>
            <el-radio :label="false">
              上传个人模板
              <el-button 
                :disabled="taskFlowData.taskTypeConfig.options.srSysTemplate"
                :type="!taskFlowData.taskTypeConfig.options.srSysTemplate ? 'primary': 'default'" 
                plain
                @click="importPresonTemplate('reportSetting')"
                size="small">
                设置
              </el-button>
            </el-radio>
          </el-radio-group>
        </div>
        <!-- 新需求先不做 -->
        <!-- <p class="mt-8">
                    电子服务报告显示浮现【服务完成】的水印
                    <el-switch />
                </p> -->
      </div>
      <!--E 生成服务报告 -->

      <!--S 启用打印功能 -->
      <div class="setting-photo">
        <h2>
          启用打印功能
          <el-switch class="ml-16" v-model="taskFlowData.taskTypeConfig.options.printTask"/>
        </h2>
        可以在PC端打印工单信息
        <div class="mt-12">
          <el-radio-group v-model="taskFlowData.taskTypeConfig.options.ptSysTemplate">
            <el-radio :label="true" class="mr-50">
              使用系统模板
              <el-button 
                :disabled="!taskFlowData.taskTypeConfig.options.ptSysTemplate"
                :type="taskFlowData.taskTypeConfig.options.ptSysTemplate ? 'primary': 'default'" 
                plain 
                size="small"
                @click="openTemplateDialog('printSetting')">
                设置
              </el-button>
            </el-radio>
            <el-radio :label="false">
              上传个人模板
              <el-button 
                :disabled="taskFlowData.taskTypeConfig.options.ptSysTemplate"
                :type="!taskFlowData.taskTypeConfig.options.ptSysTemplate ? 'primary': 'default'" 
                plain 
                @click="importPresonTemplate('printSetting')"
                size="small">
                设置
              </el-button>
            </el-radio>
          </el-radio-group>
        </div>
                
      </div>
      <!--E 启用打印功能 -->

      <!--S 启用拍照设置 -->
      <div class="setting-photo">
        <h2>
          启用拍照设置
          <el-switch
            class="ml-16"
            v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.attUploadLimitMobile"/>
        </h2>
        开启后，上传照片时只可现场拍摄上传，将不能够在相册选择并进行上传
      </div>
      <!--E 启用拍照设置 -->

      <!--S 照片水印设置 -->
      <div class="setting-water-mark" v-if="taskFlowData.taskTypeConfig.config.positionExceptionConfig.attUploadLimitMobile">
        <h2>
          照片水印设置
          <el-switch class="ml-16" v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.photoWatermark"/>
        </h2>
        开启后，照片将在
        <el-select
          v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.watermarkPosition"
          placeholder="请选择水印位置">
          <el-option
            v-for="item in waterMarkDirection"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        自动浮现水印说明以下信息
        <div class="mt-8">
          <el-select class="w-542" v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.watermarkContent" multiple placeholder="请选择水印位置">
            <el-option
              v-for="item in photoInfoArr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <!--E 照片水印设置 -->

      <!--S 位置异常设置 -->
      <div class="setting-postion-exception">
        <h2>
          位置异常提醒
          <el-switch class="ml-16" v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.positionExceptionFlag" />
        </h2>
        <p style="color: #999999">
          开启后，在以下节点时若负责人超出工单距离
          <el-input class="w-120" v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.exceptionRange" onkeyup="if(isNaN(value))execCommand('undo')" placeholder="请输入距离"></el-input>
          公里
        </p>
        将在工单流程中提示位置异常
        <div class="mt-12">
          <el-select class="w-542" v-model="taskFlowData.taskTypeConfig.config.positionExceptionConfig.exceptionFlagFlows" multiple placeholder="请选择">
            <el-option
              v-for="item in processArr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>    
          </el-select> 
        </div>
      </div>
      <!--E 位置异常设置 -->
    </div>

    <!-- 系统模板设置字段弹窗 -->
    <system-template-dialog :visiable.sync="isShowSystemModal" :type="templateType" :task-type-id="taskFlowData.taskTypeId"/>
    <!-- 导入模板设置弹窗 -->
    <template-upload-dialog :visiable.sync="isShowTemplateUploadModal" :type="templateType" :task-type-id="taskFlowData.taskTypeId">
    </template-upload-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
// api
import * as TaskApi from '@src/api/TaskApi.ts';
import * as SettingApi from '@src/api/SettingApi.js';
// components 
import SystemTemplateDialog from '../components/SystemTemplateDialog';
import TemplateUploadDialog from '../components/TemplateUploadDialog';

export default {
  name: 'other-setting-panel',
  inject: ['taskFlowData'],
  data() {
    return {
      isShowSystemModal : false,
      templateType: 'reportSetting', // 'reportSetting' or 'printSetting
      isShowUploadModal : false,
      isShowTemplateUploadModal: false,
    }
  },
  computed: {
    waterMarkDirection() {
      return [
        {label : '左上', value : 'topLeft'},
        {label : '左下', value : 'bottomLeft'},
        {label : '右上', value : 'topRight'},
        {label : '右下', value : 'bottomRight'},
      ]
    },
    photoInfoArr() {
      return [
        {label : '操作人姓名', value : 'name'},
        {label : '拍摄时间', value : 'time'},
        {label : '拍摄地点', value : 'position'},
      ]
    },
    processArr() { 
      return [
        {label : '开始', value : 'start'},
        {label : '完成', value : 'finish'}
      ]
    },
  },
  methods: {
    /**
     * 个人模板设置弹窗
     */
    importPresonTemplate(type) {
      this.templateType = type;
      this.isShowTemplateUploadModal = true;
    },
    /**
     * 系统模板设置弹窗
     */
    openTemplateDialog(type) {
      this.templateType = type;
      this.isShowSystemModal = true;
    },
    /**
     * 将对象转化成接口参数格式
     */
    objectToParams(obj, valueKey) {
      return Object.keys(obj).map(key => {
        return {
          name: key,
          [valueKey]: Array.isArray(obj[key]) ? obj[key].join(',') : obj[key]
        }
      });
    },
    /**
     * 保存 (暴露的方法) 
     */
    async submit(otherParams) {
      let {taskTypeId, taskTypeConfig} = this.taskFlowData;
      let saveOptionFormList = this.objectToParams(taskTypeConfig.options, 'state');
      let typeConfigForms = this.objectToParams(taskTypeConfig.config.positionExceptionConfig, 'value');

      let params = {
        templateId: taskTypeId,
        saveOptionFormList,
        typeConfigForms,
        ...otherParams
      }
      try {
        let res = await SettingApi.advancedSetting(params);
        if(res.status === 0) {
          this.$notify.success('保存成功');
        }else {
          this.$notify.error(res.message);
        }
      } catch (error) {
        console.error(error);
      }
    },
    /** 检查内容是否有修改 (暴露的方法) */
    checkModified() {
      let {taskTypeConfig, initTaskTypeConfig} = this.taskFlowData;
      return JSON.stringify(taskTypeConfig) != JSON.stringify(initTaskTypeConfig);
    },
    /** 同步初始数据 (暴露的方法) */
    resetInit() {
      this.taskFlowData.taskTypeConfig = _.cloneDeep(this.taskFlowData.initTaskTypeConfig);
    }
  },
  components: {
    [SystemTemplateDialog.name]: SystemTemplateDialog,
    [TemplateUploadDialog.name]: TemplateUploadDialog
  }
}
</script>

<style lang="scss" scoped>
.other-setting-panel{
    width: 100%;
    min-height: calc(100vh - 48px);
    padding: 16px 12px 24px 12px;
    background: #F5F5F5;
    .other-setting-main{
        height: 100%;
        background: #FFFFFF;
        border-radius: 4px;
        padding: 20px 50px;
        & > div {
            font-size: 14px;
            color: #999999;
            h2{
                color: #333333;
                font-size: 14px;
                margin: 24px 0 8px 0;
            }
            p{
                margin-bottom: 8px;
                color: #666666;
            }
        }
    }
}


.w-120{
    width: 120px;
}
.w-542{
    width: 542px;
}

.mt-12{
    margin-top: 12px;
}
.mr-50{
    margin-right: 50px;
}
.ml-16{
    margin-left: 16px;
}
.mt-8{
    margin-top: 8px;
}

/** element-ui */
.el-checkbox{
    margin-bottom: 0;
}
.el-button--small{
    height: 28px;
    padding: 6px 15px;
}
</style>