<template>
  <div class="other-setting-panel">
    <!--S 公共设置 -->
    <div class="other-setting-main mb-12">
      <div>
        <h2 style="margin-top: 0">
          计划时间提醒
          <el-switch
            class="ml-12"
            v-model="taskFlowData.taskTypeConfig.planRemindSetting.state"
          />
        </h2>
        <div class="mb-8">
          在计划时间
          <el-select
            class="w-104"
            v-model="taskFlowData.taskTypeConfig.planRemindSetting.minutesType"
            placeholder="请选择"
          >
            <el-option label="前" :value="0"> </el-option>
            <el-option label="后" :value="1"> </el-option>
          </el-select>
          <el-input
            class="w-104"
            onkeyup="this.value=this.value.replace(/\D/g,'')"
            v-model="taskFlowData.taskTypeConfig.planRemindSetting.minutes"
          />
          分钟提醒工单负责人、协同人及
          <el-select v-model="taskFlowData.taskTypeConfig.noticeLeader" placeholder="请选择">
            <el-option
              v-for="item in planOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <div>
            <el-input
              v-if="taskFlowData.taskTypeConfig.noticeLeader == 2"
              class="w-678 mt-8"
              placeholder="请选择通知人"
              readonly
              :value="getApproverNames(taskFlowData.taskTypeConfig.noticeUsers)"
              @click.native="selectApproveUser('planRemind')"
            />
          </div>
        </div>
      </div>
      <div class="setting-specific-form">
        <h2>
          允许工单负责人将工单状态设为暂停
          <el-switch class="ml-12" v-model="taskFlowData.taskTypeConfig.allowPause" />
        </h2>
        <approve-setting
          :options="options.pause"
          :approve-setting="taskFlowData.taskTypeConfig.pauseApproveSetting"
          @change="(setting) => changeApproveSetting(setting, 'pause')"
        />
      </div>
      <div class="setting-specific-form">
        <h2>
          允许工单在完成前被取消
          <el-switch class="ml-12" v-model="taskFlowData.taskTypeConfig.allowCancel" />
        </h2>
        <approve-setting
          :options="options.cancel"
          :approve-setting="taskFlowData.taskTypeConfig.cancelApproveSetting"
          @change="(setting) => changeApproveSetting(setting, 'cancel')"
        />
      </div>
    </div>
    <!--E 公共设置 -->
    <!--S 回执设置 -->
    <div class="other-setting-main">
      <!--S 工单费用折扣 -->
      <div class="setting-service-price">
        <h2 style="margin-top: 0">
          允许修改工单费用折扣
          <span>如果启用该选项，允许工单负责人修改工单折扣费</span>
        </h2>
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
          <span>可在PC端或移动端针对完成的工单生成电子服务报告</span>
        </h2>
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
          <span>可以在PC端打印工单信息</span>
        </h2>
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
    <!--E 回执设置 -->
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
// util
import {convertDataToParams} from '../util';
// components 
import ApproveSetting from '../components/ApproveSetting.vue';
import SystemTemplateDialog from '../components/SystemTemplateDialog';
import TemplateUploadDialog from '../components/TemplateUploadDialog';

export default {
  name: 'other-setting-panel',
  inject: ['taskFlowData'],
  props: {
    taskTypeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShowSystemModal : false,
      templateType: 'reportSetting', // 'reportSetting' or 'printSetting
      isShowUploadModal : false,
      isShowTemplateUploadModal: false,

      formList: [],
      receiptList: [],

      options: {
        pause: [],
        cancel: [],
        flow: []
      },

      planOptions: [
        {
          value: '0',
          label: '无需通知其他人',
        },
        {
          value: '1',
          label: '通知负责人团队主管',
        },
        {
          value: '2',
          label: '指定人员',
        },
      ],
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
    /** 获取工单表单、回执表单中必填的人员字段 */
    async fetchFromUser(id) {
      try {
        let res = await SettingApi.getFromUser(id);
        this.formList = res.data.list;
        this.receiptList = res.data.receiptList;

        this.buildApproveOptions();
      } catch (error) {
        console.error('fetch getFromUser => error', error);
      }
    },
    buildApproveOptions() {
      this.options.pause = this.approveOptions('pause');
      this.options.cancel = this.approveOptions('cancel');
    },
    /** 审批类型选项 */
    approveOptions(type) {
      let options = [
        {
          value: 'leader',
          label: '发起人主管',
        },
        {
          value: 'users',
          label: '指定人员',
        },
        {
          value: 'createUser',
          label: '工单创建人',
        },
        {
          value: 'userAdmin',
          label: '客户负责人',
        },
        {
          value: 'promoter',
          label: '由发起人选择',
        },
      ];

      options = [
        ...options,
        ...this.formList.map((item) => {
          return {
            label: `表单人员:${ item.showName}`,
            value: item.stateTemplateId,
          };
        }),
      ];

      if (type === 'cancel') {
        options = [
          ...options,
          ...this.receiptList.map((item) => {
            return {
              label: `回执表单人员:${ item.showName}`,
              value: item.stateTemplateId,
            };
          }),
        ];
      }

      return options;
    },
    /** 格式化审批人员名称 */
    getApproverNames(approvers) {
      return approvers.map((item) => item.displayName).join(',');
    },
    /** 选择指定审批人员 */
    selectApproveUser(type) {
      let selected = [];

      if (type === 'planRemind') selected = this.taskFlowData.taskTypeConfig.noticeUsers;

      let options = {
        title: ['overTime', 'planRemind'].includes(type) ? '选择通知人' : '选择审批人', // [选填] 默认值为 '请选择人员'
        max: 14, // [选填]最大人数：当值小于等于0或者不填时，不对选择人数做限制，max值为1时单选，大于1时多选
        selected, // [选填] 已选人员 每个人员必须包括userId,displayName,staffId,head这四个属性，只有带max大于1时生效
      };

      this.$fast.contact
        .choose('dept', options)
        .then((res) => {
          if (res.status != 0) return;
          switch (type) {
          case 'planRemind': // 计划提醒指定人员
            this.taskFlowData.taskTypeConfig.noticeUsers = res.data.users;
            break;
          default:
            break;
          }
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    /** 更新审批设置 */
    changeApproveSetting(setting, key) {
      switch (key) {
      case 'pause':
        this.$set(this.taskFlowData.taskTypeConfig, 'pauseApproveSetting', setting);
        break;
      case 'cancel':
        this.$set(this.taskFlowData.taskTypeConfig, 'cancelApproveSetting', setting);
        break;
      default:
        break;
      }
    },
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
    /** 保存公共设置 */
    async saveCommonSetting(otherParams) {
      let params = convertDataToParams(this.taskFlowData.taskTypeConfig);
      params = {
        ...params,
        ...otherParams
      };
                
      return await SettingApi.saveProcess(params);
    },
    /**
     * 保存回执设置 
     */
    async saveOptionSetting(otherParams) {
      let {taskTypeId, taskTypeConfig} = this.taskFlowData;
      let saveOptionFormList = this.objectToParams(taskTypeConfig.options, 'state');
      let typeConfigForms = this.objectToParams(taskTypeConfig.config.positionExceptionConfig, 'value');

      let params = {
        templateId: taskTypeId,
        saveOptionFormList,
        typeConfigForms,
        ...otherParams
      }
      
      return await SettingApi.advancedSetting(params);
    },
    /**
     * 保存 (暴露的方法) 
     */
    async submit(otherParams) {
      let that = this;

      return new Promise((resolve, reject) => {
        try {
          this.saveCommonSetting(otherParams).then(res => {
            if(res.status === 0) {
              that.saveOptionSetting(otherParams).then(res2 => {
                if(res2.status === 0) {
                  this.$platform.notification({
                    title: '保存成功',
                    type: 'success'
                  });
                  resolve();
                }
              });
            }else {
              this.$platform.notification({
                title: res.message,
                type: 'error'
              });
              reject();
            }
          
          })
        } catch (error) {
          reject(error);
        }
      });
    },
    /** 检查内容是否有修改 (暴露的方法) */
    checkModified() {
      let {taskTypeConfig, initTaskTypeConfig} = this.taskFlowData;
      return JSON.stringify(taskTypeConfig) != JSON.stringify(initTaskTypeConfig);
    },
    /** 同步初始数据 (暴露的方法) */
    resetInit() {
      this.taskFlowData.taskTypeConfig = _.cloneDeep(this.taskFlowData.initTaskTypeConfig);
    },
  },
  // mounted() {
  //   if(this.taskTypeId) {
  //     this.fetchFromUser(this.taskTypeId);
  //   }
  // },
  activated() {
    if(this.taskTypeId) {
      this.fetchFromUser(this.taskTypeId);
    }
  },
  components: {
    [ApproveSetting.name]: ApproveSetting,
    [SystemTemplateDialog.name]: SystemTemplateDialog,
    [TemplateUploadDialog.name]: TemplateUploadDialog
  }
}
</script>

<style lang="scss" scoped>
.other-setting-panel{
    width: 100%;
    min-height: calc(100vh - 48px);
    padding: 12px;
    .other-setting-main{
        height: 100%;
        background: #FFFFFF;
        border-radius: 4px;
        padding: 20px 20px;
        & > div {
          position: relative;
          padding-left: 8px;
          font-size: 14px;
          color: #999999;
          h2{
            color: #333333;
            font-size: 14px;
            margin: 24px 0 8px 0;
            span{
              font-size: 12px;
              font-weight: 400;
              color: #999999;
            }
          }
          p{
              margin-bottom: 8px;
              color: #666666;
          }
          &::before{
            content: "";
            position: absolute;
            left: 0;
            top: 2px;
            display: inline-block;
            width: 2px;
            height: 15px;
            background: #13C2C2;
            border-radius: 2px;
          }
        }
        & > div:not(:last-child)::after{
          content: "";
          position: relative;
          top: 12px;
          display: block;
          width: 100%;
          border-top: 1px dashed #D9D9D9;
        }
    }
}

/deep/.setting-approve-people{
  margin-bottom: 0 !important;
}

.w-104{
  width: 104px;
}

.w-120{
    width: 120px;
}
.w-542{
    width: 542px;
}
.w-678{
  width: 678px;
}

.mt-12{
    margin-top: 12px;
}
.mb-12{
    margin-bottom: 12px;
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
.el-switch{
  float: right;
}
</style>